const TICKERS = [
  { symbol: 'PTT PCL', market: 'TH', price: '32.45', change: '+0.87', pct: '+2.75%', up: true },
  { symbol: 'Sembcorp', market: 'SG', price: '5.82', change: '+0.12', pct: '+2.10%', up: true },
  { symbol: 'Wilmar Intl', market: 'SG', price: '3.41', change: '-0.03', pct: '-0.87%', up: false },
  { symbol: 'Adaro Energy', market: 'ID', price: '2,815', change: '+45', pct: '+1.62%', up: true },
  { symbol: 'Siam Cement', market: 'TH', price: '142.50', change: '+2.50', pct: '+1.79%', up: true },
  { symbol: 'Indocement', market: 'ID', price: '7,250', change: '-50', pct: '-0.68%', up: false },
  { symbol: 'Merdeka CG', market: 'ID', price: '3,125', change: '+25', pct: '+0.81%', up: true },
  { symbol: 'Astra Intl', market: 'ID', price: '5,425', change: '+75', pct: '+1.40%', up: true },
  { symbol: 'Thai Union', market: 'TH', price: '15.20', change: '+0.30', pct: '+2.01%', up: true },
  { symbol: 'Seatrium', market: 'SG', price: '1.84', change: '+0.06', pct: '+3.37%', up: true },
  { symbol: 'DBS Group', market: 'SG', price: '38.50', change: '+0.42', pct: '+1.10%', up: true },
  { symbol: 'Grab', market: 'SG', price: '4.95', change: '-0.08', pct: '-1.59%', up: false },
  { symbol: 'CIMB Group', market: 'MY', price: '7.35', change: '+0.15', pct: '+2.08%', up: true },
  { symbol: 'Bangkok Bank', market: 'TH', price: '142.00', change: '-1.00', pct: '-0.70%', up: false },
  { symbol: 'Ayala Corp', market: 'PH', price: '625.00', change: '+5.00', pct: '+0.81%', up: true },
]

export function Ticker() {
  return (
    <div style={{ height: 36, background: '#0A0D12', borderTop: '1px solid #1E2836',
      display: 'flex', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
      <div style={{ flexShrink: 0, padding: '0 12px', fontSize: 10, fontWeight: 700,
        color: '#E8323C', textTransform: 'uppercase', letterSpacing: '0.1em',
        borderRight: '1px solid #1E2836', height: '100%', display: 'flex', alignItems: 'center',
        background: '#0A0D12', zIndex: 2, whiteSpace: 'nowrap' }}>
        ESG UNIVERSE · LIVE
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div className="ticker-track" style={{ display: 'flex', gap: 0, width: 'max-content' }}>
          {[...TICKERS, ...TICKERS].map((t, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '0 20px', fontSize: 12, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
              <span style={{ color: '#E8EDF2', fontWeight: 600 }}>{t.symbol}</span>
              <span style={{ color: '#8B9AAB' }}>{t.market}</span>
              <span style={{ color: '#8B9AAB' }}>{t.price}</span>
              <span style={{ color: t.up ? '#00C087' : '#E8323C' }}>{t.up ? '▲' : '▼'} {t.change}</span>
              <span style={{ color: t.up ? '#00C087' : '#E8323C' }}>{t.pct}</span>
              <span style={{ color: '#2A3A4A', marginLeft: 8 }}>·</span>
            </span>
          ))}
        </div>
      </div>
      <style>{`
        .ticker-track {
          animation: ticker-scroll 40s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
