import type { Company, NewsItem, ESGEvent } from '../../data/companies'
import { calcSES, calcPillars } from '../../lib/esg'

interface PillarEventFeedProps {
  companies: Company[]
  allCompanies: Company[]
  onEventClick: (item: NewsItem, companyName: string, ses: number) => void
}

const PILLARS: { id: 'E' | 'S' | 'G' | 'I'; name: string; color: string; bgDim: string }[] = [
  { id: 'E', name: 'Environmental', color: '#00C087', bgDim: '#003D2B' },
  { id: 'S', name: 'Social',        color: '#1E6FD9', bgDim: '#0A2A52' },
  { id: 'G', name: 'Governance',    color: '#7C3AED', bgDim: '#1A0A2E' },
  { id: 'I', name: 'Innovation',    color: '#F59E0B', bgDim: '#2A1A00' },
]

const INNOVATION_KEYWORDS = [
  'Patent', 'Technology', 'Digital', 'Innovation', 'Hydrogen', 'EV',
  'Renewable', 'Solar', 'Wind', 'Green Bond', 'Net Zero', 'Carbon',
]

const SENT_COLOR: Record<string, string> = {
  'very-positive': '#00C087', 'positive': '#00C087',
  'neutral': '#8B9AAB', 'negative': '#C4A85A', 'very-negative': '#E8323C',
}
const SENT_BG: Record<string, string> = {
  'very-positive': '#003D2B', 'positive': '#003D2B',
  'neutral': '#131920', 'negative': '#2A1A00', 'very-negative': '#3D0A0C',
}
const SENT_LABEL: Record<string, string> = {
  'very-positive': 'Very Positive', 'positive': 'Positive',
  'neutral': 'Neutral', 'negative': 'Negative', 'very-negative': 'Very Negative',
}

type SentimentKey = 'very-negative' | 'negative' | 'neutral' | 'positive' | 'very-positive'

const SENT_RANK: Record<SentimentKey, number> = {
  'very-negative': 0,
  'negative': 1,
  'neutral': 2,
  'positive': 3,
  'very-positive': 4,
}

type FeedItem = {
  event: NewsItem
  company: Company
  sentimentRank: number
  severity: number
  date: string
}

function deriveSentiment(ev: ESGEvent): SentimentKey {
  if (ev.direction === -1 && ev.severity >= 3) return 'very-negative'
  if (ev.direction === -1) return 'negative'
  if (ev.direction === 1 && ev.severity >= 3) return 'very-positive'
  if (ev.direction === 1) return 'positive'
  return 'neutral'
}

function eventToNewsItem(ev: ESGEvent, company: Company, idx: number): NewsItem {
  const sentiment = deriveSentiment(ev)
  return {
    id: `${company.name}-ev-${idx}`,
    date: '',
    headline: ev.title,
    source: '',
    summary: ev.title,
    sentiment,
    eventType: '',
    pillar: ev.pillar,
    sdgGoals: [],
    severity: ev.severity,
  }
}

function isInnovation(text: string): boolean {
  const lower = text.toLowerCase()
  return INNOVATION_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()))
}

