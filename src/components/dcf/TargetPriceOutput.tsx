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
  const ratingColor: Record<string, string> = {
    Overweight:  '#00C087',
    Accumulate:  '#60A5FA',
    Neutral:     '#C4A85A',
    Underweight: '#E8323C',
  }

  const low  = bearPrice * 0.85
  const high = bullPrice * 1.05
  const pct  = (v: number) => ((v - low) / (high - low)) * 100

  const dotHex = ['#E8323C', '#8B9AAB', '#00C087', '#C4A85A']

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="card-title">ESG Target Price</div>
        <Badge variant={ratingVariant(rating)}>{rating}</Badge>
      </div>

      <div className="font-mono text-5xl font-bold tracking-tight mb-1" style={{ color: ratingColor[rating] }}>
        {rating}
      </div>
      <div className="font-mono text-sm mb-5" style={{ color: upsidePct >= 0 ? '#00C087' : '#E8323C' }}>
        {upsidePct >= 0 ? '+' : ''}{upsidePct.toFixed(1)}% ESG Impact on Financial Materiality
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Bear',       price: bearPrice, color: '#E8323C' },
          { label: 'Base (ESG)', price: adjPrice,  color: '#00C087' },
          { label: 'Bull',       price: bullPrice, color: '#C4A85A' },
        ].map(s => (
          <div key={s.label} className="rounded-lg p-3 text-center" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div className="text-[10px] text-secondary uppercase tracking-widest mb-1">{s.label}</div>
            <div className="font-mono text-base font-bold" style={{ color: s.color }}>{fmt(s.price)}</div>
          </div>
        ))}
      </div>

      <div className="relative mb-5">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#2A3441' }}>
          <div
            className="h-full rounded-full"
            style={{ width: '100%', background: 'linear-gradient(to right, #E8323C, #C4A85A, #00C087)' }}
          />
        </div>
        {[bearPrice, basePrice, adjPrice, bullPrice].map((p, i) => (
          <div
            key={i}
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
            style={{ left: `${Math.min(96, Math.max(4, pct(p)))}%`, background: dotHex[i], outline: '2px solid var(--surface)' }}
          />
        ))}
        <div className="flex justify-between text-[9px] text-secondary mt-1.5">
          <span>Bear {fmt(bearPrice)}</span>
          <span>Bull {fmt(bullPrice)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        {[
          ['ESG Momentum Multiplier', `${(multiplier * 100).toFixed(0)}%`, '#FFFFFF'],
          ['Quadrant', quadrant, '#FFFFFF'],
          ['Base WACC', `${baseWACC.toFixed(2)}%`, '#FFFFFF'],
          [`Adj WACC (-${waccReduction.toFixed(0)} basis points)`, `${adjWACC.toFixed(2)}%`, '#00C087'],
        ].map(([label, val, color]) => (
          <div key={label as string}>
            <div className="text-secondary">{label}</div>
            <div className="font-mono" style={{ color: color as string }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
