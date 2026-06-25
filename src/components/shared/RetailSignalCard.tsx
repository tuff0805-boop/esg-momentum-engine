import type { Company } from '../../data/companies'
import { calcCAGR, calcMomentum, calcDCF, getQuadrant } from '../../lib/esg'

interface RetailSignalCardProps {
  companies: Company[]
  allCompanies: Company[]
  onSelect: (c: Company) => void
}

function signalColor(quadrant: string): string {
  if (quadrant === 'Overweight' || quadrant === 'Strong Overweight') return '#00C087'
  if (quadrant === 'Underweight') return '#E8323C'
  return '#C4A85A'
}

function signalLabel(quadrant: string): string {
  if (quadrant === 'Overweight' || quadrant === 'Strong Overweight') return 'OVERWEIGHT'
  if (quadrant === 'Underweight') return 'UNDERWEIGHT'
  return 'NEUTRAL'
}

function plainEnglishReason(company: Company, allCompanies: Company[]): string {
  const cagr = calcCAGR(company)
  const momentum = calcMomentum(company, allCompanies)
  const cagrPct = Math.round(
    (allCompanies.filter(c => calcCAGR(c) < cagr).length / allCompanies.length) * 100
  )
  const quadrant = getQuadrant(company, allCompanies)

  if (quadrant === 'Strong Overweight') {
    return `ESG improving at ${Math.abs(cagr).toFixed(1)}%/yr with high baseline score — top ${100 - cagrPct}% of peers for momentum.`
  }
  if (quadrant === 'Overweight') {
    return `ESG improving at ${Math.abs(cagr).toFixed(1)}%/yr — faster than ${cagrPct}% of peers. Score rising fast from a low base.`
  }
  if (quadrant === 'Underweight') {
    return `ESG score declining or stagnant. Low momentum score (${momentum}/100) signals risk of rating downgrades.`
  }
  return `ESG score is high but trajectory slowing. Momentum score ${momentum}/100 — monitor for deterioration.`
}

function fmtPrice(v: number): string {
  if (v >= 1000) return Math.round(v).toLocaleString()
  return v.toFixed(2)
}

export function RetailSignalCard({ companies, allCompanies, onSelect }: RetailSignalCardProps) {
  if (companies.length === 0) {
    return null
  }

  // Pick top 3 by ESG momentum for the card carousel
  const ranked = [...companies]
    .map(c => ({ c, momentum: calcMomentum(c, allCompanies) }))
    .sort((a, b) => b.momentum - a.momentum)
    .slice(0, 3)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
      {ranked.map(({ c }) => {
        const quadrant = getQuadrant(c, allCompanies)
        const dcf      = calcDCF(c, allCompanies)
        const color    = signalColor(quadrant)
        const signal   = signalLabel(quadrant)
        const reason   = plainEnglishReason(c, allCompanies)

        return (
          <button
            key={c.name}
            onClick={() => onSelect(c)}
            style={{
              background: '#0D1117',
              border: '1px solid #1E2836',
              borderLeft: `2px solid ${color}`,
              borderRadius: 4,
              padding: '14px 16px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'background 0.12s',
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
            <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color, letterSpacing: '-0.01em', marginBottom: 8, lineHeight: 1 }}>
              {signal}
            </div>
            <div style={{ fontSize: 11, color: '#8B9AAB', lineHeight: 1.5, marginBottom: 12 }}>
              {reason}
            </div>
            <div style={{ display: 'flex', gap: 16, borderTop: '1px solid #1E2836', paddingTop: 10 }}>
              <div>
                <div style={{ fontSize: 9, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>ESG Target Price</div>
                <div className="font-mono" style={{ fontSize: 15, fontWeight: 700, color }}>{fmtPrice(dcf.adjPrice)}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Upside</div>
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
