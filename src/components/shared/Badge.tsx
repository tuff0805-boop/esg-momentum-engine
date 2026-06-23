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

const variantStyles: Record<BadgeVariant, string> = {
  'hidden-winners': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  'future-leaders': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'value-traps': 'bg-red-500/20 text-red-300 border-red-500/30',
  'overrated-leaders': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  buy: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  accumulate: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  hold: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  reduce: 'bg-red-500/20 text-red-300 border-red-500/30',
  upgrade: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  downgrade: 'bg-red-500/20 text-red-300 border-red-500/30',
  watch: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  stable: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  'pillar-e': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  'pillar-s': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'pillar-g': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'severity-1': 'bg-slate-600/30 text-slate-400 border-slate-500/20',
  'severity-2': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'severity-3': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
}

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

export function quadrantVariant(
  q: string
): BadgeVariant {
  if (q === 'Hidden Winners') return 'hidden-winners'
  if (q === 'Future Leaders') return 'future-leaders'
  if (q === 'Value Traps') return 'value-traps'
  return 'overrated-leaders'
}

export function ratingVariant(r: string): BadgeVariant {
  if (r === 'Buy') return 'buy'
  if (r === 'Accumulate') return 'accumulate'
  if (r === 'Hold') return 'hold'
  return 'reduce'
}

export function forecastVariant(f: string): BadgeVariant {
  if (f === 'Upgrade likely') return 'upgrade'
  if (f === 'Downgrade risk') return 'downgrade'
  if (f === 'Watch') return 'watch'
  return 'stable'
}
