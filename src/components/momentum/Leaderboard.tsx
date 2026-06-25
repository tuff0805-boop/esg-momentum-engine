import { motion } from 'framer-motion'
import type { Company } from '../../data/companies'
import { calcSES, calcCAGR, calcEventScore, calcMomentum, getQuadrant, getRaterForecast } from '../../lib/esg'
import { Badge, quadrantVariant, forecastVariant } from '../shared/Badge'

interface LeaderboardProps {
  companies: Company[]
  allCompanies: Company[]
  onSelect: (c: Company) => void
}

export function Leaderboard({ companies, allCompanies, onSelect }: LeaderboardProps) {
  const rows = companies
    .map(c => ({
      company: c,
      ses: calcSES(c, allCompanies),
      cagr: calcCAGR(c),
      eventScore: calcEventScore(c),
      momentum: calcMomentum(c, allCompanies),
      quadrant: getQuadrant(c, allCompanies),
      forecast: getRaterForecast(c, allCompanies),
    }))
    .sort((a, b) => b.momentum - a.momentum)

  function qBorderColor(q: string): string {
    if (q === 'Overweight')        return '#00C087'
    if (q === 'Strong Overweight') return '#1E6FD9'
    if (q === 'Underweight')       return '#E8323C'
    return '#C4A85A'
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', fontSize: 13, minWidth: 680, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1E2836', background: '#080B10', position: 'sticky', top: 0 }}>
            {['#', 'Company', 'Std. ESG', 'CAGR', 'Fwd Signal', 'Momentum', 'Quadrant', 'Rating Forecast'].map(h => (
              <th key={h} style={{ padding: '0 16px', height: 40, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: '#4A5568', textAlign: h === '#' ? 'center' : 'left', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <motion.tr
              key={r.company.name}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onSelect(r.company)}
              style={{ borderBottom: '1px solid #1E2836', cursor: 'pointer', borderLeft: `2px solid ${qBorderColor(r.quadrant)}`, height: 52 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#131920' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <td style={{ padding: '0 16px', color: '#4A5568', fontFamily: 'monospace', textAlign: 'center', verticalAlign: 'middle' }}>{i + 1}</td>
              <td style={{ padding: '0 16px', verticalAlign: 'middle' }}>
                <div style={{ fontWeight: 500, color: '#E8EDF2', fontSize: 15 }}>{r.company.name}</div>
                <div style={{ fontSize: 12, color: '#4A5568' }}>{r.company.country} · {r.company.sector}</div>
              </td>
              <td style={{ padding: '0 16px', fontFamily: 'monospace', textAlign: 'right', color: '#E8EDF2', verticalAlign: 'middle' }}>{r.ses.toFixed(1)}</td>
              <td style={{ padding: '0 16px', fontFamily: 'monospace', fontWeight: 500, textAlign: 'right', verticalAlign: 'middle' }}>
                <span style={{ color: r.cagr >= 0 ? '#00C087' : '#E8323C' }}>
                  {r.cagr >= 0 ? '+' : ''}{r.cagr.toFixed(1)}%
                </span>
              </td>
              <td style={{ padding: '0 16px', fontFamily: 'monospace', textAlign: 'right', color: '#E8EDF2', verticalAlign: 'middle' }}>{r.eventScore}/100</td>
              <td style={{ padding: '0 16px', verticalAlign: 'middle' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 64, height: 4, background: '#1E2836', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#00C087', width: `${r.momentum}%`, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#E8EDF2' }}>{r.momentum}</span>
                </div>
              </td>
              <td style={{ padding: '0 16px', verticalAlign: 'middle' }}>
                <Badge variant={quadrantVariant(r.quadrant)}>{r.quadrant}</Badge>
              </td>
              <td style={{ padding: '0 16px', verticalAlign: 'middle' }}>
                <Badge variant={forecastVariant(r.forecast)}>{r.forecast}</Badge>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
