import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * GlobalErrorBoundary catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 * 
 * Usage:
 * ```tsx
 * <GlobalErrorBoundary>
 *   <YourComponent />
 * </GlobalErrorBoundary>
 * ```
 * 
 * With custom fallback:
 * ```tsx
 * <GlobalErrorBoundary 
 *   fallback={<div>Something went wrong</div>}
 *   onError={(error) => console.error('Caught an error:', error)}
 * >
 *   <YourComponent />
 * </GlobalErrorBoundary>
 */
export class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by GlobalErrorBoundary:', error, errorInfo);
    
    // Call the optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="error-boundary-fallback">
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Error details</summary>
            {this.state.error && this.state.error.toString()}
          </details>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * withErrorBoundary is a higher-order component that wraps a component with a GlobalErrorBoundary
 * 
 * Usage:
 * ```tsx
 * const SafeComponent = withErrorBoundary(YourComponent);
 * 
 * // Then use it like a normal component
 * <SafeComponent />
 * ```
 */
export function withErrorBoundary<P>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
): React.FC<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const WrappedComponent: React.FC<P> = (props: P) => {
    return (
      <GlobalErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </GlobalErrorBoundary>
    );
  };
  
  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;
  
  return WrappedComponent;
}

export default GlobalErrorBoundary; 