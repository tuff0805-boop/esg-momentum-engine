import { Badge, ratingVariant } from '../shared/Badge'

interface TargetPriceOutputProps {
  bearPrice: number
  basePrice: number
  adjPrice: number
  bullPrice: number
  upsidePct: number
  rating: 'Overweight' | 'Accumulate' | 'Neutral' | 'Underweight'
  multiplier: number
  quadrant: string
  baseWACC: number
  adjWACC: number
  waccReduction: number
}

function fmt(v: number): string {
  if (v >= 1000) return v.toLocaleString(undefined, { maximumFractionDigits: 0 })
  if (v >= 10) return v.toFixed(2)
  return v.toFixed(3)
}

export function TargetPriceOutput({
  bearPrice,
  basePrice,
  adjPrice,
  bullPrice,
  upsidePct,
  rating,
  multiplier,
  quadrant,
  baseWACC,
  adjWACC,
  waccReduction,
}: TargetPriceOutputProps) {
  const ratingColors: Record<string, string> = {
    Overweight: 'text-blue-500',
    Accumulate: 'text-blue-400',
    Neutral: 'text-amber-400',
    Underweight: 'text-red-400',
  }

  // Range bar: map prices onto 0-100
  const low = bearPrice * 0.85
  const high = bullPrice * 1.05
  const pct = (v: number) => ((v - low) / (high - low)) * 100

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="card-title">ESG Target Price</div>
        <Badge variant={ratingVariant(rating)}>{rating}</Badge>
      </div>

      <div className={`font-mono text-5xl font-bold tracking-tight mb-1 ${ratingColors[rating]}`}>
        {rating}
      </div>
      <div className={`font-mono text-sm mb-5 ${upsidePct >= 0 ? 'text-accent' : 'text-danger'}`}>
        {upsidePct >= 0 ? '+' : ''}{upsidePct.toFixed(1)}% ESG Impact on Financial Materiality
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Bear', price: bearPrice, color: 'text-danger' },
          { label: 'Base (ESG)', price: adjPrice, color: 'text-accent' },
          { label: 'Bull', price: bullPrice, color: 'text-amber' },
        ].map(s => (
          <div key={s.label} className="rounded-lg p-3 text-center" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div className="text-[10px] text-secondary uppercase tracking-widest mb-1">{s.label}</div>
            <div className={`font-mono text-base font-bold ${s.color}`}>{fmt(s.price)}</div>
          </div>
        ))}
      </div>

      <div className="relative mb-5">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div className="h-full bg-gradient-to-r from-red-500 via-emerald-500 to-amber-500 opacity-60 rounded-full" style={{ width: '100%' }} />
        </div>
        {[bearPrice, basePrice, adjPrice, bullPrice].map((p, i) => {
          const dotColors = ['bg-red-400', 'bg-slate-400', 'bg-emerald-400', 'bg-amber-400']
          return (
            <div
              key={i}
              className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${dotColors[i]}`}
              style={{ left: `${Math.min(96, Math.max(4, pct(p)))}%`, outline: '2px solid var(--surface)' }}
            />
          )
        })}
        <div className="flex justify-between text-[9px] text-secondary mt-1.5">
          <span>Bear {fmt(bearPrice)}</span>
          <span>Bull {fmt(bullPrice)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        {[
          ['ESG Momentum Multiplier', `${(multiplier * 100).toFixed(0)}%`, 'text-primary'],
          ['Quadrant', quadrant, 'text-primary'],
          ['Base WACC', `${baseWACC.toFixed(2)}%`, 'text-primary'],
          [`Adj WACC (-${waccReduction.toFixed(0)} basis points)`, `${adjWACC.toFixed(2)}%`, 'text-accent'],
        ].map(([label, val, cls]) => (
          <div key={label as string}>
            <div className="text-secondary">{label}</div>
            <div className={`font-mono ${cls}`}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
