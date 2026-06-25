type Tab = 'standardizer' | 'momentum' | 'dcf'
type Sector = 'All' | 'Energy' | 'Materials' | 'Industrials'

interface SubNavProps {
  activeTab: Tab
  activeSector: Sector
  onTabChange: (t: Tab) => void
  onSectorChange: (s: Sector) => void
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'standardizer', label: 'ESG Standardizer' },
  { id: 'momentum',     label: 'ESG Momentum' },
  { id: 'dcf',         label: 'Financial Materiality' },
]

const SECTORS: { id: Sector; label: string }[] = [
  { id: 'All',         label: 'All' },
  { id: 'Energy',      label: 'Energy' },
  { id: 'Materials',   label: 'Materials' },
  { id: 'Industrials', label: 'Industrials' },
]

export function SubNav({ activeTab, activeSector, onTabChange, onSectorChange }: SubNavProps) {
  return (
    <div
      style={{
        height: 40,
        background: '#080B10',
        borderBottom: '1px solid #1E2836',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        paddingLeft: 16,
        paddingRight: 16,
        flexShrink: 0,
      }}
    >
      {/* Left — View tabs */}
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              padding: '0 16px',
              fontSize: 13,
              fontWeight: activeTab === tab.id ? 500 : 400,
              color: activeTab === tab.id ? '#E8EDF2' : '#8B9AAB',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #E8323C' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'color 0.12s, border-color 0.12s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              if (activeTab !== tab.id) (e.currentTarget as HTMLElement).style.color = '#E8EDF2'
            }}
            onMouseLeave={e => {
              if (activeTab !== tab.id) (e.currentTarget as HTMLElement).style.color = '#8B9AAB'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Right — Sector pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {SECTORS.map(s => (
          <button
            key={s.id}
            onClick={() => onSectorChange(s.id)}
            style={{
              padding: '2px 10px',
              fontSize: 11,
              fontWeight: 500,
              color: activeSector === s.id ? '#E8EDF2' : '#8B9AAB',
              background: activeSector === s.id ? '#1E2836' : 'transparent',
              border: `1px solid ${activeSector === s.id ? '#2A3A4A' : '#1E2836'}`,
              borderRadius: 3,
              cursor: 'pointer',
              transition: 'color 0.12s, background 0.12s',
            }}
            onMouseEnter={e => {
              if (activeSector !== s.id) (e.currentTarget as HTMLElement).style.color = '#E8EDF2'
            }}
            onMouseLeave={e => {
              if (activeSector !== s.id) (e.currentTarget as HTMLElement).style.color = '#8B9AAB'
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
