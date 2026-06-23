import { motion } from 'framer-motion'
import type { Company } from '../../data/companies'
import { calcSES, calcDisagreement, calcPillars } from '../../lib/esg'
import { Badge } from '../shared/Badge'
import { Tooltip } from '../shared/Tooltip'

interface ScoreTableProps {
  companies: Company[]
  allCompanies: Company[]
  onSelect: (c: Company) => void
}

function PillarMini({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex-1 bg-white/5 rounded-full h-1 overflow-hidden">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

function DisagreementBadge({ value }: { value: number }) {
  if (value < 0.4) return <Badge variant="buy">Low</Badge>
  if (value < 0.8) return <Badge variant="accumulate">Med</Badge>
  return <Badge variant="overrated-leaders">High</Badge>
}

export function ScoreTable({ companies, allCompanies, onSelect }: ScoreTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs min-w-[700px]">
        <thead>
          <tr className="table-head-row">
            {[
              ['Company', 'Name, country and sector of the company'],
              ['MSCI', 'MSCI ESG Rating score (0-100). Higher = better ESG profile per MSCI methodology.'],
              ['Sust.', 'Sustainalytics ESG Risk score shown normalised (0-100). Higher = lower ESG risk per Sustainalytics.'],
              ['BBG', 'Bloomberg ESG Disclosure score (0-100). Measures breadth and quality of ESG data disclosed.'],
              ['SES', 'Standardized ESG Score: z-score normalization of all three providers, rescaled to 50 +/- 15. Removes inter-provider bias.'],
              ['Disagree', 'Provider disagreement: std dev of the three z-scores. High disagreement = potential alpha from mispricing.'],
              ['Pillars', 'Environmental / Social / Governance sub-score bars derived from provider z-scores.'],
            ].map(([h, tip]) => (
              <th key={h as string} className="th whitespace-nowrap">
                <span className="flex items-center gap-1">
                  {h}
                  <Tooltip content={tip as string} />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {companies.map((c, i) => {
            const ses = calcSES(c, allCompanies)
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
                  <div className="font-semibold text-primary group-hover:text-accent transition-colors">{c.name}</div>
                  <div className="text-secondary text-[10px]">{c.country} · {c.sector}</div>
                </td>
                <td className="td font-mono text-right text-primary">{c.msci}</td>
                <td className="td font-mono text-right text-primary">{c.sustainalytics}</td>
                <td className="td font-mono text-right text-primary">{c.bloomberg}</td>
                <td className="td font-mono font-semibold text-right text-accent">{ses.toFixed(1)}</td>
                <td className="td">
                  <DisagreementBadge value={disagree} />
                </td>
                <td className="td">
                  <div className="flex flex-col gap-1 w-24">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-secondary w-3">E</span>
                      <PillarMini value={pillars.E} color="bg-emerald-500" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-secondary w-3">S</span>
                      <PillarMini value={pillars.S} color="bg-blue-500" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-secondary w-3">G</span>
                      <PillarMini value={pillars.G} color="bg-purple-500" />
                    </div>
                  </div>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
