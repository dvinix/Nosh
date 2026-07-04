import { CheckCircle, Clock, MapPin, Truck } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const revalidate = 0

export default async function OrderConfirmationPage({ 
  searchParams 
}: { 
  searchParams: { restaurantId?: string, orderId?: string } 
}) {
  const { restaurantId, orderId } = await searchParams
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  let restaurantName = 'Unknown Restaurant'
  let restaurantDesc = ''
  
  if (restaurantId) {
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('name, description, delivery_time_mins')
      .eq('id', restaurantId)
      .single()
      
    if (restaurant) {
      restaurantName = restaurant.name
      restaurantDesc = restaurant.description || ''
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-primary/10 p-4">
              <CheckCircle size={48} className="text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground">
            Your order has been received and is being prepared
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-card rounded-2xl border border-border p-8 mb-8">
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-1">Order ID</p>
            <p className="text-xl font-bold text-foreground font-mono">
              {orderId || 'ORD-PENDING'}
            </p>
          </div>

          {restaurantId && (
            <div className="mb-6 pb-6 border-b border-border">
              <p className="text-sm text-muted-foreground mb-2">From</p>
              <h2 className="text-lg font-bold text-foreground mb-1">
                {restaurantName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {restaurantDesc}
              </p>
            </div>
          )}

          {/* Status Timeline */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center mb-2">
                  <CheckCircle size={20} className="text-primary-foreground" />
                </div>
                <div className="h-12 w-1 bg-primary" />
              </div>
              <div className="pb-4">
                <p className="font-semibold text-foreground">Order Confirmed</p>
                <p className="text-sm text-muted-foreground">
                  Your order has been confirmed
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center mb-2">
                  <Clock size={20} className="text-muted-foreground" />
                </div>
                <div className="h-12 w-1 bg-secondary" />
              </div>
              <div className="pb-4">
                <p className="font-semibold text-foreground">Being Prepared</p>
                <p className="text-sm text-muted-foreground">
                  Restaurant is preparing your food
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center mb-2">
                  <Truck size={20} className="text-muted-foreground" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-foreground">Out for Delivery</p>
                <p className="text-sm text-muted-foreground">
                  Expected in 30-40 min
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-secondary rounded-lg p-6 mb-8 space-y-4">
          <div className="flex items-start gap-3">
            <MapPin size={20} className="text-muted-foreground mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Delivery Address
              </p>
              <p className="text-foreground">123 Main Street, Apt 4B</p>
              <p className="text-sm text-muted-foreground">Your default address</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/"
            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold text-center"
          >
            Back to Home
          </Link>
          <Link href="/account" className="px-6 py-3 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors font-semibold text-center flex items-center justify-center">
            Track Order
          </Link>
        </div>
      </div>
    </main>
  )
}
