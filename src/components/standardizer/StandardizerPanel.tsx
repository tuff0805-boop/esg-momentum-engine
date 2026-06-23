import { companies as ALL_COMPANIES } from '../../data/companies'
import type { Company } from '../../data/companies'
import { calcSES, calcDisagreement, getQuadrant } from '../../lib/esg'
import { MetricCard } from '../shared/MetricCard'
import { ScoreTable } from './ScoreTable'
import { DisagreementBars } from './DisagreementBars'

interface StandardizerPanelProps {
  activeSector: string
  onSelect: (c: Company) => void
  animKey: string | number
}

const SECTOR_VALUES = new Set<string>(['Energy', 'Materials', 'Industrials'])

export function StandardizerPanel({ activeSector, onSelect, animKey }: StandardizerPanelProps) {
  const filtered = SECTOR_VALUES.has(activeSector)
    ? ALL_COMPANIES.filter(c => c.sector === activeSector)
    : ALL_COMPANIES

  const avgSES = filtered.length
    ? filtered.reduce((s, c) => s + calcSES(c, ALL_COMPANIES), 0) / filtered.length
    : 0
  const highDisagreeCount = filtered.filter(c => calcDisagreement(c, ALL_COMPANIES) >= 0.8).length
  const hiddenWinnersCount = filtered.filter(c => getQuadrant(c, ALL_COMPANIES) === 'Hidden Winners').length

  return (
    <div className="flex flex-col gap-6">
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
          label="Avg SES"
          value={avgSES}
          decimals={1}
          subLabel="Standardized ESG Score"
          tooltip="Average Standardized ESG Score across filtered companies. SES normalises MSCI, Sustainalytics and Bloomberg onto a common 0-100 scale."
          color="teal"
          animKey={animKey}
        />
        <MetricCard
          label="High Disagreement"
          value={highDisagreeCount}
          subLabel="Alpha signal companies"
          tooltip="Companies where provider disagreement (std dev of z-scores) exceeds 0.8 — indicating potential mispricing and alpha opportunity."
          color="amber"
          animKey={animKey}
        />
        <MetricCard
          label="Hidden Winners"
          value={hiddenWinnersCount}
          subLabel="Low SES · positive CAGR"
          tooltip="Companies with below-average SES but positive ESG momentum — undervalued by current ratings but improving rapidly."
          color="teal"
          animKey={animKey}
        />
      </div>

      <div className="card overflow-hidden">
        <div className="card-header">
          <div className="card-title">ESG Score Comparison</div>
          <div className="card-subtitle">Cross-provider normalised scores · click row to inspect</div>
        </div>
        <ScoreTable companies={filtered} allCompanies={ALL_COMPANIES} onSelect={onSelect} />
      </div>

      <div className="card p-5">
        <div className="mb-4">
          <div className="card-title">Provider Disagreement</div>
          <div className="card-subtitle">Std dev of z-scores across MSCI, Sustainalytics and Bloomberg · high = alpha signal</div>
        </div>
        <DisagreementBars companies={filtered} allCompanies={ALL_COMPANIES} />
      </div>
    </div>
  )
}
