/**
 * VoiceVisualization component props interface
 */
export interface VoiceVisualizationProps {
  /** Whether the visualization is active */
  isListening: boolean;
  
  /** Amplitude value between 0 and 1 */
  amplitude?: number;
  
  /** Color of the visualization bars */
  color?: string;
  
  /** Size of the visualization */
  size?: 'sm' | 'md' | 'lg';
} 