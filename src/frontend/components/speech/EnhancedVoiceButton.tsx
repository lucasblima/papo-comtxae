import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop } from 'react-icons/fa';

interface EnhancedVoiceButtonProps {
  onStart?: () => void;
  onStop?: () => void;
  onResult?: (result: string) => void;
  className?: string;
  buttonText?: string;
  isListening?: boolean;
  disabled?: boolean;
}

/**
 * EnhancedVoiceButton: An improved voice input button with visualization and feedback
 * 
 * This component provides a button for initiating voice input with visual feedback
 * during voice recording.
 */
export function EnhancedVoiceButton({
  onStart,
  onStop,
  onResult,
  className = '',
  buttonText = 'Falar',
  isListening = false,
  disabled = false
}: EnhancedVoiceButtonProps): React.ReactElement {
  const [listening, setListening] = useState(isListening);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Sync with external isListening prop
  useEffect(() => {
    setListening(isListening);
  }, [isListening]);
  
  const handleToggleListening = () => {
    if (disabled) return;
    
    const newListeningState = !listening;
    setListening(newListeningState);
    
    if (newListeningState) {
      onStart?.();
    } else {
      onStop?.();
    }
  };
  
  return (
    <button
      ref={buttonRef}
      className={`voice-button flex items-center justify-center gap-2 btn ${listening ? 'btn-error' : 'btn-primary'} ${className}`}
      onClick={handleToggleListening}
      disabled={disabled}
      aria-label={listening ? 'Parar de gravar' : 'Começar a gravar'}
      data-testid="enhanced-voice-button"
    >
      {listening ? <FaStop /> : <FaMicrophone />}
      {buttonText}
      {listening && (
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
    </button>
  );
} 