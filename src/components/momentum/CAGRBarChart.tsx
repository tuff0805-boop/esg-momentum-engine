import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell, LabelList,
} from 'recharts'
import type { Company } from '../../data/companies'
import { calcCAGR, getESGSignal } from '../../lib/esg'

interface CAGRBarChartProps {
  companies: Company[]
  allCompanies: Company[]
}

const SIGNAL_COLOR: Record<string, string> = {
  'Outperform': '#00C087',
  'Strong Buy': '#60A5FA',
  'Hold':       '#C4A85A',
  'Reduce':     '#E8323C',
}

const UNIVERSE_AVG = 9.2

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{ background: '#131920', border: '1px solid #1E2836', borderRadius: 4, padding: '8px 10px', fontSize: 11 }}>
      <div style={{ fontWeight: 500, color: '#E8EDF2', marginBottom: 3 }}>{d.fullName}</div>
      <div style={{ color: '#8B9AAB' }}>ESG CAGR: <span style={{ fontFamily: 'monospace', color: d.color }}>{d.cagr >= 0 ? '+' : ''}{d.cagr.toFixed(1)}%</span></div>
      <div style={{ color: '#8B9AAB' }}>Signal: <span style={{ color: d.color }}>{d.signal}</span></div>
      <div style={{ color: '#8B9AAB', marginTop: 3 }}>vs Universe Avg: <span style={{ fontFamily: 'monospace', color: d.cagr >= UNIVERSE_AVG ? '#00C087' : '#E8323C' }}>{d.cagr >= UNIVERSE_AVG ? '+' : ''}{(d.cagr - UNIVERSE_AVG).toFixed(1)}%</span></div>
    </div>
  )
}

export function CAGRBarChart({ companies, allCompanies }: CAGRBarChartProps) {
  const data = companies
    .map(c => {
      const cagr = calcCAGR(c)
      const signal = getESGSignal(c, allCompanies)
      return {
        name: c.name.split(' ')[0],
        fullName: c.name,
        cagr,
        signal,
        color: SIGNAL_COLOR[signal] ?? '#8B9AAB',
      }
    })
    .sort((a, b) => b.cagr - a.cagr)

  const topPerformer = data[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Title */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#E8EDF2', marginBottom: 4 }}>
          ESG Improvement Rate — Compound Annual Growth Rate Ranking
        </div>
        <div style={{ fontSize: 12, color: '#8B9AAB' }}>
          Companies above the universe average ({UNIVERSE_AVG}%) are improving faster than peers
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 380 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 16, right: 80, bottom: 16, left: 80 }}
          barSize={24}
        >
          <CartesianGrid horizontal={false} stroke="#1E2836" strokeDasharray="3 3" />
          <XAxis
            type="number"
            domain={[0, 20]}
            tickFormatter={v => `${v}%`}
            tick={{ fill: '#4A5568', fontSize: 10 }}
            axisLine={{ stroke: '#1E2836' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={76}
            tick={{ fill: '#C8D3DC', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <ReferenceLine
            x={UNIVERSE_AVG}
            stroke="#2A3A4A"
            strokeDasharray="5 4"
            label={{ value: `Universe Avg ${UNIVERSE_AVG}%`, position: 'top', fill: '#4A5568', fontSize: 10 }}
          />
          <Bar dataKey="cagr" radius={[0, 3, 3, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
            <LabelList
              dataKey="cagr"
              position="right"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => `${Number(v) >= 0 ? '+' : ''}${Number(v).toFixed(1)}%`}
              style={{ fill: '#E8EDF2', fontSize: 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {Object.entries(SIGNAL_COLOR).map(([label, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#8B9AAB' }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
            {label}
          </div>
        ))}
      </div>

      {/* Insight box */}
      {topPerformer && (
        <div style={{
          background: '#0D1117', border: '1px solid #1E2836', borderLeft: '3px solid #00C087',
          borderRadius: 4, padding: '10px 14px', fontSize: 12, color: '#8B9AAB',
        }}>
          <span style={{ color: '#E8EDF2', fontWeight: 500 }}>Top performer:</span>{' '}
          {topPerformer.fullName} at{' '}
          <span style={{ fontFamily: 'monospace', color: '#00C087' }}>+{topPerformer.cagr.toFixed(1)}%</span>
          {' '}— improving{' '}
          <span style={{ color: '#00C087' }}>{((topPerformer.cagr / UNIVERSE_AVG - 1) * 100).toFixed(0)}% faster</span>
          {' '}than the universe average
        </div>
      )}
    </div>
  )
}
