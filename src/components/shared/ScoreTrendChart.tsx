import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { Company } from '../../data/companies'
import { calcSES, calcPillars, calcCAGR } from '../../lib/esg'

interface ScoreTrendChartProps {
  company: Company
  allCompanies: Company[]
  height?: number
  showPillars?: boolean
  compact?: boolean
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

function generateTrendData(company: Company, allCompanies: Company[]) {
  const currentSES = calcSES(company, allCompanies)
  const currentPillars = calcPillars(company, allCompanies)
  const cagr = calcCAGR(company)

  const sesBase = currentSES / Math.pow(1 + Math.max(-0.15, Math.min(0.15, cagr / 100)), 5)

  const cagrFactor = Math.pow(1 + Math.max(-0.15, Math.min(0.15, cagr / 100)), 5)
  const pillarBase = {
    E: currentPillars.E / cagrFactor,
    S: currentPillars.S / cagrFactor,
    G: currentPillars.G / (cagrFactor * 0.9),
  }

  const YEARS = [2019, 2020, 2021, 2022, 2023, 2024]
  const seed = company.name

  return YEARS.map((year, i) => {
    const t = i / (YEARS.length - 1)
    const jitter = (seededRandom(seed, i * 7 + 1) - 0.5) * 4
    const ses = Math.max(20, Math.min(90, sesBase + (currentSES - sesBase) * t + (i > 0 && i < YEARS.length - 1 ? jitter : 0)))

    const eJitter = (seededRandom(seed, i * 7 + 2) - 0.5) * 5
    const sJitter = (seededRandom(seed, i * 7 + 3) - 0.5) * 5
    const gJitter = (seededRandom(seed, i * 7 + 4) - 0.5) * 3

    const clamp = (v: number) => Math.max(15, Math.min(95, v))

    return {
      year,
      SES: parseFloat(ses.toFixed(1)),
      E: clamp(parseFloat((pillarBase.E + (currentPillars.E - pillarBase.E) * t + (i > 0 && i < YEARS.length - 1 ? eJitter : 0)).toFixed(1))),
      S: clamp(parseFloat((pillarBase.S + (currentPillars.S - pillarBase.S) * t + (i > 0 && i < YEARS.length - 1 ? sJitter : 0)).toFixed(1))),
      G: clamp(parseFloat((pillarBase.G + (currentPillars.G - pillarBase.G) * t + (i > 0 && i < YEARS.length - 1 ? gJitter : 0)).toFixed(1))),
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0D1117', border: '1px solid #2A3A4A', borderRadius: 4, padding: '8px 12px', fontSize: 11 }}>
      <div style={{ fontWeight: 600, color: '#E8EDF2', marginBottom: 6 }}>{label}</div>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span>{p.dataKey === 'SES' ? 'Total ESG' : p.dataKey}</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export function ScoreTrendChart({ company, allCompanies, height = 200, showPillars = true, compact = false }: ScoreTrendChartProps) {
  const data = generateTrendData(company, allCompanies)

  if (compact) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line
            type="monotone"
            dataKey="SES"
            stroke="#E8EDF2"
            strokeWidth={1.5}
            dot={false}
            animationDuration={800}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E2836" vertical={false} />
        <XAxis
          dataKey="year"
          tick={{ fill: '#4A5568', fontSize: 10 }}
          axisLine={{ stroke: '#1E2836' }}
          tickLine={false}
        />
        <YAxis
          domain={[20, 90]}
          tick={{ fill: '#4A5568', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip content={<CustomTooltip />} />
        {showPillars && (
          <Legend
            wrapperStyle={{ fontSize: 10, paddingTop: 4 }}
            formatter={(val) => <span style={{ color: '#8B9AAB' }}>{val}</span>}
          />
        )}
        <Line type="monotone" dataKey="SES" name="Total ESG" stroke="#E8EDF2" strokeWidth={2}
          dot={{ r: 3, fill: '#E8EDF2', strokeWidth: 0 }} activeDot={{ r: 5 }} animationDuration={1000} />
        {showPillars && (
          <>
            <Line type="monotone" dataKey="E" name="E" stroke="#00C087" strokeWidth={1.5}
              strokeDasharray="4 2" dot={false} animationDuration={1000} />
            <Line type="monotone" dataKey="S" name="S" stroke="#1E6FD9" strokeWidth={1.5}
              strokeDasharray="4 2" dot={false} animationDuration={1000} />
            <Line type="monotone" dataKey="G" name="G" stroke="#7C3AED" strokeWidth={1.5}
              strokeDasharray="4 2" dot={false} animationDuration={1000} />
          </>
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
