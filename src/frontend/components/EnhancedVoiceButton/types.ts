/**
 * EnhancedVoiceButton component props interface
 */
export interface EnhancedVoiceButtonProps {
  /** Whether the button is in active listening mode */
  isListening: boolean;
  
  /** Whether the button is in processing mode (disabled) */
  isProcessing?: boolean;
  
  /** Click handler for the button */
  onClick: () => void;
  
  /** Size of the button */
  size?: 'sm' | 'md' | 'lg';
  
  /** Additional CSS classes */
  className?: string;
  
  /** Color when in listening mode */
  listeningColor?: string;
  
  /** Color when in idle mode */
  idleColor?: string;
} 