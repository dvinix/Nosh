'use client'

import { MenuItem } from '@/lib/menu'
import { Plus, Minus } from 'lucide-react'

interface MenuItemComponentProps {
  item: MenuItem
  cartQuantity?: number
  onAddToCart: (item: MenuItem, quantity: number) => void
  onUpdateQuantity?: (itemId: string, quantity: number) => void
}

export function MenuItemComponent({
  item,
  cartQuantity = 0,
  onAddToCart,
  onUpdateQuantity,
}: MenuItemComponentProps) {

  return (
    <div className="flex gap-4 rounded-xl bg-card p-4 border border-border hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <h4 className="font-semibold text-foreground line-clamp-1">
            {item.name}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
          {item.dietary && item.dietary.length > 0 && (
            <div className="mt-1 flex gap-1 flex-wrap">
              {item.dietary.map((diet) => (
                <span
                  key={diet}
                  className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded"
                >
                  {diet}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Price & Add Button */}
      <div className="flex flex-col items-end justify-between">
        <span className="text-lg font-semibold text-foreground">
          ${item.price.toFixed(2)}
        </span>
        {cartQuantity > 0 ? (
          <div className="flex items-center border border-primary bg-primary/5 rounded-lg overflow-hidden">
            <button
              onClick={() => onUpdateQuantity && onUpdateQuantity(item.id, cartQuantity - 1)}
              className="p-2 text-primary hover:bg-primary/10 transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center font-semibold text-foreground">
              {cartQuantity}
            </span>
            <button
              onClick={() => onUpdateQuantity && onUpdateQuantity(item.id, cartQuantity + 1)}
              className="p-2 text-primary hover:bg-primary/10 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAddToCart(item, 1)}
            className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-3 py-2 hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Add
          </button>
        )}
      </div>
    </div>
  )
}
