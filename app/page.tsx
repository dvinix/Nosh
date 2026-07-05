import { createClient } from '@/lib/supabase/server'
import { HomeClient, type Restaurant } from '@/components/home-client'
import { getRecommendations } from '@/lib/recommendations'

export const revalidate = 0 // always fetch fresh data

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('*')

  if (error) {
    console.error('Error fetching restaurants:', error)
  }

  const { recommendations, isPersonalized } = await getRecommendations(supabase, user?.id)

  return (
    <HomeClient 
      initialRestaurants={(restaurants as Restaurant[]) || []} 
      recommendations={recommendations}
      isPersonalized={isPersonalized}
    />
  )
}
