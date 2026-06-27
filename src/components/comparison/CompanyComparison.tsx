import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { Company } from '../../data/companies'
import {
  calcSES, calcCAGR, calcMomentum, calcEventScore, calcPillars, calcDCF,
  getQuadrant, getRaterForecast, getESGSignal, getActionRating,
} from '../../lib/esg'
import { Badge, quadrantVariant, forecastVariant, esgSignalVariant, actionVariant } from '../shared/Badge'

interface CompanyComparisonProps {
  allCompanies: Company[]
  onSelectCompany: (c: Company) => void
}

function seededRandom(seed: string, index: number): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    // eslint-disable-next-line no-bitwise
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0
  }
  // eslint-disable-next-line no-bitwise
  h = Math.imul(h, index + 1337)
  // eslint-disable-next-line no-bitwise
  h ^= h >>> 16
  // eslint-disable-next-line no-bitwise
  return (h >>> 0) / 0xffffffff
}

function generateTrendPoints(company: Company, allCompanies: Company[]): { year: number; SES: number }[] {
  const currentSES = calcSES(company, allCompanies)
  const cagr = calcCAGR(company)
  const sesBase = currentSES / Math.pow(1 + Math.max(-0.15, Math.min(0.15, cagr / 100)), 5)
  const seed = company.name
  return [2019, 2020, 2021, 2022, 2023, 2024].map((year, i) => {
    const t = i / 5
    const jitter = (seededRandom(seed, i * 7 + 1) - 0.5) * 4
    const ses = Math.max(20, Math.min(90, sesBase + (currentSES - sesBase) * t + (i > 0 && i < 5 ? jitter : 0)))
    return { year, SES: parseFloat(ses.toFixed(1)) }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DualTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0D1117', border: '1px solid #2A3A4A', borderRadius: 4, padding: '8px 12px', fontSize: 11 }}>
      <div style={{ fontWeight: 600, color: '#E8EDF2', marginBottom: 6 }}>{label}</div>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.dataKey}</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

function winColor(aVal: number, bVal: number, forA: boolean): string {
  if (aVal === bVal) return '#E8EDF2'
  const aWins = aVal > bVal
  if (forA) return aWins ? '#00C087' : '#E8323C'
  return aWins ? '#E8323C' : '#00C087'
}

const dropdownStyle: React.CSSProperties = {
  background: '#0D1117', border: '1px solid #2A3A4A', borderRadius: 4,
  padding: '8px 12px', fontSize: 13, color: '#E8EDF2', cursor: 'pointer',
  outline: 'none', minWidth: 180,
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '10px 20px', background: '#080B10',
      borderTop: '1px solid #1E2836', borderBottom: '1px solid #1E2836',
      fontSize: 11, fontWeight: 600, color: '#4A5568',
      textTransform: 'uppercase', letterSpacing: '0.1em',
    }}>
      {children}
    </div>
  )
}

function CompareRow({ label, even, left, right }: { label: string; even: boolean; left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 100px 1fr',
      background: even ? '#080B10' : '#0D1117', height: 44, alignItems: 'center',
    }}>
      <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center' }}>{left}</div>
      <div style={{
        textAlign: 'center', fontSize: 10, color: '#4A5568', textTransform: 'uppercase',
        letterSpacing: '0.08em', borderLeft: '1px solid #1E2836', borderRight: '1px solid #1E2836',
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{label}</div>
      <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center' }}>{right}</div>
    </div>
  )
}