function collectPillarItems(
  companies: Company[]
): Record<'E' | 'S' | 'G' | 'I', FeedItem[]> {
  const buckets: Record<'E' | 'S' | 'G' | 'I', FeedItem[]> = { E: [], S: [], G: [], I: [] }
  const seen = new Set<string>()

  for (const company of companies) {
    // Collect from company.news first (preferred — more data)
    for (const item of company.news) {
      const key = `${company.name}::${item.headline}`
      if (seen.has(key)) continue
      seen.add(key)

      const severity = item.severity ?? 2
      const sentimentRank = SENT_RANK[item.sentiment] ?? 2
      const feedItem: FeedItem = { event: item, company, sentimentRank, severity, date: item.date }

      const pillar = item.pillar
      if (pillar === 'E' || pillar === 'S' || pillar === 'G') {
        buckets[pillar].push(feedItem)
      }
      // Also check for innovation from news
      if (isInnovation(item.headline) || isInnovation(item.eventType ?? '')) {
        buckets['I'].push(feedItem)
      }
    }

    // Collect from company.events (fallback for items not in news)
    for (let idx = 0; idx < company.events.length; idx++) {
      const ev = company.events[idx]
      const key = `${company.name}::${ev.title}`
      if (seen.has(key)) continue
      seen.add(key)

      const pseudo = eventToNewsItem(ev, company, idx)
      const sentimentRank = SENT_RANK[pseudo.sentiment as SentimentKey] ?? 2
      const feedItem: FeedItem = { event: pseudo, company, sentimentRank, severity: ev.severity, date: '' }

      if (ev.pillar === 'E' || ev.pillar === 'S' || ev.pillar === 'G') {
        buckets[ev.pillar].push(feedItem)
      }
      if (isInnovation(ev.title)) {
        buckets['I'].push({ ...feedItem })
      }
    }
  }

  // Sort: sentimentRank asc (very-negative first), then severity desc, then date desc
  for (const key of ['E', 'S', 'G', 'I'] as const) {
    buckets[key].sort((a, b) => {
      if (a.sentimentRank !== b.sentimentRank) return a.sentimentRank - b.sentimentRank
      if (b.severity !== a.severity) return b.severity - a.severity
      return b.date.localeCompare(a.date)
    })
  }

  return buckets
}

