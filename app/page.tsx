import { createClient } from '@/lib/supabase/server'
import { HomeClient, type Restaurant } from '@/components/home-client'

export const revalidate = 0 // always fetch fresh data

export default async function Home() {
  const supabase = await createClient()

  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('*')

  if (error) {
    console.error('Error fetching restaurants:', error)
  }

  return <HomeClient initialRestaurants={(restaurants as Restaurant[]) || []} />
}
