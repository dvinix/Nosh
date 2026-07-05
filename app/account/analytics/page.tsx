import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AnalyticsClient } from '@/components/analytics-client'

export const revalidate = 0

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all orders
  const { data: orders } = await supabase
    .from('orders')
    .select('id, items, total, created_at, restaurants(name)')
    .eq('user_id', user.id)

  // Fetch all dishes for mapping categories and calories
  const { data: dishes } = await supabase
    .from('dishes')
    .select('id, name, category, calories, price')

  const processedOrders = (orders || []).map(order => {
    const items = Array.isArray(order.items) ? order.items : []
    const enrichedItems = items.map((ci: any) => {
      const dish = (dishes || []).find(d => d.id === ci.item?.id)
      return {
        ...ci,
        dishInfo: dish
      }
    })
    return {
      ...order,
      items: enrichedItems
    }
  })

  // We pass the processed orders to the client, where Recharts will do the aggregation and display.
  // The client will also figure out the current month and request the personality tag.
  
  const userObj = {
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
  }

  return <AnalyticsClient orders={processedOrders} user={userObj} />
}
