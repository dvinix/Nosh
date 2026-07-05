'use client'

import { useState, useMemo } from 'react'
import { ArrowLeft, Download, Calendar, Activity } from 'lucide-react'
import Link from 'next/link'
import * as XLSX from 'xlsx'

interface OrderItem {
  item: {
    id: string
    name: string
    calories?: number
    protein_g?: number
    carbs_g?: number
    fat_g?: number
  }
  quantity: number
}

interface ProcessedOrder {
  id: string
  created_at: string
  restaurant_name: string
  items: OrderItem[]
  calories: number
  protein: number
  carbs: number
  fat: number
}

export function NutritionDashboardClient({ orders }: { orders: ProcessedOrder[] }) {
  // Extract available months from orders
  const availableMonths = useMemo(() => {
    const months = new Set<string>()
    orders.forEach(o => {
      const date = new Date(o.created_at)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      months.add(key)
    })
    
    const sorted = Array.from(months).sort((a, b) => b.localeCompare(a))
    // Default to current month if empty
    if (sorted.length === 0) {
      const now = new Date()
      sorted.push(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
    }
    return sorted
  }, [orders])

  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0])

  // Filter orders by selected month
  const monthOrders = useMemo(() => {
    return orders.filter(o => {
      const date = new Date(o.created_at)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      return key === selectedMonth
    })
  }, [orders, selectedMonth])

  // Calculate aggregates
  const aggregates = useMemo(() => {
    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0
    
    monthOrders.forEach(o => {
      totalCalories += o.calories
      totalProtein += o.protein
      totalCarbs += o.carbs
      totalFat += o.fat
    })
    
    const averageCalories = monthOrders.length > 0 ? Math.round(totalCalories / monthOrders.length) : 0
    
    return {
      totalCalories,
      totalProtein: Math.round(totalProtein),
      totalCarbs: Math.round(totalCarbs),
      totalFat: Math.round(totalFat),
      averageCalories
    }
  }, [monthOrders])

  // Weekly Chart Data
  const weeklyData = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split('-')
    const year = parseInt(yearStr)
    const month = parseInt(monthStr) - 1 // JS months are 0-indexed
    
    // Get number of days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    // Group into 4-5 weeks
    const weeks = [
      { label: 'Week 1', calories: 0, max: 0 },
      { label: 'Week 2', calories: 0, max: 0 },
      { label: 'Week 3', calories: 0, max: 0 },
      { label: 'Week 4', calories: 0, max: 0 },
      { label: 'Week 5', calories: 0, max: 0 },
    ]
    
    monthOrders.forEach(o => {
      const date = new Date(o.created_at)
      const day = date.getDate()
      const weekIndex = Math.min(Math.floor((day - 1) / 7), 4)
      weeks[weekIndex].calories += o.calories
    })
    
    const maxCalories = Math.max(...weeks.map(w => w.calories), 1) // Prevent division by zero
    
    return weeks.map(w => ({
      ...w,
      heightPercentage: Math.max((w.calories / maxCalories) * 100, w.calories > 0 ? 5 : 0) // Give small bar if > 0
    }))
  }, [monthOrders, selectedMonth])

  // Excel Export
  const downloadExcel = () => {
    if (monthOrders.length === 0) return
    
    const rows: any[] = []
    
    monthOrders.forEach(o => {
      const dateStr = new Date(o.created_at).toLocaleDateString()
      o.items.forEach(ci => {
        if (!ci.item.calories) return // Skip items without nutrition
        
        rows.push({
          Date: dateStr,
          Restaurant: o.restaurant_name,
          Dish: ci.item.name,
          Quantity: ci.quantity,
          Calories: (ci.item.calories || 0) * ci.quantity,
          'Protein (g)': (ci.item.protein_g || 0) * ci.quantity,
          'Carbs (g)': (ci.item.carbs_g || 0) * ci.quantity,
          'Fat (g)': (ci.item.fat_g || 0) * ci.quantity
        })
      })
    })
    
    // Add totals row
    rows.push({
      Date: 'TOTAL',
      Restaurant: '',
      Dish: '',
      Quantity: '',
      Calories: aggregates.totalCalories,
      'Protein (g)': aggregates.totalProtein,
      'Carbs (g)': aggregates.totalCarbs,
      'Fat (g)': aggregates.totalFat
    })

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Nutrition Report')
    
    const fileName = `nosh-calorie-report-${selectedMonth}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  // Format month name for display
  const monthName = new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            href="/account"
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Account</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="relative flex items-center">
              <Calendar className="absolute left-3 text-muted-foreground" size={16} />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="pl-9 pr-8 py-2 rounded-lg bg-secondary text-foreground border-transparent focus:ring-2 focus:ring-accent appearance-none font-medium"
              >
                {availableMonths.map(m => {
                  const date = new Date(parseInt(m.split('-')[0]), parseInt(m.split('-')[1]) - 1)
                  return (
                    <option key={m} value={m}>
                      {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </option>
                  )
                })}
              </select>
            </div>
            
            <button
              onClick={downloadExcel}
              disabled={monthOrders.length === 0}
              className="bg-[#FF4500] hover:bg-[#FF4500]/90 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Download Excel Report</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8 justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Activity className="text-primary" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Monthly Calorie Dashboard</h1>
          </div>
          <Link
            href="/account/planner"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm"
          >
            Plan My Week
          </Link>
        </div>

        {monthOrders.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <p className="text-xl font-medium text-foreground mb-2">No orders found for {monthName}</p>
            <p className="text-muted-foreground">Order some delicious meals to see your nutrition breakdown.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Hero Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-center items-center lg:col-span-2">
                <span className="text-muted-foreground text-sm font-medium mb-1 uppercase tracking-wider">Total Calories</span>
                <span className="text-5xl font-bold text-foreground font-mono">{aggregates.totalCalories.toLocaleString()}</span>
                <span className="text-muted-foreground text-sm mt-2">{aggregates.averageCalories.toLocaleString()} / order avg</span>
              </div>
              
              <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/50 p-6 shadow-sm flex flex-col justify-center items-center">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-1 uppercase tracking-wider">Protein</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-blue-700 dark:text-blue-300 font-mono">{aggregates.totalProtein}</span>
                  <span className="text-blue-600/70 dark:text-blue-400/70 font-medium">g</span>
                </div>
              </div>
              
              <div className="bg-orange-50/50 dark:bg-orange-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/50 p-6 shadow-sm flex flex-col justify-center items-center">
                <span className="text-orange-600 dark:text-orange-400 text-sm font-medium mb-1 uppercase tracking-wider">Carbs</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-orange-700 dark:text-orange-300 font-mono">{aggregates.totalCarbs}</span>
                  <span className="text-orange-600/70 dark:text-orange-400/70 font-medium">g</span>
                </div>
              </div>
              
              <div className="bg-red-50/50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/50 p-6 shadow-sm flex flex-col justify-center items-center">
                <span className="text-red-600 dark:text-red-400 text-sm font-medium mb-1 uppercase tracking-wider">Fat</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-red-700 dark:text-red-300 font-mono">{aggregates.totalFat}</span>
                  <span className="text-red-600/70 dark:text-red-400/70 font-medium">g</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Weekly Chart */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm lg:col-span-1 flex flex-col">
                <h3 className="text-lg font-bold text-foreground mb-6">Weekly Calories</h3>
                <div className="flex-1 flex items-end justify-between gap-2 h-48 pb-6">
                  {weeklyData.map((week, i) => (
                    <div key={i} className="flex flex-col items-center w-full group relative">
                      <div className="w-full flex justify-center h-full items-end pb-2">
                        <div 
                          className="w-full max-w-[40px] bg-[#FF4500]/20 hover:bg-[#FF4500] rounded-t-md transition-all duration-300 cursor-pointer relative"
                          style={{ height: `${week.heightPercentage}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10 shadow-sm border border-border">
                            {week.calories} kcal
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{week.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order List */}
              <div className="bg-card rounded-2xl border border-border shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-border">
                  <h3 className="text-lg font-bold text-foreground">Orders this month</h3>
                </div>
                <div className="divide-y divide-border overflow-y-auto max-h-[400px]">
                  {monthOrders.map(order => (
                    <div key={order.id} className="p-4 sm:p-6 hover:bg-secondary/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-foreground">{order.restaurant_name}</span>
                          <span className="text-muted-foreground text-sm">·</span>
                          <span className="text-muted-foreground text-sm">
                            {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground flex flex-wrap gap-2">
                          {order.items.filter(i => i.item.calories).map((item, idx) => (
                            <span key={idx}>
                              {item.quantity}x {item.item.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-mono font-bold text-lg text-foreground">{order.calories} kcal</div>
                        <div className="text-xs text-muted-foreground mt-1 font-medium">
                          <span className="text-blue-600 dark:text-blue-400">{order.protein}g P</span> · 
                          <span className="text-orange-600 dark:text-orange-400 ml-1">{order.carbs}g C</span> · 
                          <span className="text-red-600 dark:text-red-400 ml-1">{order.fat}g F</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