export function PillarEventFeed({ companies, allCompanies, onEventClick }: PillarEventFeedProps) {
  const pillarEvents = collectPillarItems(companies)

  // Per-pillar universe averages
  const avgPillars = { E: 0, S: 0, G: 0, I: 0 }
  companies.forEach(c => {
    const p = calcPillars(c, allCompanies)
    avgPillars.E += p.E
    avgPillars.S += p.S
    avgPillars.G += p.G
    avgPillars.I += p.I
  })
  if (companies.length) {
    avgPillars.E /= companies.length
    avgPillars.S /= companies.length
    avgPillars.G /= companies.length
    avgPillars.I /= companies.length
  }

  // Per-pillar positive/negative counts
  const counts = Object.fromEntries(
    PILLARS.map(p => {
      const items = pillarEvents[p.id]
      const pos = items.filter(i => i.sentimentRank >= 3).length
      const neg = items.filter(i => i.sentimentRank <= 1).length
      return [p.id, { pos, neg }]
    })
  ) as Record<'E' | 'S' | 'G' | 'I', { pos: number; neg: number }>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* SUMMARY ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {PILLARS.map(p => {
          const { pos, neg } = counts[p.id]
          return (
            <div
              key={p.id}
              style={{
                background: '#0D1117',
                border: `1px solid ${p.color}33`,
                borderTop: `2px solid ${p.color}`,
                borderRadius: 4,
                padding: '10px 14px',
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: p.color,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 4,
                }}
              >
                {p.name}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 12, color: '#00C087' }}>▲ {pos} positive</span>
                <span style={{ fontSize: 12, color: neg > 0 ? '#E8323C' : '#4A5568' }}>▼ {neg} negative</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* 4-COLUMN EVENT FEED */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'start' }}>
        {PILLARS.map(p => {
          const events = pillarEvents[p.id]
          const avg = avgPillars[p.id]
          return (
            <div key={p.id}>
              {/* Column header */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: p.bgDim,
                      border: `2px solid ${p.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      fontWeight: 700,
                      color: p.color,
                      flexShrink: 0,
                    }}
                  >
                    {p.id}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#E8EDF2' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#8B9AAB' }}>
                      Avg: {avg.toFixed(1)} {avg >= 50 ? '▲' : '▼'}
                    </div>
                  </div>
                </div>
                <div style={{ height: 3, background: '#1E2836', borderRadius: 2, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(avg, 100)}%`,
                      background: p.color,
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>

              {/* Event cards */}
              {events.length === 0 && (
                <div style={{ fontSize: 12, color: '#4A5568', padding: '12px 0' }}>
                  No events for this pillar.
                </div>
              )}
              {events.map(({ event, company }, idx) => {
                const isNeg = event.sentiment === 'negative' || event.sentiment === 'very-negative'
                const sentColor = SENT_COLOR[event.sentiment] ?? '#8B9AAB'
                const sentBg = SENT_BG[event.sentiment] ?? '#131920'
                const sentLabel = SENT_LABEL[event.sentiment] ?? event.sentiment
                const ses = calcSES(company, allCompanies)
                const headline = event.headline
                const date = event.date
                const eventType = event.eventType ?? ''
                const severity = event.severity ?? 2
                const sdgGoals: number[] = event.sdgGoals ?? []

                return (
                  <div
                    key={idx}
                    onClick={() => onEventClick(event, company.name, ses)}
                    style={{
                      background: '#0D1117',
                      border: '1px solid #1E2836',
                      borderLeft: `3px solid ${isNeg ? '#E8323C' : p.color}`,
                      borderRadius: 4,
                      padding: '10px 12px',
                      marginBottom: 8,
                      cursor: 'pointer',
                      boxShadow: isNeg ? 'inset 3px 0 8px rgba(232,50,60,0.08)' : 'none',
                      transition: 'border-color 0.12s',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = p.color
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = '#1E2836'
                      el.style.borderLeftColor = isNeg ? '#E8323C' : p.color
                    }}
                  >
                    {/* Row 1: company + country + sentiment */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        flexWrap: 'wrap',
                        marginBottom: 5,
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#E8EDF2' }}>
                        {company.name.split(' ')[0]}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          color: '#4A5568',
                          background: '#131920',
                          border: '1px solid #1E2836',
                          borderRadius: 2,
                          padding: '0 5px',
                        }}
                      >
                        {company.country}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 500,
                          color: sentColor,
                          background: sentBg,
                          border: `1px solid ${sentColor}44`,
                          borderRadius: 2,
                          padding: '0 5px',
                        }}
                      >
                        {sentLabel}
                      </span>
                    </div>

                    {/* Row 2: headline */}
                    <div
                      style={{
                        fontSize: 12,
                        color: '#C8D3DC',
                        lineHeight: 1.4,
                        marginBottom: 5,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical' as const,
                      }}
                    >
                      {headline}
                    </div>

                    {/* Row 3: date + event type + severity dots */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                      {date && (
                        <span style={{ fontSize: 10, color: '#4A5568', fontFamily: 'monospace' }}>{date}</span>
                      )}
                      {eventType && (
                        <span
                          style={{
                            fontSize: 10,
                            color: '#60A5FA',
                            background: '#0A2A52',
                            border: '1px solid #0F3D7A',
                            borderRadius: 2,
                            padding: '0 5px',
                          }}
                        >
                          {eventType}
                        </span>
                      )}
                      <span style={{ fontSize: 10, color: p.color, letterSpacing: 1 }}>
                        {'●'.repeat(severity)}{'○'.repeat(Math.max(0, 3 - severity))}
                      </span>
                    </div>

                    {/* Row 4: SDG chips */}
                    {sdgGoals.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {sdgGoals.slice(0, 3).map((n: number) => (
                          <span
                            key={n}
                            style={{
                              fontSize: 9,
                              color: '#8B9AAB',
                              background: '#131920',
                              border: '1px solid #1E2836',
                              borderRadius: 2,
                              padding: '1px 4px',
                            }}
                          >
                            SDG {n}
                          </span>
                        ))}
                        {sdgGoals.length > 3 && (
                          <span style={{ fontSize: 9, color: '#4A5568' }}>+{sdgGoals.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
