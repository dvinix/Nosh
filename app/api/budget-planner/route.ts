import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { budget, groupSize, mode } = await req.json()
    const supabase = await createClient()

    // Fetch all dishes with their restaurant info
    const { data: dishes } = await supabase
      .from('dishes')
      .select('*, restaurants(name)')

    if (!dishes) {
      return NextResponse.json({ error: 'No dishes available' }, { status: 400 })
    }

    // Group dishes by restaurant
    const byRestaurant: Record<string, any[]> = {}
    for (const d of dishes) {
      if (!byRestaurant[d.restaurant_id]) {
        byRestaurant[d.restaurant_id] = []
      }
      byRestaurant[d.restaurant_id].push({
        ...d,
        restaurant_name: (d.restaurants as any)?.name
      })
    }

    const allCombos: any[] = []

    // Helper to score a combo
    const scoreCombo = (combo: any[]) => {
      let totalCalories = 0
      const categories = new Set()
      let totalPrice = 0
      for (const item of combo) {
        totalCalories += item.calories || 0
        categories.add(item.category)
        totalPrice += item.price
      }
      return {
        score: mode === 'calories' ? totalCalories : categories.size,
        totalPrice,
        totalCalories,
        variety: categories.size
      }
    }

    // For each restaurant, find combos
    for (const [restId, restDishes] of Object.entries(byRestaurant)) {
      // If groupSize is provided, we just want combinations of exact size
      // If not, we can find combinations up to say, 4 items.
      const targetSize = groupSize || 3
      
      // Simple randomized greedy search to find diverse combos quickly
      // We will generate 1000 random combos of targetSize and keep the valid ones
      const validCombos = []
      
      for (let i = 0; i < 500; i++) {
        // Shuffle dishes
        const shuffled = [...restDishes].sort(() => 0.5 - Math.random())
        const combo = shuffled.slice(0, targetSize)
        
        const stats = scoreCombo(combo)
        if (stats.totalPrice <= budget) {
          validCombos.push({
            restaurant_id: restId,
            restaurant_name: combo[0].restaurant_name,
            items: combo,
            ...stats
          })
        }
      }

      // Sort local combos by score
      validCombos.sort((a, b) => b.score - a.score)
      
      // Keep best 3 from this restaurant to mix with others
      allCombos.push(...validCombos.slice(0, 3))
    }

    // Sort all combos globally by score, then by how close they are to the budget
    allCombos.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      // Tie breaker: closer to budget is better
      return b.totalPrice - a.totalPrice 
    })

    // Deduplicate exact same item combinations
    const uniqueCombos = []
    const seen = new Set()
    for (const c of allCombos) {
      const sig = c.items.map((i: any) => i.id).sort().join(',')
      if (!seen.has(sig)) {
        seen.add(sig)
        uniqueCombos.push(c)
      }
    }

    // Return top 3
    return NextResponse.json(uniqueCombos.slice(0, 3))

  } catch (error: any) {
    console.error('Budget Planner Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
