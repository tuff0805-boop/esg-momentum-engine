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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((d, i) => (
        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 11, color: '#8B9AAB', textAlign: 'right', width: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>{d.name}</div>
          <div style={{ flex: 1, height: 4, background: '#1E2836', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: color(d.value), borderRadius: 2 }}
              initial={{ width: 0 }}
              animate={{ width: `${(d.value / max) * 100}%` }}
              transition={{ delay: i * 0.04, duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#4A5568', width: 32, textAlign: 'right' }}>{d.value.toFixed(2)}</div>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 10, color: '#4A5568' }}>
        <span><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#00C087', marginRight: 4 }}/>Low (&lt;0.4)</span>
        <span><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#C4A85A', marginRight: 4 }}/>Medium (0.4–0.8)</span>
        <span><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#E8323C', marginRight: 4 }}/>High (&gt;0.8) — alpha signal</span>
      </div>
    </div>
  )
}
