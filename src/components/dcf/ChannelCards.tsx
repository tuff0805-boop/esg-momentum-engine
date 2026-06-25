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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7"/><path d="M7 7h10v10"/>
    </svg>
  )
}
function IconCoin({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8"/><path d="M12 8v8"/><path d="M8.5 10a2 2 0 013.5-1.5 2 2 0 013.5 1.5"/>
    </svg>
  )
}
function IconBuilding({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V7a2 2 0 012-2h14a2 2 0 012 2v14"/><path d="M3 21h18"/><path d="M9 21V13h6v8"/><path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01"/>
    </svg>
  )
}
function IconShield({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}

export function ChannelCards({ revUp, opSave, capexDrag, waccReduction }: ChannelCardsProps) {
  type IconFC = (props: { color: string }) => React.JSX.Element
  const channels: { label: string; value: string; numColor: string; topColor: string; desc: string; tooltip: string; Icon: IconFC; iconColor: string }[] = [
    {
      label: 'Revenue Uplift',
      value: `+${revUp.toFixed(2)}%`,
      numColor: '#00C087',
      topColor: 'rgba(0,192,135,0.4)',
      iconColor: '#00C087',
      Icon: IconRevenue,
      desc: 'ESG premium pricing power',
      tooltip: 'ESG leadership drives demand shift and pricing power. Example: A packaging company with certified sustainable materials commands 3-8% premium pricing from FMCG customers with Scope 3 commitments. Revenue uplift = multiplier x max uplift from the company transition roadmap.',
    },
    {
      label: 'Operating Cost Save',
      value: `-${opSave.toFixed(2)}%`,
      numColor: '#00C087',
      topColor: 'rgba(0,192,135,0.4)',
      iconColor: '#00C087',
      Icon: IconCoin,
      desc: 'Energy & waste efficiency gains',
      tooltip: 'ESG efficiency improvements reduce OPEX via energy savings, waste reduction and regulatory penalty avoidance. Example: A cement plant adopting waste-heat recovery cuts fuel costs by 6-12% while avoiding carbon levy exposure worth $2-5/tonne. Saving = multiplier x max OPEX saving.',
    },
    {
      label: 'Capex Drag (J-Curve)',
      value: `+${capexDrag.toFixed(2)}% Year 1-2`,
      numColor: '#E8323C',
      topColor: 'rgba(232,50,60,0.4)',
      iconColor: '#E8323C',
      Icon: IconBuilding,
      desc: 'Front-loaded transition capex',
      tooltip: 'Green transition capex front-loads costs in years 1-2 before generating savings. The J-curve reflects this: higher upfront capital spend early, normalising and becoming accretive by year 3+. Example: Solar retrofit for an industrial facility costs 2-3% of asset base upfront but delivers 18-22% IRR over 10 years.',
    },
    {
      label: 'Risk / WACC Reduction',
      value: `-${waccReduction.toFixed(0)} basis points`,
      numColor: '#0066CC',
      topColor: 'rgba(0,102,204,0.4)',
      iconColor: '#0066CC',
      Icon: IconShield,
      desc: 'Governance & ESG mandate inflows',
      tooltip: 'ESG improvement reduces cost of capital via governance quality and reduced regulatory risk premium. Institutional ESG mandates narrow credit spreads and cost of equity. Example: A company achieving MSCI upgrade from BB to A can see WACC compress 30-50bps as ESG-screened bond funds enter the register.',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {channels.map(ch => (
        <div key={ch.label} style={{ background: '#0D1117', border: '1px solid #1E2836', borderRadius: 4, padding: '12px', borderTop: `2px solid ${ch.topColor}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
            <ch.Icon color={ch.iconColor} />
            <Tooltip content={ch.tooltip} />
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 500, marginBottom: 4, color: ch.numColor }}>{ch.value}</div>
          <div style={{ fontSize: 11, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{ch.label}</div>
          <div style={{ fontSize: 12, color: '#8B9AAB', marginTop: 2 }}>{ch.desc}</div>
        </div>
      ))}
    </div>
  )
}
