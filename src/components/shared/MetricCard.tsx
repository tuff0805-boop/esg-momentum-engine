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
}

// Left accent border colors
const borderColor: Record<string, string> = {
  default: 'transparent',
  teal:    '#00C087',
  amber:   '#C4A85A',
  red:     '#E8323C',
}

// Large number text colors
const numColor: Record<string, string> = {
  default: '#FFFFFF',
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
}: MetricCardProps) {
  const border  = borderColor[color] ?? borderColor.default
  const numClr  = numColor[color] ?? numColor.default

  let arrow = ''
  let arrowColor = '#8B9AAB'
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
    <div
      className="card p-5 flex flex-col gap-1"
      style={{ borderLeft: border !== 'transparent' ? `3px solid ${border}` : undefined }}
    >
      <div className="flex items-center gap-1.5">
        <span style={{ fontSize: 10, color: '#8B9AAB', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          {label}
        </span>
        {tooltip && <Tooltip content={tooltip} />}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 30, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em', color: numClr }}>
          {prefix}{value.toFixed(decimals)}{suffix}
        </span>
        {arrow && <span style={{ fontSize: 13, color: arrowColor }}>{arrow}</span>}
      </div>
      {subLabel && <div style={{ fontSize: 11, color: '#8B9AAB', marginTop: 2 }}>{subLabel}</div>}
    </div>
  )
}
