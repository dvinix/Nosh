'use client'

import { useEffect, useState } from 'react'

interface SimpleDish {
  id: string
  name: string
  price: number
  image_url: string
}

export function GoesWellWith({ dishId }: { dishId: string }) {
  const [dishes, setDishes] = useState<SimpleDish[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch(`/api/dishes/${dishId}/goes-well-with`)
      .then(res => res.json())
      .then(data => {
        setDishes(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [dishId])

  if (loading) {
    return <div className="mt-4 pt-4 border-t border-border animate-pulse h-24 bg-muted rounded"></div>
  }

  if (dishes.length === 0) return null

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <h5 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <span className="bg-accent text-accent-foreground px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Frequently ordered together</span>
      </h5>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {dishes.map(dish => (
          <div key={dish.id} className="flex-shrink-0 w-32 flex flex-col gap-1 group">
            <div className="overflow-hidden rounded-md h-20 bg-muted">
              <img 
                src={dish.image_url} 
                alt={dish.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
              />
            </div>
            <span className="text-xs font-medium line-clamp-1 mt-1">{dish.name}</span>
            <span className="text-xs text-muted-foreground">${Number(dish.price).toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
