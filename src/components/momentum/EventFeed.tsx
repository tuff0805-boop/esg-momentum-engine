import { motion } from 'framer-motion'
import type { Company } from '../../data/companies'
import { Badge } from '../shared/Badge'

interface EventFeedProps {
  companies: Company[]
}

interface FlatEvent {
  title: string
  pillar: 'E' | 'S' | 'G'
  direction: 1 | -1
  severity: 1 | 2 | 3
  company: string
}

export function EventFeed({ companies }: EventFeedProps) {
  const events: FlatEvent[] = companies
    .flatMap(c => c.events.map(e => ({ ...e, company: c.name })))
    .sort((a, b) => b.severity * b.direction - a.severity * a.direction)

  return (
    <div className="flex flex-col gap-2">
      {events.map((ev, i) => (
        <motion.div
          key={`${ev.company}-${ev.title}`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.025 }}
          className="flex items-center gap-3 bg-white/3 border border-white/5 rounded-lg px-3 py-2.5"
        >
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ev.direction === 1 ? 'bg-teal-400' : 'bg-red-400'}`} />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-slate-300 truncate">{ev.title}</div>
            <div className="text-[10px] text-slate-600">{ev.company}</div>
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            <Badge variant={`pillar-${ev.pillar.toLowerCase()}` as 'pillar-e' | 'pillar-s' | 'pillar-g'}>
              {ev.pillar}
            </Badge>
            <Badge variant={`severity-${ev.severity}` as 'severity-1' | 'severity-2' | 'severity-3'}>
              S{ev.severity}
            </Badge>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
