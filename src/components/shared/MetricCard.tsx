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

const borderColor: Record<string, string> = {
  default: '#94A3B8',
  teal:    '#10B981',
  amber:   '#F59E0B',
  red:     '#EF4444',
}

const textColor: Record<string, string> = {
  default: 'text-primary',
  teal:    'text-accent',
  amber:   'text-amber',
  red:     'text-danger',
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
  const border = borderColor[color] ?? borderColor.default
  const cls    = textColor[color] ?? textColor.default

  let arrow = ''
  if (trendDirection === 'up')        arrow = '▲'
  else if (trendDirection === 'down') arrow = '▼'
  else if (!trendDirection) {
    if (color === 'teal' || color === 'amber') arrow = '▲'
    else if (color === 'red')                  arrow = '▼'
  }

  return (
    <div className="card p-5 flex flex-col gap-1" style={{ borderLeft: `3px solid ${border}` }}>
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-secondary uppercase tracking-[0.08em] font-semibold">{label}</span>
        {tooltip && <Tooltip content={tooltip} />}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={`font-mono text-[32px] font-bold leading-none tracking-tight ${cls}`}>
          {prefix}{value.toFixed(decimals)}{suffix}
        </span>
        {arrow && <span className={`text-sm ${cls}`}>{arrow}</span>}
      </div>
      {subLabel && <div className="text-[11px] text-secondary">{subLabel}</div>}
    </div>
  )
}
