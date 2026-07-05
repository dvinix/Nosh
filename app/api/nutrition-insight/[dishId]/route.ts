import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

function macrosHash(calories: number, protein: number, carbs: number, fat: number): string {
  return `${calories}-${protein}-${carbs}-${fat}`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dishId: string }> }
) {
  const { dishId } = await params

  try {
    const supabase = await createClient()

    // 1. Fetch dish + siblings
    const { data: dish, error: dishError } = await supabase
      .from('dishes')
      .select('id, name, description, calories, protein_g, carbs_g, fat_g, restaurant_id')
      .eq('id', dishId)
      .single()

    if (dishError || !dish) {
      return NextResponse.json({ error: 'Dish not found' }, { status: 404 })
    }

    if (!dish.calories) {
      return NextResponse.json({ error: 'No nutrition data for this dish' }, { status: 404 })
    }

    const currentHash = macrosHash(dish.calories, dish.protein_g, dish.carbs_g, dish.fat_g)

    // 2. Check cache
    const { data: cached } = await supabase
      .from('nutrition_insights')
      .select('insight, dish_macros_hash')
      .eq('dish_id', dishId)
      .single()

    if (cached && cached.dish_macros_hash === currentHash) {
      return NextResponse.json({ insight: cached.insight, cached: true })
    }

    // 3. Fetch sibling dishes for swap context
    const { data: siblings } = await supabase
      .from('dishes')
      .select('name, calories, protein_g, carbs_g, fat_g')
      .eq('restaurant_id', dish.restaurant_id)
      .neq('id', dishId)
      .not('calories', 'is', null)

    const siblingContext = (siblings || [])
      .map(d => `• ${d.name}: ${d.calories} kcal, ${d.protein_g}g protein, ${d.carbs_g}g carbs, ${d.fat_g}g fat`)
      .join('\n')

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    // 4a. Groq — rich deep analysis of this specific dish
    let deepAnalysis = ''
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a knowledgeable nutrition assistant in a food delivery app. Be friendly and informative, not clinical. Write a short analysis (3–4 sentences) covering:
1. What makes this dish nutritionally notable (highlight its standout macro)
2. Who this dish is a good fit for (e.g. high-protein seekers, comfort food lovers, light eaters)
3. One practical tip — like "best paired with..." or "great post-workout" or "enjoy as an occasional treat"

Be warm, concise, food-app in tone. No bullet points. No medical claims. No headers.`
          },
          {
            role: 'user',
            content: `Dish: "${dish.name}"
Description: "${dish.description || 'No description'}"
Nutrition: ${dish.calories} kcal | ${dish.protein_g}g protein | ${dish.carbs_g}g carbs | ${dish.fat_g}g fat`
          }
        ],
        temperature: 0.6,
        max_tokens: 150,
      })
      deepAnalysis = completion.choices[0]?.message?.content?.trim() || ''
    } catch (e) {
      console.warn('Groq deep analysis failed:', e)
    }

    // 4b. Groq — fast swap suggestion from actual menu
    let swapSuggestion = ''
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a concise nutrition assistant for a food delivery app. If a lighter alternative exists on the menu, suggest it in EXACTLY this format: "Swap [X] → [Y] to save ~[N] kcal." If no lighter dish exists, reply with exactly: "NONE". One line only, no extra text.`,
          },
          {
            role: 'user',
            content: `Current dish: "${dish.name}" at ${dish.calories} kcal

Other dishes on the menu:
${siblingContext || 'No other dishes.'}

Is there a dish with meaningfully fewer calories (at least 80 kcal less)? If yes, give the swap. If not, say NONE.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 60,
      })
      const raw = completion.choices[0]?.message?.content?.trim() || 'NONE'
      if (raw !== 'NONE' && raw.toLowerCase().startsWith('swap')) {
        swapSuggestion = raw
      }
    } catch (e) {
      console.warn('Groq swap failed:', e)
    }

    // 5. Combine into JSON blob stored in `insight` column
    const insightPayload = JSON.stringify({
      deepAnalysis,
      swapSuggestion,
    })

    // 6. Upsert cache
    await supabase.from('nutrition_insights').upsert({
      dish_id: dishId,
      insight: insightPayload,
      dish_macros_hash: currentHash,
      generated_at: new Date().toISOString(),
    })

    return NextResponse.json({
      insight: insightPayload,
      deepAnalysis,
      swapSuggestion,
      cached: false,
    })
  } catch (err: any) {
    console.error('Nutrition insight error:', err)
    return NextResponse.json({ error: 'Failed to generate insight' }, { status: 500 })
  }
}
