import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // Logged, not swallowed — still visible in the console for debugging,
    // just no longer a blank white screen for the person using the app.
    console.error('Ocean Explorer crashed:', error, info)
  }

  handleReload = () => {
    this.setState({ hasError: false })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="webgl-fallback">
          <h1>Something went wrong</h1>
          <p>
            Ocean Explorer hit an unexpected error. Reloading usually clears it — your
            discoveries and settings are saved and won&apos;t be lost.
          </p>
          <button type="button" className="info-panel-navigate" onClick={this.handleReload}>
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
