import { useState, useRef, useEffect, useCallback } from 'react'
import { Tooltip } from './shared/Tooltip'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface FAQ {
  keywords: string[]
  question: string
  answer: string
}

const SUGGESTED = [
  'Why is Wilmar International flagged Overweight?',
  'Which company has the highest ESG momentum?',
  'Compare PTT PCL and Sembcorp on climate action',
  'What SDG goals does the Materials sector score highest on?',
  'Explain the Financial Materiality Index methodology',
  'Which companies have Rating Upgrade Expected?',
]

const FALLBACK = "I can answer questions about the 10 ASEAN companies in this universe, ESG methodology, investment signals, and the Financial Materiality Index. Try asking about a specific company, or click one of the suggested questions above."

const FAQ_KB: FAQ[] = [
  {
    keywords: ['wilmar', 'overweight', 'flagged'],
    question: 'Why is Wilmar International flagged Overweight?',
    answer: 'Wilmar International is flagged Overweight due to its strong ESG CAGR of +12.2% over 5 years — the highest in the Materials sector. Key catalysts include RSPO certification expansion, a strengthened no-deforestation policy, and an active smallholder ESG programme. These initiatives map to SDG 12 (Responsible Consumption) and SDG 15 (Life on Land), signalling structural ESG improvement ahead of official rating agency updates.',
  },
  {
    keywords: ['highest', 'momentum', 'best', 'top'],
    question: 'Which company has the highest ESG momentum?',
    answer: 'Wilmar International leads the universe with the highest combined ESG Momentum Score of 76/100, driven by a 5-year ESG CAGR of +12.2% and a Forward Signal Score of 87/100. Merdeka Copper Gold ranks second with +16.1% CAGR despite a lower Standardized ESG Score, placing it firmly in the Overweight quadrant. Both are flagged as candidates for rating agency upgrades.',
  },
  {
    keywords: ['ptt', 'sembcorp', 'compare', 'climate', 'comparison'],
    question: 'Compare PTT PCL and Sembcorp on climate action',
    answer: 'Sembcorp Industries leads on climate action with a Standardized ESG Score of 63.9 vs PTT PCL\'s 55.7. Sembcorp has committed to net-zero by 2050 and issued a SGD 675M green bond, mapping to SDG 7 and SDG 13. PTT PCL launched a 500MW green hydrogen pilot but was fined THB 45M for an effluent discharge violation in 2025, creating a mixed signal. Both are classified as Strong Overweight, but Sembcorp carries lower regulatory risk.',
  },
  {
    keywords: ['sdg', 'materials', 'sector', 'goals'],
    question: 'What SDG goals does the Materials sector score highest on?',
    answer: 'The Materials sector companies in this universe score highest on SDG 12 (Responsible Consumption), SDG 13 (Climate Action), and SDG 15 (Life on Land). Wilmar\'s deforestation and RSPO initiatives directly target SDG 15, while Siam Cement Group\'s low-carbon cement patent addresses SDG 9 (Industry Innovation) and SDG 13. Merdeka Copper Gold\'s tailings management upgrade contributes to SDG 6 (Clean Water) and SDG 14 (Life Below Water).',
  },
  {
    keywords: ['financial', 'materiality', 'index', 'methodology', 'explain', 'how', 'works'],
    question: 'Explain the Financial Materiality Index methodology',
    answer: 'The Financial Materiality Index translates ESG momentum into a target price adjustment through four channels: Revenue Uplift (ESG premium pricing and institutional inflows), Operating Cost Savings (efficiency gains and penalty avoidance), Capex Drag via a J-curve (higher Year 1-2 investment that normalises from Year 3), and WACC Reduction (better governance lowers the cost of equity). A materiality threshold of 0.5% Free Cash Flow / Market Cap filters out immaterial ESG initiatives to prevent overstatement.',
  },
  {
    keywords: ['rating', 'upgrade', 'expected', 'which'],
    question: 'Which companies have Rating Upgrade Expected?',
    answer: 'Wilmar International is the primary candidate for a rating agency upgrade, driven by consistent ESG CAGR of +12.2% and three major positive catalyst events including RSPO expansion and a no-deforestation policy upgrade. Sembcorp Industries is also flagged as Stable/+ with strong green bond issuance signalling imminent disclosure improvements. Rating upgrades from MSCI or Sustainalytics typically follow 12-18 months after the leading signal events we track.',
  },
  {
    keywords: ['downgrade', 'risk', 'avoid'],
    question: 'Which companies carry downgrade risk?',
    answer: 'Siam Cement Group is flagged with Rating Downgrade Risk based on a declining momentum trajectory despite a currently high Standardized ESG Score of 59.4 — placing it in the Reduce quadrant. Adaro Energy also warrants monitoring following an environmental fine in 2025, though its coal-to-renewables roadmap provides partial offset. Investors should reduce exposure to companies showing high ESG scores with deteriorating momentum trajectories.',
  },
  {
    keywords: ['standardizer', 'normalize', 'score', 'msci', 'sustainalytics', 'bloomberg'],
    question: 'How does the ESG Score Standardizer work?',
    answer: 'The Standardizer resolves the inconsistency problem where MSCI, Sustainalytics, and Bloomberg rate the same company very differently. Each provider\'s raw score is converted to a z-score — measuring how far the company sits from that provider\'s own universe average. The three z-scores are then averaged into one Standardized ESG Score on a 0-100 scale. Where providers strongly disagree (high standard deviation), we flag the company as High Provider Divergence — a signal that the company is under-researched and potentially mispriced.',
  },
  {
    keywords: ['hidden', 'overweight', 'quadrant', 'opportunity'],
    question: 'What is the Overweight quadrant?',
    answer: 'The Overweight quadrant identifies companies with a low current Standardized ESG Score but strong positive ESG momentum trajectory. These companies are improving faster than the market has priced in — the market still values them based on their current low score, not their trajectory. CGS International\'s own research shows ESG improvers outperform the MSCI ASEAN benchmark by 8x over 5 years. Overweight companies represent the primary alpha opportunity in ESG investing.',
  },
  {
    keywords: ['cagr', 'compound', 'annual', 'growth', 'rate', 'calculate'],
    question: 'How is ESG CAGR calculated?',
    answer: 'ESG CAGR is calculated as (Standardized ESG Score current ÷ Standardized ESG Score base) ^ (1 ÷ years) − 1, expressed as a percentage. It measures the compounded annual growth rate of a company\'s Standardized ESG Score over a 3-5 year window. A positive CAGR indicates consistent ESG improvement regardless of absolute score level. The universe average ESG CAGR is 9.2%, meaning companies above this threshold are improving faster than their peers.',
  },
  {
    keywords: ['merdeka', 'copper', 'gold'],
    question: 'Tell me about Merdeka Copper Gold',
    answer: 'Merdeka Copper Gold has the highest ESG CAGR in the universe at +16.1%, driven by a community investment fund, a major tailings management upgrade (SDG 6, 14), and a sustainability hiring surge. Despite a low current Standardized ESG Score of 28.5, its rapid improvement trajectory places it firmly in the Overweight quadrant with a Financial Materiality upside of +4.0%. The tailings upgrade is the key catalyst — it directly reduces regulatory and environmental liability risk, which flows through to WACC reduction.',
  },
  {
    keywords: ['adaro', 'energy', 'coal', 'indonesia'],
    question: 'What is Adaro Energy\'s ESG outlook?',
    answer: 'Adaro Energy presents a mixed ESG picture. Its coal-to-renewables roadmap and ISO 14001 certification are positive leading signals, but an environmental fine in 2025 creates a negative offset. With a Standardized ESG Score of 43.7 and ESG CAGR of +9.5%, it sits in the Overweight quadrant — improving from a low base. The WACC reduction from improved governance is limited to 20 basis points given the regulatory fine overhang. Monitor the renewables roadmap execution for confirmation.',
  },
  {
    keywords: ['sembcorp', 'industries', 'singapore'],
    question: "What is Sembcorp Industries' investment signal?",
    answer: 'Sembcorp Industries is rated Strong Overweight with the highest Standardized ESG Score in the Energy sector at 63.9. Its SGD 675M green bond issuance, renewable energy joint venture, and net-zero 2050 commitment map to SDG 7 and SDG 13. The Financial Materiality Index shows a +10.5% ESG-adjusted target price upside — the highest Buy signal in the Energy sector. Sembcorp\'s ESG momentum score of 36/100 is lower than its peers due to a large base effect, but its absolute score quality is strongest.',
  },
  {
    keywords: ['thai', 'union', 'group', 'seafood'],
    question: 'Tell me about Thai Union Group',
    answer: 'Thai Union Group is rated Strong Overweight with a Standardized ESG Score of 63.1 and ESG CAGR of +6.5%. Its full sustainable packaging rollout (SDG 12), MSC certification renewal (SDG 14), and living wage policy adoption (SDG 8) represent three simultaneous positive ESG catalysts across all three pillars. The Financial Materiality Index assigns an ESG-adjusted target price uplift of +8.5%, driven primarily by operating cost savings from cheaper sustainable packaging materials and WACC reduction from improved governance.',
  },
  {
    keywords: ['astra', 'international', 'indonesia', 'ev', 'electric'],
    question: "What is Astra International's ESG positioning?",
    answer: "Astra International is rated Strong Overweight with a Standardized ESG Score of 54.9 and strong ESG CAGR of +8.1%. The EV manufacturing joint venture is the key leading signal — it maps to SDG 9 (Industry Innovation) and SDG 13 (Climate Action) and positions Astra ahead of Indonesia's automotive electrification mandate. The Scope 3 emissions disclosure initiation is a significant governance improvement. Financial Materiality shows +7.1% ESG-adjusted target price upside, driven by revenue growth from the EV transition.",
  },
  {
    keywords: ['seatrium', 'offshore', 'wind', 'shipbuilding'],
    question: "What is Seatrium's ESG signal?",
    answer: "Seatrium is rated Overweight with a Standardized ESG Score of 45.8 and ESG CAGR of +10.2%. The offshore wind contract win is the primary catalyst — it directly maps to SDG 7 (Affordable Clean Energy) and signals a structural shift in Seatrium's revenue mix toward clean energy infrastructure. Green shipbuilding certification and a governance board refresh complete the three-pillar ESG improvement. Financial Materiality shows +6.4% upside, primarily from revenue diversification into offshore wind.",
  },
  {
    keywords: ['indocement', 'cement', 'indonesia'],
    question: "Tell me about Indocement's ESG trajectory",
    answer: "Indocement is one of the clearest Overweight opportunities in the universe — it has a low Standardized ESG Score of 36.0 but a strong ESG CAGR of +11.3%. Its waste-heat recovery project reduces energy costs while lowering emissions, and sustainability hiring increased 38% in 2025. These are leading indicators of score improvement before rating agencies update. Financial Materiality shows +5.3% upside. The key risk is scoring inconsistency — Indocement has the lowest provider divergence in the universe, suggesting ratings are converging, which may accelerate the upgrade timeline.",
  },
  {
    keywords: ['siam', 'cement', 'group', 'thailand'],
    question: "What is Siam Cement Group's outlook?",
    answer: "Siam Cement Group is placed in the Reduce quadrant — it has a high Standardized ESG Score of 59.4 but declining ESG momentum, a combination that typically leads to market underperformance as the ESG premium compresses. Despite a low-carbon cement patent and water stewardship commitments, the momentum trajectory is negative. Financial Materiality shows only +6.4% upside, reflecting limited room for ESG-driven valuation re-rating. Investors already paying a premium for its ESG score should monitor trajectory closely.",
  },
  {
    keywords: ['provider', 'divergence', 'disagreement', 'alpha'],
    question: 'What does High Provider Divergence mean?',
    answer: "High Provider Divergence means MSCI, Sustainalytics, and Bloomberg strongly disagree on a company's ESG score. This disagreement indicates the company is under-researched and potentially mispriced by the market. PTT PCL and Adaro Energy both show High Provider Divergence — their true ESG quality is uncertain, but this uncertainty itself creates an alpha opportunity for investors who can form an independent view using our leading signal analysis and news catalyst feed.",
  },
  {
    keywords: ['wacc', 'cost', 'equity', 'discount', 'rate'],
    question: 'How does ESG affect WACC?',
    answer: 'Better ESG governance reduces agency risk and regulatory exposure, which lowers the cost of equity (WACC). Strong Overweight companies in this universe receive up to 45 basis points of WACC reduction in the Financial Materiality model. Even a 25 basis point WACC reduction on a $1B enterprise value company increases the DCF valuation by 3-8%. The governance pillar (G) is the primary driver of WACC reduction, while environmental improvements affect operating cost savings and revenue growth assumptions.',
  },
  {
    keywords: ['retail', 'investor', 'simple', 'beginner'],
    question: 'How do I use this as a retail investor?',
    answer: 'Switch to Retail View using the toggle in the top header. Retail View shows simplified buy/sell signals — Overweight (buy more), Accumulate (gradually buy), Neutral (hold), or Underweight (reduce). Each signal comes with a plain English reason and an ESG-adjusted target price. You do not need to understand the underlying methodology — just look at the signal and the target price, then make your decision through your CGS iTrade account.',
  },
  {
    keywords: ['institutional', 'analyst', 'professional', 'b2b'],
    question: 'How is this tool useful for institutional analysts?',
    answer: 'Analyst View provides the full ESG intelligence stack — Standardized ESG Score with provider breakdown, 5-year CAGR trajectory, Forward Signal Score from leading indicators, the 2x2 Momentum Matrix positioning, Financial Materiality Index with four valuation channels, and bear/base/bull scenario target prices. Institutional analysts can use the AI Analyst chatbot for rapid company comparisons, sector analysis, and methodology queries without leaving the platform.',
  },
  {
    keywords: ['cgsi', 'itrade', 'integrate', 'platform', 'how'],
    question: 'How does this integrate with CGS iTrade?',
    answer: "The ESG Momentum Engine is designed as a native iTrade ESG Intelligence module. In the full integration, the ESG signal (Overweight/Accumulate/Neutral/Underweight) appears directly on the stock quote page alongside the price and volume data. Investors can click through to the full ESG analysis without leaving the trading interface. The target price adjustment from the Financial Materiality Index updates the consensus target price displayed in iTrade's research section.",
  },
  {
    keywords: ['energy', 'sector', 'oil', 'gas'],
    question: 'How does the Energy sector rank overall?',
    answer: 'The Energy sector in this universe shows a split picture. Sembcorp Industries is the standout Strong Overweight at 63.9 Standardized ESG Score. PTT PCL and Adaro Energy are both in the Overweight quadrant, improving from low bases. The Energy sector average ESG CAGR is 7.3% — slightly below the universe average of 9.2%, but individual company trajectories vary significantly. ESG momentum in Energy is increasingly driven by transition commitments — hydrogen, renewables, and scope reduction pledges — rather than current ESG score levels.',
  },
  {
    keywords: ['buy', 'sell', 'accumulate', 'neutral', 'underweight', 'signal'],
    question: 'What do the investment ratings mean?',
    answer: 'Overweight: ESG momentum strongly supports buying — target price upside exceeds 8%. Accumulate: positive ESG trend supports gradual position building — upside 3-8%. Neutral: ESG signals are mixed or stable — hold current position, upside -3% to +3%. Underweight: ESG trajectory is deteriorating — reduce exposure, downside risk exceeds 3%. All ratings are derived from the Financial Materiality Index and reflect ESG impact on target price, not traditional fundamental analysis.',
  },
]

