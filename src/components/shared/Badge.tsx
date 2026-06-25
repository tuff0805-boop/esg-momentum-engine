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
  'hidden-winners':    { bg: '#003D2B', color: '#00C087', border: '#005A3F' },
  'future-leaders':    { bg: '#0A2A52', color: '#60A5FA', border: '#0F3D7A' },
  'value-traps':       { bg: '#3D0A0C', color: '#E8323C', border: '#5A1014' },
  'overrated-leaders': { bg: '#2A1A00', color: '#C4A85A', border: '#3D2600' },
  buy:        { bg: '#003D2B', color: '#00C087', border: '#005A3F' },
  accumulate: { bg: '#0A2A52', color: '#60A5FA', border: '#0F3D7A' },
  hold:       { bg: '#2A1A00', color: '#C4A85A', border: '#3D2600' },
  reduce:     { bg: '#3D0A0C', color: '#E8323C', border: '#5A1014' },
  upgrade:    { bg: '#003D2B', color: '#00C087', border: '#005A3F' },
  downgrade:  { bg: '#3D0A0C', color: '#E8323C', border: '#5A1014' },
  watch:      { bg: '#2A1A00', color: '#C4A85A', border: '#3D2600' },
  stable:     { bg: '#131920', color: '#8B9AAB', border: '#1E2836' },
  'pillar-e': { bg: '#003D2B', color: '#00C087', border: '#005A3F' },
  'pillar-s': { bg: '#0A2A52', color: '#60A5FA', border: '#0F3D7A' },
  'pillar-g': { bg: '#1A0A2E', color: '#C084FC', border: '#2D1050' },
  'severity-1': { bg: '#131920', color: '#8B9AAB', border: '#1E2836' },
  'severity-2': { bg: '#2A1A00', color: '#C4A85A', border: '#3D2600' },
  'severity-3': { bg: '#3D0A0C', color: '#E8323C', border: '#5A1014' },
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
        padding: '1px 6px',
        borderRadius: 3,
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        lineHeight: '16px',
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
