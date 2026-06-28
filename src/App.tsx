import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Company, NewsItem } from './data/companies'
import { companies as ALL_COMPANIES } from './data/companies'
import { calcSES } from './lib/esg'
import { TopNav } from './components/TopNav'
import { MethodologyPage } from './components/methodology/MethodologyPage'
import { GuidedTour } from './components/GuidedTour'
import { StandardizerPanel } from './components/standardizer/StandardizerPanel'
import { MomentumPanel } from './components/momentum/MomentumPanel'
import { DCFPanel } from './components/dcf/DCFPanel'
import { CompanyDrawer } from './components/shared/CompanyDrawer'
import { Chatbot } from './components/Chatbot'
import { Tooltip } from './components/shared/Tooltip'
import { LandingPage } from './components/LandingPage'
import { Ticker } from './components/Ticker'
import { EventAnalyticsModal } from './components/EventAnalyticsModal'
import { ESGScreener } from './components/screener/ESGScreener'
import { CompanyComparison } from './components/comparison/CompanyComparison'
import { PortfolioBuilder } from './components/portfolio/PortfolioBuilder'

type Sector   = 'All' | 'Energy' | 'Materials' | 'Industrials'
type Tab      = 'standardizer' | 'momentum' | 'dcf' | 'screener' | 'compare' | 'portfolio' | 'methodology'
type ViewMode = 'retail' | 'analyst'

export default function App() {
  const [showLanding, setShowLanding]         = useState(true)
  const [activeSector, setActiveSector]       = useState<Sector>('All')
  const [activeTab, setActiveTab]             = useState<Tab>('standardizer')
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [viewMode, setViewMode]               = useState<ViewMode>('analyst')
  const [tabKey, setTabKey]                   = useState(0)
  const [selectedEvent, setSelectedEvent]     = useState<{ item: NewsItem; companyName: string; ses: number } | null>(null)
  const [showTour, setShowTour]               = useState(false)

  const handleTabChange = (t: Tab) => {
    setActiveTab(t)
    setTabKey(k => k + 1)
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [activeSector])

  const onSelect = useCallback((c: Company) => setSelectedCompany(c), [])

  return (
    <AnimatePresence mode="wait">
    {showLanding ? (
      <motion.div
        key="landing"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <LandingPage
          onLaunch={() => setShowLanding(false)}
          onTabSelect={(tab) => { setShowLanding(false); setActiveTab(tab as Tab); setTabKey(k => k + 1) }}
        />
      </motion.div>
    ) : (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#080B10' }}
    >
      {/* ── Header 72px ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          height: 72,
          minHeight: 72,
          background: '#080B10',
          borderBottom: '1px solid #1E2836',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        {/* Left: CGS logo + divider + title */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <div
            onClick={() => setShowLanding(true)}
            title="Back to Overview"
            style={{ borderRadius: 6, overflow: 'hidden', flexShrink: 0, cursor: 'pointer', opacity: 1, transition: 'opacity 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.75' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
          >
            <img src="/cgsi_logo.png" alt="CGS International" style={{ height: 32, width: 'auto', display: 'block' }} />
          </div>
          <div style={{ width: 1, height: 28, background: '#2A3A4A', margin: '0 18px', flexShrink: 0 }} />
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#E8EDF2', lineHeight: 1.2, whiteSpace: 'nowrap' }}>ESG Intelligence</div>
            <div style={{ fontSize: 12, color: '#4A5568', whiteSpace: 'nowrap' }}>iTrade · Brown Industries · ASEAN</div>
          </div>
        </div>

        {/* Right: toggle + divider + clock + badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Retail/Analyst toggle */}
          <div style={{ display: 'flex', border: '1px solid #1E2836', borderRadius: 3, overflow: 'hidden' }}>
            {(['retail', 'analyst'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '5px 14px',
                  fontSize: 13,
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
          <div style={{ width: 1, height: 20, background: '#1E2836' }} />
          <SGTClock />
          <div style={{ width: 1, height: 20, background: '#1E2836' }} />
          <div style={{ fontSize: 12, fontWeight: 600, background: 'rgba(232,50,60,0.12)', color: '#E8323C', padding: '4px 10px', borderRadius: 3 }}>
            PFT100 2026
          </div>
        </div>
      </motion.header>

      {/* ── Top Nav ── */}
      <TopNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        activeSector={activeSector}
        onSectorChange={setActiveSector}
        onHelpClick={() => setShowTour(true)}
        onBackToLanding={() => setShowLanding(true)}
      />

      {/* ── Main content — full width ── */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#080B10', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1, maxWidth: 1400, margin: '0 auto', padding: '14px 24px', width: '100%' }}>
          <motion.div
            key={tabKey}
            initial={{ x: 8, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {activeTab === 'standardizer' && (
              <StandardizerPanel
                activeSector={activeSector}
                onSelect={onSelect}
                animKey={tabKey}
                viewMode={viewMode}
                onEventClick={(item, companyName, ses) => setSelectedEvent({ item, companyName, ses })}
              />
            )}
            {activeTab === 'momentum' && (
              <MomentumPanel activeSector={activeSector} onSelect={onSelect} animKey={tabKey} viewMode={viewMode} />
            )}
            {activeTab === 'dcf' && (
              <DCFPanel activeSector={activeSector} onSelect={onSelect} viewMode={viewMode} />
            )}
            {activeTab === 'screener' && (
              <ESGScreener allCompanies={ALL_COMPANIES} onSelect={onSelect} />
            )}
            {activeTab === 'compare' && (
              <CompanyComparison allCompanies={ALL_COMPANIES} onSelectCompany={onSelect} />
            )}
            {activeTab === 'portfolio' && (
              <PortfolioBuilder allCompanies={ALL_COMPANIES} onSelectCompany={onSelect} />
            )}
            {activeTab === 'methodology' && <MethodologyPage />}
          </motion.div>
        </main>
        <footer style={{ padding: '10px 20px', textAlign: 'center', fontSize: 10, color: '#4A5568', borderTop: '1px solid #1E2836' }}>
          CGS International · iTrade ESG Intelligence Module · PolyFinTech100 2026
        </footer>
        <Ticker />
      </div>

      <AnimatePresence>
        {selectedCompany && (
          <CompanyDrawer
            key={selectedCompany.name}
            company={selectedCompany}
            allCompanies={ALL_COMPANIES}
            onClose={() => setSelectedCompany(null)}
            onEventClick={(item) => {
              if (selectedCompany) {
                const ses = calcSES(selectedCompany, ALL_COMPANIES)
                setSelectedEvent({ item, companyName: selectedCompany.name, ses })
              }
            }}
          />
        )}
      </AnimatePresence>

      {selectedEvent && (
        <EventAnalyticsModal
          item={selectedEvent.item}
          companyName={selectedEvent.companyName}
          companySES={selectedEvent.ses}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {viewMode === 'analyst' && <Chatbot />}
      {showTour && <GuidedTour activeTab={activeTab} onClose={() => setShowTour(false)} />}
    </motion.div>
    )}
    </AnimatePresence>
  )
}

function SGTClock() {
  const [time, setTime] = useState(() => getSGT())
  useEffect(() => {
    const id = setInterval(() => setTime(getSGT()), 1000)
    return () => clearInterval(id)
  }, [])
  return <span style={{ fontSize: 14, fontFamily: 'monospace', color: '#8B9AAB' }}>{time} SGT</span>
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
