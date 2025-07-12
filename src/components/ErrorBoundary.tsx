import React, { Component, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Button from './ui/Button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full px-6">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
                <p className="text-gray-600 mt-2">
                  An error occurred while loading this page. You can try refreshing or return to the dashboard.
                </p>
              </div>
              
              {this.state.error && (
                <div className="mb-4 p-3 bg-red-50 rounded-md">
                  <p className="text-sm text-red-800 font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              
              <div className="flex space-x-3">
                <Link to="/" className="flex-1">
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={this.handleReset}
                  >
                    Go to Dashboard
                  </Button>
                </Link>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    this.handleReset()
                    window.location.reload()
                  }}
                >
                  Refresh Page
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}