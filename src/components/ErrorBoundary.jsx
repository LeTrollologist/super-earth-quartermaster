import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.hash = ''
    window.location.search = ''
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#08090b] flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="text-5xl">💥</div>
            <h1 className="text-xl font-display font-bold text-hd-yellow tracking-wider uppercase">
              System Malfunction
            </h1>
            <p className="text-sm font-mono text-hd-text-dim leading-relaxed">
              Something went wrong in the Quartermaster systems.
              Your loadout data is safe — try resetting to restore operations.
            </p>
            {this.state.error && (
              <pre className="text-[10px] font-mono text-red-400/70 bg-red-900/10 border border-red-900/30 rounded p-3 overflow-auto max-h-32 text-left">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="px-6 py-2.5 text-xs font-mono uppercase tracking-wider border border-hd-yellow text-hd-yellow hover:bg-hd-yellow/10 rounded transition-all"
            >
              Reset Quartermaster
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
