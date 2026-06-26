import type { Company } from '../data/companies'

export function zScore(arr: number[]): number[] {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length
  const std = Math.sqrt(arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length)
  if (std === 0) return arr.map(() => 0)
  return arr.map(v => (v - mean) / std)
}

function percentileRank(arr: number[], value: number): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const idx = sorted.findIndex(v => v >= value)
  if (idx === -1) return 100
  return (idx / sorted.length) * 100
}

export function calcSES(company: Company, allCompanies: Company[]): number {
  const msciZ = zScore(allCompanies.map(c => c.msci))
  const susZ = zScore(allCompanies.map(c => c.sustainalytics))
  const bbgZ = zScore(allCompanies.map(c => c.bloomberg))
  const idx = allCompanies.indexOf(company)
  const combined = (msciZ[idx] + susZ[idx] + bbgZ[idx]) / 3
  return Math.round((50 + combined * 15) * 10) / 10
}

export function calcDisagreement(company: Company, allCompanies: Company[]): number {
  const msciZ = zScore(allCompanies.map(c => c.msci))
  const susZ = zScore(allCompanies.map(c => c.sustainalytics))
  const bbgZ = zScore(allCompanies.map(c => c.bloomberg))
  const idx = allCompanies.indexOf(company)
  const scores = [msciZ[idx], susZ[idx], bbgZ[idx]]
  const mean = scores.reduce((a, b) => a + b, 0) / 3
  const variance = scores.reduce((a, b) => a + (b - mean) ** 2, 0) / 3
  return Math.round(Math.sqrt(variance) * 100) / 100
}

export function calcCAGR(company: Company): number {
  return (Math.pow(company.ses_current / company.ses_base, 1 / 5) - 1) * 100
}

export function calcEventScore(company: Company): number {
  const pillarWeights: Record<string, number> = { E: 1.2, S: 1.0, G: 0.9 }
  const maxPossible = company.events.length * 3 * 1.2
  if (maxPossible === 0) return 50
  const raw = company.events.reduce((sum, e) => {
    return sum + e.severity * e.direction * pillarWeights[e.pillar]
  }, 0)
  // Normalize to 0-100, with neutral at 50
  const normalised = 50 + (raw / maxPossible) * 50
  return Math.min(100, Math.max(0, Math.round(normalised)))
}

export function calcMomentum(company: Company, allCompanies: Company[]): number {
  const cagrs = allCompanies.map(c => calcCAGR(c))
  const eventScores = allCompanies.map(c => calcEventScore(c))
  const idx = allCompanies.indexOf(company)
  const cagrPct = percentileRank(cagrs, cagrs[idx])
  const eventPct = percentileRank(eventScores, eventScores[idx])
  return Math.round(0.6 * cagrPct + 0.4 * eventPct)
}

export function getQuadrant(
  company: Company,
  allCompanies: Company[]
): 'Outperform' | 'Strong Buy' | 'Underperform' | 'Reduce' {
  const sesList = allCompanies.map(c => calcSES(c, allCompanies))
  const avgSES = sesList.reduce((a, b) => a + b, 0) / sesList.length
  const ses = calcSES(company, allCompanies)
  const cagr = calcCAGR(company)
  const highSES = ses >= avgSES
  const positiveCAGR = cagr >= 0
  if (!highSES && positiveCAGR) return 'Outperform'
  if (highSES && positiveCAGR) return 'Strong Buy'
  if (!highSES && !positiveCAGR) return 'Underperform'
  return 'Reduce'
}

export function getRaterForecast(
  company: Company,
  allCompanies: Company[]
): 'Rating Upgrade Expected' | 'Stable' | 'Monitor' | 'Rating Downgrade Risk' {
  const momentum = calcMomentum(company, allCompanies)
  const cagr = calcCAGR(company)
  if (momentum >= 70 && cagr > 5) return 'Rating Upgrade Expected'
  if (momentum >= 45) return 'Stable'
  if (momentum >= 25) return 'Monitor'
  return 'Rating Downgrade Risk'
}

export function getMultiplier(quadrant: string): number {
  const map: Record<string, number> = {
    'Outperform':  1.0,
    'Strong Buy':  0.8,
    'Reduce':      0.3,
    'Underperform': 0.1,
  }
  return map[quadrant] ?? 0.5
}

