'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function CartClient({ restaurant }: { restaurant: any }) {
  const router = useRouter()
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const supabase = createClient()

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    const totalWithTax = cartTotal * 1.1

    // Write to orders table
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: session.user.id,
        restaurant_id: restaurant.id,
        items: cartItems,
        total: totalWithTax,
        status: 'pending'
      })
      .select()
      .single()

    if (!error) {
      await clearCart()
      router.push(`/order-confirmation?restaurantId=${restaurant.id}&orderId=${data.id}`)
    } else {
      console.error('Error placing order:', error)
      setIsCheckingOut(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto max-w-2xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            href={`/restaurant/${restaurant.id}`}
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </Link>
          <h1 className="text-lg font-bold text-foreground">Your Cart</h1>
          <div className="w-20" />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground mb-6">
              Add items from {restaurant.name} to get started
            </p>
            <Link
              href={`/restaurant/${restaurant.id}`}
              className="inline-block px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <section className="mb-8 space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                {restaurant.name}
              </h2>
              <div className="space-y-3">
                {cartItems.map((cartItem) => (
                  <div
                    key={cartItem.item.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground line-clamp-1">
                        {cartItem.item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        ${cartItem.item.price.toFixed(2)} each
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-border rounded-lg">
                        <button
                          onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity - 1)}
                          className="p-2 hover:bg-secondary transition-colors"
                        >
                          <Minus size={16} className="text-foreground" />
                        </button>
                        <span className="px-4 py-2 font-semibold text-foreground min-w-12 text-center">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                          className="p-2 hover:bg-secondary transition-colors"
                        >
                          <Plus size={16} className="text-foreground" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(cartItem.item.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        ${(cartItem.item.price * cartItem.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-border bg-card p-6 mb-8">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Order Summary
              </h3>
              <div className="space-y-3 mb-4 pb-4 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground font-medium">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-foreground font-medium">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground font-medium">
                    ${(cartTotal * 0.1).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between mb-6">
                <span className="text-lg font-bold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">
                  ${(cartTotal * 1.1).toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className={`w-full py-3 rounded-lg font-semibold text-primary-foreground transition-all ${
                  isCheckingOut
                    ? 'bg-primary/70 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
