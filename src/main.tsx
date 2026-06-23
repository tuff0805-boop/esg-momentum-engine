import { StrictMode, Component } from 'react'
import type { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Catch module-level / async errors that happen BEFORE React mounts
window.addEventListener('error', (e) => {
  const root = document.getElementById('root')
  if (root && !root.firstChild) {
    root.innerHTML = `<div style="padding:32px;font-family:monospace;background:#fff;color:#111">
      <h2 style="color:#dc2626">Window Error (pre-React)</h2>
      <pre style="white-space:pre-wrap;font-size:13px">${e.message}</pre>
      <pre style="white-space:pre-wrap;font-size:11px;color:#666">${e.filename}:${e.lineno}</pre>
      <pre style="white-space:pre-wrap;font-size:11px;color:#666">${e.error?.stack ?? ''}</pre>
    </div>`
  }
})

window.addEventListener('unhandledrejection', (e) => {
  const root = document.getElementById('root')
  if (root && !root.firstChild) {
    root.innerHTML = `<div style="padding:32px;font-family:monospace;background:#fff;color:#111">
      <h2 style="color:#dc2626">Unhandled Promise Rejection (pre-React)</h2>
      <pre style="white-space:pre-wrap;font-size:13px">${String(e.reason)}</pre>
    </div>`
  }
})

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary] caught:', error, info.componentStack)
  }
  render() {
    if (this.state.error) {
      const err = this.state.error
      return (
        <div style={{ padding: 32, fontFamily: 'monospace', background: '#fff', color: '#111', minHeight: '100vh' }}>
          <h2 style={{ color: '#dc2626' }}>React Runtime Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{String(err.message)}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, color: '#666' }}>{String(err.stack ?? '')}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

try {
  const rootEl = document.getElementById('root')
  if (!rootEl) throw new Error('No #root element found in DOM')
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
} catch (e) {
  const root = document.getElementById('root')
  if (root) {
    root.innerHTML = `<div style="padding:32px;font-family:monospace;background:#fff;color:#111">
      <h2 style="color:#dc2626">createRoot Error</h2>
      <pre style="white-space:pre-wrap;font-size:13px">${String(e)}</pre>
    </div>`
  }
}
