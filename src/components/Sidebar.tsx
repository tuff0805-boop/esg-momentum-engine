import React from 'react'

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

const analysisItems: { id: string; tab: Tab; label: string; icon: string }[] = [
  { id: 'standardizer', tab: 'standardizer', label: 'Standardizer',        icon: '⊞' },
  { id: 'momentum',     tab: 'momentum',     label: 'ESG Momentum',         icon: '◈' },
  { id: 'dcf',         tab: 'dcf',          label: 'Financial Materiality', icon: '◉' },
]

const sectorItems: { id: string; sector: Sector; label: string; icon: string }[] = [
  { id: 'all',         sector: 'All',         label: 'All Companies', icon: '○' },
  { id: 'energy',      sector: 'Energy',      label: 'Energy',        icon: '⚡' },
  { id: 'materials',   sector: 'Materials',   label: 'Materials',     icon: '◆' },
  { id: 'industrials', sector: 'Industrials', label: 'Industrials',   icon: '⚙' },
]

export function Sidebar({ activeTab, activeSector, isDark, onTabChange, onSectorChange, onToggleDark }: SidebarProps) {
  const isLight = !isDark

  const sidebarBg    = isLight ? '#FFFFFF'  : '#111827'
  const borderCol    = isLight ? '#E2E8F0'  : '#2A3441'
  const labelCol     = isLight ? '#94A3B8'  : '#4B5563'
  const inactiveText = isLight ? '#64748B'  : '#8B9AAB'
  const activeText   = isLight ? '#E8323C'  : '#FFFFFF'
  const hoverBg      = isLight ? '#F8FAFC'  : '#1F2937'
  const activeBg     = isLight ? '#FEF2F2'  : '#1F2937'
  const footerText   = isLight ? '#94A3B8'  : '#4B5563'
  const titleText    = isLight ? '#0F172A'  : '#FFFFFF'
  const subtitleText = isLight ? '#64748B'  : '#8B9AAB'

  const navItemBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    transition: 'background 0.12s, color 0.12s',
    borderLeft: '3px solid transparent',
    marginBottom: '2px',
  }

  const tabStyle = (id: string): React.CSSProperties => ({
    ...navItemBase,
    background: activeTab === id ? activeBg : 'transparent',
    color: activeTab === id ? activeText : inactiveText,
    borderLeft: activeTab === id ? '3px solid #E8323C' : '3px solid transparent',
    fontWeight: activeTab === id ? 700 : 500,
  })

  const sectorStyle = (s: string): React.CSSProperties => ({
    ...navItemBase,
    background: activeSector === s ? activeBg : 'transparent',
    color: activeSector === s ? activeText : inactiveText,
    borderLeft: activeSector === s ? '3px solid #E8323C' : '3px solid transparent',
    fontWeight: activeSector === s ? 700 : 500,
  })

  const sectionLabel: React.CSSProperties = {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight: 600,
    color: labelCol,
    padding: '0 12px',
    marginTop: '16px',
    marginBottom: '4px',
    display: 'block',
  }

  return (
    <aside
      style={{
        width: 230,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: sidebarBg,
        borderRight: `1px solid ${borderCol}`,
      }}
    >
      {/* Logo area */}
      <div style={{ padding: '20px 16px 16px', borderBottom: `1px solid ${borderCol}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: '#00C087',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 900 }}>ESG</span>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: titleText, lineHeight: 1.2 }}>ESG Intelligence</div>
            <div style={{ fontSize: 10, color: subtitleText, marginTop: 1 }}>iTrade &middot; CGS International</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
        <span style={sectionLabel}>View</span>
        {analysisItems.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.tab)}
            style={tabStyle(item.id)}
            onMouseEnter={e => {
              if (activeTab !== item.id) (e.currentTarget as HTMLElement).style.background = hoverBg
            }}
            onMouseLeave={e => {
              if (activeTab !== item.id) (e.currentTarget as HTMLElement).style.background = 'transparent'
            }}
          >
            <span style={{ fontSize: 12, opacity: 0.7, width: 16, textAlign: 'center' }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {activeTab === item.id && (
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8323C', flexShrink: 0 }} />
            )}
          </button>
        ))}

        <span style={sectionLabel}>Filter by Sector</span>
        <div style={{ fontSize: 10, color: labelCol, padding: '0 12px 6px', lineHeight: 1.4 }}>
          Filters all views simultaneously
        </div>
        {sectorItems.map(item => (
          <button
            key={item.id}
            onClick={() => onSectorChange(item.sector)}
            style={sectorStyle(item.sector)}
            title="Selecting a sector filters the data shown in all three views above"
            onMouseEnter={e => {
              if (activeSector !== item.sector) (e.currentTarget as HTMLElement).style.background = hoverBg
            }}
            onMouseLeave={e => {
              if (activeSector !== item.sector) (e.currentTarget as HTMLElement).style.background = 'transparent'
            }}
          >
            <span style={{ fontSize: 12, opacity: 0.7, width: 16, textAlign: 'center' }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {activeSector === item.sector && (
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8323C', flexShrink: 0 }} />
            )}
          </button>
        ))}

        <span style={sectionLabel}>Settings</span>
        <button
          onClick={onToggleDark}
          style={{ ...navItemBase, color: inactiveText }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = hoverBg }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
          <span style={{ fontSize: 12, opacity: 0.7, width: 16, textAlign: 'center' }}>{isDark ? '☀' : '☽'}</span>
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${borderCol}` }}>
        <div style={{ fontSize: 10, color: footerText, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, marginBottom: 1 }}>CGS International &middot; iTrade ESG Intelligence Module</div>
          <div>PolyFinTech100 2026</div>
        </div>
      </div>
    </aside>
  )
}
