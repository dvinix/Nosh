import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NutritionDashboardClient } from '@/components/nutrition-dashboard-client'

export const revalidate = 0

export default async function NutritionDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all orders for the user
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, items, created_at, restaurants(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders for nutrition dashboard:', error)
  }

  // Fetch dishes to get nutritional info
  // Since order items only have dish id and quantity, we need to map them
  // We can fetch all dishes, or extract unique dish IDs from orders.
  const dishIds = new Set<string>()
  orders?.forEach(order => {
    const items = order.items as any[]
    if (Array.isArray(items)) {
      items.forEach(ci => {
        if (ci.item && ci.item.id) dishIds.add(ci.item.id)
      })
    }
  })

  let dishesData: any[] = []
  if (dishIds.size > 0) {
    const { data: dishes } = await supabase
      .from('dishes')
      .select('id, name, calories, protein_g, carbs_g, fat_g')
      .in('id', Array.from(dishIds))
    
    if (dishes) dishesData = dishes
  }

  // Map nutritional info into orders
  const processedOrders = (orders || []).map(order => {
    const items = order.items as any[]
    let orderCalories = 0
    let orderProtein = 0
    let orderCarbs = 0
    let orderFat = 0
    
    const enrichedItems = Array.isArray(items) ? items.map(ci => {
      if (!ci.item || !ci.item.id) return ci
      
      const dishInfo = dishesData.find(d => d.id === ci.item.id)
      if (dishInfo) {
        const qty = ci.quantity || 1
        orderCalories += (dishInfo.calories || 0) * qty
        orderProtein += (dishInfo.protein_g || 0) * qty
        orderCarbs += (dishInfo.carbs_g || 0) * qty
        orderFat += (dishInfo.fat_g || 0) * qty
        
        return {
          ...ci,
          item: {
            ...ci.item,
            name: dishInfo.name,
            calories: dishInfo.calories,
            protein_g: dishInfo.protein_g,
            carbs_g: dishInfo.carbs_g,
            fat_g: dishInfo.fat_g
          }
        }
      }
      return ci
    }) : []
    
    return {
      id: order.id,
      created_at: order.created_at,
      restaurant_name: (order.restaurants as any)?.name || 'Unknown Restaurant',
      items: enrichedItems,
      calories: orderCalories,
      protein: orderProtein,
      carbs: orderCarbs,
      fat: orderFat
    }
  })

  return <NutritionDashboardClient orders={processedOrders} />
}
