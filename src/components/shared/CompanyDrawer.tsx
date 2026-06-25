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
      <span style={{ fontSize: 11, color: '#8B9AAB', width: 14 }}>{label}</span>
      <div className="flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', height: 6 }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <span className="font-mono" style={{ fontSize: 11, color: '#8B9AAB', width: 24, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

export function CompanyDrawer({ company, allCompanies, onClose }: CompanyDrawerProps) {
  const ses      = company ? calcSES(company, allCompanies) : 0
  const cagr     = company ? calcCAGR(company) : 0
  const momentum = company ? calcMomentum(company, allCompanies) : 0
  const pillars  = company ? calcPillars(company, allCompanies) : { E: 0, S: 0, G: 0 }
  const quadrant = company ? getQuadrant(company, allCompanies) : ''
  const forecast = company ? getRaterForecast(company, allCompanies) : ''
  const dcf      = company ? calcDCF(company, allCompanies) : null

  const cardBg     = 'rgba(255,255,255,0.03)'
  const cardBorder = 'rgba(255,255,255,0.06)'

  return (
    <AnimatePresence>
      {company && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 h-full overflow-y-auto z-50"
            style={{ width: 480, maxWidth: '95vw', background: '#0D1117', borderLeft: '1px solid #2A3441' }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            {/* Header */}
            <div className="sticky top-0 flex items-start justify-between px-6 py-4" style={{ background: '#0D1117', borderBottom: '1px solid #2A3441' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF' }}>{company.name}</div>
                <div style={{ fontSize: 12, color: '#8B9AAB', marginTop: 2 }}>{company.country} · {company.sector}</div>
              </div>
              <button onClick={onClose} style={{ color: '#8B9AAB', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {/* SES + Pillars */}
              <div className="rounded-xl p-4" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                <div className="flex items-center justify-between mb-3">
                  <span style={{ fontSize: 10, color: '#8B9AAB', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Standardized ESG Score</span>
                  <div className="flex gap-2">
                    <Badge variant={quadrantVariant(quadrant)}>{quadrant}</Badge>
                    <Badge variant={forecastVariant(forecast)}>{forecast}</Badge>
                  </div>
                </div>
                <div className="font-mono" style={{ fontSize: 36, fontWeight: 700, color: '#00C087', marginBottom: 12, lineHeight: 1 }}>{ses.toFixed(1)}</div>
                <div className="flex flex-col gap-2">
                  <PillarBar label="E" value={pillars.E} color="#00C087" />
                  <PillarBar label="S" value={pillars.S} color="#60A5FA" />
                  <PillarBar label="G" value={pillars.G} color="#C084FC" />
                </div>
              </div>

              {/* Momentum stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'ESG CAGR',    val: `${cagr >= 0 ? '+' : ''}${cagr.toFixed(1)}%`,   color: cagr >= 0 ? '#00C087' : '#E8323C' },
                  { label: 'ESG Momentum', val: `${momentum}/100`,                                color: '#FFFFFF' },
                  { label: 'Mkt Cap',     val: `$${company.mcap}B`,                               color: '#FFFFFF' },
                ].map(item => (
                  <div key={item.label} className="rounded-xl p-3 text-center" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                    <div style={{ fontSize: 11, color: '#8B9AAB', marginBottom: 4 }}>{item.label}</div>
                    <div className="font-mono" style={{ fontSize: 18, fontWeight: 600, color: item.color }}>{item.val}</div>
                  </div>
                ))}
              </div>

              {/* Provider Scores */}
              <div className="rounded-xl p-4" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                <div style={{ fontSize: 10, color: '#8B9AAB', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Provider Scores</div>
                <div className="grid grid-cols-3 gap-3">
                  {[['MSCI', company.msci], ['Sustainalytics', company.sustainalytics], ['Bloomberg', company.bloomberg]].map(([k, v]) => (
                    <div key={k as string} className="text-center">
                      <div style={{ fontSize: 11, color: '#8B9AAB', marginBottom: 2 }}>{k}</div>
                      <div className="font-mono" style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF' }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ESG Events */}
              <div>
                <div style={{ fontSize: 10, color: '#8B9AAB', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>ESG Events</div>
                <div className="flex flex-col gap-2">
                  {company.events.map((ev, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2.5" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ev.direction === 1 ? '#00C087' : '#E8323C' }} />
                      <div className="flex-1 text-sm" style={{ color: '#D1D5DB' }}>{ev.title}</div>
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
                <div className="rounded-xl p-4" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                  <div className="flex items-center justify-between mb-3">
                    <div style={{ fontSize: 10, color: '#8B9AAB', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Financial Materiality Summary</div>
                    <Badge variant={ratingVariant(dcf.rating)}>{dcf.rating}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {[
                      ['Revenue uplift',  `+${dcf.revUp.toFixed(2)}%`],
                      ['Op cost save',    `-${dcf.opSave.toFixed(2)}%`],
                      ['Capex drag',      `+${dcf.capexDrag.toFixed(2)}%`],
                      ['WACC reduction',  `-${dcf.waccReduction.toFixed(0)} basis points`],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div style={{ fontSize: 11, color: '#8B9AAB' }}>{k}</div>
                        <div className="font-mono" style={{ fontSize: 13, color: '#FFFFFF' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#8B9AAB' }}>ESG Target Price</div>
                      <div className="font-mono" style={{ fontSize: 18, fontWeight: 700, color: '#00C087' }}>
                        {dcf.adjPrice > 100 ? Math.round(dcf.adjPrice).toLocaleString() : dcf.adjPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div style={{ fontSize: 11, color: '#8B9AAB' }}>Upside</div>
                      <div className="font-mono" style={{ fontSize: 18, fontWeight: 700, color: dcf.upsidePct >= 0 ? '#00C087' : '#E8323C' }}>
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
