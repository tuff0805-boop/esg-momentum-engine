import React, { useEffect, useState } from 'react'

interface HeaderProps {
  isDark: boolean
  onToggleDark: () => void
}

export function Header({ isDark, onToggleDark }: HeaderProps) {
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString('en-SG', {
          timeZone: 'Asia/Singapore',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header
      className="relative border-b border-white/5 px-6 py-4"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #0A0F1E 0%, #0f1e3a 50%, #0A0F1E 100%)'
          : 'linear-gradient(135deg, #1e293b 0%, #0f2140 50%, #1e293b 100%)',
      }}
    >
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
          <div>
            <div className="text-white font-semibold text-base tracking-tight leading-none">
              ESG Momentum Engine
            </div>
            <div className="text-slate-500 text-xs mt-0.5 tracking-wide">
              Brown Industries · ASEAN
            </div>
          </div>
        </div>

        {/* Center — layer badges */}
        <div className="hidden md:flex items-center gap-2">
          {[
            { num: '①', label: 'Standardize' },
            { num: '②', label: 'Screen' },
            { num: '③', label: 'Value' },
          ].map((item, i) => (
            <React.Fragment key={item.num}>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                <span className="text-teal-400 text-xs">{item.num}</span>
                <span className="text-white text-xs font-medium">{item.label}</span>
              </div>
              {i < 2 && <span className="text-slate-600 text-xs">→</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <div className="text-xs text-slate-500">Powered by</div>
            <div className="text-xs font-semibold text-white">CGS International</div>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="font-mono text-xs text-teal-400 tabular-nums">
            {time} <span className="text-slate-600">SGT</span>
          </div>
          <button
            onClick={onToggleDark}
            className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center hover:border-teal-400/40 hover:text-teal-400 text-slate-400 transition-colors"
            aria-label="Toggle dark/light"
          >
            {isDark ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
