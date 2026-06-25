type Tab = 'standardizer' | 'momentum' | 'dcf'
type Sector = 'All' | 'Energy' | 'Materials' | 'Industrials'

interface SidebarProps {
  activeTab: Tab
  activeSector: Sector
  isDark: boolean
  onTabChange: (t: Tab) => void
  onSectorChange: (s: Sector) => void
  onToggleDark: () => void
}

interface NavItem {
  id: string
  label: string
  icon: string
}

const analysisItems: (NavItem & { tab: Tab })[] = [
  { id: 'standardizer', tab: 'standardizer', label: 'Standardizer',     icon: '⊞' },
  { id: 'momentum',     tab: 'momentum',     label: 'ESG Momentum',     icon: '◈' },
  { id: 'dcf',         tab: 'dcf',          label: 'Financial Materiality', icon: '◉' },
]

const sectorItems: (NavItem & { sector: Sector })[] = [
  { id: 'all',         sector: 'All',         label: 'All Companies', icon: '○' },
  { id: 'energy',      sector: 'Energy',      label: 'Energy',        icon: '⚡' },
  { id: 'materials',   sector: 'Materials',   label: 'Materials',     icon: '◆' },
  { id: 'industrials', sector: 'Industrials', label: 'Industrials',   icon: '⚙' },
]

export function Sidebar({ activeTab, activeSector, isDark, onTabChange, onSectorChange, onToggleDark }: SidebarProps) {
  const navLabel = 'text-[10px] uppercase tracking-[0.1em] font-semibold px-3 mb-1 mt-4 first:mt-0'

  const tabCls = (id: string) =>
    `flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-0 bg-transparent text-left ${
      activeTab === id
        ? 'bg-accent/10 text-accent'
        : 'text-secondary hover:bg-black/5 hover:text-primary'
    }`

  const darkTabCls = (id: string) =>
    `flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-0 bg-transparent text-left ${
      activeTab === id
        ? 'bg-blue-600/15 text-blue-400'
        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
    }`

  const sectorCls = (s: string) =>
    `flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-0 bg-transparent text-left ${
      activeSector === s
        ? 'bg-accent/10 text-accent'
        : 'text-secondary hover:bg-black/5 hover:text-primary'
    }`

  const darkSectorCls = (s: string) =>
    `flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-0 bg-transparent text-left ${
      activeSector === s
        ? 'bg-blue-600/15 text-blue-400'
        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
    }`

  const tc = isDark ? darkTabCls : tabCls
  const sc = isDark ? darkSectorCls : sectorCls
  const borderColor = isDark ? 'border-white/6' : 'border-slate-200'
  const sidebarBg = isDark ? 'bg-[#080D1A]' : 'bg-white'
  const sectionLabel = isDark ? 'text-slate-600' : 'text-slate-400'

  return (
    <aside className={`w-[220px] flex-shrink-0 flex flex-col h-screen sticky top-0 border-r ${borderColor} ${sidebarBg}`}>
      {/* Logo */}
      <div className={`px-4 py-5 border-b ${borderColor}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">E</span>
          </div>
          <div>
            <div className={`text-sm font-semibold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>ESG Intelligence</div>
            <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>iTrade &middot; CGS International</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <div className={`${navLabel} ${sectionLabel}`}>View</div>
        {analysisItems.map(item => (
          <button key={item.id} onClick={() => onTabChange(item.tab)} className={tc(item.id)}>
            <span className="text-[13px] opacity-70 w-4 text-center">{item.icon}</span>
            <span>{item.label}</span>
            {activeTab === item.id && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
            )}
          </button>
        ))}

        <div className={`${navLabel} ${sectionLabel} mt-4`}>Filter by Sector</div>
        <div className={`text-[10px] px-3 mb-1 ${sectionLabel}`}>Filters all views simultaneously</div>
        {sectorItems.map(item => (
          <button key={item.id} onClick={() => onSectorChange(item.sector)} className={sc(item.sector)} title="Selecting a sector filters the data shown in all three views above">
            <span className="text-[13px] opacity-70 w-4 text-center">{item.icon}</span>
            <span>{item.label}</span>
            {activeSector === item.sector && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
            )}
          </button>
        ))}

        <div className={`${navLabel} ${sectionLabel}`}>Settings</div>
        <button
          onClick={onToggleDark}
          className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-0 bg-transparent text-left ${isDark ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200' : 'text-secondary hover:bg-black/5 hover:text-primary'}`}
        >
          <span className="text-[13px] opacity-70 w-4 text-center">{isDark ? '☀' : '☽'}</span>
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </nav>

      {/* Footer */}
      <div className={`px-4 py-4 border-t ${borderColor}`}>
        <div className={`text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-400'} leading-relaxed`}>
          <div className="font-semibold mb-0.5">CGS International &middot; iTrade ESG Intelligence Module</div>
          <div>PolyFinTech100 2026</div>
        </div>
      </div>
    </aside>
  )
}
