import { motion } from 'framer-motion'
import type { NewsItem } from '../data/companies'

interface EventAnalyticsModalProps {
  item: NewsItem | null
  companyName: string
  companySES: number
  onClose: () => void
}

const SENTIMENT_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  'very-positive': { bg: '#003D2B', color: '#00C087',  label: 'Very Positive' },
  'positive':      { bg: '#003D2B', color: '#00C087',  label: 'Positive'      },
  'neutral':       { bg: '#131920', color: '#8B9AAB',  label: 'Neutral'       },
  'negative':      { bg: '#2A1A00', color: '#C4A85A',  label: 'Negative'      },
  'very-negative': { bg: '#3D0A0C', color: '#E8323C',  label: 'Very Negative' },
}

const PILLAR_STYLE: Record<string, { bg: string; color: string }> = {
  E:   { bg: '#003D2B', color: '#00C087' },
  S:   { bg: '#0A2A52', color: '#60A5FA' },
  G:   { bg: '#1A0A2E', color: '#C084FC' },
  ESG: { bg: '#131920', color: '#8B9AAB' },
}

const SENTIMENT_MULT: Record<string, number> = {
  'very-positive': 1,
  'positive': 0.5,
  'neutral': 0,
  'negative': -0.5,
  'very-negative': -1,
}

function Badge({ bg, color, border, children }: { bg: string; color: string; border: string; children: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
      borderRadius: 3, fontSize: 11, fontWeight: 500, background: bg, color, border: `1px solid ${border}` }}>
      {children}
    </span>
  )
}

function getImpactText(sentiment: string, severity: number): string {
  if (sentiment === 'very-positive' && severity === 3) return 'Est. 12–15% improvement in relevant ESG sub-score'
  if (sentiment === 'very-positive' && severity === 2) return 'Est. 6–10% improvement'
  if (sentiment === 'positive') return 'Est. 3–6% improvement'
  if (sentiment === 'negative') return 'Est. 3–8% deterioration'
  if (sentiment === 'very-negative') return 'Est. 10–15% deterioration'
  return 'Minimal estimated impact on ESG sub-scores'
}

