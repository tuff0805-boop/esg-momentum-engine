import { motion } from 'framer-motion'
import type { Company } from '../../data/companies'
import { calcDisagreement } from '../../lib/esg'

interface DisagreementBarsProps {
  companies: Company[]
  allCompanies: Company[]
}

export function DisagreementBars({ companies, allCompanies }: DisagreementBarsProps) {
  const data = companies
    .map(c => ({ name: c.name, value: calcDisagreement(c, allCompanies) }))
    .sort((a, b) => b.value - a.value)

  const max = Math.max(...data.map(d => d.value), 1)

  const color = (v: number) => {
    if (v < 0.4) return '#00C087'
    if (v < 0.8) return '#C4A85A'
    return '#E8323C'
  }

  return (
    <div className="flex flex-col gap-2">
      {data.map((d, i) => (
        <div key={d.name} className="flex items-center gap-3">
          <div className="text-xs text-secondary text-right w-36 truncate">{d.name}</div>
          <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: '#2A3441' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: color(d.value) }}
              initial={{ width: 0 }}
              animate={{ width: `${(d.value / max) * 100}%` }}
              transition={{ delay: i * 0.04, duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div className="font-mono text-xs text-secondary w-8 text-right">{d.value.toFixed(2)}</div>
        </div>
      ))}
      <div className="flex gap-4 mt-2" style={{ fontSize: 10, color: '#8B9AAB' }}>
        <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#00C087', marginRight: 4 }}/>Low (&lt;0.4)</span>
        <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#C4A85A', marginRight: 4 }}/>Medium (0.4–0.8)</span>
        <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#E8323C', marginRight: 4 }}/>High (&gt;0.8) — alpha signal</span>
      </div>
    </div>
  )
}
