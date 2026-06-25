import { useState, useCallback, useEffect } from 'react'
import type { Company } from './data/companies'
import { companies as ALL_COMPANIES } from './data/companies'
import { SubNav } from './components/SubNav'
import { StandardizerPanel } from './components/standardizer/StandardizerPanel'
import { MomentumPanel } from './components/momentum/MomentumPanel'
import { DCFPanel } from './components/dcf/DCFPanel'
import { CompanyDrawer } from './components/shared/CompanyDrawer'
import { Chatbot } from './components/Chatbot'
import { Tooltip } from './components/shared/Tooltip'

type Sector   = 'All' | 'Energy' | 'Materials' | 'Industrials'
type Tab      = 'standardizer' | 'momentum' | 'dcf'
type ViewMode = 'retail' | 'analyst'

export default function App() {
  const [activeSector, setActiveSector]       = useState<Sector>('All')
  const [activeTab, setActiveTab]             = useState<Tab>('standardizer')
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [viewMode, setViewMode]               = useState<ViewMode>('analyst')
  const [tabKey, setTabKey]                   = useState(0)

  const handleTabChange = (t: Tab) => {
    setActiveTab(t)
    setTabKey(k => k + 1)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [activeSector])

  const onSelect = useCallback((c: Company) => setSelectedCompany(c), [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#080B10' }}>
      <header
        style={{
          height: 48,
          minHeight: 48,
          background: '#080B10',
          borderBottom: '1px solid #1E2836',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        {/* Left: logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 5, background: '#00C087', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontSize: 9, fontWeight: 900, letterSpacing: '-0.5px' }}>ESG</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#E8EDF2', lineHeight: 1.2 }}>ESG Intelligence</div>
            <div style={{ fontSize: 11, color: '#4A5568' }}>iTrade · CGS International</div>
          </div>
        </div>

        {/* Right: clock + badge + toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SGTClock />
          <div style={{ width: 1, height: 16, background: '#1E2836' }} />
          <div style={{ fontSize: 10, fontWeight: 600, background: 'rgba(232,50,60,0.12)', color: '#E8323C', padding: '2px 8px', borderRadius: 3 }}>
            PFT100 2026
          </div>
          <div style={{ width: 1, height: 16, background: '#1E2836' }} />
          {/* Retail/Analyst toggle */}
          <div style={{ display: 'flex', border: '1px solid #1E2836', borderRadius: 3, overflow: 'hidden' }}>
            {(['retail', 'analyst'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '3px 10px',
                  fontSize: 11,
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === mode ? '#E8323C' : 'transparent',
                  color: viewMode === mode ? '#FFFFFF' : '#8B9AAB',
                  transition: 'background 0.12s, color 0.12s',
                  textTransform: 'capitalize',
                }}
              >
                {mode}
              </button>
            ))}
          </div>
          <Tooltip content="Retail view shows simplified buy/sell signals. Analyst view shows full ESG methodology, scoring model, and DCF valuation." />
        </div>
      </header>

      <SubNav
        activeTab={activeTab}
        activeSector={activeSector}
        onTabChange={handleTabChange}
        onSectorChange={setActiveSector}
      />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <main style={{ maxWidth: 1440, margin: '0 auto', padding: '12px 16px' }}>
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
        <footer style={{ padding: '8px 16px', textAlign: 'center', fontSize: 10, color: '#4A5568', borderTop: '1px solid #1E2836', flexShrink: 0 }}>
          CGS International · iTrade ESG Intelligence Module · PolyFinTech100 2026
        </footer>
      </div>

      <CompanyDrawer
        company={selectedCompany}
        allCompanies={ALL_COMPANIES}
        onClose={() => setSelectedCompany(null)}
      />

      {viewMode === 'analyst' && <Chatbot />}
    </div>
  )
}

function SGTClock() {
  const [time, setTime] = useState(() => getSGT())
  useEffect(() => {
    const id = setInterval(() => setTime(getSGT()), 1000)
    return () => clearInterval(id)
  }, [])
  return <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#8B9AAB' }}>{time} SGT</span>
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
