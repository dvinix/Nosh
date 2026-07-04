'use client'

import { useState } from 'react'
import { Edit2, LogOut, MapPin, Heart, Settings } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export interface Order {
  id: string
  restaurantName: string
  date: string
  total: number
  status: 'completed' | 'pending' | 'cancelled'
  items: number
}

interface AccountClientProps {
  orders: Order[]
  user: {
    email: string
    name: string
    initials: string
  }
}

const mockFavorites = [
  {
    id: '1',
    name: 'Ember & Oak',
    cuisine: 'Modern, Comfort',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  },
]

const mockAddresses = [
  {
    id: '1',
    name: 'Home',
    address: '123 Main Street, Apt 4B',
    city: 'San Francisco, CA 94102',
    default: true,
  },
]

export function AccountClient({ orders, user }: AccountClientProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'favorites' | 'addresses' | 'settings'>(
    'orders'
  )
  const router = useRouter()
  const supabase = createClient()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'pending':
        return 'text-amber-600 bg-amber-50'
      case 'cancelled':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-primary hover:text-primary/90 font-medium text-sm">
              ← Back to Home
            </Link>
            <h1 className="text-2xl font-bold text-foreground">My Account</h1>
            <button onClick={handleLogout} className="p-2 hover:bg-secondary rounded-lg transition-colors text-destructive">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Profile Card */}
            <div className="bg-card rounded-xl border border-border p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                  {user.initials}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-sm font-medium text-foreground">
                <Edit2 size={16} />
                Edit Profile
              </button>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {[
                { id: 'orders', label: 'My Orders', icon: '📋' },
                { id: 'favorites', label: 'Favorites', icon: '❤️' },
                { id: 'addresses', label: 'Addresses', icon: '📍' },
                { id: 'settings', label: 'Settings', icon: '⚙️' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary text-foreground'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6">Order History</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-12 bg-card rounded-lg border border-border">
                    <p className="text-muted-foreground mb-4">No orders yet</p>
                    <Link
                      href="/"
                      className="inline-block text-primary hover:text-primary/90 font-medium"
                    >
                      Start ordering
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {order.restaurantName}
                            </h3>
                            <p className="text-sm text-muted-foreground">{order.date}</p>
                          </div>
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {order.items} {order.items === 1 ? 'item' : 'items'}
                          </span>
                          <span className="font-semibold text-foreground">
                            ${order.total.toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border">
                          <button className="text-primary hover:text-primary/90 text-sm font-medium">
                            Reorder
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6">Favorite Restaurants</h2>
                {mockFavorites.length === 0 ? (
                  <div className="text-center py-12 bg-card rounded-lg border border-border">
                    <p className="text-muted-foreground">No favorites yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {mockFavorites.map((restaurant) => (
                      <Link
                        key={restaurant.id}
                        href={`/restaurant/${restaurant.id}`}
                        className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all"
                      >
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={restaurant.image}
                            alt={restaurant.name}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                          />
                          <button className="absolute top-3 right-3 p-2 rounded-full bg-white hover:bg-gray-100 transition-colors shadow-md">
                            <Heart size={18} className="fill-red-500 text-red-500" />
                          </button>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-foreground line-clamp-1">
                            {restaurant.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {restaurant.cuisine}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Delivery Addresses</h2>
                  <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold text-sm">
                    Add Address
                  </button>
                </div>
                <div className="space-y-3">
                  {mockAddresses.map((address) => (
                    <div
                      key={address.id}
                      className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <MapPin size={20} className="text-primary flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold text-foreground">{address.name}</h3>
                            <p className="text-sm text-muted-foreground">{address.address}</p>
                            <p className="text-sm text-muted-foreground">{address.city}</p>
                          </div>
                        </div>
                        {address.default && (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button className="text-primary hover:text-primary/90 text-sm font-medium">
                          Edit
                        </button>
                        <button className="text-destructive hover:text-destructive/90 text-sm font-medium">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6">Settings</h2>
                <div className="space-y-4">
                  {[
                    {
                      title: 'Email Notifications',
                      description: 'Receive updates about your orders and promotions',
                      enabled: true,
                    },
                    {
                      title: 'Push Notifications',
                      description: 'Get alerts when your food is ready',
                      enabled: true,
                    },
                    {
                      title: 'Personalized Recommendations',
                      description: 'Receive suggestions based on your order history',
                      enabled: false,
                    },
                  ].map((setting) => (
                    <div
                      key={setting.title}
                      className="bg-card rounded-lg border border-border p-4 flex items-center justify-between"
                    >
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {setting.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {setting.description}
                        </p>
                      </div>
                      <button
                        className={`relative w-12 h-7 rounded-full transition-colors ${
                          setting.enabled ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                            setting.enabled ? 'translate-x-5' : ''
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Danger Zone */}
                <div className="mt-8 pt-8 border-t border-border">
                  <h3 className="font-semibold text-destructive mb-4">Account Settings</h3>
                  <button className="px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors font-semibold text-sm">
                    Delete Account
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
