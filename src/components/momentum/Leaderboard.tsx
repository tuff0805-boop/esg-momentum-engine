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

  function quadrantBorder(q: string): string {
    if (q === 'Overweight')        return '#00C087'
    if (q === 'Strong Overweight') return '#60A5FA'
    if (q === 'Underweight')       return '#E8323C'
    return '#C4A85A'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs min-w-[680px]">
        <thead>
          <tr className="table-head-row">
            {['#', 'Company', 'Std. ESG Score', 'ESG CAGR', 'Forward Signal Score', 'ESG Momentum', 'Quadrant', 'Rating Agency Forecast'].map(h => (
              <th key={h} className="th">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <motion.tr
              key={r.company.name}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onSelect(r.company)}
              className="tr group"
              style={{ borderLeft: `3px solid ${quadrantBorder(r.quadrant)}` }}
            >
              <td className="td font-mono" style={{ color: '#8B9AAB' }}>{i + 1}</td>
              <td className="td">
                <div className="font-semibold" style={{ color: '#FFFFFF' }}>{r.company.name}</div>
                <div style={{ fontSize: 10, color: '#8B9AAB' }}>{r.company.country} · {r.company.sector}</div>
              </td>
              <td className="td font-mono text-right" style={{ color: '#FFFFFF' }}>{r.ses.toFixed(1)}</td>
              <td className="td font-mono font-semibold text-right">
                <span style={{ color: r.cagr >= 0 ? '#00C087' : '#E8323C' }}>
                  {r.cagr >= 0 ? '+' : ''}{r.cagr.toFixed(1)}%
                </span>
              </td>
              <td className="td font-mono text-right" style={{ color: '#FFFFFF' }}>{r.eventScore}/100</td>
              <td className="td">
                <div className="flex items-center gap-2">
                  <div className="w-20 rounded-full h-1.5 overflow-hidden" style={{ background: '#2A3441' }}>
                    <div className="h-full rounded-full" style={{ background: '#00C087', width: `${r.momentum}%` }} />
                  </div>
                  <span className="font-mono" style={{ color: '#FFFFFF' }}>{r.momentum}</span>
                </div>
              </td>
              <td className="td">
                <Badge variant={quadrantVariant(r.quadrant)}>{r.quadrant}</Badge>
              </td>
              <td className="td">
                <Badge variant={forecastVariant(r.forecast)}>{r.forecast}</Badge>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
