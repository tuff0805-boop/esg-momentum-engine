import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import type { Company } from '../../data/companies'
import { calcSES, calcCAGR, calcMomentum, calcEventScore, calcDCF, getQuadrant, getESGSignal } from '../../lib/esg'
import { Badge, esgSignalVariant } from '../shared/Badge'
import { ScoreTrendChart } from '../shared/ScoreTrendChart'

interface PortfolioBuilderProps {
  allCompanies: Company[]
  onSelectCompany: (c: Company) => void
}

const PIE_COLORS: Record<string, string> = {
  'Outperform': '#00C087', 'Strong Buy': '#1E6FD9', 'Neutral': '#C4A85A', 'Underperform': '#E8323C',
}

export function PortfolioBuilder({ allCompanies, onSelectCompany }: PortfolioBuilderProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [weights, setWeights] = useState<Record<string, number>>({})

  const companyData = useMemo(() =>
    allCompanies.map(c => ({
      company: c,
      ses: calcSES(c, allCompanies),
      cagr: calcCAGR(c),
      momentum: calcMomentum(c, allCompanies),
      eventScore: calcEventScore(c),
      dcf: calcDCF(c, allCompanies),
      quadrant: getQuadrant(c, allCompanies),
      esgSignal: getESGSignal(c, allCompanies),
      upside: calcDCF(c, allCompanies)?.upsidePct ?? 0,
    })),
  [allCompanies])

  const toggleCompany = (name: string) => {
    if (selected.includes(name)) {
      const next = selected.filter(n => n !== name)
      setSelected(next)
      if (next.length > 0) {
        const eq = parseFloat((100 / next.length).toFixed(1))
        const newW: Record<string, number> = {}
        next.forEach((n, i) => { newW[n] = i < next.length - 1 ? eq : parseFloat((100 - eq * (next.length - 1)).toFixed(1)) })
        setWeights(newW)
      } else {
        setWeights({})
      }
    } else {
      const next = [...selected, name]
      setSelected(next)
      const eq = parseFloat((100 / next.length).toFixed(1))
      const newW: Record<string, number> = {}
      next.forEach((n, i) => { newW[n] = i < next.length - 1 ? eq : parseFloat((100 - eq * (next.length - 1)).toFixed(1)) })
      setWeights(newW)
    }
  }

  const updateWeight = (name: string, val: number) => {
    const others = selected.filter(n => n !== name)
    const remaining = Math.max(0, 100 - val)
    const totalOthers = others.reduce((s, n) => s + (weights[n] ?? 0), 0)
    const newW: Record<string, number> = { ...weights, [name]: val }
    if (totalOthers > 0) {
      others.forEach(n => {
        newW[n] = parseFloat(((weights[n] ?? 0) / totalOthers * remaining).toFixed(1))
      })
    }
    setWeights(newW)
  }

  const applyPreset = (names: string[]) => {
    setSelected(names)
    const eq = parseFloat((100 / names.length).toFixed(1))
    const w: Record<string, number> = {}
    names.forEach((n, i) => { w[n] = i < names.length - 1 ? eq : parseFloat((100 - eq * (names.length - 1)).toFixed(1)) })
    setWeights(w)
  }

  const portfolioMetrics = useMemo(() => {
    if (selected.length === 0) return null
    let ses = 0, cagr = 0, momentum = 0, upside = 0
    selected.forEach(name => {
      const w = (weights[name] ?? 0) / 100
      const d = companyData.find(x => x.company.name === name)
      if (!d) return
      ses      += d.ses * w
      cagr     += d.cagr * w
      momentum += d.momentum * w
      upside   += d.upside * w
    })
    return { ses: parseFloat(ses.toFixed(1)), cagr: parseFloat(cagr.toFixed(1)), momentum: parseFloat(momentum.toFixed(0)), upside: parseFloat(upside.toFixed(1)) }
  }, [selected, weights, companyData])

  const signalDist = useMemo(() => {
    const counts: Record<string, number> = {}
    selected.forEach(name => {
      const d = companyData.find(x => x.company.name === name)
      if (!d) return
      counts[d.esgSignal] = (counts[d.esgSignal] ?? 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [selected, companyData])

  const sectorWeights = useMemo(() => {
    const sw: Record<string, number> = {}
    selected.forEach(name => {
      const d = companyData.find(x => x.company.name === name)
      if (!d) return
      sw[d.company.sector] = (sw[d.company.sector] ?? 0) + (weights[name] ?? 0)
    })
    return sw
  }, [selected, weights, companyData])

  const bestUpside = useMemo(() => {
    if (selected.length === 0) return null
    return companyData.filter(d => selected.includes(d.company.name)).reduce((best, d) => d.upside > best.upside ? d : best)
  }, [selected, companyData])

  const highestMomentum = useMemo(() => {
    if (selected.length === 0) return null
    return companyData.filter(d => selected.includes(d.company.name)).reduce((best, d) => d.momentum > best.momentum ? d : best)
  }, [selected, companyData])

  const weakestSignal = useMemo(() => {
    if (selected.length === 0) return null
    const rank: Record<string, number> = { 'Outperform': 3, 'Strong Buy': 2, 'Neutral': 1, 'Underperform': 0 }
    return companyData.filter(d => selected.includes(d.company.name)).reduce((worst, d) => (rank[d.esgSignal] ?? 0) < (rank[worst.esgSignal] ?? 0) ? d : worst)
  }, [selected, companyData])

  const aiInsight = useMemo(() => {
    if (!portfolioMetrics || selected.length < 2) return null
    const dominantSector = Object.entries(sectorWeights).sort((a,b) => b[1]-a[1])[0]
    if (!dominantSector) return null
    const [sector, pct] = dominantSector
    if (pct > 50) return `This portfolio is overweight in ${sector} (${pct.toFixed(0)}%) vs the ~30% ASEAN benchmark. Consider adding diversification across other sectors for balanced ESG exposure.`
    if (portfolioMetrics.cagr > 10) return `Strong ESG momentum portfolio with ${portfolioMetrics.cagr.toFixed(1)}% weighted CAGR — well above the 5.2% ASEAN ESG universe average. Holdings show consistent upward ESG trajectories.`
    return `Balanced ESG portfolio with ${selected.length} holdings. Weighted momentum of ${portfolioMetrics.momentum}/100 indicates steady improvement trajectory across the universe.`
  }, [portfolioMetrics, sectorWeights, selected])

  const benchmarkData = portfolioMetrics ? [
    { name: 'Your Portfolio', score: portfolioMetrics.ses, fill: '#00C087' },
    { name: 'MSCI ASEAN Avg', score: 42, fill: '#4A5568' },
    { name: 'ESG Leaders Avg', score: 68, fill: '#1E6FD9' },
  ] : []

  const msciPercentile = portfolioMetrics ? Math.round(Math.min(99, Math.max(1, ((portfolioMetrics.ses - 42) / 58) * 100 + 50))) : 0

  // Preset computations (use slice to avoid mutating companyData)
  const esgLeaderNames = useMemo(() =>
    companyData.slice().sort((a,b) => b.momentum - a.momentum).slice(0,3).map(d => d.company.name),
  [companyData])

  const diversifiedNames = useMemo(() => {
    const sectors = ['Energy','Materials','Industrials']
    return sectors.map(s => companyData.find(d => d.company.sector === s)?.company.name).filter(Boolean) as string[]
  }, [companyData])

  const highUpsideNames = useMemo(() =>
    companyData.slice().sort((a,b) => b.upside - a.upside).slice(0,3).map(d => d.company.name),
  [companyData])

  const presets = [
    { label: '⬡ ESG Leaders', names: esgLeaderNames },
    { label: '◈ Diversified ASEAN', names: diversifiedNames },
    { label: '↑ High Upside', names: highUpsideNames },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* SECTION 1: COMPANY SELECTION */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#E8EDF2', marginBottom: 4 }}>ESG Portfolio Builder</div>
          <div style={{ fontSize: 13, color: '#8B9AAB' }}>Select companies to build your ESG portfolio and see combined metrics</div>
        </div>

        {/* Company grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginBottom: 16 }}>
          {companyData.map(({ company, ses, upside, esgSignal }) => {
            const isSel = selected.includes(company.name)
            return (
              <div
                key={company.name}
                onClick={() => toggleCompany(company.name)}
                style={{
                  background: '#0D1117',
                  border: `1px solid ${isSel ? '#00C087' : '#1E2836'}`,
                  borderLeft: `3px solid ${isSel ? '#00C087' : '#1E2836'}`,
                  borderRadius: 4,
                  padding: '10px 12px',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: isSel ? '0 0 12px rgba(0,192,135,0.12)' : 'none',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLElement).style.borderColor = '#2A3A4A' }}
                onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLElement).style.borderColor = '#1E2836' }}
              >
                {isSel && (
                  <div style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%',
                    background: '#00C087', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                <div style={{ fontSize: 13, fontWeight: 600, color: '#E8EDF2', marginBottom: 3, paddingRight: 20 }}>{company.name}</div>
                <div style={{ fontSize: 11, color: '#4A5568', marginBottom: 6 }}>{company.country} · {company.sector}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                  <Badge variant={esgSignalVariant(esgSignal)}>{esgSignal}</Badge>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: upside >= 0 ? '#00C087' : '#E8323C' }}>
                    {upside >= 0 ? '+' : ''}{upside.toFixed(1)}%
                  </span>
                </div>
                <ScoreTrendChart company={company} allCompanies={allCompanies} height={36} showPillars={false} compact={true} />
                <div style={{ fontSize: 10, color: '#4A5568', marginTop: 3, fontFamily: 'monospace' }}>ESG {ses.toFixed(1)}</div>
              </div>
            )
          })}
        </div>

        {/* Selection status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: '1px solid #1E2836', marginBottom: selected.length > 0 ? 16 : 0 }}>
          <span style={{ fontSize: 13, color: '#8B9AAB' }}>
            <span style={{ color: '#00C087', fontFamily: 'monospace', fontWeight: 600 }}>{selected.length}</span> {selected.length === 1 ? 'company' : 'companies'} selected
            {selected.length > 0 && <span style={{ color: '#4A5568' }}> · weights sum to {Object.values(weights).reduce((s,v) => s+v, 0).toFixed(1)}%</span>}
          </span>
          {selected.length > 0 && (
            <button onClick={() => { setSelected([]); setWeights({}) }}
              style={{ fontSize: 12, color: '#E8323C', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
              Clear all
            </button>
          )}
        </div>

        {/* Weight sliders + pie */}
        {selected.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 20, marginBottom: 20, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 11, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Allocation Weights</div>
              {selected.map(name => {
                const w = weights[name] ?? 0
                return (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: '#E8EDF2', minWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name.split(' ')[0]}</span>
                    <input type="range" min={5} max={80} step={1} value={w}
                      onChange={e => updateWeight(name, Number(e.target.value))}
                      style={{ flex: 1, accentColor: '#00C087', cursor: 'pointer' }} />
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#00C087', minWidth: 40, textAlign: 'right' }}>{w.toFixed(1)}%</span>
                  </div>
                )
              })}
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Allocation</div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={selected.map(name => ({ name: name.split(' ')[0], value: weights[name] ?? 0 }))}
                    dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                    paddingAngle={2} animationDuration={600}>
                    {selected.map((_, i) => (
                      <Cell key={i} fill={['#00C087','#1E6FD9','#7C3AED','#F59E0B','#E8323C','#60A5FA','#C084FC','#C4A85A','#4A5568','#34D399'][i % 10]} />
                    ))}
                  </Pie>
                  <RTooltip formatter={(v) => `${Number(v).toFixed(1)}%`}
                    contentStyle={{ background: '#0D1117', border: '1px solid #2A3A4A', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* EMPTY STATE */}
      {selected.length === 0 && (
        <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 14, color: '#8B9AAB', textAlign: 'center' }}>
            Select companies above to build your ESG portfolio
          </div>
          <div style={{ fontSize: 12, color: '#4A5568', marginBottom: 8 }}>Or start with a preset:</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {presets.map(preset => (
              <button key={preset.label} onClick={() => applyPreset(preset.names)}
                style={{ fontSize: 13, color: '#E8EDF2', background: '#0D1117', border: '1px solid #2A3A4A',
                  borderRadius: 4, padding: '8px 16px', cursor: 'pointer', transition: 'border-color 0.12s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#00C087' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2A3A4A' }}>
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: PORTFOLIO METRICS (>=2 selected) */}
      {portfolioMetrics && selected.length >= 2 && (
        <div style={{ borderTop: '1px solid #1E2836', padding: '20px' }}>
          <div style={{ fontSize: 11, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Portfolio Metrics</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Portfolio ESG Score', value: portfolioMetrics.ses.toFixed(1), color: '#00C087', sub: 'weighted average' },
              { label: 'Portfolio ESG CAGR',  value: `${portfolioMetrics.cagr >= 0 ? '+' : ''}${portfolioMetrics.cagr.toFixed(1)}%`, color: '#00C087', sub: 'weighted avg' },
              { label: 'Portfolio Momentum',  value: `${portfolioMetrics.momentum}/100`, color: '#E8EDF2', sub: 'weighted avg' },
              { label: 'Wtd. Pot. Upside',    value: `${portfolioMetrics.upside >= 0 ? '+' : ''}${portfolioMetrics.upside.toFixed(1)}%`, color: portfolioMetrics.upside >= 0 ? '#00C087' : '#E8323C', sub: 'weighted avg' },
            ].map(m => (
              <div key={m.label} style={{ background: '#0D1117', border: '1px solid #1E2836', borderRadius: 4, padding: '12px 16px' }}>
                <div style={{ fontSize: 10, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{m.label}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 700, color: m.color, lineHeight: 1 }}>{m.value}</div>
                <div style={{ fontSize: 10, color: '#4A5568', marginTop: 4 }}>{m.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#0D1117', border: '1px solid #1E2836', borderRadius: 4, padding: '12px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#E8EDF2', marginBottom: 4 }}>Portfolio vs Benchmark</div>
              <div style={{ fontSize: 11, color: '#4A5568', marginBottom: 10 }}>
                Your portfolio outperforms <span style={{ color: '#00C087' }}>{msciPercentile}%</span> of the MSCI ASEAN universe
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={benchmarkData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                  <XAxis dataKey="name" tick={{ fill: '#4A5568', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#4A5568', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <RTooltip contentStyle={{ background: '#0D1117', border: '1px solid #2A3A4A', fontSize: 11 }} />
                  <Bar dataKey="score" radius={[2, 2, 0, 0]} animationDuration={800}>
                    {benchmarkData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: '#0D1117', border: '1px solid #1E2836', borderRadius: 4, padding: '12px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#E8EDF2', marginBottom: 10 }}>Portfolio Signal Distribution</div>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={signalDist} dataKey="value" cx="40%" cy="50%" outerRadius={60}
                    paddingAngle={2} animationDuration={800}>
                    {signalDist.map((entry, i) => <Cell key={i} fill={PIE_COLORS[entry.name] ?? '#4A5568'} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 10 }} formatter={(val: string) => <span style={{ color: PIE_COLORS[val] ?? '#8B9AAB' }}>{val}</span>} />
                  <RTooltip formatter={(v, name) => { const n = Number(v); return [`${n} ${n === 1 ? 'company' : 'companies'}`, String(name)] }}
                    contentStyle={{ background: '#0D1117', border: '1px solid #2A3A4A', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: HOLDINGS TABLE */}
      {selected.length > 0 && (
        <div style={{ borderTop: '1px solid #1E2836', padding: '0 0 20px' }}>
          <div style={{ padding: '12px 20px', fontSize: 11, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #1E2836' }}>
            Portfolio Holdings
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#080B10', borderBottom: '1px solid #1E2836' }}>
                  {['Company', 'Weight', 'ESG Signal', 'Std. ESG', 'CAGR', 'Momentum', 'Pot. Upside', 'Contribution', ''].map(h => (
                    <th key={h} style={{ padding: '0 14px', height: 40, fontSize: 11, textTransform: 'uppercase',
                      letterSpacing: '0.08em', fontWeight: 600, color: '#4A5568', textAlign: 'left',
                      whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selected.map((name, i) => {
                  const d = companyData.find(x => x.company.name === name)
                  if (!d) return null
                  const w = weights[name] ?? 0
                  const contribution = parseFloat((d.upside * w / 100).toFixed(2))
                  return (
                    <tr key={name}
                      style={{ borderBottom: '1px solid #1E2836', height: 52, background: i % 2 === 0 ? 'transparent' : '#0D1117' }}>
                      <td style={{ padding: '0 14px', verticalAlign: 'middle' }}>
                        <div
                          style={{ fontWeight: 500, color: '#E8EDF2', fontSize: 14, cursor: 'pointer' }}
                          onClick={() => onSelectCompany(d.company)}
                        >
                          {d.company.name}
                        </div>
                        <div style={{ fontSize: 11, color: '#4A5568' }}>{d.company.country} · {d.company.sector}</div>
                      </td>
                      <td style={{ padding: '0 14px', verticalAlign: 'middle' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#00C087' }}>{w.toFixed(1)}%</span>
                      </td>
                      <td style={{ padding: '0 14px', verticalAlign: 'middle' }}>
                        <Badge variant={esgSignalVariant(d.esgSignal)}>{d.esgSignal}</Badge>
                      </td>
                      <td style={{ padding: '0 14px', fontFamily: 'monospace', color: '#E8EDF2', verticalAlign: 'middle' }}>{d.ses.toFixed(1)}</td>
                      <td style={{ padding: '0 14px', fontFamily: 'monospace', fontWeight: 500, verticalAlign: 'middle',
                        color: d.cagr >= 0 ? '#00C087' : '#E8323C' }}>
                        {d.cagr >= 0 ? '+' : ''}{d.cagr.toFixed(1)}%
                      </td>
                      <td style={{ padding: '0 14px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 48, height: 4, background: '#1E2836', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: '#00C087', width: `${d.momentum}%`, borderRadius: 2 }} />
                          </div>
                          <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#E8EDF2' }}>{d.momentum}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0 14px', fontFamily: 'monospace', fontWeight: 500, verticalAlign: 'middle',
                        color: d.upside >= 0 ? '#00C087' : '#E8323C' }}>
                        {d.upside >= 0 ? '+' : ''}{d.upside.toFixed(1)}%
                      </td>
                      <td style={{ padding: '0 14px', fontFamily: 'monospace', fontSize: 12, verticalAlign: 'middle',
                        color: contribution >= 0 ? '#00C087' : '#E8323C' }}>
                        {contribution >= 0 ? '+' : ''}{contribution.toFixed(2)}%
                      </td>
                      <td style={{ padding: '0 14px', verticalAlign: 'middle' }}>
                        <button onClick={() => toggleCompany(name)}
                          style={{ fontSize: 14, color: '#E8323C', background: 'transparent', border: 'none',
                            cursor: 'pointer', lineHeight: 1, padding: '2px 6px' }}>×</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {portfolioMetrics && (
            <div style={{ margin: '16px 20px 0', background: '#0D1117', border: '1px solid #1E2836',
              borderTop: '2px solid #00C087', borderRadius: 4, padding: '16px' }}>
              <div style={{ fontSize: 11, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Portfolio Summary</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#4A5568', marginBottom: 2 }}>Weighted Target Upside</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: portfolioMetrics.upside >= 0 ? '#00C087' : '#E8323C' }}>
                    {portfolioMetrics.upside >= 0 ? '+' : ''}{portfolioMetrics.upside.toFixed(1)}%
                  </div>
                </div>
                {bestUpside && (
                  <div>
                    <div style={{ fontSize: 10, color: '#4A5568', marginBottom: 2 }}>Best Performing Holding</div>
                    <div style={{ fontSize: 13, color: '#E8EDF2', fontWeight: 500 }}>
                      {bestUpside.company.name.split(' ')[0]} <span style={{ color: '#00C087', fontFamily: 'monospace' }}>+{bestUpside.upside.toFixed(1)}%</span>
                    </div>
                  </div>
                )}
                {highestMomentum && (
                  <div>
                    <div style={{ fontSize: 10, color: '#4A5568', marginBottom: 2 }}>Highest Momentum</div>
                    <div style={{ fontSize: 13, color: '#E8EDF2', fontWeight: 500 }}>
                      {highestMomentum.company.name.split(' ')[0]} <span style={{ color: '#E8EDF2', fontFamily: 'monospace' }}>{highestMomentum.momentum}/100</span>
                    </div>
                  </div>
                )}
                {weakestSignal && (
                  <div>
                    <div style={{ fontSize: 10, color: '#4A5568', marginBottom: 2 }}>Weakest ESG Signal</div>
                    <div style={{ fontSize: 13, color: '#C4A85A' }}>
                      {weakestSignal.company.name.split(' ')[0]} — consider reviewing
                    </div>
                  </div>
                )}
              </div>
              {aiInsight && (
                <div style={{ fontSize: 12, color: '#8B9AAB', lineHeight: 1.6, borderTop: '1px solid #1E2836', paddingTop: 10 }}>
                  <span style={{ color: '#E8323C', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 6 }}>AI Insight</span>
                  {aiInsight}
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
