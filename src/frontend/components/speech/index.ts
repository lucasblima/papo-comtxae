/**
 * Speech Components Barrel File
 * 
 * This file re-exports all speech-related components from the speech directory.
 * Import speech components from this file to avoid direct imports from component files.
 * 
 * Example:
 * import { VoiceInput, VoiceVisualization, EnhancedVoiceButton, VoiceAuthentication } from '../components/speech';
 * 
 * Note: VoiceOnboarding has been moved to '../components/onboarding/VoiceOnboarding'
 * Please update your imports to use the new location directly.
 */

export { VoiceInput } from './VoiceInput';
export { VoiceVisualization } from './VoiceVisualization';
export { VoiceOnboarding } from '../onboarding/VoiceOnboarding'; // Re-export from new location for backward compatibility
export { EnhancedVoiceButton } from './EnhancedVoiceButton';
export { VoiceAuthentication } from './VoiceAuthentication';
// Add other speech component exports here as they are created
