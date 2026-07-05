import { createClient } from '@/lib/supabase/server'
import { HomeClient, type Restaurant } from '@/components/home-client'
import { getRecommendations, getTrending } from '@/lib/recommendations'

export const revalidate = 0 // always fetch fresh data

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: restaurants, error },
    { recommendations, isPersonalized },
    trending
  ] = await Promise.all([
    supabase.from('restaurants').select('*'),
    getRecommendations(supabase, user?.id),
    getTrending(supabase)
  ])

  if (error) {
    console.error('Error fetching restaurants:', error)
  }

  return (
    <HomeClient 
      initialRestaurants={(restaurants as Restaurant[]) || []} 
      recommendations={recommendations}
      isPersonalized={isPersonalized}
      trendingRestaurantId={trending?.topRestaurantId}
    />
  )
}
