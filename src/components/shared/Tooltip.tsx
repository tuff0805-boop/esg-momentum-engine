import { useState, useRef, useEffect } from 'react'

interface TooltipProps {
  content: string
  className?: string
}

export function Tooltip({ content, className = '' }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<'top' | 'bottom'>('top')
  const btnRef = useRef<HTMLButtonElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!visible || !btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    setPosition(rect.top < 120 ? 'bottom' : 'top')
  }, [visible])

  useEffect(() => {
    if (!visible) return
    const handler = (e: MouseEvent) => {
      if (!btnRef.current?.contains(e.target as Node) && !tipRef.current?.contains(e.target as Node)) {
        setVisible(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [visible])

  return (
    <span className={`relative inline-flex ${className}`}>
      <button
        ref={btnRef}
        onClick={() => setVisible(v => !v)}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="w-4 h-4 rounded-full border border-white/20 text-white/40 text-[9px] flex items-center justify-center hover:border-teal-400/50 hover:text-teal-400 transition-colors cursor-help"
        aria-label="Info"
      >
        ?
      </button>
      {visible && (
        <div
          ref={tipRef}
          className={`absolute z-50 w-60 text-left text-xs text-slate-300 bg-[#0D1526] border border-white/10 rounded-lg p-3 shadow-xl leading-relaxed ${
            position === 'top'
              ? 'bottom-full mb-2 left-1/2 -translate-x-1/2'
              : 'top-full mt-2 left-1/2 -translate-x-1/2'
          }`}
        >
          {content}
        </div>
      )}
    </span>
  )
}
