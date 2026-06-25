import type { NewsItem } from '../../data/companies'
import { Tooltip } from './Tooltip'

function sdgLabel(n: number): string {
  return `SDG ${n}`
}

const SENTIMENT_STYLE: Record<NewsItem['sentiment'], { bg: string; color: string; label: string }> = {
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
              background: '#0D1117',
              border: '1px solid #1E2836',
              borderRadius: 4,
              padding: compact ? '10px 12px' : '10px 12px',
            }}
          >
            {/* Top row: date + badges */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span style={{ fontSize: 10, color: '#4A5568', fontFamily: 'monospace' }}>{item.date}</span>

              {/* Sentiment badge */}
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', padding: '1px 6px',
                  borderRadius: 3, fontSize: 10, fontWeight: 500, letterSpacing: '0.04em',
                  background: sent.bg, color: sent.color, border: `1px solid ${sent.color}44`,
                }}
              >
                {sent.label}
              </span>

              {/* Event type badge */}
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', padding: '1px 6px',
                  borderRadius: 3, fontSize: 10, fontWeight: 500,
                  background: '#0A2A52', color: '#60A5FA', border: '1px solid #0F3D7A',
                }}
              >
                {item.eventType}
              </span>

              {/* Pillar badge */}
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', padding: '1px 6px',
                  borderRadius: 3, fontSize: 10, fontWeight: 500,
                  background: pil.bg, color: pil.color, border: `1px solid ${pil.color}44`,
                }}
              >
                {item.pillar}
              </span>

              {/* Tooltip on sentiment */}
              <Tooltip content="Sentiment is classified based on the event type, magnitude, and ESG pillar impact. Very Positive = major verifiable commitment or certification. Very Negative = regulatory fine, controversy, or governance failure." />
            </div>

            {/* Headline */}
            <div style={{ fontSize: 13, fontWeight: 500, color: '#E8EDF2', marginBottom: 4, lineHeight: 1.4 }}>
              {item.headline}
            </div>

            {/* Source */}
            <div style={{ fontSize: 11, color: '#4A5568', marginBottom: compact ? 4 : 6 }}>
              {item.source}
            </div>

            {/* Summary — hidden in compact mode */}
            {!compact && (
              <div style={{ fontSize: 11, color: '#8B9AAB', lineHeight: 1.5, marginBottom: 8 }}>
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
                    borderRadius: 2, fontSize: 10, fontWeight: 500,
                    background: '#131920', color: '#8B9AAB', border: '1px solid #1E2836',
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
