import React from 'react'
import { Tooltip } from '../shared/Tooltip'

interface ChannelCardsProps {
  revUp: number
  opSave: number
  capexDrag: number
  waccReduction: number
}

function IconRevenue({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7"/><path d="M7 7h10v10"/>
    </svg>
  )
}
function IconCoin({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8"/><path d="M12 8v8"/><path d="M8.5 10a2 2 0 013.5-1.5 2 2 0 013.5 1.5"/>
    </svg>
  )
}
function IconBuilding({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V7a2 2 0 012-2h14a2 2 0 012 2v14"/><path d="M3 21h18"/><path d="M9 21V13h6v8"/><path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01"/>
    </svg>
  )
}
function IconShield({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}

export function ChannelCards({ revUp, opSave, capexDrag, waccReduction }: ChannelCardsProps) {
  type IconFC = (props: { color: string }) => React.JSX.Element
  const channels: { label: string; value: string; numColor: string; borderColor: string; desc: string; tooltip: string; Icon: IconFC; iconColor: string }[] = [
    {
      label: 'Revenue Uplift',
      value: `+${revUp.toFixed(2)}%`,
      numColor: '#10B981',
      borderColor: 'rgba(16,185,129,0.25)',
      iconColor: '#10B981',
      Icon: IconRevenue,
      desc: 'ESG premium pricing power',
      tooltip: 'ESG leadership drives demand shift and pricing power. Example: A packaging company with certified sustainable materials commands 3-8% premium pricing from FMCG customers with Scope 3 commitments. Revenue uplift = multiplier x max uplift from the company transition roadmap.',
    },
    {
      label: 'Operating Cost Save',
      value: `-${opSave.toFixed(2)}%`,
      numColor: '#10B981',
      borderColor: 'rgba(16,185,129,0.25)',
      iconColor: '#10B981',
      Icon: IconCoin,
      desc: 'Energy & waste efficiency gains',
      tooltip: 'ESG efficiency improvements reduce OPEX via energy savings, waste reduction and regulatory penalty avoidance. Example: A cement plant adopting waste-heat recovery cuts fuel costs by 6-12% while avoiding carbon levy exposure worth $2-5/tonne. Saving = multiplier x max OPEX saving.',
    },
    {
      label: 'Capex Drag (J-Curve)',
      value: `+${capexDrag.toFixed(2)}% yr1-2`,
      numColor: '#F59E0B',
      borderColor: 'rgba(245,158,11,0.25)',
      iconColor: '#F59E0B',
      Icon: IconBuilding,
      desc: 'Front-loaded transition capex',
      tooltip: 'Green transition capex front-loads costs in years 1-2 before generating savings. The J-curve reflects this: higher capex spend early, normalising and becoming accretive by year 3+. Example: Solar retrofit for an industrial facility costs 2-3% of asset base upfront but delivers 18-22% IRR over 10 years.',
    },
    {
      label: 'Risk / WACC Reduction',
      value: `-${waccReduction.toFixed(0)}bps`,
      numColor: '#3B82F6',
      borderColor: 'rgba(59,130,246,0.25)',
      iconColor: '#3B82F6',
      Icon: IconShield,
      desc: 'Governance & ESG mandate inflows',
      tooltip: 'ESG improvement reduces cost of capital via governance quality and reduced regulatory risk premium. Institutional ESG mandates narrow credit spreads and cost of equity. Example: A company achieving MSCI upgrade from BB to A can see WACC compress 30-50bps as ESG-screened bond funds enter the register.',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {channels.map(ch => (
        <div key={ch.label} className="card p-4" style={{ borderTop: `3px solid ${ch.borderColor}` }}>
          <div className="flex items-start justify-between mb-2">
            <ch.Icon color={ch.iconColor} />
            <Tooltip content={ch.tooltip} />
          </div>
          <div className="font-mono text-2xl font-bold mb-1" style={{ color: ch.numColor }}>{ch.value}</div>
          <div className="text-[10px] text-secondary uppercase tracking-widest font-semibold">{ch.label}</div>
          <div className="text-[11px] text-secondary mt-0.5">{ch.desc}</div>
        </div>
      ))}
    </div>
  )
}
