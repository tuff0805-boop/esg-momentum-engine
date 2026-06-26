import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { Company } from '../../data/companies'
import { calcSES, calcCAGR, getQuadrant } from '../../lib/esg'

interface MomentumMatrixProps {
  companies: Company[]
  allCompanies: Company[]
  onSelect: (c: Company) => void
}

const quadrantColors: Record<string, string> = {
  'Outperform':  '#00C087',
  'Strong Buy':  '#60A5FA',
  'Underperform': '#E8323C',
  'Reduce':      '#C4A85A',
}

interface DataPoint {
  x: number
  y: number
  name: string
  quadrant: string
  company: Company
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomDot = (props: any) => {
  const { cx, cy, payload, onClick } = props
  const color = quadrantColors[payload.quadrant] ?? '#8B9AAB'
  const label = payload.name.split(' ')[0]
  const labelW = label.length * 5.5 + 8
  return (
    <g onClick={() => onClick(payload.company)} style={{ cursor: 'pointer' }}>
      <circle cx={cx} cy={cy} r={7} fill={color} stroke="#1E2836" strokeWidth={1.5} />
      <rect x={cx - labelW/2} y={cy - 24} width={labelW} height={13} rx={3} fill="#131920" stroke="#1E2836" strokeWidth={0.5} />
      <text x={cx} y={cy - 13} textAnchor="middle" fontSize={9} fill="#E8EDF2" fontWeight="500">
        {label}
      </text>
    </g>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d: DataPoint = payload[0].payload
  const color = quadrantColors[d.quadrant]
  return (
    <div style={{ background: '#131920', border: '1px solid #1E2836', borderRadius: 4, padding: '8px 10px', fontSize: 11 }}>
      <div style={{ fontWeight: 500, color: '#E8EDF2', marginBottom: 3 }}>{d.name}</div>
      <div style={{ color: '#8B9AAB' }}>Score: <span style={{ fontFamily: 'monospace', color: '#00C087' }}>{d.x.toFixed(1)}</span></div>
      <div style={{ color: '#8B9AAB' }}>CAGR: <span style={{ fontFamily: 'monospace', color: d.y >= 0 ? '#00C087' : '#E8323C' }}>{d.y >= 0 ? '+' : ''}{d.y.toFixed(1)}%</span></div>
      <div style={{ marginTop: 4, fontWeight: 500, color, fontSize: 10 }}>{d.quadrant}</div>
    </div>
  )
}

function applyJitter(points: DataPoint[]): DataPoint[] {
  const out = points.map(p => ({ ...p }))
  for (let i = 0; i < out.length; i++) {
    for (let j = i + 1; j < out.length; j++) {
      if (Math.abs(out[i].x - out[j].x) < 3 && Math.abs(out[i].y - out[j].y) < 1.0) {
        out[i] = { ...out[i], x: out[i].x - 1.5, y: out[i].y + 0.3 }
        out[j] = { ...out[j], x: out[j].x + 1.5, y: out[j].y - 0.3 }
      }
    }
  }
  return out
}

export function MomentumMatrix({ companies, allCompanies, onSelect }: MomentumMatrixProps) {
  const sesList = allCompanies.map(c => calcSES(c, allCompanies))
  const avgSES = sesList.reduce((a, b) => a + b, 0) / sesList.length

  const rawData: DataPoint[] = companies.map(c => ({
    x: calcSES(c, allCompanies),
    y: calcCAGR(c),
    name: c.name,
    quadrant: getQuadrant(c, allCompanies),
    company: c,
  }))
  const data = applyJitter(rawData)

  const cagrValues = data.map(d => d.y)
  const yMin = cagrValues.length ? Math.floor(Math.min(...cagrValues) - 2) : -6
  const yMax = cagrValues.length ? Math.ceil(Math.max(...cagrValues) + 2) : 16

  return (
    <div className="relative" style={{ background: '#080B10', borderRadius: 4, padding: '4px 0' }}>
      <ResponsiveContainer width="100%" height={380}>
        <ScatterChart margin={{ top: 28, right: 30, bottom: 28, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2836" vertical={true} />
          <XAxis
            type="number"
            dataKey="x"
            name="SES"
            domain={[20, 80]}
            label={{ value: 'Standardized ESG Score', position: 'insideBottom', offset: -14, fill: '#4A5568', fontSize: 11 }}
            tick={{ fill: '#4A5568', fontSize: 11 }}
            axisLine={{ stroke: '#1E2836' }}
            tickLine={false}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="ESG CAGR"
            domain={[yMin, yMax]}
            tickFormatter={v => `${Number(v).toFixed(1)}%`}
            label={{ value: 'ESG CAGR', angle: -90, position: 'insideLeft', fill: '#4A5568', fontSize: 10 }}
            tick={{ fill: '#4A5568', fontSize: 10 }}
            axisLine={{ stroke: '#1E2836' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            x={avgSES}
            stroke="#2A3A4A"
            strokeDasharray="4 4"
            label={{ value: 'Avg Score', position: 'top', fill: '#4A5568', fontSize: 10 }}
          />
          <ReferenceLine
            y={0}
            stroke="#2A3A4A"
            strokeDasharray="4 4"
            label={{ value: 'CAGR=0', position: 'right', fill: '#4A5568', fontSize: 10 }}
          />
          <Scatter
            data={data}
            shape={(props: unknown) => <CustomDot {...(props as Record<string, unknown>)} onClick={onSelect} />}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={quadrantColors[d.quadrant]} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      <div className="absolute top-7 left-16 text-[10px] font-semibold pointer-events-none" style={{ color: '#4A5568', opacity: 0.6 }}>Outperform</div>
      <div className="absolute top-7 right-8 text-[10px] font-semibold pointer-events-none" style={{ color: '#4A5568', opacity: 0.6 }}>Strong Buy</div>
      <div className="absolute bottom-14 left-16 text-[10px] font-semibold pointer-events-none" style={{ color: '#4A5568', opacity: 0.6 }}>Underperform</div>
      <div className="absolute bottom-14 right-8 text-[10px] font-semibold pointer-events-none" style={{ color: '#4A5568', opacity: 0.6 }}>Reduce</div>
    </div>
  )
}
