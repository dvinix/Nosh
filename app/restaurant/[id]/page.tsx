import { createClient } from '@/lib/supabase/server'
import { RestaurantClient, type Restaurant, type Dish } from '@/components/restaurant-client'
import Link from 'next/link'

export const revalidate = 0 // always fetch fresh data

export default async function RestaurantDetails({ params }: { params: { id: string } }) {
  // Await the params first
  const { id: restaurantId } = await params
  const supabase = await createClient()

  // Fetch restaurant details
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', restaurantId)
    .single()

  if (restaurantError || !restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Restaurant not found
          </h1>
          <Link
            href="/"
            className="text-primary hover:text-primary/90 font-medium"
          >
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  // Fetch dishes
  const { data: dishes, error: dishesError } = await supabase
    .from('dishes')
    .select('*, calories, protein_g, carbs_g, fat_g')
    .eq('restaurant_id', restaurantId)

  if (dishesError) {
    console.error('Error fetching dishes:', dishesError)
  }

  return <RestaurantClient restaurant={restaurant as Restaurant} dishes={(dishes as Dish[]) || []} />
}
