import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { targetCalories, preference } = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the full catalog
    const { data: dishes } = await supabase
      .from('dishes')
      .select('*, restaurants(name)')

    if (!dishes || dishes.length === 0) {
      return NextResponse.json({ error: 'No dishes available in catalog' }, { status: 400 })
    }

    const catalog = dishes.map(d => ({
      id: d.id,
      name: d.name,
      category: d.category,
      calories: d.calories
    }))

    // Filter by preference if veg/non-veg. (Assuming category has 'Veg' or we can let LLM decide based on name).
    // The prompt says "Only choose dishes that exist in the provided catalog". The LLM can deduce preference.
    
    const systemPrompt = `You are a meal-planning assistant for a food delivery app. Given a daily calorie target and the available dish catalog, build a 7-day plan (one dish per day) that stays within ±10% of the target and matches the stated dietary preference. Only choose dishes that exist in the provided catalog — never invent a dish. 

Return valid JSON: an array of 7 objects with "day" (String, e.g. "Monday") and "dish_id" (String).
Do NOT include any markdown formatting like \`\`\`json or \`\`\` in your response. Just the raw JSON array.`

    const userMessage = `Daily Calorie Target: ${targetCalories}
Dietary Preference: ${preference}

Catalog:
${JSON.stringify(catalog)}`

    const response = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.2
    })

    let jsonContent = response.choices[0].message.content || '[]'
    
    // Clean markdown if present
    if (jsonContent.includes('\`\`\`')) {
      jsonContent = jsonContent.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim()
    }

    let parsedJson
    try {
      parsedJson = JSON.parse(jsonContent)
      if (parsedJson.plan) parsedJson = parsedJson.plan
    } catch (e) {
      console.error('Failed to parse LLM response', jsonContent)
      return NextResponse.json({ error: 'Failed to generate a valid plan. Try again.' }, { status: 500 })
    }

    // Map dish_id back to full dish objects
    const planData = parsedJson.map((item: any) => {
      const dish = dishes.find(d => d.id === item.dish_id)
      return {
        day: item.day,
        dish: dish ? {
          ...dish,
          restaurant_name: (dish.restaurants as any)?.name
        } : null
      }
    }).filter((item: any) => item.dish !== null)

    // Save to DB
    const { data: savedPlan, error } = await supabase.from('diet_plans').insert({
      user_id: user.id,
      target_calories: targetCalories,
      preference,
      plan_json: planData
    }).select().single()

    if (error) {
      console.error('Error saving plan', error)
      return NextResponse.json({ error: 'Failed to save plan' }, { status: 500 })
    }

    return NextResponse.json(savedPlan)

  } catch (error: any) {
    console.error('Planner API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
