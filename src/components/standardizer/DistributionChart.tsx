import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import type { Company } from '../../data/companies'
import { calcSES, calcDisagreement } from '../../lib/esg'

interface DistributionChartProps {
  companies: Company[]
  allCompanies: Company[]
}

function gaussian(x: number, mean: number, std: number): number {
  return Math.exp(-0.5 * ((x - mean) / std) ** 2) / (std * Math.sqrt(2 * Math.PI))
}

function divergenceColor(d: number): string {
  if (d < 0.4) return '#00C087'
  if (d < 0.8) return '#C4A85A'
  return '#E8323C'
}

function divergenceLevel(d: number): string {
  if (d < 0.4) return 'Low'
  if (d < 0.8) return 'Medium'
  return 'High'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#131920', border: '1px solid #1E2836', borderRadius: 4, padding: '6px 10px', fontSize: 11 }}>
      <div style={{ color: '#8B9AAB' }}>Score: <span style={{ fontFamily: 'monospace', color: '#E8EDF2' }}>{payload[0]?.payload?.x?.toFixed(1)}</span></div>
      <div style={{ color: '#8B9AAB' }}>Density: <span style={{ fontFamily: 'monospace', color: '#1E6FD9' }}>{payload[0]?.value?.toFixed(4)}</span></div>
    </div>
  )
}

export function DistributionChart({ companies, allCompanies }: DistributionChartProps) {
  const scores = allCompanies.map(c => calcSES(c, allCompanies))
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length || 50
  const std = Math.sqrt(scores.reduce((a, b) => a + (b - mean) ** 2, 0) / scores.length) || 12

  // Generate 100 curve points
  const curveData = Array.from({ length: 101 }, (_, i) => {
    const x = i
    return { x, y: gaussian(x, mean, std) }
  })

  const companyData = companies.map(c => ({
    company: c,
    ses: calcSES(c, allCompanies),
    divergence: calcDisagreement(c, allCompanies),
  }))

  return (
    <div>
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#E8EDF2' }}>
          Score Distribution — Universe of {allCompanies.length} Companies
        </div>
        <div style={{ fontSize: 11, color: '#8B9AAB', marginTop: 2 }}>
          Tail companies with high provider divergence = greatest mispricing opportunity
        </div>
      </div>

      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={curveData} margin={{ top: 10, right: 16, bottom: 20, left: 0 }}>
            <defs>
              <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1E6FD9" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#1E6FD9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2836" />
            <XAxis
              dataKey="x"
              domain={[0, 100]}
              tick={{ fill: '#4A5568', fontSize: 10 }}
              axisLine={{ stroke: '#1E2836' }}
              tickLine={false}
              label={{ value: 'Standardized ESG Score', position: 'insideBottom', offset: -10, fill: '#4A5568', fontSize: 10 }}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="y"
              stroke="#1E6FD9"
              strokeWidth={2}
              fill="url(#distGrad)"
              dot={false}
              activeDot={false}
            />
            {companyData.map(({ company, ses, divergence }) => (
              <ReferenceLine
                key={company.name}
                x={Math.round(ses)}
                stroke={divergenceColor(divergence)}
                strokeWidth={1.5}
                strokeDasharray="3 3"
                label={{
                  value: company.name.split(' ')[0],
                  position: 'top',
                  fill: divergenceColor(divergence),
                  fontSize: 8,
                }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 10, color: '#4A5568' }}>
        <span>
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#00C087', marginRight: 4 }} />
          Low divergence
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#C4A85A', marginRight: 4 }} />
          Medium divergence
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#E8323C', marginRight: 4 }} />
          High divergence — alpha signal
        </span>
      </div>

      {/* Company divergence table */}
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {companyData.map(({ company, ses, divergence }) => (
          <div key={company.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
            <span style={{ color: divergenceColor(divergence), width: 8, height: 8, borderRadius: '50%', background: divergenceColor(divergence), flexShrink: 0, display: 'inline-block' }} />
            <span style={{ color: '#8B9AAB', width: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{company.name}</span>
            <span style={{ fontFamily: 'monospace', color: '#00C087' }}>{ses.toFixed(1)}</span>
            <span style={{ color: '#4A5568', fontSize: 10 }}>{divergenceLevel(divergence)} divergence</span>
          </div>
        ))}
      </div>
    </div>
  )
}
