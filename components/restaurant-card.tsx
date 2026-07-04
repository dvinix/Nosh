import { Restaurant } from '@/lib/restaurants'
import { Star, Clock } from 'lucide-react'
import Link from 'next/link'

interface RestaurantCardProps {
  restaurant: Restaurant
  featured?: boolean
}

export function RestaurantCard({
  restaurant,
  featured = false,
}: RestaurantCardProps) {
  return (
    <Link href={`/restaurant/${restaurant.id}`}>
    <div
      className={`group relative overflow-hidden rounded-2xl bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105 ${
        featured ? 'col-span-1 md:col-span-2 row-span-2' : ''
      }`}
    >
      {/* Image */}
      <div
        className={`relative overflow-hidden bg-muted ${
          featured ? 'h-96' : 'h-48'
        }`}
      >
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-foreground line-clamp-1">
          {restaurant.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {restaurant.description}
        </p>

        {/* Cuisine tags */}
        <div className="mt-2 flex flex-wrap gap-1">
          {restaurant.cuisines.slice(0, 2).map((cuisine) => (
            <span
              key={cuisine}
              className="inline-block bg-secondary px-2 py-1 rounded-lg text-xs text-secondary-foreground font-medium"
            >
              {cuisine}
            </span>
          ))}
        </div>

        {/* Meta information */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star size={16} className="fill-accent text-accent" />
              <span className="font-semibold text-foreground">
                {restaurant.rating}
              </span>
              <span className="text-muted-foreground">
                ({restaurant.reviews})
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock size={14} />
            {restaurant.deliveryTime}
          </div>
        </div>
      </div>
    </div>
    </Link>
  )
}
