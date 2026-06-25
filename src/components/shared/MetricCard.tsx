import { motion } from 'framer-motion'
import { Tooltip } from './Tooltip'

interface MetricCardProps {
  label: string
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  subLabel?: string
  tooltip?: string
  color?: 'default' | 'teal' | 'amber' | 'red'
  trendDirection?: 'up' | 'down' | 'neutral'
  animKey?: string | number
  index?: number
}

const numColor: Record<string, string> = {
  default: '#E8EDF2',
  teal:    '#00C087',
  amber:   '#C4A85A',
  red:     '#E8323C',
}

export function MetricCard({
  label,
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  subLabel,
  tooltip,
  color = 'default',
  trendDirection,
  index = 0,
}: MetricCardProps) {
  const numClr = numColor[color] ?? numColor.default

  let arrow = ''
  let arrowColor = '#4A5568'
  if (trendDirection === 'up') {
    arrow = '▲'; arrowColor = '#00C087'
  } else if (trendDirection === 'down') {
    arrow = '▼'; arrowColor = '#E8323C'
  } else if (!trendDirection) {
    if (color === 'teal') { arrow = '▲'; arrowColor = '#00C087' }
    else if (color === 'amber') { arrow = '▲'; arrowColor = '#C4A85A' }
    else if (color === 'red')   { arrow = '▼'; arrowColor = '#E8323C' }
  }

  return (
    <motion.div
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: (index ?? 0) * 0.08, duration: 0.25, ease: 'easeOut' }}
      style={{
        background: '#0D1117',
        border: '1px solid #1E2836',
        borderRadius: 4,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        minHeight: 120,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 10, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          {label}
        </span>
        {tooltip && <Tooltip content={tooltip} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 40, fontWeight: 500, lineHeight: 1, color: numClr, fontVariantNumeric: 'tabular-nums' }}>
          {prefix}{value.toFixed(decimals)}{suffix}
        </span>
        {arrow && <span style={{ fontSize: 11, color: arrowColor }}>{arrow}</span>}
      </div>
      {subLabel && <div style={{ fontSize: 11, color: '#4A5568', marginTop: 1 }}>{subLabel}</div>}
    </motion.div>
  )
}