export function calcDCF(company: Company, allCompanies: Company[]) {
  const quadrant = getQuadrant(company, allCompanies)
  const multiplier = getMultiplier(quadrant)
  const revUp = (company.rev_up * multiplier) / 100
  const opSave = (company.opcost_save * multiplier) / 100
  const capexDrag = (company.capex_drag * multiplier) / 100
  const waccReduction = company.wacc_red * multiplier
  const baseWACC = company.wacc / 100
  const adjWACC = baseWACC - waccReduction / 10000
  const baseTG = company.tg / 100
  const adjTG = baseTG + 0.001 * multiplier
  const baseVal = company.fcf / (baseWACC - baseTG)
  const adjVal = (company.fcf * (1 + revUp + opSave)) / (adjWACC - adjTG)
  const upsidePct = (adjVal - baseVal) / baseVal
  const bearPrice = company.base_price * (1 + upsidePct * 0.5)
  const adjPrice = company.base_price * (1 + upsidePct)
  const bullPrice = company.base_price * (1 + upsidePct * 1.6)
  const materialityPass = company.fcf / company.mcap > 0.005

  let rating: 'Strong Buy' | 'Dollar-Cost Strategy' | 'Hold' | 'Reduce'
  if (upsidePct > 0.08) rating = 'Strong Buy'
  else if (upsidePct >= 0.03) rating = 'Dollar-Cost Strategy'
  else if (upsidePct >= -0.03) rating = 'Hold'
  else rating = 'Reduce'

  return {
    multiplier,
    revUp: revUp * 100,
    opSave: opSave * 100,
    capexDrag: capexDrag * 100,
    waccReduction,
    baseWACC: baseWACC * 100,
    adjWACC: adjWACC * 100,
    baseTG: baseTG * 100,
    adjTG: adjTG * 100,
    baseVal,
    adjVal,
    upsidePct: upsidePct * 100,
    bearPrice,
    basePrice: company.base_price,
    adjPrice,
    bullPrice,
    materialityPass,
    rating,
  }
}

export function getDCFRating(upsidePct: number): 'Strong Buy' | 'Dollar-Cost Strategy' | 'Hold' | 'Reduce' {
  if (upsidePct > 8) return 'Strong Buy'
  if (upsidePct >= 3) return 'Dollar-Cost Strategy'
  if (upsidePct >= -3) return 'Hold'
  return 'Reduce'
}

export function getActionRating(
  company: Company,
  allCompanies: Company[]
): 'Strong Buy' | 'Dollar-Cost Strategy' | 'Hold' | 'Reduce' {
  const dcf = calcDCF(company, allCompanies)
  return getDCFRating(dcf.upsidePct)
}

export function getESGSignal(
  company: Company,
  allCompanies: Company[]
): 'Outperform' | 'Neutral' | 'Underperform' {
  const quadrant = getQuadrant(company, allCompanies)
  if (quadrant === 'Strong Buy' || quadrant === 'Outperform') return 'Outperform'
  if (quadrant === 'Reduce' || quadrant === 'Underperform') return 'Underperform'
  return 'Neutral'
}

export function calcPillars(
  company: Company,
  allCompanies: Company[]
): { E: number; S: number; G: number; I: number } {
  const idx = allCompanies.indexOf(company)
  const msciZ = zScore(allCompanies.map(c => c.msci))
  const susZ = zScore(allCompanies.map(c => c.sustainalytics))
  const bbgZ = zScore(allCompanies.map(c => c.bloomberg))

  // Deterministic pillar approximation using provider z-scores
  const envRaw = msciZ[idx] * 0.5 + bbgZ[idx] * 0.5
  const socRaw = susZ[idx] * 0.6 + msciZ[idx] * 0.4
  const govRaw = bbgZ[idx] * 0.6 + susZ[idx] * 0.4

  const clamp = (v: number) => Math.min(100, Math.max(0, Math.round(50 + v * 15)))

  const innovationKeywords = ['Patent', 'Technology', 'Digital', 'Innovation', 'Hydrogen', 'EV', 'Renewable', 'Solar', 'Wind']
  const innovationEvents = company.events.filter(ev =>
    innovationKeywords.some(kw => ev.title.toLowerCase().includes(kw.toLowerCase()))
  )
  const I = Math.min(90, 40 + innovationEvents.length * 8 + innovationEvents.reduce((s, e) => s + e.severity, 0) * 3)

  return { E: clamp(envRaw), S: clamp(socRaw), G: clamp(govRaw), I }
}
