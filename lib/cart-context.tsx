'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  vegetarian?: boolean
  spicy?: boolean
  popular?: boolean
}

export interface CartItem {
  id?: string // Supabase cart_item id
  item: MenuItem
  quantity: number
  restaurant_id?: string
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: MenuItem, quantity: number, restaurantId?: string) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  cartTotal: number
  cartCount: number
  cartRestaurantId?: string
  cartRestaurantName?: string
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartRestaurantId, setCartRestaurantId] = useState<string | undefined>()
  const [cartRestaurantName, setCartRestaurantName] = useState<string | undefined>()
  
  // Modal State
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false)
  const [pendingCartItem, setPendingCartItem] = useState<{item: MenuItem, quantity: number, restaurantId: string} | null>(null)

  const supabase = createClient()
  const router = useRouter()

  const fetchCartItems = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data, error } = await supabase
      .from('cart_items')
      .select('id, quantity, restaurant_id, dishes(id, name, description, price, image_url, is_veg), restaurants(name)')
      .eq('user_id', session.user.id)

    if (error) {
      console.error('Error fetching cart:', error)
      return
    }

    if (data) {
      let fetchedRestId = undefined
      let fetchedRestName = undefined
      const items: CartItem[] = data.map((row: any) => {
        fetchedRestId = row.restaurant_id
        fetchedRestName = row.restaurants?.name
        return {
          id: row.id,
          restaurant_id: row.restaurant_id,
          quantity: row.quantity,
          item: {
            id: row.dishes.id,
            name: row.dishes.name,
            description: row.dishes.description,
            price: Number(row.dishes.price),
            image: row.dishes.image_url,
            vegetarian: row.dishes.is_veg,
          },
        }
      })
      setCartItems(items)
      setCartRestaurantId(fetchedRestId)
      setCartRestaurantName(fetchedRestName)
    }
  }, [supabase])

  useEffect(() => {
    fetchCartItems()
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchCartItems()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchCartItems, supabase])

  const requireAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return null
    }
    return session.user
  }

  const handleConfirmReplace = async () => {
    if (!pendingCartItem) return
    const user = await requireAuth()
    if (!user) return

    // Call the RPC function to atomically replace cart
    const { error } = await supabase.rpc('replace_cart', {
      p_user_id: user.id,
      p_dish_id: pendingCartItem.item.id,
      p_restaurant_id: pendingCartItem.restaurantId,
      p_quantity: pendingCartItem.quantity
    })

    if (!error) {
      // Re-fetch to get accurate state + restaurant name
      await fetchCartItems()
    } else {
      console.error('Failed to replace cart', error)
    }

    setIsReplaceModalOpen(false)
    setPendingCartItem(null)
  }

  const handleCancelReplace = () => {
    setIsReplaceModalOpen(false)
    setPendingCartItem(null)
  }

  const addToCart = useCallback(async (item: MenuItem, quantity: number, restaurantId?: string) => {
    const user = await requireAuth()
    if (!user) return

    if (!restaurantId) return

    // Check if adding from a different restaurant
    if (cartRestaurantId && cartRestaurantId !== restaurantId && cartItems.length > 0) {
      setPendingCartItem({ item, quantity, restaurantId })
      setIsReplaceModalOpen(true)
      return
    }

    const existing = cartItems.find((ci) => ci.item.id === item.id)
    if (existing) {
      const newQuantity = existing.quantity + quantity
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existing.id)

      if (!error) {
        setCartItems((prev) =>
          prev.map((ci) =>
            ci.id === existing.id ? { ...ci, quantity: newQuantity } : ci
          )
        )
      }
    } else {
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          dish_id: item.id,
          restaurant_id: restaurantId,
          quantity,
        })
        .select()
        .single()

      if (!error && data) {
        // Optimistically update, fetch actual restaurant name via refetch if needed
        setCartItems((prev) => [...prev, { id: data.id, item, quantity, restaurant_id: data.restaurant_id }])
        setCartRestaurantId(restaurantId)
        // Refetch to get the restaurant name if it was empty
        if (!cartRestaurantName) {
          fetchCartItems()
        }
      } else {
        console.error("Error inserting cart item:", error)
      }
    }
  }, [cartItems, cartRestaurantId, cartRestaurantName, supabase, requireAuth, fetchCartItems])

  const removeFromCart = useCallback(async (itemId: string) => {
    const existing = cartItems.find((ci) => ci.item.id === itemId)
    if (!existing || !existing.id) return

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', existing.id)

    if (!error) {
      setCartItems((prev) => {
        const next = prev.filter((ci) => ci.item.id !== itemId)
        if (next.length === 0) {
          setCartRestaurantId(undefined)
          setCartRestaurantName(undefined)
        }
        return next
      })
    }
  }, [cartItems, supabase])

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    const existing = cartItems.find((ci) => ci.item.id === itemId)
    if (!existing || !existing.id) return

    if (quantity <= 0) {
      await removeFromCart(itemId)
      return
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', existing.id)

    if (!error) {
      setCartItems((prev) =>
        prev.map((ci) =>
          ci.id === existing.id ? { ...ci, quantity } : ci
        )
      )
    }
  }, [cartItems, supabase, removeFromCart])

  const clearCart = useCallback(async () => {
    const user = await requireAuth()
    if (!user) return

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)

    if (!error) {
      setCartItems([])
      setCartRestaurantId(undefined)
      setCartRestaurantName(undefined)
    }
  }, [supabase, requireAuth])

  const cartTotal = cartItems.reduce(
    (sum, ci) => sum + ci.item.price * ci.quantity,
    0
  )
  const cartCount = cartItems.reduce((sum, ci) => sum + ci.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        cartRestaurantId,
        cartRestaurantName
      }}
    >
      {children}

      {/* Confirmation Modal Overlay */}
      {isReplaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-xl p-6 shadow-xl border border-border">
            <h3 className="text-xl font-bold text-foreground mb-4">Replace Cart?</h3>
            <p className="text-muted-foreground mb-6">
              Your cart currently has items from <strong className="text-foreground">{cartRestaurantName || 'another restaurant'}</strong>. 
              Adding this item will clear your current cart. Do you want to replace it?
            </p>
            <div className="flex gap-4 justify-end">
              <button 
                onClick={handleCancelReplace}
                className="px-4 py-2 rounded-lg font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmReplace}
                className="px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Replace Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
