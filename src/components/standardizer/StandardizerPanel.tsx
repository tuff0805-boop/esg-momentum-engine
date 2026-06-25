import { companies as ALL_COMPANIES } from '../../data/companies'
import type { Company } from '../../data/companies'
import { calcSES, calcDisagreement, getQuadrant } from '../../lib/esg'
import { MetricCard } from '../shared/MetricCard'
import { ScoreTable } from './ScoreTable'
import { DisagreementBars } from './DisagreementBars'
import { RetailSignalCard } from '../shared/RetailSignalCard'

interface StandardizerPanelProps {
  activeSector: string
  onSelect: (c: Company) => void
  animKey: string | number
  viewMode?: 'retail' | 'analyst'
}

const SECTOR_VALUES = new Set<string>(['Energy', 'Materials', 'Industrials'])

export function StandardizerPanel({ activeSector, onSelect, animKey, viewMode = 'analyst' }: StandardizerPanelProps) {
  const filtered = SECTOR_VALUES.has(activeSector)
    ? ALL_COMPANIES.filter(c => c.sector === activeSector)
    : ALL_COMPANIES

  const avgSES = filtered.length
    ? filtered.reduce((s, c) => s + calcSES(c, ALL_COMPANIES), 0) / filtered.length
    : 0
  const highDisagreeCount = filtered.filter(c => calcDisagreement(c, ALL_COMPANIES) >= 0.8).length
  const hiddenWinnersCount = filtered.filter(c => getQuadrant(c, ALL_COMPANIES) === 'Overweight').length

  const isRetail = viewMode === 'retail'

  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-secondary leading-relaxed px-1">
        {isRetail
          ? 'Top ESG investment signals for the current selection. Click any card to see company details.'
          : 'We normalize scores from three rating agencies into one reliable score. Higher divergence between providers = more alpha opportunity.'}
      </div>

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

      {/* Provider Disagreement — analyst only */}
      {!isRetail && (
        <div className="card p-5">
          <div className="mb-4">
            <div className="card-title">Provider Disagreement</div>
            <div className="card-subtitle">Standard deviation of z-scores across MSCI, Sustainalytics and Bloomberg · high = alpha signal</div>
          </div>
          <DisagreementBars companies={filtered} allCompanies={ALL_COMPANIES} />
        </div>
      )}
    </div>
  )
}
