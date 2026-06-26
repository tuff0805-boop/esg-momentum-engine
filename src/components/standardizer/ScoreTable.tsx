import { motion } from 'framer-motion'
import type { Company } from '../../data/companies'
import { calcSES, calcDisagreement, calcPillars } from '../../lib/esg'
import { Badge } from '../shared/Badge'
import { Tooltip } from '../shared/Tooltip'

interface ScoreTableProps {
  companies: Company[]
  allCompanies: Company[]
  onSelect: (c: Company) => void
  hidePillars?: boolean
}

function DisagreementBadge({ value }: { value: number }) {
  if (value < 0.4) return <Badge variant="buy">Low</Badge>
  if (value < 0.8) return <Badge variant="accumulate">Med</Badge>
  return <Badge variant="reduce">High</Badge>
}

export function ScoreTable({ companies, allCompanies, onSelect, hidePillars = false }: ScoreTableProps) {
  const headers: [string, string][] = [
    ['Company', 'Name, country and sector of the company'],
    ['MSCI', 'MSCI ESG Rating score (0-100). Higher = better ESG profile per MSCI methodology.'],
    ['Sust.', 'Sustainalytics ESG Risk score shown normalised (0-100). Higher = lower ESG risk per Sustainalytics.'],
    ['BBG', 'Bloomberg ESG Disclosure score (0-100). Measures breadth and quality of ESG data disclosed.'],
    ['Std. ESG Score', 'Standardized ESG Score: z-score normalization of all three providers, rescaled to 50 +/- 15. Removes inter-provider bias.'],
    ['Divergence', 'Provider divergence: standard deviation of the three z-scores. High divergence = potential alpha from mispricing.'],
  ]
  if (!hidePillars) {
    headers.push(['Pillars', 'Environmental / Social / Governance sub-score bars derived from provider z-scores.'])
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs min-w-[580px]">
        <thead>
          <tr className="table-head-row">
            {headers.map(([h, tip]) => (
              <th key={h} className="th whitespace-nowrap">
                <span className="flex items-center gap-1">
                  {h}
                  <Tooltip content={tip} />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {companies.map((c, i) => {
            const ses     = calcSES(c, allCompanies)
            const disagree = calcDisagreement(c, allCompanies)
            const pillars = calcPillars(c, allCompanies)
            return (
              <motion.tr
                key={c.name}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => onSelect(c)}
                className="tr group"
              >
                <td className="td">
                  <div className="font-semibold text-primary group-hover:text-accent transition-colors" style={{ fontSize: 15 }}>{c.name}</div>
                  <div className="text-secondary" style={{ fontSize: 12 }}>{c.country} · {c.sector}</div>
                </td>
                <td className="td font-mono text-right text-primary">{c.msci}</td>
                <td className="td font-mono text-right text-primary">{c.sustainalytics}</td>
                <td className="td font-mono text-right text-primary">{c.bloomberg}</td>
                <td className="td font-mono font-semibold text-right" style={{ color: '#00C087' }}>{ses.toFixed(1)}</td>
                <td className="td">
                  <DisagreementBadge value={disagree} />
                </td>
                {!hidePillars && (
                  <td className="td">
                    <div className="flex flex-col gap-1 w-24">
                      {([['E', pillars.E, '#00C087'], ['S', pillars.S, '#60A5FA'], ['G', pillars.G, '#C084FC'], ['I', pillars.I, '#F59E0B']] as [string, number, string][]).map(([lbl, val, col]) => (
                        <div key={lbl} className="flex items-center gap-1">
                          <span className="text-[9px] text-secondary w-3">{lbl}</span>
                          <div className="flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', height: 4 }}>
                            <div className="h-full rounded-full" style={{ width: `${val}%`, background: col }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                )}
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
