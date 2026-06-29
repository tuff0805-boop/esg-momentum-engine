import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import type { Company, NewsItem } from '../../data/companies'
import {
  calcSES, calcCAGR, calcMomentum, calcPillars, calcDCF,
  getQuadrant, getRaterForecast, getESGSignal, getActionRating,
} from '../../lib/esg'
import { Badge, quadrantVariant, forecastVariant, esgSignalVariant, actionVariant } from './Badge'
import { NewsCatalystFeed } from './NewsCatalystFeed'
import { ScoreTrendChart } from './ScoreTrendChart'

interface CompanyDrawerProps {
  company: Company | null
  allCompanies: Company[]
  onClose: () => void
  onEventClick?: (item: NewsItem) => void
}

function PillarBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, color: '#8B9AAB', width: 14, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', height: 4, borderRadius: 2, overflow: 'hidden' }}>
        <motion.div
          style={{ background: color, height: '100%', borderRadius: 2 }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#8B9AAB', width: 24, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

export function CompanyDrawer({ company, allCompanies, onClose, onEventClick }: CompanyDrawerProps) {
  if (!company) return null

  const ses       = calcSES(company, allCompanies)
  const cagr      = calcCAGR(company)
  const momentum  = calcMomentum(company, allCompanies)
  const pillars   = calcPillars(company, allCompanies)
  const quadrant  = getQuadrant(company, allCompanies)
  const forecast  = getRaterForecast(company, allCompanies)
  const dcf       = calcDCF(company, allCompanies)
  const esgSignal = getESGSignal(company, allCompanies)
  const action    = getActionRating(company, allCompanies)

  const border = '#1E2836'

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          zIndex: 9998,
        }}
      />
      {/* Modal */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(960px, 92vw)',
          height: '88vh',
          backgroundColor: '#0D1117',
          border: '1px solid #2A3A4A',
          borderRadius: '8px',
          overflowY: 'auto',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'none',
            border: 'none',
            color: '#8B9AAB',
            fontSize: 20,
            cursor: 'pointer',
            zIndex: 10,
            lineHeight: 1,
          }}
        >✕</button>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '0 20px', height: 56, borderBottom: `1px solid ${border}`,
          background: '#080B10', flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#E8EDF2', lineHeight: 1.2 }}>{company.name}</div>
            <div style={{ fontSize: 13, color: '#8B9AAB' }}>{company.country} · {company.sector}</div>
          </div>
        </div>

        {/* Investment Thesis — full-width strip */}
        {company.investmentThesis && (
          <div style={{
            margin: '0 20px 0',
            padding: '14px 16px',
            background: '#0D1117',
            border: '1px solid #1E2836',
            borderLeft: '3px solid #00C087',
            borderRadius: 4,
            flexShrink: 0,
          }}>
            <div style={{ fontSize: 10, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Investment Thesis</div>
            <div style={{ fontSize: 13, color: '#E8EDF2', lineHeight: 1.6 }}>{company.investmentThesis}</div>
            <div style={{ fontSize: 10, color: '#4A5568', marginTop: 8 }}>ESG Momentum Engine · CGS International iTrade</div>
          </div>
        )}

            {/* Body — 3-column grid */}
            <div style={{
              flex: 1,
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: '30% 40% 30%',
            }}>
              {/* LEFT COLUMN */}
              <div style={{ overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* SES score */}
                <div>
                  <div style={{ fontSize: 11, color: '#8B9AAB', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Standardized ESG Score</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 700, color: '#00C087', lineHeight: 1 }}>{ses.toFixed(1)}</div>
                </div>

                {/* ESG Signal + Suggested Action */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.06em', width: 110, flexShrink: 0 }}>ESG Signal</span>
                    <Badge variant={esgSignalVariant(esgSignal)}>{esgSignal}</Badge>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.06em', width: 110, flexShrink: 0 }}>Suggested Action</span>
                    <Badge variant={actionVariant(action)}>{action}</Badge>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    <span style={{ fontSize: 10, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.06em', width: 110, flexShrink: 0 }}>Quadrant</span>
                    <Badge variant={quadrantVariant(quadrant)}>{quadrant}</Badge>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.06em', width: 110, flexShrink: 0 }}>Forecast</span>
                    <Badge variant={forecastVariant(forecast)}>{forecast}</Badge>
                  </div>
                </div>

                {/* Pillar bars E/S/G/I */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <PillarBar label="E" value={pillars.E} color="#00C087" />
                  <PillarBar label="S" value={pillars.S} color="#60A5FA" />
                  <PillarBar label="G" value={pillars.G} color="#C084FC" />
                </div>

                {/* ESG Score History */}
                <div>
                  <div style={{ fontSize: 10, color: '#8B9AAB', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    ESG Score History (2019–2024)
                  </div>
                  <ScoreTrendChart company={company} allCompanies={allCompanies} height={160} showPillars={true} />
                </div>

                {/* Provider scores */}
                <div>
                  <div style={{ fontSize: 11, color: '#8B9AAB', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Provider Scores</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                    {[['MSCI', company.msci], ['Sust.', company.sustainalytics], ['BBG', company.bloomberg]].map(([k, v]) => (
                      <div key={k as string} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: '#8B9AAB', marginBottom: 2 }}>{k}</div>
                        <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 600, color: '#E8EDF2' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                  {[
                    { label: 'ESG CAGR',     val: `${cagr >= 0 ? '+' : ''}${cagr.toFixed(1)}%`, color: cagr >= 0 ? '#00C087' : '#E8323C' },
                    { label: 'Momentum',     val: `${momentum}/100`,                              color: '#FFFFFF' },
                    { label: 'Mkt Cap',      val: `$${company.mcap}B`,                            color: '#FFFFFF' },
                  ].map(item => (
                    <div key={item.label} style={{ background: '#080B10', border: `1px solid ${border}`, borderRadius: 4, padding: '6px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#8B9AAB', marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: item.color }}>{item.val}</div>
                    </div>
                  ))}
                </div>

                {/* ESG Events */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#E8EDF2', marginBottom: 8 }}>ESG Events</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {company.events.map((ev, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#080B10', border: `1px solid ${border}`, borderRadius: 4 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: ev.direction === 1 ? '#00C087' : '#E8323C' }} />
                        <div style={{ flex: 1, fontSize: 11, color: '#D1D5DB', lineHeight: 1.4 }}>{ev.title}</div>
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                          <Badge variant={`pillar-${ev.pillar.toLowerCase()}` as 'pillar-e' | 'pillar-s' | 'pillar-g'}>{ev.pillar}</Badge>
                          <Badge variant={`severity-${ev.severity}` as 'severity-1' | 'severity-2' | 'severity-3'}>S{ev.severity}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CENTER COLUMN — News & Catalysts */}
              <div style={{ overflowY: 'auto', padding: 16, borderLeft: `1px solid ${border}`, borderRight: `1px solid ${border}` }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#E8EDF2', marginBottom: 12 }}>News &amp; Catalysts</div>
                {company.news && company.news.length > 0
                  ? <NewsCatalystFeed news={company.news} onEventClick={onEventClick} />
                  : <div style={{ color: '#8B9AAB', fontSize: 12 }}>No news available.</div>
                }
              </div>

              {/* RIGHT COLUMN — Financial Materiality */}
              <div style={{ overflowY: 'auto', padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#E8EDF2', marginBottom: 12 }}>Financial Materiality</div>

                {dcf && (
                  <>
                    {/* Bear / Base / Bull */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                      {[
                        { label: 'Bear Case', price: dcf.bearPrice, border: '#E8323C', color: '#E8323C' },
                        { label: 'Base Case', price: dcf.adjPrice,  border: '#4A5568', color: '#8B9AAB' },
                        { label: 'Bull Case', price: dcf.bullPrice, border: '#00C087', color: '#00C087' },
                      ].map(s => (
                        <div key={s.label} style={{ borderLeft: `3px solid ${s.border}`, padding: '8px 10px', background: '#080B10', borderRadius: 2 }}>
                          <div style={{ fontSize: 10, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{s.label}</div>
                          <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 600, color: s.color }}>{s.price.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>

                    {/* ESG Signal + Suggested Action */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.06em', width: 110, flexShrink: 0 }}>ESG Signal</span>
                        <Badge variant={esgSignalVariant(esgSignal)}>{esgSignal}</Badge>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.06em', width: 110, flexShrink: 0 }}>Suggested Action</span>
                        <Badge variant={actionVariant(action)}>{action}</Badge>
                      </div>
                    </div>

                    {/* Potential Upside */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, padding: '8px 10px', background: '#080B10', border: `1px solid ${border}`, borderRadius: 4 }}>
                      <span style={{ fontSize: 10, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Potential Upside</span>
                      <span style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: dcf.upsidePct >= 0 ? '#00C087' : '#E8323C' }}>
                        {dcf.upsidePct >= 0 ? '+' : ''}{dcf.upsidePct.toFixed(1)}%
                      </span>
                    </div>

                    {/* 4 channel metrics */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {[
                        ['Revenue Uplift',   `+${dcf.revUp.toFixed(2)}%`],
                        ['Op Cost Save',     `-${dcf.opSave.toFixed(2)}%`],
                        ['Capex Drag',       `+${dcf.capexDrag.toFixed(2)}%`],
                        ['WACC Reduction',   `-${dcf.waccReduction.toFixed(0)} bps`],
                      ].map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#080B10', border: `1px solid ${border}`, borderRadius: 4 }}>
                          <span style={{ fontSize: 11, color: '#8B9AAB' }}>{k}</span>
                          <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#E8EDF2' }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
        </div>
    </>,
    document.body
  )
}
