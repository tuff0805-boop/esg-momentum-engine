export function MethodologyPage() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>

      {/* PAGE TITLE */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 11, color: '#E8323C', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>Intellectual Foundation</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#E8EDF2', margin: 0, marginBottom: 8 }}>ESG Momentum Engine — Methodology</h1>
        <p style={{ fontSize: 15, color: '#8B9AAB', margin: 0, lineHeight: 1.6 }}>
          How we turn fragmented ESG ratings into a unified intelligence system — and price the impact.
        </p>
      </div>

      {/* SECTION 1: HOW IT WORKS */}
      <Section title="01 — How It Works">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {[
            {
              n: '1',
              title: 'Standardize',
              icon: '⬡',
              color: '#00C087',
              body: 'We collect raw ESG scores from MSCI, Sustainalytics, and Bloomberg, convert each to a z-score, and average them into one Standardized ESG Score (SES) — removing provider bias.',
            },
            {
              n: '2',
              title: 'Measure Momentum',
              icon: '↗',
              color: '#1E6FD9',
              body: 'We calculate 5-year ESG CAGR and combine it with a Forward Signal Score from leading indicators (certifications, green bonds, sustainability hiring) to produce a composite Momentum Score.',
            },
            {
              n: '3',
              title: 'Value the Impact',
              icon: '◈',
              color: '#7C3AED',
              body: 'We translate ESG momentum into a target price adjustment through four financial channels: revenue uplift, operating cost savings, capex drag reduction, and WACC compression.',
            },
          ].map(s => (
            <div key={s.n} style={{ background: '#0D1117', border: '1px solid #1E2836', borderTop: `2px solid ${s.color}`, borderRadius: 4, padding: 20 }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontSize: 10, color: s.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Step {s.n}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#E8EDF2', marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: '#8B9AAB', lineHeight: 1.6 }}>{s.body}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* SECTION 2: SCORING FORMULA */}
      <Section title="02 — The Scoring Formulae">
        <div style={{ background: '#080B10', border: '1px solid #1E2836', borderRadius: 4, padding: 20, fontFamily: 'monospace' }}>
          {[
            { label: 'Standardized ESG Score', formula: 'SES = (z_MSCI + z_Sustainalytics + z_Bloomberg) / 3' },
            { label: 'ESG CAGR', formula: 'ESG CAGR = (SES_current / SES_base)^(1/years) − 1' },
            { label: 'Momentum Score', formula: 'Momentum = (0.60 × CAGR_score) + (0.40 × Forward_Signal_Score)' },
            { label: 'Target Price Adjustment', formula: 'ΔTP = Σ(Revenue Uplift + OpCost Savings − Capex Drag + WACC Reduction)' },
          ].map((f, i) => (
            <div key={i} style={{ marginBottom: i < 3 ? 16 : 0 }}>
              <div style={{ fontSize: 10, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{f.label}</div>
              <div style={{ fontSize: 13, color: '#00C087', padding: '10px 14px', background: '#0A1A0F', borderRadius: 3, border: '1px solid #003D2B' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: '#4A5568', lineHeight: 1.6 }}>
          z-scores are computed against the full ASEAN Brown Industry universe (n=10). Forward Signal Score weights: Certifications (30%), Green Bond Issuance (25%), Sustainability Hiring (20%), ESG News Sentiment (15%), Controversy Flags (−10%).
        </div>
      </Section>

      {/* SECTION 3: FORWARD SIGNAL FRAMEWORK */}
      <Section title="03 — Forward Signal Score — Execution Quality Framework">
        <p style={{ fontSize: 13, color: '#8B9AAB', lineHeight: 1.7, marginBottom: 20, marginTop: 0 }}>
          The Forward Signal Score (40% of Momentum Score) measures leading indicators of ESG execution quality — signals that precede official rating agency updates by 12–18 months. These are organized into five categories, each weighted by predictive validity and data availability.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#0D1117' }}>
                {['Category', 'Signal', 'Data Source', 'Weight', 'Current Phase'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A5568', fontWeight: 600, borderBottom: '1px solid #1E2836' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Organizational Readiness', 'Sustainability hiring velocity',                     'LinkedIn job postings',                   '15%', 'Phase 1'],
                ['Organizational Readiness', 'Project lead track record',                          'Company filings + news',                  '10%', 'Phase 2'],
                ['Organizational Readiness', 'Executive turnover in sustainability BU',             'LinkedIn + SGX announcements',            '5%',  'Phase 2'],
                ['Physical Execution',       'Capex disbursement vs announced plan',               'Quarterly filings',                       '15%', 'Phase 2'],
                ['Physical Execution',       'Permit filings (EIA, construction)',                 'KLHK, ONEP, NEA registries',              '10%', 'Phase 2'],
                ['Physical Execution',       'Satellite imagery — construction progress',           'Planet Labs, Orbital Insight',            '5%',  'Phase 3'],
                ['Third-Party Verification', 'Equipment supplier/EPC contractor announcements',    'News NLP + SGX',                          '10%', 'Phase 1'],
                ['Third-Party Verification', 'Certification status (RSPO, ISO 14001, SBTi)',       'Certifying bodies',                       '10%', 'Phase 1'],
                ['Third-Party Verification', 'Patent filings related to core technology',          'Patent registries',                       '5%',  'Phase 2'],
                ['Capital Commitment',       'Green bond tied to specific project',                'SGX + MAS filings',                       '10%', 'Phase 1'],
                ['Capital Commitment',       'Covenant renegotiation (negative signal)',            'Bond prospectus filings',                 '5%',  'Phase 2'],
                ['Stakeholder Sentiment',    'Analyst call NLP — management specificity',          'Earnings call transcripts',               '5%',  'Phase 2'],
                ['Stakeholder Sentiment',    'Community/NGO sentiment near project sites',         'Local news NLP',                          '5%',  'Phase 3'],
              ].map((row, i) => {
                const phase = row[4]
                const phaseBg  = phase === 'Phase 1' ? '#003D2B' : phase === 'Phase 2' ? '#0A2A52' : '#2A1A00'
                const phaseColor = phase === 'Phase 1' ? '#00C087' : phase === 'Phase 2' ? '#60A5FA' : '#C4A85A'
                const phaseLabel = phase === 'Phase 1' ? 'Phase 1 (Live)' : phase === 'Phase 2' ? 'Phase 2' : 'Phase 3'
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#080B10' : '#0D1117', borderBottom: '1px solid #1E2836' }}>
                    <td style={{ padding: '9px 14px', color: '#8B9AAB', whiteSpace: 'nowrap' }}>{row[0]}</td>
                    <td style={{ padding: '9px 14px', color: '#E8EDF2' }}>{row[1]}</td>
                    <td style={{ padding: '9px 14px', color: '#8B9AAB' }}>{row[2]}</td>
                    <td style={{ padding: '9px 14px', fontFamily: 'monospace', color: '#C8D3DC', textAlign: 'right', whiteSpace: 'nowrap' }}>{row[3]}</td>
                    <td style={{ padding: '9px 14px' }}>
                      <span style={{ fontSize: 10, fontWeight: 500, color: phaseColor, background: phaseBg, border: `1px solid ${phaseColor}44`, borderRadius: 3, padding: '2px 7px', whiteSpace: 'nowrap' }}>
                        {phaseLabel}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 14, fontSize: 12, color: '#4A5568', lineHeight: 1.6, padding: '10px 14px', background: '#0D1117', border: '1px solid #1E2836', borderRadius: 4 }}>
          Phase 1 signals power the current POC. Phase 2 signals are in development for the production version leveraging CGS International's existing MSCI and Bloomberg institutional data relationships.
        </div>
      </Section>

      {/* SECTION 4: DATA SOURCES */}
      <Section title="04 — Data Sources">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#080B10', borderBottom: '1px solid #1E2836' }}>
                {['Provider', 'Coverage', 'Update Frequency', 'Weight in SES'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A5568', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['MSCI ESG Ratings',       '8,500+ companies',  'Quarterly',  '33.3%'],
                ['Sustainalytics ESG Risk', '13,000+ companies', 'Quarterly',  '33.3%'],
                ['Bloomberg ESG Scores',    '11,800+ companies', 'Annual',     '33.3%'],
                ['SGX/Bursa Filings',       'All listed cos.',   'Annual',     'Leading signal'],
                ['NewsAPI / GDELT',         'Global news',       'Real-time',  'Event classifier'],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1E2836', background: i % 2 === 0 ? 'transparent' : '#0D1117' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ padding: '10px 16px', color: j === 0 ? '#E8EDF2' : '#8B9AAB' }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* SECTION 5: ACADEMIC FOUNDATION */}
      <Section title="05 — Academic Foundation">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            {
              authors: 'Friede, Busch & Bassen (2015)',
              journal: 'Journal of Sustainable Finance & Investment',
              finding: '90% of 2,000+ empirical studies show a non-negative ESG–financial performance relationship. Strong evidence that ESG outperforms across asset classes and geographies.',
              color: '#00C087',
            },
            {
              authors: 'MSCI Research (2021)',
              journal: 'ESG and the Cost of Capital',
              finding: 'ESG Leaders showed 13% lower beta vs ESG Laggards over 10 years. Lower idiosyncratic risk translates directly to WACC compression — the core of our Financial Materiality channel.',
              color: '#1E6FD9',
            },
            {
              authors: 'Khan, Serafeim & Yoon (2016)',
              journal: 'Harvard Business School Working Paper',
              finding: 'Firms with strong performance on material ESG issues significantly outperform firms with poor performance — but only on material issues. Immaterial ESG spending has no positive effect. This validates our pillar-weighting approach.',
              color: '#7C3AED',
            },
          ].map(p => (
            <div key={p.authors} style={{ background: '#0D1117', border: '1px solid #1E2836', borderLeft: `3px solid ${p.color}`, borderRadius: 4, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#E8EDF2', marginBottom: 2 }}>{p.authors}</div>
              <div style={{ fontSize: 11, color: p.color, marginBottom: 8 }}>{p.journal}</div>
              <div style={{ fontSize: 13, color: '#8B9AAB', lineHeight: 1.6 }}>{p.finding}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* SECTION 6: ROADMAP */}
      <Section title="06 — The 18-Month Roadmap">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {[
            {
              phase: 'Phase 1 · Now',
              title: 'ASEAN Proof of Concept',
              items: ['10 Brown Industry companies', 'Three agency standardizer', 'Momentum + DCF model', 'iTrade integration'],
              color: '#00C087',
            },
            {
              phase: 'Phase 2 · +6 Months',
              title: 'ASEAN Expansion',
              items: ['100+ ASEAN companies', 'Real-time news NLP', 'Automated report generation', 'API for iTrade Pro'],
              color: '#1E6FD9',
            },
            {
              phase: 'Phase 3 · +18 Months',
              title: 'Global Scale',
              items: ['5,000+ global companies', 'Alternative data feeds', 'ML momentum prediction', 'Institutional licensing'],
              color: '#7C3AED',
            },
          ].map(ph => (
            <div key={ph.phase} style={{ background: '#0D1117', border: `1px solid ${ph.color}33`, borderRadius: 4, padding: 20 }}>
              <div style={{ fontSize: 10, color: ph.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{ph.phase}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#E8EDF2', marginBottom: 12 }}>{ph.title}</div>
              <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
                {ph.items.map(item => (
                  <li key={item} style={{ fontSize: 12, color: '#8B9AAB', marginBottom: 4 }}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* SECTION 7: GREENWASHING DEFENSE */}
      <Section title="07 — Greenwashing Defense">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: '✓', title: 'Verified Events Only', body: 'Regulatory fines are government-issued. Third-party certifications are independently audited. Company press releases receive lower weighting than verifiable external events.' },
            { icon: '⚠', title: 'Provider Divergence Flag', body: 'When MSCI, Sustainalytics, and Bloomberg disagree by more than 15 points, the system flags high divergence — signaling either mispricing or data quality risk.' },
            { icon: '⊖', title: 'Negative Event Offset', body: 'Negative ESG events (fines, controversies, governance failures) directly offset positive announcements in the Forward Signal Score. A company cannot greenwash by publishing press releases.' },
          ].map(g => (
            <div key={g.title} style={{ display: 'flex', gap: 12, padding: '12px 16px', background: '#0D1117', border: '1px solid #1E2836', borderRadius: 4 }}>
              <div style={{ fontSize: 18, color: '#00C087', flexShrink: 0, width: 24 }}>{g.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#E8EDF2', marginBottom: 4 }}>{g.title}</div>
                <div style={{ fontSize: 13, color: '#8B9AAB', lineHeight: 1.5 }}>{g.body}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#E8EDF2', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid #1E2836' }}>{title}</div>
      {children}
    </div>
  )
}
