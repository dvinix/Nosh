import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { stats, month } = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if tag already exists for this user and month
    const { data: existingTag } = await supabase
      .from('monthly_personality_tags')
      .select('tag')
      .eq('user_id', user.id)
      .eq('month', month)
      .single()

    if (existingTag) {
      return NextResponse.json({ tag: existingTag.tag })
    }

    const systemPrompt = `You are a witty food personality generator for a food delivery app called Nosh. 
Based on a user's monthly ordering stats, generate a single, short personality tag (1-2 short sentences maximum).
Format it as a title and a brief explanation.
Examples: 
- "The Weekend Warrior — 70% of your orders land on Sat/Sun!"
- "Pizza Connoisseur — You spent $120 on Pizza this month alone."
- "The Health Nut — You kept it clean with 10 Salad orders this month."

Here are the user's stats:
${JSON.stringify(stats)}

Return ONLY the plain text string of the personality tag. No markdown, no quotes, no conversational filler.`

    const response = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: systemPrompt }
      ],
      temperature: 0.7,
      max_tokens: 100
    })

    const tag = response.choices[0].message.content?.trim() || "The Foodie — You love exploring new tastes!"

    // Save it
    await supabase.from('monthly_personality_tags').insert({
      user_id: user.id,
      month,
      tag
    })

    return NextResponse.json({ tag })
  } catch (error: any) {
    console.error('Generate tag error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
