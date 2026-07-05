import { Restaurant } from '@/lib/restaurants'
import { Star, Clock, Info } from 'lucide-react'
import Link from 'next/link'

interface RestaurantCardProps {
  restaurant: Restaurant
  featured?: boolean
  reasonTag?: string
  metrics?: {
    freqScore: number
    timeMatch: number
    affinityScore: number
    ratingScore: number
    totalScore: number
  }
}

export function RestaurantCard({
  restaurant,
  featured = false,
  reasonTag,
  metrics,
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
        {reasonTag && (
          <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-full shadow-md z-10 flex items-center gap-1 group/tooltip">
            <Star size={12} className="fill-current" />
            {reasonTag}
            {metrics && (
              <>
                <Info size={12} className="ml-1 opacity-70" />
                <div className="absolute left-0 top-full mt-2 w-48 bg-card text-foreground p-3 rounded-lg shadow-xl border border-border opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all pointer-events-none">
                  <p className="font-semibold text-sm mb-2 border-b border-border pb-1">AI Match Logic</p>
                  <div className="space-y-1 text-xs font-normal">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order History</span>
                      <span>{Math.round(metrics.freqScore * 100)}/40</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time of Day</span>
                      <span>{Math.round(metrics.timeMatch * 100)}/30</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taste Match</span>
                      <span>{Math.round(metrics.affinityScore * 100)}/20</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rating</span>
                      <span>{Math.round(metrics.ratingScore * 100)}/10</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-border mt-1 pt-1">
                      <span>Total Match</span>
                      <span className="text-primary">{Math.round(metrics.totalScore * 100)}%</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
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
