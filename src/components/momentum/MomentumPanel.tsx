import { useState } from 'react'
import { companies as ALL_COMPANIES } from '../../data/companies'
import type { Company } from '../../data/companies'
import { calcCAGR, getQuadrant, getRaterForecast } from '../../lib/esg'
import { MetricCard } from '../shared/MetricCard'
import { CAGRBarChart } from './CAGRBarChart'
import { EventFeed } from './EventFeed'
import { Leaderboard } from './Leaderboard'
import { RetailSignalCard } from '../shared/RetailSignalCard'
import { ScoreTrendChart } from '../shared/ScoreTrendChart'

interface MomentumPanelProps {
  activeSector: string
  onSelect: (c: Company) => void
  animKey: string | number
  viewMode?: 'retail' | 'analyst'
}

const SECTOR_VALUES = new Set<string>(['Energy', 'Materials', 'Industrials'])

export function MomentumPanel({ activeSector, onSelect, animKey, viewMode = 'analyst' }: MomentumPanelProps) {
  const filtered = SECTOR_VALUES.has(activeSector)
    ? ALL_COMPANIES.filter(c => c.sector === activeSector)
    : ALL_COMPANIES

  const avgCAGR      = filtered.length ? filtered.reduce((s, c) => s + calcCAGR(c), 0) / filtered.length : 0
  const hiddenWinners = filtered.filter(c => getQuadrant(c, ALL_COMPANIES) === 'Outperform').length
  const upgradeLikely = filtered.filter(c => getRaterForecast(c, ALL_COMPANIES) === 'Rating Upgrade Expected').length
  const downgradeRisk = filtered.filter(c => getRaterForecast(c, ALL_COMPANIES) === 'Rating Downgrade Risk').length

  const isRetail = viewMode === 'retail'
  const [momentumSubTab, setMomentumSubTab] = useState<'matrix' | 'leaderboard' | 'trends'>('matrix')

  return (
    <div className="flex flex-col gap-6">
      {/* Retail: signal cards at top */}
      {isRetail && (
        <RetailSignalCard companies={filtered} allCompanies={ALL_COMPANIES} onSelect={onSelect} />
      )}

      {/* Analyst: metric strip */}
      {!isRetail && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Average ESG CAGR"
            value={avgCAGR}
            decimals={1}
            suffix="%"
            subLabel="5-year Compound Annual Growth Rate"
            tooltip="Average ESG Compound Annual Growth Rate (CAGR) across filtered companies: (Score_current / Score_base)^(1/5) - 1"
            color="teal"
            animKey={animKey}
          />
          <MetricCard
            label="Outperform"
            value={hiddenWinners}
            subLabel="Low score · rising trajectory"
            tooltip="Companies below-average Standardized ESG Score but with positive ESG CAGR — potential re-rating candidates."
            color="teal"
            animKey={animKey}
          />
          <MetricCard
            label="Rating Upgrade Expected"
            value={upgradeLikely}
            subLabel="Rating Agency Forecast"
            tooltip="Companies with ESG Momentum score >= 70 and ESG CAGR > 5% — likely to receive rating upgrades in the next 12 months."
            color="teal"
            animKey={animKey}
          />
          <MetricCard
            label="Rating Downgrade Risk"
            value={downgradeRisk}
            subLabel="Rating Agency Forecast"
            tooltip="Companies with ESG Momentum score < 25 — at risk of ESG rating downgrades and negative screening by institutional investors."
            color="red"
            trendDirection="down"
            animKey={animKey}
          />
        </div>
      )}

      {/* Analyst: sub-tab nav */}
      {!isRetail && (
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #1E2836', marginBottom: 0 }}>
          {[
            { id: 'matrix' as const, label: '◈ CAGR Ranking' },
            { id: 'leaderboard' as const, label: '≡ Leaderboard' },
            { id: 'trends' as const, label: '↗ Score Trends' },
          ].map(t => (
            <button key={t.id} onClick={() => setMomentumSubTab(t.id)} style={{
              padding: '8px 20px', fontSize: 13, fontWeight: momentumSubTab === t.id ? 500 : 400,
              color: momentumSubTab === t.id ? '#E8EDF2' : '#8B9AAB',
              background: 'none', border: 'none',
              borderBottom: momentumSubTab === t.id ? '2px solid #E8323C' : '2px solid transparent',
              cursor: 'pointer', marginBottom: -1, transition: 'color 0.12s',
            }}>{t.label}</button>
          ))}
        </div>
      )}

      {/* CAGR Ranking tab — analyst only */}
      {!isRetail && momentumSubTab === 'matrix' && (
        <div className="card overflow-hidden">
          <div className="p-4">
            <CAGRBarChart companies={filtered} allCompanies={ALL_COMPANIES} />
          </div>
        </div>
      )}

      {/* Leaderboard tab — analyst only */}
      {!isRetail && momentumSubTab === 'leaderboard' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="card overflow-hidden">
            <div className="card-header">
              <div className="card-title">Leading Signals</div>
              <div className="card-subtitle">Forward-looking ESG events · most severe first</div>
            </div>
            <div className="p-4 max-h-72 overflow-y-auto">
              <EventFeed companies={filtered} />
            </div>
          </div>
          <div className="card overflow-hidden lg:col-span-2">
            <div className="card-header">
              <div className="card-title">Momentum Leaderboard</div>
              <div className="card-subtitle">Sorted by combined momentum score · 60% CAGR + 40% event score</div>
            </div>
            <Leaderboard companies={filtered} allCompanies={ALL_COMPANIES} onSelect={onSelect} />
          </div>
        </div>
      )}

      {/* Trends tab — analyst only */}
      {!isRetail && momentumSubTab === 'trends' && (
        <div className="card overflow-hidden">
          <div className="card-header">
            <div className="card-title">5-Year ESG Score Trajectories</div>
            <div className="card-subtitle">Upward trajectory = Outperform signal · Click any company to view full analysis</div>
          </div>
          <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {filtered.map(company => (
              <div
                key={company.name}
                onClick={() => onSelect(company)}
                style={{ background: '#080B10', border: '1px solid #1E2836', borderRadius: 4, padding: '10px 12px', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2A3A4A' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1E2836' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#E8EDF2' }}>{company.name}</span>
                  <span style={{ fontSize: 10, color: '#4A5568', background: '#131920', border: '1px solid #1E2836', borderRadius: 2, padding: '0 5px' }}>{company.country}</span>
                </div>
                <ScoreTrendChart company={company} allCompanies={ALL_COMPANIES} height={140} showPillars={false} compact={false} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Retail: always show leaderboard */}
      {isRetail && (
        <div className="card overflow-hidden">
          <div className="card-header">
            <div className="card-title">Momentum Leaderboard</div>
            <div className="card-subtitle">Sorted by combined momentum score · 60% CAGR + 40% event score</div>
          </div>
          <Leaderboard companies={filtered} allCompanies={ALL_COMPANIES} onSelect={onSelect} />
        </div>
      )}
    </div>
  )
}
