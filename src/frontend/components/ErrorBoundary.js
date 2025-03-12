/**
 * DEPRECATED: This file re-exports from the canonical location
 * Please import ErrorBoundary from './ui/GlobalErrorBoundary' instead
 * Or even better, use the barrel file: import { GlobalErrorBoundary } from './ui';
 */

export { GlobalErrorBoundary as ErrorBoundary } from './ui/GlobalErrorBoundary';
export { withErrorBoundary } from './ui/GlobalErrorBoundary';
export default GlobalErrorBoundary; 