function matchFAQ(userInput: string): FAQ | null {
  const lower = userInput.toLowerCase()
  return FAQ_KB.find(faq => faq.keywords.some(kw => lower.includes(kw))) ?? null
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function Chatbot() {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bottomRef               = useRef<HTMLDivElement>(null)
  const inputRef                = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = useCallback((text: string) => {
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

    // Simulate typing delay then return FAQ answer
    setTimeout(() => {
      const match = matchFAQ(trimmed)
      const answer = match?.answer ?? FALLBACK
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: answer,
        timestamp: new Date(),
      }])
      setLoading(false)
    }, 800)
  }, [loading])

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
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100 }}>
          <button
            onClick={() => setOpen(true)}
            title="Ask our AI Analyst any question about the ESG data, company comparisons, or investment signals shown in this dashboard."
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#0D1117', border: '1px solid #1E2836',
              borderRadius: 4, padding: '8px 14px 8px 10px',
              cursor: 'pointer', color: '#E8EDF2',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E8323C' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1E2836' }}
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
            width: 400, height: 600,
            maxWidth: 'calc(100vw - 48px)', maxHeight: 'calc(100vh - 80px)',
            background: '#080B10', border: '1px solid #1E2836',
            borderRadius: 4, boxShadow: 'none',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #1E2836', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>ESG AI Analyst</div>
              <div style={{ fontSize: 10, color: '#8B9AAB', marginTop: 1 }}>
                25 curated answers · ESG knowledge base
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                        background: '#0D1117', border: '1px solid #1E2836',
                        borderRadius: 3, padding: '8px 12px',
                        color: '#8B9AAB', fontSize: 12, textAlign: 'left',
                        cursor: 'pointer', transition: 'background 0.1s, border-color 0.1s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = '#131920'
                        ;(e.currentTarget as HTMLElement).style.borderColor = '#E8323C44'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = '#0D1117'
                        ;(e.currentTarget as HTMLElement).style.borderColor = '#1E2836'
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
                    borderRadius: msg.role === 'user' ? '8px 8px 2px 8px' : '8px 8px 8px 2px',
                    background: msg.role === 'user' ? '#0A2A52' : '#0D1117',
                    color: '#E8EDF2',
                    fontSize: 12,
                    lineHeight: 1.55,
                    border: msg.role === 'user' ? '1px solid #1E2836' : '1px solid #1E2836',
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
                <div style={{ padding: '10px 14px', background: '#0D1117', border: '1px solid #1E2836', borderRadius: '8px 8px 8px 2px', display: 'flex', gap: 4, alignItems: 'center' }}>
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

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid #1E2836', flexShrink: 0, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about ESG data, companies…"
              disabled={loading}
              style={{
                flex: 1, background: '#0D1117', border: '1px solid #1E2836',
                borderRadius: 3, padding: '8px 12px', fontSize: 12,
                color: '#E8EDF2', outline: 'none',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#E8323C' }}
              onBlur={e => { e.currentTarget.style.borderColor = '#1E2836' }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              style={{
                background: input.trim() && !loading ? '#E8323C' : '#1E2836',
                border: 'none', borderRadius: 3, padding: '8px 12px',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                color: '#E8EDF2', transition: 'background 0.12s', flexShrink: 0,
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  )
}
