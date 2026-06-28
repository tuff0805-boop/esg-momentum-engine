import { motion, AnimatePresence } from 'framer-motion'

type Tab = 'standardizer' | 'momentum' | 'dcf' | 'screener' | 'compare' | 'portfolio' | 'methodology'

interface GuidedTourProps {
  activeTab: Tab
  onClose: () => void
}

const TOUR_CONTENT: Record<Tab, { title: string; steps: string[] }> = {
  standardizer: {
    title: 'ESG Standardizer',
    steps: [
      'View pillar events by E / S / G / I column — each column shows real universe events.',
      'Click any event card to open the Agency Analysis modal and see how MSCI, Sustainalytics, and Bloomberg would react.',
      'Switch to "Provider Scores" sub-tab to see the full score table with divergence indicators.',
      'High divergence between providers signals a potential mispricing opportunity.',
    ],
  },
  momentum: {
    title: 'ESG Momentum Engine',
    steps: [
      'The scatter matrix plots ESG Score (x-axis) vs CAGR (y-axis) — four quadrants show different signal types.',
      'Top-right = Outperform (high score AND high momentum). Top-left = Strong Buy (low score, high momentum).',
      'Click any company dot to open the full company analysis modal.',
      'Switch to "Score Trends" sub-tab to see 5-year trajectory for all companies at once.',
    ],
  },
  dcf: {
    title: 'Financial Materiality',
    steps: [
      'Select a company from the top dropdown to see its ESG-adjusted DCF model.',
      'Four financial channels (Revenue Uplift, Op Cost, Capex, WACC) combine into a target price adjustment.',
      'Bear / Base / Bull scenarios reflect uncertainty in ESG trajectory.',
      'Scroll down to the All Companies table for a cross-universe comparison.',
    ],
  },
  screener: {
    title: 'ESG Screener',
    steps: [
      'Use the checkboxes on the left to filter companies by ESG Signal, Sector, and Rating Forecast.',
      'Adjust the CAGR and Momentum sliders to surface companies with the best improving trajectories.',
      'Results update instantly — no submit button needed.',
      'Click "Analyse →" on any result row to open the full company analysis.',
    ],
  },
  compare: {
    title: 'Company Compare',
    steps: [
      'Use the two dropdowns at the top to select any two companies for side-by-side analysis.',
      'Green values indicate the winner on each metric row.',
      'The "ESG LEADER" badge marks the overall winner based on momentum score.',
      'The butterfly chart shows E/S/G/I pillar scores — teal bars = Company A, blue = Company B.',
    ],
  },
  portfolio: {
    title: 'Portfolio Builder',
    steps: [
      'Click any company card to add it to your portfolio. Click again to remove.',
      'Or use Quick Presets (ESG Leaders, Diversified ASEAN, High Upside) for instant portfolios.',
      'Adjust weight sliders to set custom allocations — they auto-rebalance when you add/remove companies.',
      'The Benchmark chart shows how your portfolio compares to MSCI ASEAN average.',
    ],
  },
  methodology: {
    title: 'Methodology',
    steps: [
      'This page explains the full intellectual foundation behind the ESG Momentum Engine.',
      'Section 2 shows the exact scoring formulae used to compute every number in the system.',
      'Section 4 cites the academic research underpinning our approach.',
      'Share this page with judges or analysts who want to understand the methodology.',
    ],
  },
}

export function GuidedTour({ activeTab, onClose }: GuidedTourProps) {
  const content = TOUR_CONTENT[activeTab]

  return (
    <AnimatePresence>
      <motion.div
        key="tour-backdrop"
        style={{ position: 'fixed', inset: 0, zIndex: 300 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        key="tour-panel"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 320, background: '#0D1117',
          borderLeft: '1px solid #2A3A4A',
          zIndex: 301, display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
        }}
        initial={{ x: 320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 320, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E2836', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 10, color: '#E8323C', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>How to use</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#E8EDF2' }}>{content.title}</div>
          </div>
          <button onClick={onClose} style={{ color: '#8B9AAB', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Steps */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>
          {content.steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.07, duration: 0.25 }}
              style={{ display: 'flex', gap: 12, marginBottom: 16 }}
            >
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(232,50,60,0.12)', border: '1px solid #E8323C44',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#E8323C',
              }}>{i + 1}</div>
              <div style={{ fontSize: 13, color: '#C8D3DC', lineHeight: 1.6, paddingTop: 3 }}>{step}</div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: 20, borderTop: '1px solid #1E2836' }}>
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '10px 0', fontSize: 13, fontWeight: 500,
              color: '#E8EDF2', background: '#E8323C', border: 'none', borderRadius: 4, cursor: 'pointer',
            }}
          >
            Got it
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
