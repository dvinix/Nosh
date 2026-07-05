'use client'

import { useState, useMemo } from 'react'
import { Search, MapPin, User } from 'lucide-react'
import { RestaurantCard } from '@/components/restaurant-card'
import { SteamAnimation } from '@/components/steam-animation'
import { cuisineCategories } from '@/lib/restaurants'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { ShoppingCart } from 'lucide-react'

// Define the Restaurant type matching Supabase
export interface Restaurant {
  id: string
  name: string
  description: string
  cover_image_url: string
  rating: number
  delivery_time_mins: string
  cuisine_type: string[]
  featured?: boolean
}

import { Recommendation } from '@/lib/recommendations'

export function HomeClient({ 
  initialRestaurants, 
  recommendations = [], 
  isPersonalized = false 
}: { 
  initialRestaurants: Restaurant[],
  recommendations?: Recommendation[],
  isPersonalized?: boolean
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('All')
  const { cartCount, cartRestaurantId } = useCart()

  const filteredRestaurants = useMemo(() => {
    return initialRestaurants.filter((restaurant) => {
      const matchesSearch =
        searchQuery === '' ||
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (restaurant.cuisine_type || []).some((c) =>
          c.toLowerCase().includes(searchQuery.toLowerCase())
        )

      const matchesCuisine =
        selectedCuisine === 'All' ||
        (restaurant.cuisine_type || []).includes(selectedCuisine)

      return matchesSearch && matchesCuisine
    })
  }, [searchQuery, selectedCuisine, initialRestaurants])

  const featuredRestaurant = filteredRestaurants.find((r) => r.featured)
  const otherRestaurants = filteredRestaurants.filter((r) => !r.featured)

  // Map to match the existing component props
  const mapToProp = (r: Restaurant) => ({
    id: r.id,
    name: r.name,
    description: r.description || '',
    image: r.cover_image_url || '',
    rating: Number(r.rating) || 0,
    reviews: 0, // Placeholder
    deliveryTime: r.delivery_time_mins ? `${r.delivery_time_mins} min` : '',
    cuisines: r.cuisine_type || [],
    featured: r.featured || false
  })

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            {/* Logo & Branding */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                N
              </div>
              <h1 className="text-xl font-bold text-foreground hidden sm:block">
                Nosh
              </h1>
            </div>

            {/* Location & Account */}
            <div className="flex items-center gap-3 ml-auto">
              <button className="relative p-2 hover:bg-secondary rounded-lg transition-colors">
                <MapPin size={20} className="text-foreground" />
              </button>
              <Link
                href={cartCount > 0 && cartRestaurantId ? `/restaurant/${cartRestaurantId}/cart` : '/'}
                className="relative p-2 hover:bg-secondary rounded-lg transition-colors"
                title={cartCount > 0 ? `${cartCount} items in cart` : 'Cart is empty'}
              >
                <ShoppingCart size={20} className="text-foreground" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link href="/account" className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <User size={20} className="text-foreground" />
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search restaurants, cuisines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            />
          </div>

          {/* Cuisine Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            {cuisineCategories.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => setSelectedCuisine(cuisine)}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all whitespace-nowrap ${
                  selectedCuisine === cuisine
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-secondary text-secondary-foreground hover:bg-border'
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Featured Section */}
        {featuredRestaurant && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Featured
            </h2>
            <div className="relative rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <SteamAnimation />
              <RestaurantCard
                restaurant={mapToProp(featuredRestaurant)}
                featured={true}
              />
            </div>
          </section>
        )}

        {/* Recommended Section */}
        {recommendations.length > 0 && selectedCuisine === 'All' && searchQuery === '' && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {isPersonalized ? 'Recommended for you' : 'Popular right now'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <RestaurantCard
                  key={rec.restaurant.id}
                  restaurant={mapToProp(rec.restaurant)}
                  reasonTag={rec.reason}
                  metrics={rec.metrics}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Restaurants Section */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {selectedCuisine === 'All' ? 'All Restaurants' : selectedCuisine}
          </h2>

          {otherRestaurants.length === 0 && searchQuery !== '' && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No restaurants found matching &quot;{searchQuery}&quot;
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Clear search
              </button>
            </div>
          )}

          {otherRestaurants.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={mapToProp(restaurant)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer spacing */}
      <div className="h-20" />
    </main>
  )
}
