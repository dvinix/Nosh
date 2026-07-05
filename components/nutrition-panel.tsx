'use client'

import { useState } from 'react'
import { Flame, Beef, Wheat, Droplets, Sparkles, RefreshCw, TrendingDown, Brain, ChevronRight } from 'lucide-react'

interface NutritionData {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

interface InsightPayload {
  deepAnalysis?: string
  swapSuggestion?: string
}

interface NutritionPanelProps {
  dishId: string
  dishName: string
  nutrition: NutritionData
  quantity?: number
  compact?: boolean
}

function MacroBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}

function MacroStat({
  icon, label, value, unit, color, barMax, barColor,
}: {
  icon: React.ReactNode; label: string; value: number; unit: string
  color: string; barMax: number; barColor: string
}) {
  return (
    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <span style={{ color }}>{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/50">{label}</span>
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="font-mono text-xl font-bold text-white leading-none">{Math.round(value)}</span>
        <span className="font-mono text-xs text-white/40">{unit}</span>
      </div>
      <MacroBar value={value} max={barMax} color={barColor} />
    </div>
  )
}

function parseInsight(raw: string): InsightPayload {
  try {
    return JSON.parse(raw) as InsightPayload
  } catch {
    // Legacy single-string format — treat as deepAnalysis
    return { deepAnalysis: raw, swapSuggestion: undefined }
  }
}

export function NutritionPanel({ dishId, dishName, nutrition, quantity = 1, compact = false }: NutritionPanelProps) {
  const [payload, setPayload] = useState<InsightPayload | null>(null)
  const [insightLoading, setInsightLoading] = useState(false)
  const [insightError, setInsightError] = useState(false)
  const [showInsight, setShowInsight] = useState(false)

  const cal     = Math.round(nutrition.calories * quantity)
  const protein = +(nutrition.protein_g * quantity).toFixed(1)
  const carbs   = +(nutrition.carbs_g * quantity).toFixed(1)
  const fat     = +(nutrition.fat_g * quantity).toFixed(1)

  const fetchInsight = async () => {
    setInsightLoading(true)
    setInsightError(false)
    try {
      const res = await fetch(`/api/nutrition-insight/${dishId}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      // Server returns deepAnalysis + swapSuggestion directly, or insight JSON blob from cache
      if (data.deepAnalysis !== undefined || data.swapSuggestion !== undefined) {
        setPayload({ deepAnalysis: data.deepAnalysis, swapSuggestion: data.swapSuggestion })
      } else if (data.insight) {
        setPayload(parseInsight(data.insight))
      }
    } catch {
      setInsightError(true)
    } finally {
      setInsightLoading(false)
    }
  }

  const handleToggleInsight = () => {
    if (!showInsight && !payload) fetchInsight()
    setShowInsight((v) => !v)
  }

  // ── Compact cart row ──────────────────────────────────────────
  if (compact) {
    return (
      <div className="mt-2 flex items-center gap-3 text-xs font-mono text-muted-foreground">
        <span className="flex items-center gap-1"><Flame size={12} className="text-orange-400" />{cal} kcal</span>
        <span className="flex items-center gap-1"><Beef size={12} className="text-blue-400" />{protein}g P</span>
        <span className="flex items-center gap-1"><Wheat size={12} className="text-yellow-400" />{carbs}g C</span>
        <span className="flex items-center gap-1"><Droplets size={12} className="text-pink-400" />{fat}g F</span>
      </div>
    )
  }

  // ── Full dashboard ────────────────────────────────────────────
  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
      {/* Dark macro dashboard */}
      <div
        className="relative p-4"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.3) 20px, rgba(255,255,255,0.3) 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.3) 20px, rgba(255,255,255,0.3) 21px)',
          }}
        />
        <div className="relative">
          {/* Calories hero */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">
                Energy per serving{quantity > 1 ? ` × ${quantity}` : ''}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-4xl font-black text-white">{cal}</span>
                <span className="font-mono text-sm text-white/50 font-medium">kcal</span>
              </div>
            </div>
            <div
              className="flex items-center justify-center rounded-xl p-2.5"
              style={{ background: 'rgba(212,165,116,0.15)', border: '1px solid rgba(212,165,116,0.3)' }}
            >
              <Flame size={22} style={{ color: '#d4a574' }} />
            </div>
          </div>

          {/* Daily value bar */}
          <div className="mb-5">
            <div className="flex justify-between text-[10px] font-mono text-white/30 mb-1">
              <span>Daily value</span>
              <span>{Math.round((cal / 2000) * 100)}% of 2000 kcal</span>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min(100, Math.round((cal / 2000) * 100))}%`,
                  background: 'linear-gradient(90deg, #d4a574, #e8a87c)',
                }}
              />
            </div>
          </div>

          {/* Macros */}
          <div className="flex gap-4">
            <MacroStat icon={<Beef size={12} />} label="Protein" value={protein} unit="g" color="#60a5fa" barMax={60} barColor="#3b82f6" />
            <div className="w-px bg-white/10" />
            <MacroStat icon={<Wheat size={12} />} label="Carbs" value={carbs} unit="g" color="#fbbf24" barMax={100} barColor="#f59e0b" />
            <div className="w-px bg-white/10" />
            <MacroStat icon={<Droplets size={12} />} label="Fat" value={fat} unit="g" color="#f472b6" barMax={60} barColor="#ec4899" />
          </div>
        </div>
      </div>

      {/* AI Insight section */}
      <div className="bg-card border-t border-border">
        <button
          onClick={handleToggleInsight}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-accent" />
            <span className="text-sm font-medium text-foreground">AI Health Insight</span>
            <span className="text-[10px] font-mono bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">
              Groq API
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{showInsight ? 'Hide ▲' : 'Show ▼'}</span>
        </button>

        {showInsight && (
          <div className="px-4 pb-4 space-y-3">
            {/* Loading */}
            {insightLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse py-2">
                <RefreshCw size={14} className="animate-spin" />
                <span>Analysing with Groq...</span>
              </div>
            )}

            {/* Error */}
            {insightError && !insightLoading && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Couldn't load insight.</span>
                <button
                  onClick={fetchInsight}
                  className="text-xs text-accent hover:underline flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Retry
                </button>
              </div>
            )}

            {/* Deep Analysis (Groq) */}
            {payload && !insightLoading && payload.deepAnalysis && (
              <div
                className="rounded-xl p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(96,165,250,0.06) 0%, rgba(59,130,246,0.06) 100%)',
                  border: '1px solid rgba(96,165,250,0.18)',
                }}
              >
                <div className="flex gap-3">
                  <div
                    className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(96,165,250,0.12)' }}
                  >
                    <Brain size={14} style={{ color: '#60a5fa' }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#60a5fa' }}>
                        Deep Nutrition Analysis
                      </p>
                      <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded-full">
                        Groq · Llama 3.3
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{payload.deepAnalysis}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Swap Suggestion (Groq) */}
            {payload && !insightLoading && payload.swapSuggestion && (
              <div
                className="rounded-xl p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(212,90,58,0.07) 0%, rgba(212,165,116,0.07) 100%)',
                  border: '1px solid rgba(212,90,58,0.2)',
                }}
              >
                <div className="flex gap-3">
                  <div
                    className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(212,90,58,0.12)' }}
                  >
                    <TrendingDown size={14} style={{ color: '#d45a3a' }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#d45a3a' }}>
                        Lighter Alternative
                      </p>
                      <span className="text-[10px] font-mono bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded-full">
                        Groq · Llama 3.3
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{payload.swapSuggestion}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

}
