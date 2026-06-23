import { useState, useCallback, useEffect } from 'react'
import type { Company } from './data/companies'
import { companies as ALL_COMPANIES } from './data/companies'
import { Sidebar } from './components/Sidebar'
import { StandardizerPanel } from './components/standardizer/StandardizerPanel'
import { MomentumPanel } from './components/momentum/MomentumPanel'
import { DCFPanel } from './components/dcf/DCFPanel'
import { CompanyDrawer } from './components/shared/CompanyDrawer'

type Sector = 'All' | 'Energy' | 'Materials' | 'Industrials'
type Tab    = 'standardizer' | 'momentum' | 'dcf'

const TAB_LABELS: Record<Tab, string> = {
  standardizer: 'ESG Score Standardizer',
  momentum:     'ESG CAGR Momentum',
  dcf:          'DCF Valuation',
}


export default function App() {
  const [activeSector, setActiveSector] = useState<Sector>('All')
  const [activeTab, setActiveTab]       = useState<Tab>('standardizer')
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isDark, setIsDark] = useState(false)
  const [tabKey, setTabKey] = useState(0)

  const handleTabChange = (t: Tab) => {
    setActiveTab(t)
    setTabKey(k => k + 1)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [activeSector])

  const onSelect = useCallback((c: Company) => setSelectedCompany(c), [])

  const topbarBg   = isDark ? 'bg-[#080D1A] border-white/6' : 'bg-white border-slate-200'
  const mainBg     = isDark ? 'bg-[#0A0F1E] text-slate-200' : 'bg-[#F8FAFC] text-slate-900'
  const breadcrumb = isDark ? 'text-slate-500' : 'text-slate-400'
  const clock      = isDark ? 'text-slate-400' : 'text-slate-600'

  return (
    <div className={`flex h-screen overflow-hidden ${mainBg}`}>
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        activeSector={activeSector}
        isDark={isDark}
        onTabChange={handleTabChange}
        onSectorChange={setActiveSector}
        onToggleDark={() => setIsDark(d => !d)}
      />

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top navbar */}
        <header className={`sticky top-0 z-20 flex items-center justify-between px-6 py-3 border-b ${topbarBg}`}>
          <div>
            <div className={`text-xs ${breadcrumb}`}>ESG Momentum Engine</div>
            <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {TAB_LABELS[activeTab]}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Cosmetic search */}
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${isDark ? 'bg-white/5 text-slate-500 border border-white/8' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              Search companies...
            </div>
            {/* SGT clock */}
            <SGTClock className={`text-xs font-mono ${clock}`} />
            {/* PolyFinTech badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-semibold">
              <span>PFT100</span>
              <span className="text-accent/60">2026</span>
            </div>
          </div>
        </header>

        {/* Panel content */}
        <main className="flex-1 p-6 max-w-screen-xl w-full mx-auto">
          {activeTab === 'standardizer' && (
            <StandardizerPanel activeSector={activeSector} onSelect={onSelect} animKey={tabKey} />
          )}
          {activeTab === 'momentum' && (
            <MomentumPanel activeSector={activeSector} onSelect={onSelect} animKey={tabKey} />
          )}
          {activeTab === 'dcf' && (
            <DCFPanel activeSector={activeSector} onSelect={onSelect} />
          )}
        </main>
      </div>

      <CompanyDrawer
        company={selectedCompany}
        allCompanies={ALL_COMPANIES}
        onClose={() => setSelectedCompany(null)}
      />
    </div>
  )
}

function SGTClock({ className }: { className?: string }) {
  const [time, setTime] = useState(() => getSGT())
  useEffect(() => {
    const id = setInterval(() => setTime(getSGT()), 1000)
    return () => clearInterval(id)
  }, [])
  return <span className={className}>{time} SGT</span>
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
