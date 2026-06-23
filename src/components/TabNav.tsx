type Tab = 'standardizer' | 'momentum' | 'dcf'

interface TabNavProps {
  active: Tab
  onChange: (t: Tab) => void
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'standardizer', label: 'Process Standardizer' },
  { id: 'momentum',     label: 'ESG CAGR Momentum'   },
  { id: 'dcf',         label: 'DCF Valuation'        },
]

export function TabNav({ active, onChange }: TabNavProps) {
  return (
    <div className="border-b border-white/5 px-6">
      <div className="flex gap-1 max-w-screen-2xl mx-auto">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all -mb-px ${
              active === t.id
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="text-[11px] opacity-60">{i + 1}.</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
