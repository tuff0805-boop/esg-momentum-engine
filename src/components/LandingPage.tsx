import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Ticker } from './Ticker'

interface LandingPageProps {
  onLaunch: () => void
  onTabSelect: (tab: 'standardizer' | 'momentum' | 'dcf') => void
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

const FEATURES = [
  {
    num: '01',
    tab: 'standardizer' as const,
    title: 'ESG Score Standardizer',
    desc: 'We normalize scores from MSCI, Sustainalytics, and Bloomberg into one reliable score. High provider divergence flags mispriced opportunities.',
    btn: 'Explore Standardizer →',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="2" y="2" width="8" height="8" rx="1" fill="#00C087" opacity="0.8"/>
        <rect x="12" y="2" width="8" height="8" rx="1" fill="#00C087" opacity="0.5"/>
        <rect x="22" y="2" width="8" height="8" rx="1" fill="#00C087" opacity="0.3"/>
        <rect x="2" y="12" width="8" height="8" rx="1" fill="#00C087" opacity="0.5"/>
        <rect x="12" y="12" width="8" height="8" rx="1" fill="#00C087" opacity="0.8"/>
        <rect x="22" y="12" width="8" height="8" rx="1" fill="#00C087" opacity="0.5"/>
        <rect x="2" y="22" width="8" height="8" rx="1" fill="#00C087" opacity="0.3"/>
        <rect x="12" y="22" width="8" height="8" rx="1" fill="#00C087" opacity="0.5"/>
        <rect x="22" y="22" width="8" height="8" rx="1" fill="#00C087" opacity="0.8"/>
      </svg>
    ),
  },
  {
    num: '02',
    tab: 'momentum' as const,
    title: 'ESG Momentum Engine',
    desc: 'We track ESG trajectory — not just where companies stand, but how fast they\'re improving. Companies accelerating fastest are flagged as Outperform.',
    btn: 'Explore Momentum →',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <polyline points="2,26 10,18 16,22 24,10 30,6" stroke="#00C087" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="22,6 30,6 30,14" stroke="#00C087" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    num: '03',
    tab: 'dcf' as const,
    title: 'Financial Materiality Index',
    desc: 'We translate ESG improvements into a target price impact through four channels: revenue, costs, capex, and risk. ESG meets valuation.',
    btn: 'Explore Materiality →',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="13" stroke="#00C087" strokeWidth="2"/>
        <circle cx="16" cy="16" r="8" stroke="#00C087" strokeWidth="1.5" opacity="0.6"/>
        <circle cx="16" cy="16" r="3" fill="#00C087"/>
      </svg>
    ),
  },
]

const STATS = [
  { value: '10', label: 'ASEAN Brown Industry Companies' },
  { value: '3', label: 'ESG Rating Providers Standardized' },
  { value: '9.2%', label: 'Average ESG CAGR — Universe' },
  { value: '55.1%', label: 'ESG Improvers vs 6.4% MSCI ASEAN Benchmark' },
]

export function LandingPage({ onLaunch, onTabSelect }: LandingPageProps) {
  return (
    <div style={{ minHeight: '100vh', background: '#080B10', display: 'flex', flexDirection: 'column' }}>
      {/* TOP BAR */}
      <div style={{ height: 64, borderBottom: '1px solid #1E2836', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <div style={{ borderRadius: 6, overflow: 'hidden' }}>
            <img src="/cgsi_logo.png" style={{ height: 32, display: 'block' }} alt="CGS International" />
          </div>
          <div style={{ width: 1, height: 28, background: '#2A3A4A', margin: '0 18px' }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>ESG Intelligence</div>
            <div style={{ fontSize: 12, color: '#4A5568' }}>Powered by CGS International · iTrade</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ background: '#E8323C', color: '#fff', fontSize: 11, fontWeight: 600,
            padding: '4px 12px', borderRadius: 3, letterSpacing: '0.02em' }}>
            PolyFinTech100 2026
          </div>
          <div style={{ width: 1, height: 20, background: '#1E2836' }} />
          <SGTClock />
        </div>
      </div>

      {/* HERO SECTION */}
      <motion.div
        initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
        style={{
          minHeight: '55vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', textAlign: 'center', padding: '80px 24px',
          position: 'relative',
          backgroundImage: 'url(/windmill.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(8,11,16,0.55) 0%, rgba(8,11,16,0.75) 60%, rgba(8,11,16,0.95) 100%)',
          zIndex: 0,
        }} />
        {/* Text content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#E8323C', marginBottom: 20 }}>
            Introducing
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 700, color: '#E8EDF2', lineHeight: 1.1, margin: '0 auto 8px' }}>
            The Next Generation of
          </h1>
          <h1 style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.1, margin: '0 auto 24px',
            background: 'linear-gradient(135deg, #00C087, #1E6FD9)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            ESG Intelligence.
          </h1>
          <p style={{ fontSize: 16, color: '#8B9AAB', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            From static scores to dynamic intelligence. We find the companies becoming great before the market does — and we put a price on it.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <motion.button
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              onClick={onLaunch}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{ fontSize: 16, fontWeight: 600, color: '#fff', background: '#E8323C', border: 'none',
                borderRadius: 6, padding: '14px 32px', cursor: 'pointer' }}
            >
              Launch Dashboard →
            </motion.button>
            <a
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ fontSize: 12, color: '#00C087', cursor: 'pointer', textDecoration: 'none' }}
            >
              View methodology ↓
            </a>
          </div>
        </div>
      </motion.div>

      {/* FEATURES SECTION */}
      <div id="features" style={{ padding: '64px 40px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8B9AAB',
          marginBottom: 32, textAlign: 'center' }}>How It Works</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.num}
              initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              style={{ background: '#0D1117', border: '1px solid #1E2836', borderRadius: 8, padding: 32 }}>
              <div style={{ marginBottom: 16 }}>{f.icon}</div>
              <div style={{ fontSize: 11, color: '#E8323C', textTransform: 'uppercase',
                letterSpacing: '0.1em', marginBottom: 8 }}>{f.num}</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#E8EDF2', marginBottom: 12 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: '#8B9AAB', lineHeight: 1.6, marginBottom: 20 }}>{f.desc}</div>
              <button onClick={() => onTabSelect(f.tab)}
                style={{ fontSize: 13, color: '#00C087', background: 'transparent', border: 'none',
                  cursor: 'pointer', padding: 0 }}>
                {f.btn}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* STATS BAR — between features and ticker */}
      <div style={{ borderTop: '1px solid #1E2836', borderBottom: '1px solid #1E2836',
        padding: '32px 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
        {STATS.map((s, i) => (
          <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 * i, duration: 0.5 }}
            style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#00C087', fontFamily: 'monospace' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#8B9AAB', marginTop: 4 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* TICKER */}
      <Ticker />

      {/* BOTTOM BAR */}
      <div style={{ padding: '16px 40px', borderTop: '1px solid #1E2836' }}>
        <div style={{ fontSize: 11, color: '#4A5568', textAlign: 'center' }}>
          © 2026 CGS International · iTrade ESG Intelligence Module · PolyFinTech100 2026 Hackathon · Sample data for illustrative purposes only
        </div>
      </div>
    </div>
  )
}
