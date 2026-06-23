import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface JCurveChartProps {
  capexDrag: number
  opSave: number
  revUp: number
}

export function JCurveChart({ capexDrag, opSave, revUp }: JCurveChartProps) {
  const netBenefit = opSave + revUp
  const data = [
    { year: 'Y1', value: -(capexDrag * 1.2) },
    { year: 'Y2', value: -(capexDrag * 0.6) },
    { year: 'Y3', value:  netBenefit * 0.35  },
    { year: 'Y4', value:  netBenefit * 0.70  },
    { year: 'Y5', value:  netBenefit * 1.00  },
  ]

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 10, right: 4, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey="year"
          tick={{ fill: '#64748b', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => `${v.toFixed(1)}%`}
          tick={{ fill: '#64748b', fontSize: 9 }}
          axisLine={false}
          tickLine={false}
          width={38}
        />
        <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1} />
        <Bar dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={28}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.value >= 0 ? '#10B981' : '#EF4444'} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
