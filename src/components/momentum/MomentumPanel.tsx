import { companies as ALL_COMPANIES } from '../../data/companies'
import type { Company } from '../../data/companies'
import { calcCAGR, getQuadrant, getRaterForecast } from '../../lib/esg'
import { MetricCard } from '../shared/MetricCard'
import { MomentumMatrix } from './MomentumMatrix'
import { EventFeed } from './EventFeed'
import { Leaderboard } from './Leaderboard'
import { RetailSignalCard } from '../shared/RetailSignalCard'

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
  const hiddenWinners = filtered.filter(c => getQuadrant(c, ALL_COMPANIES) === 'Overweight').length
  const upgradeLikely = filtered.filter(c => getRaterForecast(c, ALL_COMPANIES) === 'Rating Upgrade Expected').length
  const downgradeRisk = filtered.filter(c => getRaterForecast(c, ALL_COMPANIES) === 'Rating Downgrade Risk').length

  const isRetail = viewMode === 'retail'

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
            label="Overweight"
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

      {/* Matrix — analyst only */}
      {!isRetail && (
        <div className="card overflow-hidden">
          <div className="card-header">
            <div className="card-title">ESG Momentum Matrix</div>
            <div className="card-subtitle">X = Standardized ESG Score · Y = ESG CAGR · click dot to inspect</div>
          </div>
          <div className="p-4">
            <MomentumMatrix companies={filtered} allCompanies={ALL_COMPANIES} onSelect={onSelect} />
          </div>
          <div className="px-5 pb-4 flex gap-4 flex-wrap">
            {[
              { label: 'Overweight',        color: '#00C087' },
              { label: 'Strong Overweight', color: '#60A5FA' },
              { label: 'Underweight',       color: '#E8323C' },
              { label: 'Reduce',            color: '#C4A85A' },
            ].map(q => (
              <div key={q.label} className="flex items-center gap-1.5 text-xs text-secondary">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: q.color }} />
                {q.label}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 gap-6 ${!isRetail ? 'lg:grid-cols-3' : ''}`}>
        {/* Leading Signals — analyst only */}
        {!isRetail && (
          <div className="card overflow-hidden">
            <div className="card-header">
              <div className="card-title">Leading Signals</div>
              <div className="card-subtitle">Forward-looking ESG events · most severe first</div>
            </div>
            <div className="p-4 max-h-72 overflow-y-auto">
              <EventFeed companies={filtered} />
            </div>
          </div>
        )}

        {/* Leaderboard — always visible */}
        <div className={`card overflow-hidden ${!isRetail ? 'lg:col-span-2' : ''}`}>
          <div className="card-header">
            <div className="card-title">Momentum Leaderboard</div>
            <div className="card-subtitle">Sorted by combined momentum score · 60% CAGR + 40% event score</div>
          </div>
          <Leaderboard companies={filtered} allCompanies={ALL_COMPANIES} onSelect={onSelect} />
        </div>
      </div>
    </div>
  )
}
