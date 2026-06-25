import { useState, useCallback, useEffect } from 'react'
import type { Company } from './data/companies'
import { companies as ALL_COMPANIES } from './data/companies'
import { Sidebar } from './components/Sidebar'
import { StandardizerPanel } from './components/standardizer/StandardizerPanel'
import { MomentumPanel } from './components/momentum/MomentumPanel'
import { DCFPanel } from './components/dcf/DCFPanel'
import { CompanyDrawer } from './components/shared/CompanyDrawer'
import { Chatbot } from './components/Chatbot'
import { Tooltip } from './components/shared/Tooltip'

type Sector   = 'All' | 'Energy' | 'Materials' | 'Industrials'
type Tab      = 'standardizer' | 'momentum' | 'dcf'
type ViewMode = 'retail' | 'analyst'

const TAB_LABELS: Record<Tab, string> = {
  standardizer: 'ESG Score Standardizer',
  momentum:     'ESG Momentum',
  dcf:          'Financial Materiality Index',
}

export default function App() {
  const [activeSector, setActiveSector]     = useState<Sector>('All')
  const [activeTab, setActiveTab]           = useState<Tab>('standardizer')
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isDark, setIsDark]                 = useState(true)
  const [viewMode, setViewMode]             = useState<ViewMode>('analyst')
  const [tabKey, setTabKey]                 = useState(0)

  const handleTabChange = (t: Tab) => {
    setActiveTab(t)
    setTabKey(k => k + 1)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  useEffect(() => {
    document.documentElement.classList.remove('dark')
    if (!isDark) {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
  }, [isDark])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [activeSector])

  const onSelect = useCallback((c: Company) => setSelectedCompany(c), [])

  const isLight = !isDark
  const mainBg  = isLight ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#0D1117] text-white'

  return (
    <div className={`flex h-screen overflow-hidden ${mainBg}`}>
      <Sidebar
        activeTab={activeTab}
        activeSector={activeSector}
        isDark={isDark}
        onTabChange={handleTabChange}
        onSectorChange={setActiveSector}
        onToggleDark={() => setIsDark(d => !d)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top navbar */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 border-b"
          style={{
            background: isLight ? '#ffffff' : '#0D1117',
            borderColor: isLight ? '#E2E8F0' : '#2A3441',
          }}
        >
          {/* Left: CGS logo + breadcrumb */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pr-3 border-r" style={{ borderColor: isLight ? '#E2E8F0' : '#2A3441' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#E8323C' }}>
                <span className="text-white text-[10px] font-black leading-none">S</span>
              </div>
              <span className="text-sm font-bold" style={{ color: isLight ? '#0F172A' : '#FFFFFF' }}>CGS International</span>
            </div>
            <div>
              <div className="text-[10px] font-medium" style={{ color: '#8B9AAB' }}>
                iTrade ESG Intelligence &middot; {TAB_LABELS[activeTab]}
              </div>
            </div>
          </div>

          {/* Right: view toggle + search + clock + badge */}
          <div className="flex items-center gap-3">
            {/* Retail / Analyst toggle */}
            <div className="flex items-center gap-1.5">
              <div
                className="flex rounded-full overflow-hidden"
                style={{ border: '1px solid #2A3441', background: isLight ? '#F1F5F9' : '#1A2332' }}
              >
                {(['retail', 'analyst'] as ViewMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    style={{
                      padding: '4px 12px',
                      fontSize: 11,
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      background: viewMode === mode ? '#E8323C' : 'transparent',
                      color: viewMode === mode ? '#FFFFFF' : '#8B9AAB',
                      transition: 'background 0.15s, color 0.15s',
                      textTransform: 'capitalize',
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <Tooltip content="Retail view shows simplified buy/sell signals. Analyst view shows full ESG methodology, scoring model, and DCF valuation." />
            </div>

            <div
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
              style={{
                background: isLight ? '#F1F5F9' : '#1A2332',
                border: `1px solid ${isLight ? '#E2E8F0' : '#2A3441'}`,
                color: '#8B9AAB',
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              Search companies...
            </div>
            <SGTClock className="text-xs font-mono hidden sm:block" style={{ color: '#8B9AAB' }} />
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
              style={{ background: 'rgba(232,50,60,0.12)', color: '#E8323C' }}
            >
              <span>PFT100</span>
              <span style={{ opacity: 0.6 }}>2026</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-screen-xl w-full mx-auto">
          {activeTab === 'standardizer' && (
            <StandardizerPanel activeSector={activeSector} onSelect={onSelect} animKey={tabKey} viewMode={viewMode} />
          )}
          {activeTab === 'momentum' && (
            <MomentumPanel activeSector={activeSector} onSelect={onSelect} animKey={tabKey} viewMode={viewMode} />
          )}
          {activeTab === 'dcf' && (
            <DCFPanel activeSector={activeSector} onSelect={onSelect} viewMode={viewMode} />
          )}
        </main>
      </div>

      <CompanyDrawer
        company={selectedCompany}
        allCompanies={ALL_COMPANIES}
        onClose={() => setSelectedCompany(null)}
      />

      {/* AI Chatbot — analyst view only */}
      {viewMode === 'analyst' && <Chatbot />}
    </div>
  )
}

function SGTClock({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const [time, setTime] = useState(() => getSGT())
  useEffect(() => {
    const id = setInterval(() => setTime(getSGT()), 1000)
    return () => clearInterval(id)
  }, [])
  return <span className={className} style={style}>{time} SGT</span>
}

function getSGT(): string {
  return new Date().toLocaleTimeString('en-SG', {
    timeZone: 'Asia/Singapore',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}