export function CompanyComparison({ allCompanies, onSelectCompany }: CompanyComparisonProps) {
  const defaultA = allCompanies.find(c => c.name.includes('Wilmar')) ?? allCompanies[0]
  const defaultB = allCompanies.find(c => c.name.includes('PTT')) ?? allCompanies[1]

  const [compA, setCompA] = useState<Company>(defaultA)
  const [compB, setCompB] = useState<Company>(defaultB)

  const COL_A = '#00C087'
  const COL_B = '#1E6FD9'

  const dataA = useMemo(() => ({
    ses: calcSES(compA, allCompanies),
    cagr: calcCAGR(compA),
    momentum: calcMomentum(compA, allCompanies),
    eventScore: calcEventScore(compA),
    pillars: calcPillars(compA, allCompanies),
    dcf: calcDCF(compA, allCompanies),
    quadrant: getQuadrant(compA, allCompanies),
    forecast: getRaterForecast(compA, allCompanies),
    esgSignal: getESGSignal(compA, allCompanies),
    action: getActionRating(compA, allCompanies),
    trend: generateTrendPoints(compA, allCompanies),
  }), [compA, allCompanies])

  const dataB = useMemo(() => ({
    ses: calcSES(compB, allCompanies),
    cagr: calcCAGR(compB),
    momentum: calcMomentum(compB, allCompanies),
    eventScore: calcEventScore(compB),
    pillars: calcPillars(compB, allCompanies),
    dcf: calcDCF(compB, allCompanies),
    quadrant: getQuadrant(compB, allCompanies),
    forecast: getRaterForecast(compB, allCompanies),
    esgSignal: getESGSignal(compB, allCompanies),
    action: getActionRating(compB, allCompanies),
    trend: generateTrendPoints(compB, allCompanies),
  }), [compB, allCompanies])

  const diff = dataA.momentum - dataB.momentum
  const aIsLeader = diff > 5
  const bIsLeader = diff < -5
  const isTied = Math.abs(diff) <= 5

  const trendData = dataA.trend.map((pt, i) => ({
    year: pt.year,
    [compA.name]: pt.SES,
    [compB.name]: dataB.trend[i]?.SES ?? 0,
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── SELECTOR ROW ── */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid #1E2836', background: '#080B10',
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 10, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0 }}>Compare</span>
        <select
          value={compA.name}
          onChange={e => setCompA(allCompanies.find(c => c.name === e.target.value) ?? allCompanies[0])}
          style={dropdownStyle}
        >
          {allCompanies.map(c => <option key={c.name} value={c.name}>{c.name} ({c.country})</option>)}
        </select>
        <div style={{
          background: 'rgba(232,50,60,0.15)', border: '1px solid #E8323C44', borderRadius: 4,
          padding: '4px 10px', fontSize: 12, fontWeight: 700, color: '#E8323C', flexShrink: 0,
        }}>vs</div>
        <select
          value={compB.name}
          onChange={e => setCompB(allCompanies.find(c => c.name === e.target.value) ?? allCompanies[1])}
          style={dropdownStyle}
        >
          {allCompanies.map(c => <option key={c.name} value={c.name}>{c.name} ({c.country})</option>)}
        </select>
        {/* Quick quadrant badges */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <Badge variant={quadrantVariant(dataA.quadrant)}>{dataA.quadrant}</Badge>
          <span style={{ fontSize: 11, color: '#4A5568' }}>vs</span>
          <Badge variant={quadrantVariant(dataB.quadrant)}>{dataB.quadrant}</Badge>
        </div>
      </div>

      {/* ── WINNER BANNER ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #1E2836' }}>
        <div style={{
          padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10, borderRight: '1px solid #1E2836',
          background: aIsLeader ? 'rgba(0,192,135,0.06)' : isTied ? 'rgba(196,168,90,0.06)' : 'transparent',
        }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: COL_A }}>{compA.name}</span>
          <span style={{ fontSize: 10, color: '#4A5568', background: '#131920', border: '1px solid #1E2836', borderRadius: 2, padding: '1px 5px' }}>{compA.country}</span>
          {aIsLeader && <span style={{ fontSize: 10, fontWeight: 700, color: '#00C087', background: '#003D2B', border: '1px solid #00C08744', borderRadius: 3, padding: '2px 7px', letterSpacing: '0.06em' }}>ESG LEADER</span>}
          {isTied && <span style={{ fontSize: 10, fontWeight: 700, color: '#C4A85A', background: '#2A1A00', border: '1px solid #C4A85A44', borderRadius: 3, padding: '2px 7px', letterSpacing: '0.06em' }}>SIMILAR</span>}
        </div>
        <div style={{
          padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10,
          background: bIsLeader ? 'rgba(30,111,217,0.06)' : isTied ? 'rgba(196,168,90,0.06)' : 'transparent',
        }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: COL_B }}>{compB.name}</span>
          <span style={{ fontSize: 10, color: '#4A5568', background: '#131920', border: '1px solid #1E2836', borderRadius: 2, padding: '1px 5px' }}>{compB.country}</span>
          {bIsLeader && <span style={{ fontSize: 10, fontWeight: 700, color: '#00C087', background: '#003D2B', border: '1px solid #00C08744', borderRadius: 3, padding: '2px 7px', letterSpacing: '0.06em' }}>ESG LEADER</span>}
          {isTied && <span style={{ fontSize: 10, fontWeight: 700, color: '#C4A85A', background: '#2A1A00', border: '1px solid #C4A85A44', borderRadius: 3, padding: '2px 7px', letterSpacing: '0.06em' }}>SIMILAR</span>}
        </div>
      </div>

      {/* ── SECTION 1: ESG SCORE OVERVIEW ── */}
      <SectionTitle>ESG Score Overview</SectionTitle>
      {[
        { label: 'Std. ESG Score', aVal: dataA.ses.toFixed(1),            bVal: dataB.ses.toFixed(1),            aNum: dataA.ses,              bNum: dataB.ses },
        { label: 'ESG CAGR',      aVal: `${dataA.cagr >= 0 ? '+' : ''}${dataA.cagr.toFixed(1)}%`, bVal: `${dataB.cagr >= 0 ? '+' : ''}${dataB.cagr.toFixed(1)}%`, aNum: dataA.cagr, bNum: dataB.cagr },
        { label: 'Momentum',      aVal: `${dataA.momentum}/100`,           bVal: `${dataB.momentum}/100`,           aNum: dataA.momentum,         bNum: dataB.momentum },
        { label: 'Forward Signal',aVal: `${dataA.eventScore}/100`,          bVal: `${dataB.eventScore}/100`,          aNum: dataA.eventScore,       bNum: dataB.eventScore },
        { label: 'Pot. Upside',   aVal: `${(dataA.dcf?.upsidePct ?? 0) >= 0 ? '+' : ''}${(dataA.dcf?.upsidePct ?? 0).toFixed(1)}%`, bVal: `${(dataB.dcf?.upsidePct ?? 0) >= 0 ? '+' : ''}${(dataB.dcf?.upsidePct ?? 0).toFixed(1)}%`, aNum: dataA.dcf?.upsidePct ?? 0, bNum: dataB.dcf?.upsidePct ?? 0 },
      ].map((row, i) => (
        <CompareRow key={row.label} label={row.label} even={i % 2 === 0}
          left={<span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 600, color: winColor(row.aNum, row.bNum, true) }}>{row.aVal}</span>}
          right={<span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 600, color: winColor(row.aNum, row.bNum, false) }}>{row.bVal}</span>}
        />
      ))}
      {/* Badge rows */}
      {[
        { label: 'ESG Signal', aEl: <Badge variant={esgSignalVariant(dataA.esgSignal)}>{dataA.esgSignal}</Badge>, bEl: <Badge variant={esgSignalVariant(dataB.esgSignal)}>{dataB.esgSignal}</Badge> },
        { label: 'Action',     aEl: <Badge variant={actionVariant(dataA.action)}>{dataA.action}</Badge>,          bEl: <Badge variant={actionVariant(dataB.action)}>{dataB.action}</Badge> },
        { label: 'Forecast',   aEl: <Badge variant={forecastVariant(dataA.forecast)}>{dataA.forecast}</Badge>,    bEl: <Badge variant={forecastVariant(dataB.forecast)}>{dataB.forecast}</Badge> },
      ].map((row, i) => (
        <CompareRow key={row.label} label={row.label} even={(i + 5) % 2 === 0} left={row.aEl} right={row.bEl} />
      ))}

      {/* ── SECTION 2: PILLAR BUTTERFLY CHART ── */}
      <SectionTitle>E/S/G/I Pillar Breakdown</SectionTitle>
      <div style={{ padding: '16px 20px' }}>
        {(['E', 'S', 'G', 'I'] as const).map(p => {
          const PILLAR_COLORS = { E: '#00C087', S: '#60A5FA', G: '#C084FC', I: '#F59E0B' }
          const PILLAR_NAMES  = { E: 'Environmental', S: 'Social', G: 'Governance', I: 'Innovation' }
          const aScore = dataA.pillars[p]
          const bScore = dataB.pillars[p]
          const color = PILLAR_COLORS[p]
          return (
            <div key={p} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: color, fontWeight: 600, width: 14 }}>{p}</span>
                <span style={{ fontSize: 11, color: '#4A5568' }}>{PILLAR_NAMES[p]}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 48px 1fr', gap: 8, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: aScore >= bScore ? COL_A : '#4A5568', flexShrink: 0 }}>{aScore}</span>
                  <div style={{ width: 120, height: 6, background: '#1E2836', borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                    <div style={{ height: '100%', width: `${aScore}%`, background: COL_A, borderRadius: 2, marginLeft: 'auto' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'center', fontSize: 10, color: '#4A5568' }}>vs</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 120, height: 6, background: '#1E2836', borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                    <div style={{ height: '100%', width: `${bScore}%`, background: COL_B, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: bScore >= aScore ? COL_B : '#4A5568', flexShrink: 0 }}>{bScore}</span>
                </div>
              </div>
            </div>
          )
        })}
        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: COL_A }}>
            <div style={{ width: 12, height: 3, background: COL_A, borderRadius: 1 }} />{compA.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: COL_B }}>
            <div style={{ width: 12, height: 3, background: COL_B, borderRadius: 1 }} />{compB.name}
          </div>
        </div>
      </div>

      {/* ── SECTION 3: 5-YEAR TREND OVERLAY ── */}
      <SectionTitle>ESG Score Trajectory — 5 Year Comparison</SectionTitle>
      <div style={{ padding: '0 20px 16px' }}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData} margin={{ top: 8, right: 16, bottom: 4, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2836" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: '#4A5568', fontSize: 10 }} axisLine={{ stroke: '#1E2836' }} tickLine={false} />
            <YAxis domain={[20, 90]} tick={{ fill: '#4A5568', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
            <Tooltip content={<DualTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              formatter={(val: string) => <span style={{ color: val === compA.name ? COL_A : COL_B }}>{val}</span>}
            />
            <Line type="monotone" dataKey={compA.name} stroke={COL_A} strokeWidth={2}
              dot={{ r: 3, fill: COL_A, strokeWidth: 0 }} activeDot={{ r: 5 }} animationDuration={1000} />
            <Line type="monotone" dataKey={compB.name} stroke={COL_B} strokeWidth={2}
              dot={{ r: 3, fill: COL_B, strokeWidth: 0 }} activeDot={{ r: 5 }} animationDuration={1000} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── SECTION 4: NEWS EVENTS COMPARISON ── */}
      <SectionTitle>Recent News Events</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #1E2836' }}>
        {[
          { company: compA, color: COL_A },
          { company: compB, color: COL_B },
        ].map(({ company, color }, ci) => (
          <div key={company.name} style={{ padding: '12px 16px', borderRight: ci === 0 ? '1px solid #1E2836' : 'none' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color, marginBottom: 10 }}>{company.name}</div>
            {company.news.slice(0, 3).map(item => {
              const sentColors: Record<string, { c: string; bg: string }> = {
                'very-positive': { c: '#00C087', bg: '#003D2B' },
                'positive':      { c: '#00C087', bg: '#003D2B' },
                'neutral':       { c: '#8B9AAB', bg: '#131920' },
                'negative':      { c: '#C4A85A', bg: '#2A1A00' },
                'very-negative': { c: '#E8323C', bg: '#3D0A0C' },
              }
              const sc = sentColors[item.sentiment] ?? sentColors['neutral']
              return (
                <div key={item.id} style={{
                  background: '#0D1117', border: '1px solid #1E2836',
                  borderLeft: `3px solid ${color}`, borderRadius: 4, padding: '8px 10px', marginBottom: 6,
                }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, color: '#4A5568', fontFamily: 'monospace' }}>{item.date}</span>
                    <span style={{
                      fontSize: 10, color: sc.c, background: sc.bg,
                      border: `1px solid ${sc.c}44`, borderRadius: 2, padding: '0 5px',
                    }}>
                      {item.sentiment.replace('-', ' ')}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 12, color: '#C8D3DC', lineHeight: 1.4,
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  } as React.CSSProperties}>{item.headline}</div>
                </div>
              )
            })}
            <button
              onClick={() => onSelectCompany(company)}
              style={{
                fontSize: 12, color, background: 'transparent', border: 'none',
                padding: 0, cursor: 'pointer', marginTop: 4,
              }}
            >
              View all events →
            </button>
          </div>
        ))}
      </div>

      {/* ── SECTION 5: FINANCIAL MATERIALITY ── */}
      <SectionTitle>Financial Materiality</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #1E2836' }}>
        {[
          { company: compA, dcf: dataA.dcf, upside: dataA.dcf?.upsidePct ?? 0, color: COL_A },
          { company: compB, dcf: dataB.dcf, upside: dataB.dcf?.upsidePct ?? 0, color: COL_B },
        ].map(({ company, dcf, upside, color }, ci) => (
          <div key={company.name} style={{ padding: '12px 16px', borderRight: ci === 0 ? '1px solid #1E2836' : 'none' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color, marginBottom: 10 }}>{company.name}</div>
            {dcf ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                  {[
                    { l: 'Bear', v: dcf.bearPrice, c: '#E8323C' },
                    { l: 'Base', v: dcf.adjPrice,  c: '#8B9AAB' },
                    { l: 'Bull', v: dcf.bullPrice, c: '#00C087' },
                  ].map(s => (
                    <div key={s.l} style={{
                      flex: 1, background: '#080B10', border: '1px solid #1E2836',
                      borderTop: `2px solid ${s.c}`, borderRadius: 3, padding: '6px 8px', textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 9, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{s.l}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: s.c }}>{s.v.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
                {[
                  ['Revenue Uplift',  `+${dcf.revUp.toFixed(2)}%`],
                  ['Op Cost Save',    `-${dcf.opSave.toFixed(2)}%`],
                  ['WACC Reduction',  `-${dcf.waccReduction.toFixed(0)} bps`],
                ].map(([k, v]) => (
                  <div key={k} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '5px 8px', background: '#0D1117', border: '1px solid #1E2836', borderRadius: 3,
                  }}>
                    <span style={{ fontSize: 11, color: '#8B9AAB' }}>{k}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#E8EDF2' }}>{v}</span>
                  </div>
                ))}
                <div style={{
                  padding: '8px', background: '#080B10', border: `1px solid ${upside >= 0 ? '#00C08744' : '#E8323C44'}`,
                  borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: 11, color: '#8B9AAB' }}>Potential Upside</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: upside >= 0 ? '#00C087' : '#E8323C' }}>
                    {upside >= 0 ? '+' : ''}{upside.toFixed(1)}%
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: '#4A5568' }}>No DCF data available.</div>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}
