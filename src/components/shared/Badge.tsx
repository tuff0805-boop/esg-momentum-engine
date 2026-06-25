import React from 'react'

type BadgeVariant =
  | 'hidden-winners'
  | 'future-leaders'
  | 'value-traps'
  | 'overrated-leaders'
  | 'buy'
  | 'accumulate'
  | 'hold'
  | 'reduce'
  | 'upgrade'
  | 'downgrade'
  | 'watch'
  | 'stable'
  | 'pillar-e'
  | 'pillar-s'
  | 'pillar-g'
  | 'severity-1'
  | 'severity-2'
  | 'severity-3'

const variantStyles: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  'hidden-winners':    { bg: '#064E3B', color: '#00C087', border: '#065F46' },
  'future-leaders':    { bg: '#1E3A5F', color: '#60A5FA', border: '#1E40AF' },
  'value-traps':       { bg: '#7F1D1D', color: '#FCA5A5', border: '#991B1B' },
  'overrated-leaders': { bg: '#451A03', color: '#FCD34D', border: '#78350F' },
  buy:        { bg: '#064E3B', color: '#00C087', border: '#065F46' },
  accumulate: { bg: '#1E3A5F', color: '#60A5FA', border: '#1E40AF' },
  hold:       { bg: '#3B2A00', color: '#FCD34D', border: '#78350F' },
  reduce:     { bg: '#7F1D1D', color: '#FCA5A5', border: '#991B1B' },
  upgrade:    { bg: '#064E3B', color: '#00C087', border: '#065F46' },
  downgrade:  { bg: '#7F1D1D', color: '#FCA5A5', border: '#991B1B' },
  watch:      { bg: '#3B2A00', color: '#FCD34D', border: '#78350F' },
  stable:     { bg: '#1F2937', color: '#8B9AAB', border: '#2A3441' },
  'pillar-e': { bg: '#064E3B', color: '#00C087', border: '#065F46' },
  'pillar-s': { bg: '#1E3A5F', color: '#60A5FA', border: '#1E40AF' },
  'pillar-g': { bg: '#3B0764', color: '#C084FC', border: '#581C87' },
  'severity-1': { bg: '#1F2937', color: '#8B9AAB', border: '#2A3441' },
  'severity-2': { bg: '#3B2A00', color: '#FCD34D', border: '#78350F' },
  'severity-3': { bg: '#7F1D1D', color: '#FCA5A5', border: '#991B1B' },
}

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant, children, className = '' }: BadgeProps) {
  const s = variantStyles[variant]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 7px',
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
      className={className}
    >
      {children}
    </span>
  )
}

export function quadrantVariant(q: string): BadgeVariant {
  if (q === 'Overweight')        return 'hidden-winners'
  if (q === 'Strong Overweight') return 'future-leaders'
  if (q === 'Underweight')       return 'value-traps'
  return 'overrated-leaders'
}

export function ratingVariant(r: string): BadgeVariant {
  if (r === 'Overweight') return 'buy'
  if (r === 'Accumulate') return 'accumulate'
  if (r === 'Neutral')    return 'hold'
  return 'reduce'
}

export function forecastVariant(f: string): BadgeVariant {
  if (f === 'Rating Upgrade Expected') return 'upgrade'
  if (f === 'Rating Downgrade Risk')   return 'downgrade'
  if (f === 'Watch')                   return 'watch'
  return 'stable'
}
