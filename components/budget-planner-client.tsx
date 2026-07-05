'use client'

import { useState } from 'react'
import { ArrowLeft, Loader2, Sparkles, Plus, Wallet } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { MenuItem } from '@/lib/menu'
import { useRouter } from 'next/navigation'

interface Combo {
  restaurant_id: string
  restaurant_name: string
  items: MenuItem[]
  score: number
  totalPrice: number
  totalCalories: number
  variety: number
}

export function BudgetPlannerClient() {
  const [budget, setBudget] = useState('')
  const [groupSize, setGroupSize] = useState('')
  const [mode, setMode] = useState<'variety' | 'calories'>('variety')
  const [loading, setLoading] = useState(false)
  const [combos, setCombos] = useState<Combo[]>([])
  const [error, setError] = useState('')
  
  const { addToCart, clearCart, cartRestaurantId } = useCart()
  const router = useRouter()

  const findCombos = async () => {
    if (!budget || isNaN(Number(budget)) || Number(budget) <= 0) {
      setError('Please enter a valid budget amount')
      return
    }
    
    setError('')
    setLoading(true)
    
    try {
      const res = await fetch('/api/budget-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget: Number(budget),
          groupSize: groupSize ? Number(groupSize) : undefined,
          mode
        })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to find combinations')
      }
      
      setCombos(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOrderCombo = async (combo: Combo) => {
    // If cart has items from different restaurant, we clear it first for a smooth 1-click combo order
    // In a real app we might show a modal, but addToCart already handles it.
    // However, addToCart is async and showing the modal multiple times in a loop would be messy.
    // Let's just clear cart if it's a different restaurant.
    if (cartRestaurantId && cartRestaurantId !== combo.restaurant_id) {
      if (confirm(`This combo is from ${combo.restaurant_name}. Your cart has items from another restaurant. Start a new cart?`)) {
        await clearCart()
      } else {
        return
      }
    }

    for (const item of combo.items) {
      await addToCart(item, 1, combo.restaurant_id)
    }
    router.push(`/restaurant/${combo.restaurant_id}/cart`)
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Home</span>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Budget Planner</h1>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Controls */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-green-500/10 rounded-xl">
                  <Wallet className="text-green-600 dark:text-green-400" size={24} />
                </div>
                <h2 className="text-xl font-bold text-foreground">Plan Your Feast</h2>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Total Budget ($)</label>
                  <input 
                    type="number" 
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-green-500 outline-none font-medium"
                    placeholder="e.g. 50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Group Size (Optional)</label>
                  <input 
                    type="number" 
                    value={groupSize}
                    onChange={(e) => setGroupSize(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Number of people"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Optimize For</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMode('variety')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        mode === 'variety' 
                          ? 'bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400' 
                          : 'bg-secondary border-transparent text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      Maximum Variety
                    </button>
                    <button
                      onClick={() => setMode('calories')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        mode === 'calories' 
                          ? 'bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400' 
                          : 'bg-secondary border-transparent text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      Most Calories
                    </button>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                
                <button
                  onClick={findCombos}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-4"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                  {loading ? 'Crunching numbers...' : 'Find Best Combos'}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {!combos.length && !loading && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-2xl">
                <div className="p-4 bg-secondary rounded-full mb-4">
                  <Sparkles className="text-muted-foreground" size={32} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Ready to optimize your budget</h3>
                <p className="text-muted-foreground max-w-sm">Enter your budget and preferences on the left to instantly generate optimal meal combinations.</p>
              </div>
            )}
            
            {combos.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-foreground">Top Recommended Combos</h3>
                {combos.map((combo, idx) => (
                  <div key={idx} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="bg-green-500/5 px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            Option {idx + 1}
                          </span>
                          <span className="font-bold text-foreground">{combo.restaurant_name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {combo.items.length} items · {combo.variety} categories · {combo.totalCalories} kcal
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</p>
                          <p className="text-2xl font-bold text-foreground font-mono">${combo.totalPrice.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => handleOrderCombo(combo)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm whitespace-nowrap"
                        >
                          <Plus size={16} /> Order Combo
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {combo.items.map((item, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                              {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex flex-col justify-center">
                              <span className="font-semibold text-foreground text-sm line-clamp-1">{item.name}</span>
                              <span className="text-xs text-muted-foreground mb-1">{item.category}</span>
                              <span className="font-medium text-foreground text-sm">${Number(item.price).toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </main>
  )
}
