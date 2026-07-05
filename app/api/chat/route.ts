import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Groq from 'groq-sdk'
import { getRecommendations } from '@/lib/recommendations'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Tool definitions for Groq
const tools = [
  {
    type: 'function',
    function: {
      name: 'search_dishes',
      description: 'Search for dishes by query, category, or max price.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search term for dish name or description' },
          category: { type: 'string', description: 'Category of the dish (e.g. Mains, Sides, Desserts)' },
          max_price: { type: 'number', description: 'Maximum price of the dish' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_order_history',
      description: 'Get the past orders for the current user.',
      parameters: {
        type: 'object',
        properties: {
          user_id: { type: 'string', description: 'The UUID of the user' },
        },
        required: ['user_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_recommendations',
      description: 'Get personalized restaurant recommendations for the current user based on their history and time of day.',
      parameters: {
        type: 'object',
        properties: {
          user_id: { type: 'string', description: 'The UUID of the user' },
        },
        required: ['user_id'],
      },
    },
  },
]

export async function POST(req: Request) {
  try {
    const { message } = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Fetch user context (last 10 orders)
    const { data: pastOrders } = await supabase
      .from('orders')
      .select('items, total, created_at, restaurants(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // 2. Fetch basic restaurant catalog
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('name, cuisine_type, rating')

    // 3. Fetch chat history for this user
    const { data: chatHistory } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    // Save user message to DB
    await supabase.from('chat_messages').insert({
      user_id: user.id,
      role: 'user',
      content: message,
    })

    const systemPrompt = `You are Nosh's food ordering assistant. Help the user find dishes, recommend restaurants based on their history, and answer questions about their past orders. Keep responses to 2-3 sentences, conversational, no bullet-point walls of text. If asked to place an order, confirm the dish and restaurant with the user before adding to cart — never add to cart without explicit confirmation.
    
IMPORTANT: When calling a tool, you MUST output valid JSON and ensure all curly braces are closed properly.
    
Context:
Last 10 Orders: ${JSON.stringify(pastOrders)}
Restaurants: ${JSON.stringify(restaurants)}
Current User ID: ${user.id}
`

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...(chatHistory || []).map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: message }
    ]

    // Initial Groq Call
    let runner = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      tools: tools as any,
      tool_choice: 'auto',
      max_tokens: 4096,
    })

    let responseMessage = runner.choices[0].message
    messages.push(responseMessage)

    // Handle Tool Calls
    while (responseMessage.tool_calls) {
      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name
        const args = JSON.parse(toolCall.function.arguments)
        let toolResult = ''

        try {
          if (functionName === 'search_dishes') {
            let query = supabase.from('dishes').select('name, description, price, category, restaurants(name)')
            if (args.query) query = query.ilike('name', `%${args.query}%`)
            if (args.category) query = query.eq('category', args.category)
            if (args.max_price) query = query.lte('price', args.max_price)
            
            const { data } = await query.limit(5)
            toolResult = JSON.stringify(data)
          } else if (functionName === 'get_order_history') {
            const { data } = await supabase
              .from('orders')
              .select('id, items, total, status, created_at, restaurants(name)')
              .eq('user_id', args.user_id)
              .order('created_at', { ascending: false })
            toolResult = JSON.stringify(data)
          } else if (functionName === 'get_recommendations') {
            const { recommendations } = await getRecommendations(supabase, args.user_id)
            toolResult = JSON.stringify(recommendations.map(r => ({ name: r.restaurant.name, reason: r.reason })))
          }
        } catch (err: any) {
          toolResult = JSON.stringify({ error: err.message })
        }

        messages.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: functionName,
          content: toolResult,
        })
      }

      // Second Groq call with tool results
      runner = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        tools: tools as any,
        max_tokens: 4096,
      })
      responseMessage = runner.choices[0].message
      messages.push(responseMessage)
    }

    // Save assistant response to DB
    await supabase.from('chat_messages').insert({
      user_id: user.id,
      role: 'assistant',
      content: responseMessage.content,
    })

    return NextResponse.json({ message: responseMessage.content })
  } catch (error: any) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Assistant is busy, try again in a moment' },
      { status: 500 }
    )
  }
}
