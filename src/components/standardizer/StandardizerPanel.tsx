import { useState } from 'react'
import { companies as ALL_COMPANIES } from '../../data/companies'
import type { Company, NewsItem } from '../../data/companies'
import { calcSES, calcDisagreement, getQuadrant } from '../../lib/esg'
import { MetricCard } from '../shared/MetricCard'
import { ScoreTable } from './ScoreTable'
import { DistributionChart } from './DistributionChart'
import { RetailSignalCard } from '../shared/RetailSignalCard'
import { PillarEventFeed } from './PillarEventFeed'

interface StandardizerPanelProps {
  activeSector: string
  onSelect: (c: Company) => void
  animKey: string | number
  viewMode?: 'retail' | 'analyst'
  onEventClick?: (item: NewsItem, companyName: string, ses: number) => void
}

const SECTOR_VALUES = new Set<string>(['Energy', 'Materials', 'Industrials'])

export function StandardizerPanel({ activeSector, onSelect, animKey, viewMode = 'analyst', onEventClick }: StandardizerPanelProps) {
  const [subTab, setSubTab] = useState<'events' | 'scores'>('events')
  const filtered = SECTOR_VALUES.has(activeSector)
    ? ALL_COMPANIES.filter(c => c.sector === activeSector)
    : ALL_COMPANIES

  const avgSES = filtered.length
    ? filtered.reduce((s, c) => s + calcSES(c, ALL_COMPANIES), 0) / filtered.length
    : 0
  const highDisagreeCount = filtered.filter(c => calcDisagreement(c, ALL_COMPANIES) >= 0.8).length
  const hiddenWinnersCount = filtered.filter(c => getQuadrant(c, ALL_COMPANIES) === 'Outperform').length

  const isRetail = viewMode === 'retail'

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-tab switcher */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #1E2836', marginBottom: 4 }}>
        {(['events', 'scores'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            style={{
              padding: '8px 20px',
              fontSize: 13,
              fontWeight: subTab === tab ? 500 : 400,
              color: subTab === tab ? '#E8EDF2' : '#8B9AAB',
              background: 'none',
              border: 'none',
              borderBottom: subTab === tab ? '2px solid #E8323C' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: -1,
              transition: 'color 0.12s',
            }}
          >
            {tab === 'events' ? '⬡ Pillar Events' : '▦ Provider Scores'}
          </button>
        ))}
      </div>

      {subTab === 'events' ? (
        <PillarEventFeed
          companies={filtered}
          allCompanies={ALL_COMPANIES}
          onEventClick={onEventClick ?? (() => {})}
        />
      ) : (
        <>
      {/* Retail view: top signal cards */}
      {isRetail && (
        <RetailSignalCard companies={filtered} allCompanies={ALL_COMPANIES} onSelect={onSelect} />
      )}

      {/* Analyst-only: metric summary strip */}
      {!isRetail && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Universe"
            value={filtered.length}
            subLabel="ASEAN brown companies"
            tooltip="Total number of brown industry ASEAN companies in the current filtered view."
            trendDirection="neutral"
            animKey={animKey}
          />
          <MetricCard
            label="Average Standardized ESG Score"
            value={avgSES}
            decimals={1}
            subLabel="Normalized across all providers"
            tooltip="Average Standardized ESG Score across filtered companies. Normalises MSCI, Sustainalytics and Bloomberg onto a common 0-100 scale."
            color="teal"
            animKey={animKey}
          />
          <MetricCard
            label="High Provider Divergence"
            value={highDisagreeCount}
            subLabel="Overweight opportunity companies"
            tooltip="Companies where provider divergence (standard deviation of z-scores) exceeds 0.8 — indicating potential mispricing and alpha opportunity."
            color="amber"
            animKey={animKey}
          />
          <MetricCard
            label="Overweight"
            value={hiddenWinnersCount}
            subLabel="Low score · rising trajectory"
            tooltip="Companies with below-average Standardized ESG Score but positive ESG Compound Annual Growth Rate — undervalued by current ratings but improving rapidly."
            color="teal"
            animKey={animKey}
          />
        </div>
      )}

      {/* Score table — pillar bars hidden in retail view */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <div className="card-title">ESG Score Comparison</div>
          <div className="card-subtitle">Cross-provider normalised scores · click row to inspect</div>
        </div>
        <ScoreTable
          companies={filtered}
          allCompanies={ALL_COMPANIES}
          onSelect={onSelect}
          hidePillars={isRetail}
        />
      </div>

      {/* Score Distribution Bell Curve — analyst only */}
      {!isRetail && (
        <div className="card p-5">
          <DistributionChart companies={filtered} allCompanies={ALL_COMPANIES} />
        </div>
      )}
        </>
      )}
    </div>
  )
}
