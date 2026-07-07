import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, maxWidth: 480, margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#991B1B', marginBottom: 10 }}>
              Something went wrong
            </div>
            <div style={{ fontSize: 13, color: '#7F1D1D', lineHeight: 1.6, marginBottom: 16 }}>
              Please take a screenshot of this message and share it — it'll help fix the issue quickly.
            </div>
            <div style={{
              background: 'white', border: '1px solid #FCA5A5', borderRadius: 6, padding: 12,
              fontSize: 12, color: '#374151', fontFamily: 'monospace', wordBreak: 'break-word',
              maxHeight: 200, overflowY: 'auto', marginBottom: 16
            }}>
              {this.state.error?.message || String(this.state.error)}
            </div>
            <button
              onClick={this.handleReset}
              style={{
                background: '#0A3D35', color: 'white', border: 'none', borderRadius: 8,
                padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer'
              }}
            >
              Reload and try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
