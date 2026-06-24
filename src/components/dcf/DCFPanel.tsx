import { useState } from 'react'
import { motion } from 'framer-motion'
import { companies as ALL_COMPANIES } from '../../data/companies'
import type { Company } from '../../data/companies'
import { calcDCF, getQuadrant } from '../../lib/esg'
import { Badge, quadrantVariant, ratingVariant } from '../shared/Badge'
import { ChannelCards } from './ChannelCards'
import { JCurveChart } from './JCurveChart'
import { TargetPriceOutput } from './TargetPriceOutput'

interface DCFPanelProps {
  activeSector: string
  onSelect: (c: Company) => void
}

function fmt(v: number): string {
  if (v >= 1000) return v.toLocaleString(undefined, { maximumFractionDigits: 0 })
  if (v >= 10) return v.toFixed(2)
  return v.toFixed(3)
}

const SECTOR_VALUES = new Set<string>(['Energy', 'Materials', 'Industrials'])

export function DCFPanel({ activeSector, onSelect }: DCFPanelProps) {
  const [selectedIdx, setSelectedIdx] = useState(0)

  const filtered = SECTOR_VALUES.has(activeSector)
    ? ALL_COMPANIES.filter(c => c.sector === activeSector)
    : ALL_COMPANIES

  const safeIdx = selectedIdx < filtered.length ? selectedIdx : 0
  const company = filtered[safeIdx] ?? filtered[0]

  if (!company) return (
    <div className="text-secondary text-sm p-8 text-center">No companies match the current filter.</div>
  )

  const quadrant = getQuadrant(company, ALL_COMPANIES)
  const dcf = calcDCF(company, ALL_COMPANIES)

  const allRows = ALL_COMPANIES.map(c => ({
    company: c,
    dcf: calcDCF(c, ALL_COMPANIES),
    quadrant: getQuadrant(c, ALL_COMPANIES),
  })).sort((a, b) => b.dcf.upsidePct - a.dcf.upsidePct)

  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-secondary leading-relaxed px-1">
        We translate ESG improvements into financial impact — showing how much they affect the company's target price through four channels.
      </div>
      {/* Company selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-xs text-secondary uppercase tracking-widest">Company</label>
        <div className="relative">
          <select
            value={safeIdx}
            onChange={e => setSelectedIdx(Number(e.target.value))}
            className="select-input"
          >
            {filtered.map((c, i) => (
              <option key={c.name} value={i}>{c.name} ({c.country})</option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-secondary text-xs">▾</div>
        </div>
        <Badge variant={quadrantVariant(quadrant)}>{quadrant}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <ChannelCards revUp={dcf.revUp} opSave={dcf.opSave} capexDrag={dcf.capexDrag} waccReduction={dcf.waccReduction} />
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] text-secondary uppercase tracking-widest">Financial Materiality Threshold</div>
                <Badge variant={dcf.materialityPass ? 'buy' : 'reduce'}>{dcf.materialityPass ? 'PASS' : 'FAIL'}</Badge>
              </div>
              <div className="font-mono text-xs text-primary mb-1">
                Free Cash Flow / Market Cap = {((company.fcf / company.mcap) * 100).toFixed(2)}%
              </div>
              <div className="text-[10px] text-secondary">
                Threshold: &gt;0.5% · ESG adjustments are material to enterprise value
              </div>
            </div>
            <div className="card p-4">
              <div className="text-[10px] text-secondary uppercase tracking-widest mb-2">ESG Transition Capex — J-Curve</div>
              <JCurveChart capexDrag={dcf.capexDrag} opSave={dcf.opSave} revUp={dcf.revUp} />
            </div>
          </div>
        </div>

        <div>
          <TargetPriceOutput
            bearPrice={dcf.bearPrice}
            basePrice={dcf.basePrice}
            adjPrice={dcf.adjPrice}
            bullPrice={dcf.bullPrice}
            upsidePct={dcf.upsidePct}
            rating={dcf.rating}
            multiplier={dcf.multiplier}
            quadrant={quadrant}
            baseWACC={dcf.baseWACC}
            adjWACC={dcf.adjWACC}
            waccReduction={dcf.waccReduction}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="card-header">
          <div className="card-title">All Companies — ESG Valuation</div>
          <div className="card-subtitle">Sorted by ESG upside · click row to inspect</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[640px]">
            <thead>
              <tr className="table-head-row">
                {['Company', 'Sector', 'ESG Positioning', 'Base Price', 'ESG Target Price', 'Upside', 'Rating'].map(h => (
                  <th key={h} className="th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allRows.map((r, i) => (
                <motion.tr
                  key={r.company.name}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => onSelect(r.company)}
                  className="tr"
                  style={{ borderLeft: `3px solid ${quadrantBorderColor(r.quadrant)}` }}
                >
                  <td className="td">
                    <div className="font-semibold text-primary group-hover:text-accent transition-colors">{r.company.name}</div>
                    <div className="text-secondary text-[10px]">{r.company.country} · {r.company.sector}</div>
                  </td>
                  <td className="td text-secondary">{r.company.sector}</td>
                  <td className="td"><Badge variant={quadrantVariant(r.quadrant)}>{r.quadrant.split(' ').map((w: string) => w[0]).join('')}</Badge></td>
                  <td className="td font-mono text-right text-primary">{fmt(r.company.base_price)}</td>
                  <td className="td font-mono text-right text-accent">{fmt(r.dcf.adjPrice)}</td>
                  <td className="td font-mono text-right font-semibold">
                    <span className={r.dcf.upsidePct >= 0 ? 'text-accent' : 'text-danger'}>
                      {r.dcf.upsidePct >= 0 ? '+' : ''}{r.dcf.upsidePct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="td"><Badge variant={ratingVariant(r.dcf.rating)}>{r.dcf.rating}</Badge></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-[10px] text-secondary border border-border rounded-lg px-4 py-3 leading-relaxed">
        <strong className="text-primary">Disclaimer:</strong> All data is sample/illustrative for PolyFinTech100 2026 hackathon purposes only. This is not financial advice.
        ESG scores, valuations and price targets are derived from hardcoded sample data. Production version connects to live MSCI, Sustainalytics and Bloomberg ESG APIs.
        Past ESG performance does not guarantee future rating changes. CGS International is the hackathon sponsor and does not endorse any specific investment recommendations shown here.
      </div>
    </div>
  )
}

function quadrantBorderColor(q: string): string {
  if (q === 'Overweight') return '#10B981'
  if (q === 'Strong Overweight') return '#3B82F6'
  if (q === 'Underweight') return '#EF4444'
  return '#F59E0B'
}
