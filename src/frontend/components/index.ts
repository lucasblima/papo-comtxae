/**
 * Main Components Barrel File
 * 
 * This file re-exports all components from their category directories.
 * Import components from this file to get access to all components in one import.
 * 
 * Example:
 * import { Button, VoiceInput, ThemeToggle } from '../components';
 */

// UI Components
export { 
  ThemeToggle,
  GlobalErrorBoundary,
  ErrorBoundary,
  withErrorBoundary
} from './ui';
export * from './ui/Toast';
export * from './ui/AchievementNotification';

// Form Components
export {
  AssociationSelection
} from './form';

// Speech Components
export {
  VoiceInput,
  VoiceVisualization,
  EnhancedVoiceButton,
  VoiceOnboarding
} from './speech';

// No standalone components should be here - all components should be in their category directories
