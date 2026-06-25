import { useState, useRef, useEffect, useCallback } from 'react'
import { companies as ALL_COMPANIES } from '../data/companies'
import { calcSES, calcCAGR, calcMomentum, calcDCF, getQuadrant, getRaterForecast } from '../lib/esg'
import { Tooltip } from './shared/Tooltip'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUGGESTED = [
  'Why is Wilmar International flagged Overweight?',
  'Which company has the highest ESG momentum?',
  'Compare PTT PCL and Sembcorp on climate action',
  'What SDG goals does the Materials sector score highest on?',
  'Explain the Financial Materiality Index methodology',
  'Which companies have Rating Upgrade Expected?',
]

function buildSystemPrompt(): string {
  const companyData = ALL_COMPANIES.map(c => {
    const ses      = calcSES(c, ALL_COMPANIES)
    const cagr     = calcCAGR(c)
    const momentum = calcMomentum(c, ALL_COMPANIES)
    const quadrant = getQuadrant(c, ALL_COMPANIES)
    const forecast = getRaterForecast(c, ALL_COMPANIES)
    const dcf      = calcDCF(c, ALL_COMPANIES)
    return {
      name: c.name,
      country: c.country,
      sector: c.sector,
      scores: { msci: c.msci, sustainalytics: c.sustainalytics, bloomberg: c.bloomberg },
      standardizedESGScore: ses,
      esgCAGR_pct: +cagr.toFixed(2),
      esgMomentum: momentum,
      quadrant,
      ratingForecast: forecast,
      dcf: {
        rating: dcf.rating,
        upsidePct: +dcf.upsidePct.toFixed(2),
        adjPrice: +dcf.adjPrice.toFixed(2),
        waccReduction_bps: dcf.waccReduction,
        revUp_pct: +dcf.revUp.toFixed(3),
        opSave_pct: +dcf.opSave.toFixed(3),
      },
      recentNews: c.news.map(n => ({
        date: n.date,
        headline: n.headline,
        sentiment: n.sentiment,
        eventType: n.eventType,
        sdgGoals: n.sdgGoals,
        pillar: n.pillar,
      })),
      esgEvents: c.events.map(e => ({ title: e.title, pillar: e.pillar, direction: e.direction > 0 ? 'positive' : 'negative', severity: e.severity })),
    }
  })

  return `You are an ESG investment analyst assistant for CGS International's iTrade ESG Intelligence platform. You have access to real-time ESG data for 10 ASEAN brown-industry companies across the Energy, Materials, and Industrials sectors.

Here is the current dashboard data:
${JSON.stringify(companyData, null, 2)}

Scoring methodology:
- Standardized ESG Score (SES): z-score normalization of MSCI, Sustainalytics and Bloomberg scores, rescaled to 50 ± 15
- ESG CAGR: compound annual growth rate of ESG scores over 5 years
- ESG Momentum: 60% CAGR percentile + 40% event score percentile (0–100)
- Quadrant: Overweight (low score, rising), Strong Overweight (high score, rising), Underweight (low score, falling), Reduce (high score, falling)
- Financial Materiality Index: DCF-based valuation model translating ESG improvements into target price impact via revenue uplift, operating cost savings, capex drag, and WACC reduction

Answer questions concisely and professionally. Use investment terminology. Reference specific data points when answering. Keep responses under 150 words unless the user asks for more detail. Format numbers clearly. Do not invent data not present in the dataset above.`
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function Chatbot() {
  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const bottomRef             = useRef<HTMLDivElement>(null)
  const inputRef              = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 512,
          system: buildSystemPrompt(),
          messages: history,
        }),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        const msg = (errBody as { error?: { message?: string } })?.error?.message ?? `HTTP ${res.status}`
        throw new Error(msg)
      }

      const data = await res.json() as { content: { type: string; text: string }[] }
      const aiText = data.content.find(b => b.type === 'text')?.text ?? '(no response)'

      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: aiText,
        timestamp: new Date(),
      }])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [messages, loading])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <div
          style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100 }}
          title="Ask our AI Analyst any question about the ESG data, company comparisons, or investment signals shown in this dashboard."
        >
          <button
            onClick={() => setOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#1A2332', border: '1.5px solid #E8323C',
              borderRadius: 28, padding: '10px 18px 10px 14px',
              cursor: 'pointer', color: '#FFFFFF', boxShadow: '0 4px 16px rgba(232,50,60,0.25)',
              transition: 'box-shadow 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(232,50,60,0.45)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(232,50,60,0.25)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8323C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600 }}>AI Analyst</span>
          </button>
        </div>
      )}

      {/* Chat panel */}
      {open && (
        <div
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 100,
            width: 400, height: 600, maxWidth: 'calc(100vw - 48px)', maxHeight: 'calc(100vh - 80px)',
            background: '#111827', border: '1px solid #2A3441',
            borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
        >
          {/* Panel header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #2A3441', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>ESG AI Analyst</div>
              <div style={{ fontSize: 10, color: '#8B9AAB', marginTop: 1 }}>
                Powered by Claude ·{' '}
                <span style={{ color: '#4B5563' }}>claude-sonnet-4-6</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip content="Ask our AI Analyst any question about the ESG data, company comparisons, or investment signals shown in this dashboard." />
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B9AAB', padding: 4, borderRadius: 6 }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Message area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.length === 0 && !loading && (
              <div>
                <div style={{ fontSize: 11, color: '#4B5563', textAlign: 'center', marginBottom: 14, marginTop: 8 }}>
                  Ask about ESG scores, company comparisons, or methodology
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {SUGGESTED.map(q => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      style={{
                        background: '#1A2332', border: '1px solid #2A3441',
                        borderRadius: 8, padding: '8px 12px',
                        color: '#D1D5DB', fontSize: 12, textAlign: 'left',
                        cursor: 'pointer', transition: 'background 0.1s, border-color 0.1s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = '#1F2D3D'
                        ;(e.currentTarget as HTMLElement).style.borderColor = '#E8323C44'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = '#1A2332'
                        ;(e.currentTarget as HTMLElement).style.borderColor = '#2A3441'
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'assistant' && (
                  <div style={{ fontSize: 9, color: '#4B5563', marginBottom: 3, marginLeft: 2 }}>AI Analyst</div>
                )}
                <div
                  style={{
                    maxWidth: '88%',
                    padding: '10px 12px',
                    borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: msg.role === 'user' ? '#1E3A5F' : '#1A2332',
                    color: '#FFFFFF',
                    fontSize: 13,
                    lineHeight: 1.55,
                    border: msg.role === 'user' ? '1px solid #1E40AF' : '1px solid #2A3441',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.content}
                </div>
                <div style={{ fontSize: 9, color: '#4B5563', marginTop: 3, marginLeft: 2, marginRight: 2 }}>
                  {fmtTime(msg.timestamp)}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 9, color: '#4B5563', marginBottom: 3, marginLeft: 2 }}>AI Analyst</div>
                <div style={{ padding: '10px 14px', background: '#1A2332', border: '1px solid #2A3441', borderRadius: '12px 12px 12px 2px', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      style={{
                        display: 'inline-block',
                        width: 6, height: 6, borderRadius: '50%',
                        background: '#E8323C',
                        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div style={{ padding: '8px 12px', background: '#7F1D1D22', border: '1px solid #7F1D1D', borderRadius: 8, fontSize: 11, color: '#FCA5A5' }}>
                <strong>Error:</strong> {error}
                {error.includes('401') && (
                  <div style={{ marginTop: 4, color: '#8B9AAB' }}>API key not configured. Set VITE_ANTHROPIC_API_KEY in your environment to enable the chatbot.</div>
                )}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid #2A3441', flexShrink: 0, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about ESG data, companies…"
              disabled={loading}
              style={{
                flex: 1, background: '#1A2332', border: '1px solid #2A3441',
                borderRadius: 8, padding: '8px 12px', fontSize: 13,
                color: '#FFFFFF', outline: 'none',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#E8323C' }}
              onBlur={e => { e.currentTarget.style.borderColor = '#2A3441' }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              style={{
                background: input.trim() && !loading ? '#E8323C' : '#2A3441',
                border: 'none', borderRadius: 8, padding: '8px 12px',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                color: '#FFFFFF', transition: 'background 0.12s',
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Bounce keyframes */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  )
}
