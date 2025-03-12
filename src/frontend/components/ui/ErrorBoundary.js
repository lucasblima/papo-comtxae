/**
 * DEPRECATED: This file re-exports from the canonical location
 * Please import ErrorBoundary from './ui/GlobalErrorBoundary' instead
 * Or even better, use the barrel file: import { GlobalErrorBoundary } from './ui';
 */

import { GlobalErrorBoundary } from './GlobalErrorBoundary';
export { GlobalErrorBoundary as ErrorBoundary } from './GlobalErrorBoundary';
export { withErrorBoundary } from './GlobalErrorBoundary';
export default GlobalErrorBoundary; 