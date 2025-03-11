import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  fallback?: ReactNode;
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-error text-error-content rounded-lg">
          <h2 className="text-lg font-bold">Something went wrong</h2>
          <p className="mt-2">The application encountered an unexpected error.</p>
          <button 
            className="btn btn-sm mt-4"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
