'use client'

import { useState } from 'react'
import { ArrowLeft, Loader2, RefreshCw, Flame, Plus } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { MenuItem } from '@/lib/menu'

interface PlanDay {
  day: string
  dish: MenuItem & { restaurant_name: string, restaurant_id: string }
}

interface DietPlan {
  id: string
  target_calories: number
  preference: string
  plan_json: PlanDay[]
}

export function DietPlannerClient({ initialPlan }: { initialPlan?: DietPlan }) {
  const [plan, setPlan] = useState<DietPlan | undefined>(initialPlan)
  const [loading, setLoading] = useState(false)
  const [calories, setCalories] = useState<string>(initialPlan?.target_calories.toString() || '2000')
  const [preference, setPreference] = useState(initialPlan?.preference || 'No preference')
  const [error, setError] = useState('')
  
  const { addToCart } = useCart()

  const generatePlan = async () => {
    if (!calories || isNaN(Number(calories))) {
      setError('Please enter a valid calorie target')
      return
    }
    
    setError('')
    setLoading(true)
    
    try {
      const res = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCalories: Number(calories),
          preference
        })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate plan')
      }
      
      setPlan(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOrder = (dish: MenuItem & { restaurant_id: string }) => {
    // Stage 2A cart lock is handled inside addToCart automatically!
    addToCart(dish, 1, dish.restaurant_id)
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/account/nutrition" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Weekly Diet Planner</h1>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!plan ? (
          <div className="max-w-md mx-auto bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Create your plan</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Daily Calorie Target</label>
                <input 
                  type="number" 
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary outline-none"
                  placeholder="e.g. 2000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Dietary Preference</label>
                <select 
                  value={preference}
                  onChange={(e) => setPreference(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="No preference">No preference</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-vegetarian">Non-vegetarian</option>
                  <option value="Vegan">Vegan</option>
                </select>
              </div>

              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              
              <button
                onClick={generatePlan}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Flame />}
                {loading ? 'Generating 7-day plan...' : 'Generate Plan'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Your Weekly Plan</h2>
                <p className="text-muted-foreground mt-1">
                  Target: {plan.target_calories} kcal/day · {plan.preference}
                </p>
              </div>
              <button
                onClick={generatePlan}
                disabled={loading}
                className="bg-secondary hover:bg-secondary/80 text-foreground font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                Regenerate
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {plan.plan_json.map((dayItem, i) => {
                if (!dayItem.dish) return null
                return (
                  <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col">
                    <div className="bg-secondary/50 px-4 py-3 border-b border-border font-bold text-foreground uppercase tracking-wider text-sm flex justify-between items-center">
                      <span>{dayItem.day}</span>
                      <span className="text-primary font-mono">{dayItem.dish.calories} kcal</span>
                    </div>
                    
                    {dayItem.dish.image_url && (
                      <div className="h-40 w-full bg-muted">
                        <img 
                          src={dayItem.dish.image_url} 
                          alt={dayItem.dish.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-foreground line-clamp-2">{dayItem.dish.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{dayItem.dish.restaurant_name}</p>
                      
                      <div className="mt-auto pt-4 flex items-center justify-between">
                        <span className="font-bold text-foreground">${Number(dayItem.dish.price).toFixed(2)}</span>
                        <button
                          onClick={() => handleOrder(dayItem.dish)}
                          className="bg-primary/10 hover:bg-primary/20 text-primary font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors text-sm"
                        >
                          <Plus size={16} /> Order this
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
