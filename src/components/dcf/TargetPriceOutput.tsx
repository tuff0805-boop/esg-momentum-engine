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
  bearPrice, basePrice, adjPrice, bullPrice,
  upsidePct, rating, multiplier, quadrant,
  baseWACC, adjWACC, waccReduction,
}: TargetPriceOutputProps) {
  const ratingColor: Record<string, string> = {
    Overweight:  '#00C087',
    Accumulate:  '#1E6FD9',
    Neutral:     '#C4A85A',
    Underweight: '#E8323C',
  }

  const low  = bearPrice * 0.85
  const high = bullPrice * 1.05
  const pct  = (v: number) => ((v - low) / (high - low)) * 100
  const dotHex = ['#E8323C', '#8B9AAB', '#00C087', '#C4A85A']

  return (
    <div style={{ background: '#0D1117', border: '1px solid #1E2836', borderRadius: 4, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#E8EDF2' }}>ESG Target Price</div>
          <div style={{ width: 24, height: 2, background: '#E8323C', marginTop: 4, borderRadius: 1 }} />
        </div>
        <Badge variant={ratingVariant(rating)}>{rating}</Badge>
      </div>

      <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 500, color: ratingColor[rating], letterSpacing: '-0.01em', marginBottom: 2 }}>
        {rating}
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 12, color: upsidePct >= 0 ? '#00C087' : '#E8323C', marginBottom: 16 }}>
        {upsidePct >= 0 ? '+' : ''}{upsidePct.toFixed(1)}% ESG financial materiality impact
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
        {[
          { label: 'Bear',       price: bearPrice, color: '#E8323C' },
          { label: 'Base (ESG)', price: adjPrice,  color: '#00C087' },
          { label: 'Bull',       price: bullPrice, color: '#C4A85A' },
        ].map(s => (
          <div key={s.label} style={{ background: '#080B10', border: '1px solid #1E2836', borderRadius: 4, padding: '8px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 500, color: s.color }}>{fmt(s.price)}</div>
          </div>
        ))}
      </div>

      <div style={{ position: 'relative', marginBottom: 16 }}>
        <div style={{ height: 3, background: '#1E2836', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to right, #E8323C, #C4A85A, #00C087)', borderRadius: 2 }} />
        </div>
        {[bearPrice, basePrice, adjPrice, bullPrice].map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
              width: 10, height: 10, borderRadius: '50%',
              left: `${Math.min(96, Math.max(4, pct(p)))}%`,
              background: dotHex[i], border: '2px solid #0D1117',
            }}
          />
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#4A5568', marginTop: 6 }}>
          <span>Bear {fmt(bearPrice)}</span>
          <span>Bull {fmt(bullPrice)}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 11 }}>
        {[
          ['ESG Momentum Multiplier', `${(multiplier * 100).toFixed(0)}%`, '#E8EDF2'],
          ['Quadrant', quadrant, '#E8EDF2'],
          ['Base WACC', `${baseWACC.toFixed(2)}%`, '#E8EDF2'],
          [`Adj WACC (-${waccReduction.toFixed(0)} bps)`, `${adjWACC.toFixed(2)}%`, '#00C087'],
        ].map(([label, val, color]) => (
          <div key={label as string}>
            <div style={{ color: '#4A5568', fontSize: 10 }}>{label}</div>
            <div style={{ fontFamily: 'monospace', color: color as string, fontSize: 12 }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
