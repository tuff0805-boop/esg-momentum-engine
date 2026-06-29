import React from 'react'

type BadgeVariant =
  | 'outperform'
  | 'strong-buy'
  | 'underperform'
  | 'reduce'
  | 'dollar-cost'
  | 'hold'
  | 'upgrade'
  | 'downgrade'
  | 'monitor'
  | 'stable'
  | 'pillar-e'
  | 'pillar-s'
  | 'pillar-g'
  | 'severity-1'
  | 'severity-2'
  | 'severity-3'
  | 'buy'
  | 'accumulate'

const variantStyles: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  'outperform':    { bg: '#003D2B', color: '#00C087', border: '#005A3F' },
  'strong-buy':    { bg: '#0A2A52', color: '#60A5FA', border: '#0F3D7A' },
  'underperform':  { bg: '#3D0A0C', color: '#E8323C', border: '#5A1014' },
  'reduce':        { bg: '#2A1A00', color: '#C4A85A', border: '#3D2600' },
  'dollar-cost':   { bg: '#003D3A', color: '#2DD4BF', border: '#005450' },
  'hold':          { bg: '#131920', color: '#8B9AAB', border: '#1E2836' },
  'buy':           { bg: '#003D2B', color: '#00C087', border: '#005A3F' },
  'accumulate':    { bg: '#0A2A52', color: '#60A5FA', border: '#0F3D7A' },
  'upgrade':       { bg: '#003D2B', color: '#00C087', border: '#005A3F' },
  'downgrade':     { bg: '#3D0A0C', color: '#E8323C', border: '#5A1014' },
  'monitor':       { bg: '#2A1A00', color: '#C4A85A', border: '#3D2600' },
  'stable':        { bg: '#131920', color: '#8B9AAB', border: '#1E2836' },
  'pillar-e':      { bg: '#003D2B', color: '#00C087', border: '#005A3F' },
  'pillar-s':      { bg: '#0A2A52', color: '#60A5FA', border: '#0F3D7A' },
  'pillar-g':      { bg: '#1A0A2E', color: '#C084FC', border: '#2D1050' },
  'severity-1':    { bg: '#131920', color: '#8B9AAB', border: '#1E2836' },
  'severity-2':    { bg: '#2A1A00', color: '#C4A85A', border: '#3D2600' },
  'severity-3':    { bg: '#3D0A0C', color: '#E8323C', border: '#5A1014' },
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
  if (q === 'Outperform')   return 'outperform'
  if (q === 'Strong Buy')   return 'strong-buy'
  if (q === 'Underperform') return 'underperform'
  return 'reduce'
}

export function ratingVariant(r: string): BadgeVariant {
  if (r === 'Strong Buy')          return 'strong-buy'
  if (r === 'Dollar-Cost Strategy') return 'dollar-cost'
  if (r === 'Hold')                return 'hold'
  return 'reduce'
}

export function forecastVariant(f: string): BadgeVariant {
  if (f === 'Rating Upgrade Expected') return 'upgrade'
  if (f === 'Rating Downgrade Risk')   return 'downgrade'
  if (f === 'Monitor')                 return 'monitor'
  return 'stable'
}

export function esgSignalVariant(s: string): BadgeVariant {
  if (s === 'Outperform')   return 'outperform'
  if (s === 'Underperform') return 'underperform'
  return 'hold'
}

export function actionVariant(a: string): BadgeVariant {
  if (a === 'Strong Buy')           return 'strong-buy'
  if (a === 'Dollar-Cost Strategy') return 'dollar-cost'
  if (a === 'Hold')                 return 'hold'
  return 'reduce'
}
