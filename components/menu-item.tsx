'use client'

import { useState } from 'react'
import { MenuItem } from '@/lib/menu'
import { Plus, Minus, ChevronDown, ChevronUp, Flame } from 'lucide-react'
import { NutritionPanel } from '@/components/nutrition-panel'

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
  const [nutritionOpen, setNutritionOpen] = useState(false)

  const hasNutrition =
    item.calories != null &&
    item.protein_g != null &&
    item.carbs_g != null &&
    item.fat_g != null

  const effectiveQty = cartQuantity > 0 ? cartQuantity : 1

  return (
    <div className="rounded-xl bg-card border border-border hover:shadow-md transition-shadow overflow-hidden">
      <div className="flex gap-4 p-4">
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
            {/* Calorie quick peek */}
            {hasNutrition && !nutritionOpen && (
              <button
                onClick={() => setNutritionOpen(true)}
                className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors"
              >
                <Flame size={11} className="text-orange-400" />
                <span className="font-mono font-medium">{item.calories} kcal</span>
                <ChevronDown size={11} />
              </button>
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

      {/* Expandable Nutrition Dashboard */}
      {hasNutrition && (
        <>
          {nutritionOpen ? (
            <div className="px-4 pb-4">
              <NutritionPanel
                dishId={item.id}
                dishName={item.name}
                nutrition={{
                  calories: item.calories!,
                  protein_g: item.protein_g!,
                  carbs_g: item.carbs_g!,
                  fat_g: item.fat_g!,
                }}
                quantity={effectiveQty}
              />
              <button
                onClick={() => setNutritionOpen(false)}
                className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-1"
              >
                <ChevronUp size={12} /> Hide nutrition
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
