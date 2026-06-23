import { motion, AnimatePresence } from 'framer-motion'
import type { Company } from '../../data/companies'
import { calcSES, calcCAGR, calcMomentum, calcPillars, calcDCF } from '../../lib/esg'
import { getQuadrant, getRaterForecast } from '../../lib/esg'
import { Badge, quadrantVariant, ratingVariant, forecastVariant } from './Badge'

interface CompanyDrawerProps {
  company: Company | null
  allCompanies: Company[]
  onClose: () => void
}

function PillarBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 w-4">{label}</span>
      <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <span className="font-mono text-xs text-slate-400 w-6 text-right">{value}</span>
    </div>
  )
}

export function CompanyDrawer({ company, allCompanies, onClose }: CompanyDrawerProps) {
  const ses = company ? calcSES(company, allCompanies) : 0
  const cagr = company ? calcCAGR(company) : 0
  const momentum = company ? calcMomentum(company, allCompanies) : 0
  const pillars = company ? calcPillars(company, allCompanies) : { E: 0, S: 0, G: 0 }
  const quadrant = company ? getQuadrant(company, allCompanies) : ''
  const forecast = company ? getRaterForecast(company, allCompanies) : ''
  const dcf = company ? calcDCF(company, allCompanies) : null

  return (
    <AnimatePresence>
      {company && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 h-full w-[480px] max-w-[95vw] bg-[#0D1526] border-l border-white/5 z-50 overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#0D1526] border-b border-white/5 px-6 py-4 flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold text-white">{company.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {company.country} · {company.sector}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-white transition-colors mt-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              {/* SES + Pillars */}
              <div className="bg-white/3 border border-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-500 uppercase tracking-widest">SES Score</span>
                  <div className="flex gap-2">
                    <Badge variant={quadrantVariant(quadrant)}>{quadrant}</Badge>
                    <Badge variant={forecastVariant(forecast)}>{forecast}</Badge>
                  </div>
                </div>
                <div className="font-mono text-4xl font-bold text-teal-400 mb-4">{ses.toFixed(1)}</div>
                <div className="flex flex-col gap-2">
                  <PillarBar label="E" value={pillars.E} color="bg-teal-500" />
                  <PillarBar label="S" value={pillars.S} color="bg-blue-500" />
                  <PillarBar label="G" value={pillars.G} color="bg-purple-500" />
                </div>
              </div>

              {/* Momentum */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/3 border border-white/5 rounded-xl p-3 text-center">
                  <div className="text-xs text-slate-500 mb-1">ESG CAGR</div>
                  <div className={`font-mono text-xl font-semibold ${cagr >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                    {cagr >= 0 ? '+' : ''}{cagr.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-white/3 border border-white/5 rounded-xl p-3 text-center">
                  <div className="text-xs text-slate-500 mb-1">Momentum</div>
                  <div className="font-mono text-xl font-semibold text-white">{momentum}/100</div>
                </div>
                <div className="bg-white/3 border border-white/5 rounded-xl p-3 text-center">
                  <div className="text-xs text-slate-500 mb-1">Mkt Cap</div>
                  <div className="font-mono text-xl font-semibold text-white">${company.mcap}B</div>
                </div>
              </div>

              {/* Provider Scores */}
              <div className="bg-white/3 border border-white/5 rounded-xl p-4">
                <div className="text-xs text-slate-500 uppercase tracking-widest mb-3">Provider Scores</div>
                <div className="grid grid-cols-3 gap-3">
                  {[['MSCI', company.msci], ['Sustainalytics', company.sustainalytics], ['Bloomberg', company.bloomberg]].map(([k, v]) => (
                    <div key={k as string} className="text-center">
                      <div className="text-xs text-slate-500 mb-1">{k}</div>
                      <div className="font-mono text-lg font-semibold text-white">{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ESG Events */}
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-widest mb-3">ESG Events</div>
                <div className="flex flex-col gap-2">
                  {company.events.map((ev, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/3 border border-white/5 rounded-lg px-3 py-2.5">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ev.direction === 1 ? 'bg-teal-400' : 'bg-red-400'}`} />
                      <div className="flex-1 text-sm text-slate-300">{ev.title}</div>
                      <div className="flex gap-1.5">
                        <Badge variant={`pillar-${ev.pillar.toLowerCase()}` as 'pillar-e' | 'pillar-s' | 'pillar-g'}>{ev.pillar}</Badge>
                        <Badge variant={`severity-${ev.severity}` as 'severity-1' | 'severity-2' | 'severity-3'}>S{ev.severity}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DCF Summary */}
              {dcf && (
                <div className="bg-white/3 border border-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-slate-500 uppercase tracking-widest">DCF Summary</div>
                    <Badge variant={ratingVariant(dcf.rating)}>{dcf.rating}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {[
                      ['Revenue uplift', `+${dcf.revUp.toFixed(2)}%`],
                      ['Op cost save', `-${dcf.opSave.toFixed(2)}%`],
                      ['Capex drag', `+${dcf.capexDrag.toFixed(2)}%`],
                      ['WACC reduction', `-${dcf.waccReduction.toFixed(0)}bps`],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div className="text-xs text-slate-500">{k}</div>
                        <div className="font-mono text-sm text-white">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500">ESG Target Price</div>
                      <div className="font-mono text-lg font-bold text-teal-400">
                        {dcf.adjPrice > 100
                          ? Math.round(dcf.adjPrice).toLocaleString()
                          : dcf.adjPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Upside</div>
                      <div className={`font-mono text-lg font-bold ${dcf.upsidePct >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                        {dcf.upsidePct >= 0 ? '+' : ''}{dcf.upsidePct.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
