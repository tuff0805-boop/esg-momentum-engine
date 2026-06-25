import { motion } from 'framer-motion'

type Tab    = 'standardizer' | 'momentum' | 'dcf'
type Sector = 'All' | 'Energy' | 'Materials' | 'Industrials'

interface SidebarProps {
  activeTab: Tab
  activeSector: Sector
  onTabChange: (t: Tab) => void
  onSectorChange: (s: Sector) => void
}

const NAV_ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: 'standardizer', label: 'ESG Standardizer',    icon: '▦' },
  { id: 'momentum',     label: 'ESG Momentum',         icon: '◈' },
  { id: 'dcf',         label: 'Financial Materiality', icon: '◎' },
]

const SECTOR_ITEMS: { id: Sector; label: string }[] = [
  { id: 'All',         label: 'All Companies' },
  { id: 'Energy',      label: 'Energy' },
  { id: 'Materials',   label: 'Materials' },
  { id: 'Industrials', label: 'Industrials' },
]

const SECTOR_COUNTS: Record<Sector, number> = { All: 10, Energy: 3, Materials: 4, Industrials: 3 }
const SECTOR_DOTS: Record<Sector, string> = {
  All: '#E8EDF2', Energy: '#C4A85A', Materials: '#00C087', Industrials: '#1E6FD9'
}

export function Sidebar({ activeTab, activeSector, onTabChange, onSectorChange }: SidebarProps) {
  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#080B10',
        borderRight: '1px solid #1E2836',
        position: 'relative',
      }}
    >
      {/* Logo area */}
      <div
        style={{
          height: 64,
          minHeight: 64,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          borderBottom: '1px solid #1E2836',
        }}
      >
        <img src="/cgsi_logo.png" alt="CGS International" style={{ height: 24, width: 'auto', objectFit: 'contain' }} />
      </div>

      {/* Nav items */}
      <nav style={{ padding: '8px 0' }}>
        {NAV_ITEMS.map((item, i) => {
          const isActive = activeTab === item.id
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.05, duration: 0.2 }}
              whileHover={{ x: 2 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                height: 52,
                padding: '0 20px',
                fontSize: 15,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? '#E8EDF2' : '#8B9AAB',
                background: isActive ? '#0D1117' : 'transparent',
                border: 'none',
                borderLeft: isActive ? '2px solid #E8323C' : '2px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'color 0.15s, background 0.15s',
              }}
            >
              <span style={{ fontSize: 18, opacity: isActive ? 1 : 0.6, width: 20, textAlign: 'center', flexShrink: 0 }}>
                {item.icon}
              </span>
              <span style={{ flex: 1, whiteSpace: 'nowrap' }}>
                {item.label}
              </span>
              {isActive && (
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#E8323C', flexShrink: 0 }} />
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* Divider */}
      <div style={{ height: 1, background: '#1E2836', margin: '4px 16px' }} />

      {/* Sector filter */}
      <div style={{ padding: '0 0 8px' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, color: '#4A5568', padding: '12px 20px 6px' }}>
          Sector
        </div>
        {SECTOR_ITEMS.map((item, i) => {
          const isActive = activeSector === item.id
          const dot      = SECTOR_DOTS[item.id]
          return (
            <motion.button
              key={item.id}
              onClick={() => onSectorChange(item.id)}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15 + i * 0.05, duration: 0.2 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                height: 44,
                padding: '0 20px',
                fontSize: 14,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? '#E8EDF2' : '#8B9AAB',
                background: isActive ? '#0D1117' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.color = '#E8EDF2'
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.color = '#8B9AAB'
              }}
            >
              <span
                style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: isActive ? dot : '#2A3A4A',
                  flexShrink: 0,
                  transition: 'background 0.15s',
                }}
              />
              <span style={{ flex: 1 }}>{item.label}</span>
              <span style={{ fontSize: 12, color: '#4A5568', fontFamily: 'monospace' }}>
                {SECTOR_COUNTS[item.id]}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 'auto',
          borderTop: '1px solid #1E2836',
          padding: '12px 16px',
        }}
      >
        <div style={{ fontSize: 10, color: '#4A5568', lineHeight: 1.6 }}>
          <div>PolyFinTech100 2026</div>
          <div>CGS International</div>
        </div>
      </div>
    </aside>
  )
}