export function EventAnalyticsModal({ item, companyName, companySES, onClose }: EventAnalyticsModalProps) {
  if (!item) return null

  const mult = SENTIMENT_MULT[item.sentiment] ?? 0
  const severity = item.severity ?? 2
  const msciDelta  = Math.round((item.pillar === 'E' ? 4 : item.pillar === 'G' ? 3 : 2) * severity * mult)
  const sustDelta  = Math.round((item.pillar === 'S' ? 4 : 3) * severity * mult)
  const bbgDelta   = Math.round(2.5 * severity * mult)

  const deltas = [msciDelta, sustDelta, bbgDelta]
  const maxDiff = Math.max(...deltas) - Math.min(...deltas)
  const hasDivergence = maxDiff > 2

  const sent = SENTIMENT_STYLE[item.sentiment] ?? SENTIMENT_STYLE.neutral
  const pil  = PILLAR_STYLE[item.pillar] ?? PILLAR_STYLE.ESG

  const avgDelta = Math.round((msciDelta + sustDelta + bbgDelta) / 3)
  const isPositive = avgDelta >= 0

  const primaryChannel = item.pillar === 'E' ? 'WACC reduction' : item.pillar === 'S' ? 'Revenue uplift' : 'Risk premium'
  const finImpact = (severity * 0.8 * Math.abs(mult)).toFixed(1)

  const rows = [
    { agency: 'MSCI',           delta: msciDelta,  lag: '6–12 months' },
    { agency: 'Sustainalytics', delta: sustDelta,  lag: '3–6 months'  },
    { agency: 'Bloomberg',      delta: bbgDelta,   lag: '6–9 months'  },
  ]

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        style={{ width: 'min(820px, 92vw)', maxHeight: '88vh', background: '#0D1117',
          border: '1px solid #2A3A4A', borderRadius: 8, display: 'flex', flexDirection: 'column',
          overflow: 'hidden' }}
      >
        {/* HEADER */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #1E2836', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Badge bg={sent.bg} color={sent.color} border={sent.color + '44'}>{sent.label}</Badge>
              <Badge bg={pil.bg} color={pil.color} border={pil.color + '44'}>{item.pillar}</Badge>
              <Badge bg="#0A2A52" color="#60A5FA" border="#0F3D7A">{item.eventType}</Badge>
            </div>
            <button onClick={onClose}
              style={{ color: '#8B9AAB', background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#E8EDF2', lineHeight: 1.4, marginBottom: 6 }}>
            {item.headline}
          </div>
          <div style={{ fontSize: 12, color: '#4A5568' }}>{companyName} · {item.date}</div>
        </div>

        {/* BODY */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* TWO-COLUMN */}
          <div style={{ display: 'grid', gridTemplateColumns: '45% 55%', borderBottom: '1px solid #1E2836' }}>
            {/* LEFT — What Happened */}
            <div style={{ padding: 24, borderRight: '1px solid #1E2836' }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em',
                color: '#4A5568', marginBottom: 12 }}>What Happened</div>
              <div style={{ fontSize: 13, color: '#E8EDF2', lineHeight: 1.6, marginBottom: 16 }}>
                {item.summary}
              </div>
              {/* SDG chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                <span style={{ fontSize: 9, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.08em' }}>SDG</span>
                {item.sdgGoals.map(n => (
                  <span key={n} style={{ display: 'inline-flex', alignItems: 'center', padding: '1px 5px',
                    borderRadius: 2, fontSize: 10, fontWeight: 500,
                    background: '#131920', color: '#8B9AAB', border: '1px solid #1E2836' }}>
                    SDG {n}
                  </span>
                ))}
              </div>
              {/* Estimated Impact */}
              <div style={{ background: '#080B10', border: '1px solid #1E2836', borderRadius: 4, padding: 12 }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: '#4A5568', marginBottom: 6 }}>Estimated Impact</div>
                <div style={{ fontSize: 13, color: '#E8EDF2', marginBottom: 6 }}>
                  {getImpactText(item.sentiment, severity)}
                </div>
                <div style={{ fontSize: 11, color: '#8B9AAB', lineHeight: 1.5 }}>
                  Rating agencies typically update scores 12–18 months after such events.
                </div>
              </div>
            </div>

            {/* RIGHT — How Agencies Respond */}
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em',
                color: '#4A5568', marginBottom: 16 }}>How Agencies Respond</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1E2836' }}>
                    {['Agency', 'Current Score', 'Est. Post-event', 'Δ Change', 'Typical Lag'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: 10,
                        color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => {
                    const post = (companySES + row.delta).toFixed(1)
                    const diffFromOthers = deltas.filter(d => d !== row.delta)
                    const highlight = diffFromOthers.some(d => Math.abs(d - row.delta) > 2)
                    return (
                      <tr key={row.agency} style={{ borderBottom: '1px solid #1E2836' }}>
                        <td style={{ padding: '10px 8px', color: '#E8EDF2', fontWeight: 500 }}>{row.agency}</td>
                        <td style={{ padding: '10px 8px', color: '#8B9AAB', fontFamily: 'monospace' }}>
                          {companySES.toFixed(1)}
                        </td>
                        <td style={{ padding: '10px 8px', color: '#E8EDF2', fontFamily: 'monospace' }}>{post}</td>
                        <td style={{ padding: '10px 8px', fontFamily: 'monospace',
                          background: highlight ? 'rgba(196,168,90,0.12)' : 'transparent',
                          color: row.delta > 0 ? '#00C087' : row.delta < 0 ? '#E8323C' : '#8B9AAB' }}>
                          {row.delta > 0 ? '▲' : row.delta < 0 ? '▼' : '—'} {Math.abs(row.delta)} pts
                        </td>
                        <td style={{ padding: '10px 8px', color: '#8B9AAB', fontSize: 11 }}>{row.lag}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {hasDivergence && (
                <div style={{ marginTop: 16, background: 'rgba(196,168,90,0.08)', border: '1px solid #C4A85A44',
                  borderRadius: 4, padding: '10px 12px', fontSize: 12, color: '#C4A85A', lineHeight: 1.5 }}>
                  ⚠ Agency Divergence Detected — estimates diverge by {maxDiff} points on this event.
                  This gap represents a potential mispricing opportunity.
                </div>
              )}
            </div>
          </div>

          {/* FULL-WIDTH — What This Means For You */}
          <div style={{ padding: 24 }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em',
              color: '#4A5568', marginBottom: 16 }}>What This Means For You</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {/* Box 1 — ESG Score Impact */}
              <div style={{ background: '#080B10', border: '1px solid #1E2836', borderRadius: 4, padding: 16 }}>
                <div style={{ fontSize: 12, color: '#4A5568', marginBottom: 8 }}>ESG Score Impact</div>
                <div style={{ fontSize: 24, fontFamily: 'monospace', fontWeight: 700,
                  color: isPositive ? '#00C087' : '#E8323C', marginBottom: 6 }}>
                  {isPositive ? '+' : ''}{Math.abs(avgDelta)} pts
                </div>
                <div style={{ fontSize: 11, color: '#8B9AAB', lineHeight: 1.5 }}>
                  Estimated Standardized ESG Score change over next 2 reporting cycles
                </div>
              </div>

              {/* Box 2 — Forward Signal */}
              <div style={{ background: '#080B10', border: '1px solid #1E2836', borderRadius: 4, padding: 16 }}>
                <div style={{ fontSize: 12, color: '#4A5568', marginBottom: 8 }}>Forward Signal</div>
                <div style={{ fontSize: 24, fontFamily: 'monospace', fontWeight: 700,
                  color: mult >= 0 ? '#00C087' : '#E8323C', marginBottom: 6 }}>
                  {mult >= 0 ? '+' : '-'}{severity * 8}/100
                </div>
                <div style={{ fontSize: 11, color: '#8B9AAB', lineHeight: 1.5 }}>
                  Forward Signal Score change — leading indicator of upcoming rating review
                </div>
              </div>

              {/* Box 3 — Financial Materiality */}
              <div style={{ background: '#080B10', border: '1px solid #1E2836', borderRadius: 4, padding: 16 }}>
                <div style={{ fontSize: 12, color: '#4A5568', marginBottom: 8 }}>Financial Materiality</div>
                <div style={{ fontSize: 24, fontFamily: 'monospace', fontWeight: 700,
                  color: mult >= 0 ? '#00C087' : '#E8323C', marginBottom: 6 }}>
                  {mult >= 0 ? '+' : '-'}{finImpact}%
                </div>
                <div style={{ fontSize: 11, color: '#8B9AAB', lineHeight: 1.5 }}>
                  Estimated target price impact via {primaryChannel}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
