'use client'

import { useState } from 'react'
import { ArrowLeft, MapPin, Clock, Star, ShoppingCart } from 'lucide-react'
import { MenuItemComponent } from '@/components/menu-item'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'

export interface Restaurant {
  id: string
  name: string
  description: string
  cover_image_url: string
  rating: number
  delivery_time_mins: string
  cuisine_type: string[]
}

export interface Dish {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  is_veg: boolean
  category: string
  calories?: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
}

export function RestaurantClient({ restaurant, dishes }: { restaurant: Restaurant, dishes: Dish[] }) {
  // Group dishes by category
  const categoriesMap = new Map<string, Dish[]>()
  dishes.forEach((dish) => {
    if (!categoriesMap.has(dish.category)) {
      categoriesMap.set(dish.category, [])
    }
    categoriesMap.get(dish.category)!.push(dish)
  })

  const categories = Array.from(categoriesMap.keys())
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0] || '')
  
  const { addToCart, cartTotal, cartCount, cartRestaurantId, cartRestaurantName, cartItems, updateQuantity } = useCart()

  const selectedDishes = categoriesMap.get(selectedCategory) || []

  const mappedRestaurant = {
    id: restaurant.id,
    name: restaurant.name,
    description: restaurant.description || '',
    image: restaurant.cover_image_url || '',
    rating: Number(restaurant.rating) || 0,
    reviews: 0,
    deliveryTime: restaurant.delivery_time_mins ? `${restaurant.delivery_time_mins} min` : '',
    cuisines: restaurant.cuisine_type || [],
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </Link>
          <Link
            href={cartRestaurantId ? `/restaurant/${cartRestaurantId}/cart` : `/restaurant/${restaurant.id}/cart`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              cartCount > 0
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-secondary text-foreground hover:bg-border'
            }`}
            title={cartCount > 0 ? `Ordering from ${cartRestaurantName || 'another restaurant'}` : 'Cart is empty'}
          >
            <ShoppingCart size={20} />
            {cartCount > 0 ? (
              <div className="flex flex-col text-xs leading-tight">
                <span className="font-semibold text-sm">{cartCount} items · ${cartTotal.toFixed(2)}</span>
                <span className="opacity-80">From: {cartRestaurantName}</span>
              </div>
            ) : (
              <span className="text-sm font-medium">Cart</span>
            )}
          </Link>
        </div>
      </header>

      {/* Hero Image */}
      <div className="relative h-72 overflow-hidden">
        <img
          src={mappedRestaurant.image}
          alt={mappedRestaurant.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Restaurant Info */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 mb-8">
        <div className="bg-card rounded-2xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {mappedRestaurant.name}
          </h1>
          <p className="text-muted-foreground mb-4">{mappedRestaurant.description}</p>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Star size={16} className="fill-accent text-accent" />
              <span className="font-semibold text-foreground">
                {mappedRestaurant.rating}
              </span>
              <span className="text-muted-foreground">
                ({mappedRestaurant.reviews} reviews)
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={16} />
              {mappedRestaurant.deliveryTime}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={16} />
              Free delivery
            </div>
          </div>

          {/* Cuisines */}
          <div className="mt-4 flex gap-2 flex-wrap">
            {mappedRestaurant.cuisines.map((cuisine) => (
              <span
                key={cuisine}
                className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium"
              >
                {cuisine}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category Filter */}
          <aside className="lg:col-span-1">
            <div className="sticky top-32 bg-card rounded-xl border border-border p-4 space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary text-foreground'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </aside>

          {/* Menu Items */}
          <div className="lg:col-span-3 space-y-8">
            {selectedCategory && (
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  {selectedCategory}
                </h2>
                <div className="space-y-4">
                  {selectedDishes.map((dish) => {
                    const cartItem = cartItems.find(ci => ci.item.id === dish.id)
                    return (
                      <MenuItemComponent
                        key={dish.id}
                        item={{
                          id: dish.id,
                          name: dish.name,
                          description: dish.description || '',
                          price: Number(dish.price),
                          image: dish.image_url || '',
                          dietary: dish.is_veg ? ['Vegetarian'] : [],
                          category: dish.category,
                          calories: dish.calories,
                          protein_g: dish.protein_g,
                          carbs_g: dish.carbs_g,
                          fat_g: dish.fat_g,
                        }}
                        cartQuantity={cartItem?.quantity || 0}
                        onAddToCart={(item, quantity) => addToCart(item, quantity, restaurant.id)}
                        onUpdateQuantity={updateQuantity}
                      />
                    )
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Floating Cart Button (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-card border-t border-border p-4 z-50">
        <Link
          href={cartRestaurantId ? `/restaurant/${cartRestaurantId}/cart` : `/restaurant/${restaurant.id}/cart`}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors font-semibold ${
            cartCount > 0
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-secondary text-foreground hover:bg-border'
          }`}
        >
          <ShoppingCart size={20} />
          {cartCount > 0 ? (
            <div className="flex flex-col items-center">
              <span>View Cart ({cartCount})</span>
              <span className="text-xs font-normal opacity-80">From: {cartRestaurantName}</span>
            </div>
          ) : (
            <span>Cart is empty</span>
          )}
          <span>{cartCount > 0 ? `$${cartTotal.toFixed(2)}` : '$0.00'}</span>
        </Link>
      </div>
    </main>
  )
}
