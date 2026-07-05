import { SupabaseClient } from '@supabase/supabase-js'

export interface Recommendation {
  restaurant: any
  score: number
  reason: string
  metrics?: {
    freqScore: number
    timeMatch: number
    affinityScore: number
    ratingScore: number
    totalScore: number
  }
}

export async function getRecommendations(
  supabase: SupabaseClient,
  userId: string | undefined
): Promise<{ recommendations: Recommendation[], isPersonalized: boolean }> {
  // 1. Fetch all restaurants
  const { data: restaurantsData, error } = await supabase
    .from('restaurants')
    .select('*, dishes(category)')
  
  if (error) {
    console.error('Error fetching restaurants for recommendations:', error)
  }
  const restaurants = restaurantsData || []

  // 2. Map Time of Day
  const currentHour = new Date().getHours() // Server local time (UTC or host time)
  
  let timeWindowCategories: string[] = []
  let timeWindowName = ''
  
  if (currentHour >= 5 && currentHour < 11) {
    timeWindowCategories = ['Pastries', 'Beverages', 'Breakfast']
    timeWindowName = 'Breakfast'
  } else if (currentHour >= 11 && currentHour < 16) {
    timeWindowCategories = ['Salads', 'Mains', 'Sandwiches', 'Mezze Platters', 'Asian Specialties']
    timeWindowName = 'Lunch'
  } else if (currentHour >= 16 && currentHour < 19) {
    timeWindowCategories = ['Pastries', 'Beverages', 'Tapas', 'Desserts', 'Appetizers']
    timeWindowName = 'a Snack'
  } else {
    timeWindowCategories = ['Mains', 'Curries', 'Asian Specialties', 'Seafood', 'Pasta', 'Smoked Meats']
    timeWindowName = 'Dinner'
  }

  // 3. User History
  let maxOrderCount = 0
  const userOrderCounts: Record<string, number> = {}
  const userCategoryCounts: Record<string, number> = {}
  let totalItemsOrdered = 0
  
  if (userId) {
    const { data: orders } = await supabase
      .from('orders')
      .select('restaurant_id, items')
      .eq('user_id', userId)
      
    if (orders && orders.length > 0) {
      orders.forEach(order => {
        // Count frequency
        userOrderCounts[order.restaurant_id] = (userOrderCounts[order.restaurant_id] || 0) + 1
        if (userOrderCounts[order.restaurant_id] > maxOrderCount) {
          maxOrderCount = userOrderCounts[order.restaurant_id]
        }
        
        // Count category affinity
        const items = order.items as any[]
        if (Array.isArray(items)) {
          items.forEach(cartItem => {
            if (cartItem.item && cartItem.item.category) {
              const cat = cartItem.item.category
              userCategoryCounts[cat] = (userCategoryCounts[cat] || 0) + (cartItem.quantity || 1)
              totalItemsOrdered += (cartItem.quantity || 1)
            }
          })
        }
      })
    }
  }

  const isPersonalized = maxOrderCount > 0

  // 4. Calculate Scores
  const results: Recommendation[] = restaurants.map(restaurant => {
    // a. Order Frequency (0.4)
    let freqScore = 0
    if (maxOrderCount > 0 && userOrderCounts[restaurant.id]) {
      freqScore = userOrderCounts[restaurant.id] / maxOrderCount
    }

    // b. Time of Day (0.3)
    const restaurantCategories = new Set((restaurant.dishes || []).map((d: any) => d.category))
    let timeMatch = 0
    for (const cat of timeWindowCategories) {
      if (restaurantCategories.has(cat)) {
        timeMatch = 1
        break
      }
    }

    // c. Category Affinity (0.2)
    let affinityScore = 0
    if (totalItemsOrdered > 0) {
      let matches = 0
      restaurantCategories.forEach(cat => {
        if (userCategoryCounts[cat as string]) {
          matches += userCategoryCounts[cat as string]
        }
      })
      affinityScore = matches / totalItemsOrdered
    }

    // d. Normalized Rating (0.1)
    const rating = Number(restaurant.rating) || 0
    const ratingScore = rating / 5.0

    // Final Score
    const totalScore = (freqScore * 0.4) + (timeMatch * 0.3) + (affinityScore * 0.2) + (ratingScore * 0.1)

    // Determine Reason
    let reason = ''
    if (isPersonalized) {
      const fWeight = freqScore * 0.4
      const tWeight = timeMatch * 0.3
      const aWeight = affinityScore * 0.2
      
      const maxWeight = Math.max(fWeight, tWeight, aWeight)
      if (maxWeight === fWeight && fWeight > 0) {
        reason = 'Your usual pick'
      } else if (maxWeight === aWeight && aWeight > 0) {
        reason = 'Matches your taste'
      } else if (maxWeight === tWeight && tWeight > 0) {
        reason = `Perfect for ${timeWindowName} right now`
      } else {
        reason = 'Highly rated'
      }
    } else {
      if (timeMatch > 0) {
        reason = `Perfect for ${timeWindowName} right now`
      } else {
        reason = 'Highly rated'
      }
    }

    return {
      restaurant,
      score: totalScore,
      reason,
      metrics: {
        freqScore: freqScore * 0.4,
        timeMatch: timeMatch * 0.3,
        affinityScore: affinityScore * 0.2,
        ratingScore: ratingScore * 0.1,
        totalScore
      }
    }
  })

  // Sort by score descending
  results.sort((a, b) => b.score - a.score)

  return {
    recommendations: results.slice(0, 3),
    isPersonalized
  }
}
