import { createClient } from '@/lib/supabase/server'
import { AccountClient, type Order } from '@/components/account-client'
import { redirect } from 'next/navigation'


export const revalidate = 0

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export default async function AccountPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch orders with restaurant details
  const { data: ordersData, error } = await supabase
    .from('orders')
    .select('id, total, status, created_at, items, restaurants(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  let orders: Order[] = []

  if (ordersData) {
    orders = ordersData.map((o: any) => {
      // items in jsonb is an array of CartItem
      const itemsCount = Array.isArray(o.items) ? o.items.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) : 0
      
      return {
        id: o.id,
        restaurantName: o.restaurants?.name || 'Unknown Restaurant',
        date: formatDate(o.created_at),
        total: Number(o.total),
        status: o.status as 'completed' | 'pending' | 'cancelled',
        items: itemsCount,
      }
    })
  }

  const userObj = {
    email: user.email || '',
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    initials: (user.user_metadata?.full_name || user.email || 'U').substring(0, 2).toUpperCase()
  }

  return <AccountClient orders={orders} user={userObj} />
}
