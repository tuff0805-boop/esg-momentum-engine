import { motion } from 'framer-motion'

type Tab = 'standardizer' | 'momentum' | 'dcf' | 'screener' | 'compare' | 'portfolio' | 'methodology'
type Sector = 'All' | 'Energy' | 'Materials' | 'Industrials'

interface TopNavProps {
  activeTab: Tab
  onTabChange: (t: Tab) => void
  activeSector: Sector
  onSectorChange: (s: Sector) => void
  onHelpClick: () => void
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'standardizer',  label: 'ESG Standardizer'       },
  { id: 'momentum',      label: 'ESG Momentum'            },
  { id: 'dcf',           label: 'Financial Materiality'   },
  { id: 'screener',      label: 'ESG Screener'            },
  { id: 'compare',       label: 'Compare'                 },
  { id: 'portfolio',     label: 'Portfolio'               },
  { id: 'methodology',   label: 'Methodology'             },
]

const SECTORS: Sector[] = ['All', 'Energy', 'Materials', 'Industrials']

export function TopNav({ activeTab, onTabChange, activeSector, onSectorChange, onHelpClick }: TopNavProps) {
  return (
    <div style={{
      height: 44, minHeight: 44, flexShrink: 0,
      background: '#080B10',
      borderBottom: '1px solid #1E2836',
      display: 'flex', alignItems: 'stretch',
      justifyContent: 'space-between',
      zIndex: 15,
    }}>
      {/* LEFT: Tab items */}
      <div style={{ display: 'flex', alignItems: 'stretch', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                position: 'relative',
                padding: '0 18px',
                height: '100%',
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? '#E8EDF2' : '#8B9AAB',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#C8D3DC' }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#8B9AAB' }}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="tab-underline"
                  style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: 2, background: '#E8323C', borderRadius: '1px 1px 0 0',
                  }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                />
              )}
            </button>
          )
        })}

        {/* Help button — shown next to active tab indicator */}
        <button
          onClick={onHelpClick}
          title="How to use this tab"
          style={{
            alignSelf: 'center',
            width: 20, height: 20, borderRadius: '50%',
            background: 'rgba(139,154,171,0.12)', border: '1px solid #2A3A4A',
            fontSize: 11, color: '#8B9AAB', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginLeft: 4, transition: 'all 0.12s', flexShrink: 0,
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(232,50,60,0.15)'; el.style.borderColor = '#E8323C'; el.style.color = '#E8323C' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(139,154,171,0.12)'; el.style.borderColor = '#2A3A4A'; el.style.color = '#8B9AAB' }}
        >
          ?
        </button>
      </div>

      {/* RIGHT: Sector filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', borderLeft: '1px solid #1E2836' }}>
        <span style={{ fontSize: 10, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 4, flexShrink: 0 }}>Sector:</span>
        {SECTORS.map(s => {
          const isActive = activeSector === s
          return (
            <button
              key={s}
              onClick={() => onSectorChange(s)}
              style={{
                fontSize: 11, fontWeight: isActive ? 500 : 400,
                color: isActive ? '#E8EDF2' : '#8B9AAB',
                background: isActive ? '#1E2836' : 'transparent',
                border: `1px solid ${isActive ? '#2A3A4A' : '#1E2836'}`,
                borderRadius: 3, padding: '3px 10px', cursor: 'pointer',
                transition: 'all 0.12s', whiteSpace: 'nowrap',
              }}
            >
              {s}
            </button>
          )
        })}
      </div>
    </div>
  )
}
