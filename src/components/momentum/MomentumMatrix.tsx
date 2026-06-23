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
  'Hidden Winners': '#1D9E75',
  'Future Leaders': '#3B82F6',
  'Value Traps': '#E05252',
  'Overrated Leaders': '#EF9F27',
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
  const color = quadrantColors[payload.quadrant] ?? '#94a3b8'
  const label = payload.name.split(' ')[0]
  const labelW = label.length * 5.5 + 8
  return (
    <g onClick={() => onClick(payload.company)} style={{ cursor: 'pointer' }}>
      <circle cx={cx} cy={cy} r={8} fill={color} stroke="#ffffff" strokeWidth={2} />
      <rect
        x={cx - labelW / 2}
        y={cy - 26}
        width={labelW}
        height={14}
        rx={4}
        fill="white"
        fillOpacity={0.92}
      />
      <text
        x={cx}
        y={cy - 15}
        textAnchor="middle"
        fontSize={9}
        fill="#1e293b"
        fontWeight="600"
        fontFamily="'JetBrains Mono', monospace"
      >
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
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} className="rounded-lg p-3 text-xs shadow-xl">
      <div className="font-semibold text-primary mb-1">{d.name}</div>
      <div className="text-secondary">SES: <span className="font-mono text-accent">{d.x.toFixed(1)}</span></div>
      <div className="text-secondary">CAGR: <span className={`font-mono ${d.y >= 0 ? 'text-accent' : 'text-danger'}`}>{d.y >= 0 ? '+' : ''}{d.y.toFixed(1)}%</span></div>
      <div className="mt-1.5 font-medium" style={{ color }}>{d.quadrant}</div>
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

  // Dynamic Y domain with 2-unit breathing room so dots near extremes don't clip
  const cagrValues = data.map(d => d.y)
  const yMin = cagrValues.length ? Math.floor(Math.min(...cagrValues) - 2) : -6
  const yMax = cagrValues.length ? Math.ceil(Math.max(...cagrValues) + 2) : 16

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 28, right: 30, bottom: 28, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="color-mix(in srgb, var(--border) 80%, transparent)" />
          <XAxis
            type="number"
            dataKey="x"
            name="SES"
            domain={[20, 80]}
            label={{ value: 'SES Score', position: 'insideBottom', offset: -14, fill: '#64748b', fontSize: 11 }}
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="ESG CAGR"
            domain={[yMin, yMax]}
            tickFormatter={v => `${Number(v).toFixed(1)}%`}
            label={{ value: 'ESG CAGR', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            x={avgSES}
            stroke="#94a3b8"
            strokeOpacity={0.3}
            strokeDasharray="4 4"
            label={{ value: 'Avg SES', position: 'top', fill: '#94a3b8', fontSize: 10 }}
          />
          <ReferenceLine
            y={0}
            stroke="#94a3b8"
            strokeOpacity={0.3}
            strokeDasharray="4 4"
            label={{ value: 'CAGR=0', position: 'right', fill: '#94a3b8', fontSize: 10 }}
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

      {/* Corner quadrant labels */}
      <div className="absolute top-7 left-16 text-[10px] font-semibold pointer-events-none" style={{ color: '#10B981', opacity: 0.6 }}>Hidden Winners</div>
      <div className="absolute top-7 right-8 text-[10px] font-semibold pointer-events-none" style={{ color: '#3B82F6', opacity: 0.6 }}>Future Leaders</div>
      <div className="absolute bottom-14 left-16 text-[10px] font-semibold pointer-events-none" style={{ color: '#EF4444', opacity: 0.6 }}>Value Traps</div>
      <div className="absolute bottom-14 right-8 text-[10px] font-semibold pointer-events-none" style={{ color: '#F59E0B', opacity: 0.6 }}>Overrated Leaders</div>
    </div>
  )
}
