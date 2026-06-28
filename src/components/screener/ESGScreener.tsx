import { useState, useMemo } from 'react'
import type { Company } from '../../data/companies'
import { calcSES, calcCAGR, calcMomentum, calcDCF, getQuadrant, getRaterForecast, getESGSignal, getActionRating } from '../../lib/esg'
import { Badge, forecastVariant, esgSignalVariant, actionVariant } from '../shared/Badge'

interface ESGScreenerProps {
  allCompanies: Company[]
  onSelect: (c: Company) => void
}

const DEFAULT_SIGNALS = ['Strong Buy', 'Outperform']
const DEFAULT_SECTORS = ['Energy', 'Materials', 'Industrials']
const DEFAULT_FORECASTS = ['Rating Upgrade Expected', 'Stable']

function toggleItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600,
        color: '#4A5568', marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  )
}

function FilterCheckbox({ label, checked, onChange, color }: { label: string; checked: boolean; onChange: () => void; color?: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 6 }}>
      <div
        onClick={onChange}
        style={{
          width: 14, height: 14, borderRadius: 2, flexShrink: 0,
          border: `1.5px solid ${checked ? (color ?? '#E8323C') : '#2A3A4A'}`,
          background: checked ? (color ?? '#E8323C') : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          transition: 'all 0.12s',
        }}
      >
        {checked && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <span style={{ fontSize: 13, color: checked ? '#E8EDF2' : '#8B9AAB', transition: 'color 0.12s' }}>{label}</span>
    </label>
  )
}

function FilterSlider({ label, value, min, max, step, format, onChange }: {
  label: string; value: number; min: number; max: number; step: number
  format: (v: number) => string; onChange: (v: number) => void
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: '#8B9AAB' }}>{label}</span>
        <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#00C087' }}>{format(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#E8323C', cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <span style={{ fontSize: 10, color: '#4A5568' }}>{format(min)}</span>
        <span style={{ fontSize: 10, color: '#4A5568' }}>{format(max)}</span>
      </div>
    </div>
  )
}

