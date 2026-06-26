import type { Company } from '../../data/companies'
import { calcMomentum, calcDCF, getESGSignal, getActionRating } from '../../lib/esg'

interface RetailSignalCardProps {
  companies: Company[]
  allCompanies: Company[]
  onSelect: (c: Company) => void
}

function esgSignalColor(signal: string): string {
  if (signal === 'Outperform') return '#00C087'
  if (signal === 'Underperform') return '#E8323C'
  return '#C4A85A'
}

function actionColor(action: string): string {
  if (action === 'Strong Buy') return '#60A5FA'
  if (action === 'Dollar-Cost Strategy') return '#2DD4BF'
  if (action === 'Hold') return '#8B9AAB'
  return '#C4A85A'
}

export function RetailSignalCard({ companies, allCompanies, onSelect }: RetailSignalCardProps) {
  if (companies.length === 0) return null

  // Top 5 by ESG momentum
  const ranked = [...companies]
    .map(c => ({ c, momentum: calcMomentum(c, allCompanies) }))
    .sort((a, b) => b.momentum - a.momentum)
    .slice(0, 5)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {ranked.map(({ c }) => {
        const dcf           = calcDCF(c, allCompanies)
        const esgSignal     = getESGSignal(c, allCompanies)
        const suggestedAction = getActionRating(c, allCompanies)
        const sigColor      = esgSignalColor(esgSignal)
        const actColor      = actionColor(suggestedAction)

        return (
          <button
            key={c.name}
            onClick={() => onSelect(c)}
            style={{
              background: '#0D1117',
              border: '1px solid #1E2836',
              borderLeft: `2px solid ${sigColor}`,
              borderRadius: 4,
              padding: '12px 14px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'background 0.12s',
              width: '100%',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#131920' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#0D1117' }}
          >
            <div style={{ fontSize: 11, color: '#8B9AAB', marginBottom: 4 }}>
              {c.country} · {c.sector}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>
              {c.name}
            </div>

            {/* ESG Signal (large) + Suggested Action (smaller) */}
            <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color: sigColor, letterSpacing: '-0.01em', lineHeight: 1 }}>
              {esgSignal}
            </div>
            <div style={{ fontSize: 13, color: actColor, marginTop: 3, marginBottom: 10 }}>
              {suggestedAction}
            </div>

            {/* Bear / Base / Bull scenario boxes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
              {[
                { label: 'Bear Case', price: dcf.bearPrice, borderColor: '#E8323C', color: '#E8323C' },
                { label: 'Base Case', price: dcf.adjPrice,  borderColor: '#4A5568', color: '#8B9AAB' },
                { label: 'Bull Case', price: dcf.bullPrice, borderColor: '#00C087', color: '#00C087' },
              ].map(s => (
                <div
                  key={s.label}
                  style={{
                    borderLeft: `2px solid ${s.borderColor}`,
                    paddingLeft: 6,
                    background: '#080B10',
                    borderRadius: 2,
                    padding: '4px 8px',
                  }}
                >
                  <div style={{ fontSize: 9, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: s.color }}>{s.price.toFixed(2)}</div>
                </div>
              ))}
            </div>

            {/* ESG Target + Potential Upside */}
            <div style={{ display: 'flex', gap: 12, borderTop: '1px solid #1E2836', paddingTop: 10 }}>
              <div>
                <div style={{ fontSize: 9, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>ESG Target Price</div>
                <div className="font-mono" style={{ fontSize: 15, fontWeight: 700, color: sigColor }}>{dcf.adjPrice.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Potential Upside</div>
                <div className="font-mono" style={{ fontSize: 15, fontWeight: 700, color: dcf.upsidePct >= 0 ? '#00C087' : '#E8323C' }}>
                  {dcf.upsidePct >= 0 ? '+' : ''}{dcf.upsidePct.toFixed(1)}%
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
