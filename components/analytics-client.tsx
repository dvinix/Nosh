'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { ArrowLeft, Download, TrendingUp, TrendingDown, Award, PieChart as PieChartIcon } from 'lucide-react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import * as htmlToImage from 'html-to-image'

interface AnalyticsClientProps {
  orders: any[]
  user: { name: string }
}

const COLORS = ['#d45a3a', '#e07a5f', '#f4a261', '#e9c46a', '#2a9d8f', '#264653']

export function AnalyticsClient({ orders, user }: AnalyticsClientProps) {
  const [tag, setTag] = useState<string>('')
  const [loadingTag, setLoadingTag] = useState(true)
  const wrappedRef = useRef<HTMLDivElement>(null)

  // Determine current month key
  const now = new Date()
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`

  const stats = useMemo(() => {
    let thisMonthSpend = 0
    let lastMonthSpend = 0
    let thisMonthOrdersCount = 0
    let thisMonthCalories = 0
    
    const dayCounts = [0, 0, 0, 0, 0, 0, 0] // Sun-Sat
    const categorySpend: Record<string, number> = {}
    const dishCounts: Record<string, { count: number, name: string, restaurant: string }> = {}

    orders.forEach(o => {
      const date = new Date(o.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const total = Number(o.total) || 0

      if (monthKey === currentMonthKey) {
        thisMonthSpend += total
        thisMonthOrdersCount++
        dayCounts[date.getDay()]++

        o.items.forEach((ci: any) => {
          const qty = ci.quantity || 1
          if (ci.dishInfo) {
            // Calories
            thisMonthCalories += (ci.dishInfo.calories || 0) * qty
            
            // Category Spend
            const cat = ci.dishInfo.category || 'Other'
            categorySpend[cat] = (categorySpend[cat] || 0) + ((ci.dishInfo.price || 0) * qty)
            
            // Dish counts
            const dId = ci.dishInfo.id
            if (!dishCounts[dId]) {
              dishCounts[dId] = { count: 0, name: ci.dishInfo.name, restaurant: o.restaurants?.name || '' }
            }
            dishCounts[dId].count += qty
          }
        })
      } else if (monthKey === lastMonthKey) {
        lastMonthSpend += total
      }
    })

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayData = dayCounts.map((count, i) => ({ name: days[i], orders: count }))

    const catData = Object.entries(categorySpend)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    const topDishes = Object.values(dishCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

    const topCuisine = catData.length > 0 ? catData[0].name : 'None'

    return {
      thisMonthSpend,
      lastMonthSpend,
      thisMonthOrdersCount,
      thisMonthCalories,
      dayData,
      catData,
      topDishes,
      topCuisine
    }
  }, [orders, currentMonthKey, lastMonthKey])

  useEffect(() => {
    // Only fetch tag if we have orders this month to generate from
    if (stats.thisMonthOrdersCount > 0) {
      fetch('/api/generate-tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: currentMonthKey,
          stats: {
            orders: stats.thisMonthOrdersCount,
            spend: stats.thisMonthSpend,
            topCuisine: stats.topCuisine,
            topDish: stats.topDishes[0]?.name
          }
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.tag) setTag(data.tag)
          setLoadingTag(false)
        })
        .catch(() => setLoadingTag(false))
    } else {
      setLoadingTag(false)
    }
  }, [stats, currentMonthKey])

  const spendDiff = stats.thisMonthSpend - stats.lastMonthSpend
  const spendDiffPercent = stats.lastMonthSpend > 0 ? (spendDiff / stats.lastMonthSpend) * 100 : 0

  const handleDownload = () => {
    if (!wrappedRef.current) return
    htmlToImage.toPng(wrappedRef.current, { quality: 1, backgroundColor: '#000000' })
      .then((dataUrl) => {
        const link = document.createElement('a')
        link.download = `nosh-wrapped-${currentMonthKey}.png`
        link.href = dataUrl
        link.click()
      })
      .catch((err) => {
        console.error('Failed to export image', err)
      })
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/account" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Account</span>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Analytics</h1>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Top level stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Spend This Month</p>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-bold font-mono text-foreground">${stats.thisMonthSpend.toFixed(2)}</p>
              {stats.lastMonthSpend > 0 && (
                <div className={`flex items-center text-sm font-medium pb-1 ${spendDiff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {spendDiff > 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                  {Math.abs(spendDiffPercent).toFixed(0)}%
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">vs ${stats.lastMonthSpend.toFixed(2)} last month</p>
          </div>
          
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Total Orders</p>
            <p className="text-4xl font-bold font-mono text-foreground">{stats.thisMonthOrdersCount}</p>
          </div>
          
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm lg:col-span-2">
            <p className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Top Ordered Dishes</p>
            {stats.topDishes.length === 0 ? (
              <p className="text-muted-foreground">No orders this month.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {stats.topDishes.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">{i + 1}</div>
                      <div>
                        <p className="text-sm font-bold text-foreground line-clamp-1">{d.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{d.restaurant}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-foreground text-sm bg-secondary px-2 py-1 rounded">x{d.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Bar Chart */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-6">Orders by Day of Week</h3>
            <div className="h-64 w-full">
              {stats.thisMonthOrdersCount === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.dayData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#1f1f1f', borderColor: '#333', borderRadius: '8px', color: '#fff'}} />
                    <Bar dataKey="orders" fill="#d45a3a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-6">Spend by Cuisine</h3>
            <div className="h-64 w-full flex items-center">
              {stats.catData.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">No data</div>
              ) : (
                <>
                  <ResponsiveContainer width="50%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.catData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.catData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} contentStyle={{backgroundColor: '#1f1f1f', borderColor: '#333', borderRadius: '8px', color: '#fff'}} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="w-50% pl-4 flex flex-col gap-2">
                    {stats.catData.slice(0, 5).map((entry, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span className="text-foreground">{entry.name}</span>
                        </div>
                        <span className="font-mono text-muted-foreground">${entry.value.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* NOSH WRAPPED */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Nosh Wrapped</h2>
            <button 
              onClick={handleDownload}
              disabled={stats.thisMonthOrdersCount === 0}
              className="bg-secondary hover:bg-secondary/80 text-foreground font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm disabled:opacity-50"
            >
              <Download size={16} /> Save Image
            </button>
          </div>
          
          <div className="flex justify-center">
            {stats.thisMonthOrdersCount === 0 ? (
              <div className="bg-card rounded-2xl border border-border p-12 text-center w-full max-w-md">
                <p className="text-muted-foreground">No orders this month to generate your Wrapped.</p>
              </div>
            ) : (
              <div 
                ref={wrappedRef} 
                className="bg-[#121212] w-full max-w-md rounded-3xl overflow-hidden relative shadow-2xl border border-[#333]"
                style={{ width: '400px', height: '600px' }} // Fixed dimensions for the export
              >
                {/* Decorative background elements */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/30 rounded-full blur-[80px]"></div>
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px]"></div>
                
                <div className="p-8 h-full flex flex-col relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-primary font-black text-2xl tracking-tighter">NOSH</h3>
                      <p className="text-white/60 font-medium text-sm tracking-widest uppercase">Wrapped {now.getFullYear()}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-white text-xs font-bold uppercase tracking-widest">
                      {now.toLocaleString('default', { month: 'short' })}
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <p className="text-white/80 text-lg mb-2">This month, {user.name}, you were...</p>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                      {loadingTag ? (
                        <div className="h-16 flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <h2 className="text-2xl font-bold text-white leading-tight italic">
                          "{tag}"
                        </h2>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex flex-col justify-center">
                      <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">Top Dish</p>
                      <p className="text-white font-bold text-lg leading-tight line-clamp-2">{stats.topDishes[0]?.name}</p>
                    </div>
                    
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex flex-col justify-center">
                      <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">Top Cuisine</p>
                      <p className="text-white font-bold text-lg leading-tight line-clamp-2">{stats.topCuisine}</p>
                    </div>
                    
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex flex-col justify-center">
                      <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">Total Spend</p>
                      <p className="text-primary font-bold text-2xl font-mono">${stats.thisMonthSpend.toFixed(0)}</p>
                    </div>
                    
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex flex-col justify-center">
                      <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">Calories</p>
                      <p className="text-orange-400 font-bold text-2xl font-mono">{stats.thisMonthCalories.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}
