
type Sector = 'All' | 'Energy' | 'Materials' | 'Industrials'

interface SectorFilterProps {
  active: Sector
  onChange: (s: Sector) => void
  counts: Record<Sector, number>
}

const sectors: Sector[] = ['All', 'Energy', 'Materials', 'Industrials']

export function SectorFilter({ active, onChange, counts }: SectorFilterProps) {
  return (
    <div className="border-b border-white/5 px-6 py-3">
      <div className="flex items-center gap-2 flex-wrap max-w-screen-2xl mx-auto">
        <span className="text-xs text-slate-600 uppercase tracking-widest mr-1">Sector</span>
        {sectors.map(s => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              active === s
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 border border-white/5 hover:border-white/10 hover:text-slate-200'
            }`}
          >
            {s}
            <span className={`font-mono text-[10px] ${active === s ? 'text-teal-500' : 'text-slate-600'}`}>
              {counts[s]}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
