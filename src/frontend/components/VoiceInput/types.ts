/**
 * VoiceInput component props interface
 */
export interface VoiceInputProps {
  /** Callback function that receives the recognized text */
  onResult: (text: string) => void;
  
  /** Callback function that indicates when voice recognition is active */
  onProcessing: (isProcessing: boolean) => void;
  
  /** Language code for voice recognition (default: 'pt-BR') */
  language?: string;
} 