import { createClient } from '@/lib/supabase/server'
import { CartClient } from '@/components/cart-client'
import Link from 'next/link'

export const revalidate = 0

export default async function CartPage({ params }: { params: { id: string } }) {
  const { id: restaurantId } = await params
  const supabase = await createClient()

  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', restaurantId)
    .single()

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Restaurant not found
          </h1>
          <Link
            href="/"
            className="text-primary hover:text-primary/90 font-medium"
          >
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  return <CartClient restaurant={restaurant} />
}