export function ESGScreener({ allCompanies, onSelect }: ESGScreenerProps) {
  const [signals, setSignals] = useState<string[]>(DEFAULT_SIGNALS)
  const [sectors, setSectors] = useState<string[]>(DEFAULT_SECTORS)
  const [minCagr, setMinCagr] = useState(5)
  const [minMomentum, setMinMomentum] = useState(30)
  const [minUpside, setMinUpside] = useState(0)
  const [forecasts, setForecasts] = useState<string[]>(DEFAULT_FORECASTS)
  const [sortBy, setSortBy] = useState<'momentum' | 'cagr' | 'upside' | 'ses'>('momentum')
  const [showToast, setShowToast] = useState(false)

  const avgSES = allCompanies.reduce((s, c) => s + calcSES(c, allCompanies), 0) / allCompanies.length

  const results = useMemo(() => {
    return allCompanies
      .map(c => {
        const ses = calcSES(c, allCompanies)
        const cagr = calcCAGR(c)
        const momentum = calcMomentum(c, allCompanies)
        const dcf = calcDCF(c, allCompanies)
        const quadrant = getQuadrant(c, allCompanies)
        const forecast = getRaterForecast(c, allCompanies)
        const esgSignal = getESGSignal(c, allCompanies)
        const action = getActionRating(c, allCompanies)
        const upside = dcf?.upsidePct ?? 0
        return { company: c, ses, cagr, momentum, upside, quadrant, forecast, esgSignal, action }
      })
      .filter(r =>
        sectors.includes(r.company.sector) &&
        (signals.length === 0 || signals.includes(r.quadrant) || signals.includes(r.esgSignal)) &&
        r.cagr >= minCagr &&
        r.momentum >= minMomentum &&
        r.upside >= minUpside &&
        (forecasts.length === 0 || forecasts.includes(r.forecast))
      )
      .sort((a, b) => {
        if (sortBy === 'momentum') return b.momentum - a.momentum
        if (sortBy === 'cagr') return b.cagr - a.cagr
        if (sortBy === 'upside') return b.upside - a.upside
        return b.ses - a.ses
      })
  }, [allCompanies, signals, sectors, minCagr, minMomentum, minUpside, forecasts, sortBy])

  const resetFilters = () => {
    setSignals(DEFAULT_SIGNALS)
    setSectors(DEFAULT_SECTORS)
    setMinCagr(5)
    setMinMomentum(30)
    setMinUpside(0)
    setForecasts(DEFAULT_FORECASTS)
    setSortBy('momentum')
  }

  const handleExport = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 'calc(100vh - 130px)', gap: 0 }}>
      {/* LEFT PANEL — Filter Controls */}
      <div style={{
        width: 260, flexShrink: 0, borderRight: '1px solid #1E2836',
        padding: '20px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#E8EDF2', marginBottom: 20 }}>
          Screening Filters
          <div style={{ width: 24, height: 2, background: '#E8323C', marginTop: 4, borderRadius: 1 }} />
        </div>

        <FilterSection title="ESG Signal">
          {['Strong Buy', 'Outperform', 'Hold', 'Dollar-Cost Strategy', 'Reduce'].map(s => (
            <FilterCheckbox key={s} label={s} checked={signals.includes(s)}
              onChange={() => setSignals(toggleItem(signals, s))}
              color={s === 'Strong Buy' ? '#60A5FA' : s === 'Outperform' ? '#00C087' : s === 'Reduce' ? '#E8323C' : undefined} />
          ))}
        </FilterSection>

        <FilterSection title="Sector">
          {['Energy', 'Materials', 'Industrials'].map(s => (
            <FilterCheckbox key={s} label={s} checked={sectors.includes(s)}
              onChange={() => setSectors(toggleItem(sectors, s))} />
          ))}
        </FilterSection>

        <FilterSection title="Minimum ESG CAGR">
          <FilterSlider label="Min CAGR" value={minCagr} min={0} max={20} step={0.5}
            format={v => `${v.toFixed(1)}% / yr`} onChange={setMinCagr} />
        </FilterSection>

        <FilterSection title="Minimum Momentum Score">
          <FilterSlider label="Min Momentum" value={minMomentum} min={0} max={100} step={5}
            format={v => `${v}/100`} onChange={setMinMomentum} />
        </FilterSection>

        <FilterSection title="Minimum Potential Upside">
          <FilterSlider label="Min Upside" value={minUpside} min={0} max={15} step={0.5}
            format={v => `${v.toFixed(1)}%`} onChange={setMinUpside} />
        </FilterSection>

        <FilterSection title="Rating Forecast">
          {['Rating Upgrade Expected', 'Stable', 'Monitor', 'Rating Downgrade Risk'].map(f => (
            <FilterCheckbox key={f} label={f} checked={forecasts.includes(f)}
              onChange={() => setForecasts(toggleItem(forecasts, f))}
              color={f === 'Rating Upgrade Expected' ? '#00C087' : f === 'Rating Downgrade Risk' ? '#E8323C' : undefined} />
          ))}
        </FilterSection>

        <button
          onClick={resetFilters}
          style={{ marginTop: 'auto', width: '100%', padding: '8px 0', fontSize: 13,
            color: '#E8323C', background: 'transparent', border: '1px solid #2A3A4A',
            borderRadius: 4, cursor: 'pointer', transition: 'border-color 0.12s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E8323C' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2A3A4A' }}
        >
          Reset Filters
        </button>
      </div>

      {/* RIGHT PANEL — Results */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* Results header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E2836', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#E8EDF2' }}>
            <span style={{ color: '#00C087', fontFamily: 'monospace', fontWeight: 700 }}>{results.length}</span>
            <span style={{ color: '#8B9AAB' }}> {results.length === 1 ? 'company' : 'companies'} match your criteria</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Sort dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#4A5568' }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                style={{ background: '#0D1117', border: '1px solid #1E2836', borderRadius: 3,
                  padding: '4px 8px', fontSize: 12, color: '#E8EDF2', cursor: 'pointer', outline: 'none' }}
              >
                <option value="momentum">Momentum Score</option>
                <option value="cagr">ESG CAGR</option>
                <option value="upside">Potential Upside</option>
                <option value="ses">ESG Score</option>
              </select>
            </div>
            {/* Export CSV */}
            <button
              onClick={handleExport}
              style={{ fontSize: 12, color: '#8B9AAB', background: 'transparent',
                border: '1px solid #1E2836', borderRadius: 3, padding: '4px 10px',
                cursor: 'pointer', transition: 'color 0.12s, border-color 0.12s' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = '#E8EDF2'; el.style.borderColor = '#2A3A4A' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = '#8B9AAB'; el.style.borderColor = '#1E2836' }}
            >
              ↓ Export CSV
            </button>
          </div>
        </div>

        {/* No results */}
        {results.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 }}>
            <div style={{ fontSize: 32, opacity: 0.3 }}>⚙</div>
            <div style={{ fontSize: 14, color: '#8B9AAB', textAlign: 'center' }}>
              No companies match your current filters.<br />
              <span style={{ fontSize: 12, color: '#4A5568' }}>Try adjusting the minimum thresholds.</span>
            </div>
            <button onClick={resetFilters} style={{ fontSize: 13, color: '#E8323C', background: 'transparent',
              border: '1px solid #E8323C', borderRadius: 4, padding: '8px 20px', cursor: 'pointer' }}>
              Reset Filters
            </button>
          </div>
        )}

        {/* Results table */}
        {results.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#080B10', borderBottom: '1px solid #1E2836', position: 'sticky', top: 0, zIndex: 1 }}>
                  {['#', 'Company', 'Sector', 'ESG Signal', 'Std. ESG', 'CAGR', 'Momentum', 'Pot. Upside', 'Forecast', 'Action', ''].map(h => (
                    <th key={h} style={{ padding: '0 14px', height: 40, fontSize: 11, textTransform: 'uppercase',
                      letterSpacing: '0.08em', fontWeight: 600, color: '#4A5568',
                      textAlign: h === '#' || h === 'Std. ESG' || h === 'CAGR' || h === 'Pot. Upside' ? 'right' : 'left',
                      whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => {
                  const isTop = i === 0
                  return (
                    <tr
                      key={r.company.name}
                      style={{
                        borderBottom: '1px solid #1E2836',
                        borderLeft: isTop ? '2px solid #00C087' : '2px solid transparent',
                        background: isTop ? 'rgba(0,192,135,0.04)' : 'transparent',
                        height: 52,
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#131920' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isTop ? 'rgba(0,192,135,0.04)' : 'transparent' }}
                    >
                      {/* Rank */}
                      <td style={{ padding: '0 14px', textAlign: 'right', verticalAlign: 'middle' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 22, height: 22, borderRadius: '50%', background: '#1E2836',
                          fontSize: 11, color: '#8B9AAB', fontFamily: 'monospace' }}>{i + 1}</span>
                      </td>
                      {/* Company */}
                      <td style={{ padding: '0 14px', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 500, color: '#E8EDF2', fontSize: 14 }}>{r.company.name}</div>
                        <span style={{ fontSize: 10, color: '#4A5568', background: '#131920',
                          border: '1px solid #1E2836', borderRadius: 2, padding: '1px 5px' }}>{r.company.country}</span>
                      </td>
                      {/* Sector */}
                      <td style={{ padding: '0 14px', fontSize: 12, color: '#8B9AAB', verticalAlign: 'middle' }}>{r.company.sector}</td>
                      {/* ESG Signal */}
                      <td style={{ padding: '0 14px', verticalAlign: 'middle' }}>
                        <Badge variant={esgSignalVariant(r.esgSignal)}>{r.esgSignal}</Badge>
                      </td>
                      {/* Std. ESG */}
                      <td style={{ padding: '0 14px', textAlign: 'right', verticalAlign: 'middle',
                        fontFamily: 'monospace', fontWeight: 500,
                        color: r.ses >= avgSES ? '#00C087' : '#E8323C' }}>{r.ses.toFixed(1)}</td>
                      {/* CAGR */}
                      <td style={{ padding: '0 14px', textAlign: 'right', verticalAlign: 'middle',
                        fontFamily: 'monospace', fontWeight: 500,
                        color: r.cagr >= 0 ? '#00C087' : '#E8323C' }}>
                        {r.cagr >= 0 ? '+' : ''}{r.cagr.toFixed(1)}%
                      </td>
                      {/* Momentum bar */}
                      <td style={{ padding: '0 14px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 56, height: 4, background: '#1E2836', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: '#00C087', width: `${r.momentum}%`, borderRadius: 2 }} />
                          </div>
                          <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#E8EDF2' }}>{r.momentum}</span>
                        </div>
                      </td>
                      {/* Potential Upside */}
                      <td style={{ padding: '0 14px', textAlign: 'right', verticalAlign: 'middle',
                        fontFamily: 'monospace', fontWeight: 500,
                        color: r.upside >= 0 ? '#00C087' : '#E8323C' }}>
                        {r.upside >= 0 ? '+' : ''}{r.upside.toFixed(1)}%
                      </td>
                      {/* Forecast */}
                      <td style={{ padding: '0 14px', verticalAlign: 'middle' }}>
                        <Badge variant={forecastVariant(r.forecast)}>{r.forecast}</Badge>
                      </td>
                      {/* Suggested Action badge */}
                      <td style={{ padding: '0 14px', verticalAlign: 'middle' }}>
                        <Badge variant={actionVariant(r.action)}>{r.action}</Badge>
                      </td>
                      {/* Analyse button */}
                      <td style={{ padding: '0 14px', verticalAlign: 'middle' }}>
                        <button
                          onClick={() => onSelect(r.company)}
                          style={{ fontSize: 12, color: '#00C087', background: 'transparent',
                            border: '1px solid #00C08744', borderRadius: 3, padding: '4px 10px',
                            cursor: 'pointer', transition: 'all 0.12s', whiteSpace: 'nowrap' }}
                          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#003D2B'; el.style.borderColor = '#00C087' }}
                          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.borderColor = '#00C08744' }}
                        >
                          Analyse →
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toast notification */}
      {showToast && (
        <div style={{ position: 'fixed', bottom: 80, right: 24, background: '#0D1117',
          border: '1px solid #2A3A4A', borderRadius: 6, padding: '12px 20px',
          fontSize: 13, color: '#E8EDF2', zIndex: 500, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
          ✓ CSV export coming in production
        </div>
      )}
    </div>
  )
}
