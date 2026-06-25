import type { NewsItem } from '../../data/companies'
import { Tooltip } from './Tooltip'

function sdgLabel(n: number): string {
  return `SDG ${n}`
}

const SENTIMENT_STYLE: Record<NewsItem['sentiment'], { bg: string; color: string; label: string }> = {
  'very-positive': { bg: '#064E3B', color: '#00C087',  label: 'Very Positive' },
  'positive':      { bg: '#052E20', color: '#34D399',  label: 'Positive'      },
  'neutral':       { bg: '#1F2937', color: '#8B9AAB',  label: 'Neutral'       },
  'negative':      { bg: '#3B2A00', color: '#FCD34D',  label: 'Negative'      },
  'very-negative': { bg: '#7F1D1D', color: '#EF4444',  label: 'Very Negative' },
}

const PILLAR_STYLE: Record<string, { bg: string; color: string }> = {
  E:   { bg: '#064E3B', color: '#00C087' },
  S:   { bg: '#1E3A5F', color: '#60A5FA' },
  G:   { bg: '#3B0764', color: '#C084FC' },
  ESG: { bg: '#1F2937', color: '#8B9AAB' },
}

interface NewsCatalystFeedProps {
  news: NewsItem[]
  compact?: boolean
}

export function NewsCatalystFeed({ news, compact = false }: NewsCatalystFeedProps) {
  if (!news || news.length === 0) {
    return <div style={{ color: '#8B9AAB', fontSize: 12, padding: '8px 0' }}>No news available.</div>
  }

  return (
    <div className="flex flex-col gap-3">
      {news.map(item => {
        const sent = SENTIMENT_STYLE[item.sentiment]
        const pil  = PILLAR_STYLE[item.pillar] ?? PILLAR_STYLE.ESG
        return (
          <div
            key={item.id}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid #2A3441',
              borderRadius: 8,
              padding: compact ? '10px 12px' : '14px 16px',
            }}
          >
            {/* Top row: date + badges */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span style={{ fontSize: 10, color: '#8B9AAB', fontFamily: 'monospace' }}>{item.date}</span>

              {/* Sentiment badge */}
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', padding: '2px 6px',
                  borderRadius: 4, fontSize: 10, fontWeight: 600, letterSpacing: '0.05em',
                  background: sent.bg, color: sent.color, border: `1px solid ${sent.color}33`,
                }}
              >
                {sent.label}
              </span>

              {/* Event type badge */}
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', padding: '2px 6px',
                  borderRadius: 4, fontSize: 10, fontWeight: 600,
                  background: '#1E3A5F', color: '#60A5FA', border: '1px solid #1E40AF',
                }}
              >
                {item.eventType}
              </span>

              {/* Pillar badge */}
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', padding: '2px 6px',
                  borderRadius: 4, fontSize: 10, fontWeight: 700,
                  background: pil.bg, color: pil.color, border: `1px solid ${pil.color}44`,
                }}
              >
                {item.pillar}
              </span>

              {/* Tooltip on sentiment */}
              <Tooltip content="Sentiment is classified based on the event type, magnitude, and ESG pillar impact. Very Positive = major verifiable commitment or certification. Very Negative = regulatory fine, controversy, or governance failure." />
            </div>

            {/* Headline */}
            <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', marginBottom: 4, lineHeight: 1.4 }}>
              {item.headline}
            </div>

            {/* Source */}
            <div style={{ fontSize: 10, color: '#8B9AAB', marginBottom: compact ? 4 : 6 }}>
              {item.source}
            </div>

            {/* Summary — hidden in compact mode */}
            {!compact && (
              <div style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.6, marginBottom: 8 }}>
                {item.summary}
              </div>
            )}

            {/* SDG chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span style={{ fontSize: 9, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 2 }}>SDG</span>
              {item.sdgGoals.map(n => (
                <span
                  key={n}
                  title={`UN SDG Goal ${n}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', padding: '1px 5px',
                    borderRadius: 4, fontSize: 10, fontWeight: 600,
                    background: '#1A2332', color: '#FFFFFF', border: '1px solid #2A3441',
                    gap: 2,
                  }}
                >
                  {sdgLabel(n)}
                </span>
              ))}
              <Tooltip content="UN Sustainable Development Goals mapped to this news event. Shows which global sustainability objectives this company action supports or risks." />
            </div>
          </div>
        )
      })}
    </div>
  )
}
