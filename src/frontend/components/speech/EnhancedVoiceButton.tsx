import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedVoiceButtonProps {
  onStart?: () => void;
  onStop?: () => void;
  onResult?: (result: string) => void;
  className?: string;
  buttonText?: string;
  isListening?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  error?: string;
  soundLevel?: number;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * EnhancedVoiceButton: An improved voice input button with visualization and feedback
 * 
 * This component provides a button for initiating voice input with visual and haptic
 * feedback during voice recording. It includes accessibility features, loading states,
 * and error handling.
 */
export function EnhancedVoiceButton({
  onStart,
  onStop,
  onResult,
  className = '',
  buttonText = 'Falar',
  isListening = false,
  disabled = false,
  isLoading = false,
  error = '',
  soundLevel = 0,
  size = 'md'
}: EnhancedVoiceButtonProps): React.ReactElement {
  const [listening, setListening] = useState(isListening);
  const [showTooltip, setShowTooltip] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Sync with external isListening prop
  useEffect(() => {
    setListening(isListening);
  }, [isListening]);
  
  // Handle keyboard interactions
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleToggleListening();
      } else if (event.key === 'Escape' && listening) {
        event.preventDefault();
        handleToggleListening();
      }
    };

    const button = buttonRef.current;
    if (button) {
      button.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      if (button) {
        button.removeEventListener('keydown', handleKeyPress);
      }
    };
  }, [listening]);

  // Trigger haptic feedback if available
  const triggerHapticFeedback = () => {
    if (typeof window !== 'undefined' && 'navigator' in window) {
      if ('vibrate' in navigator) {
        navigator.vibrate(listening ? [100] : [50, 50, 50]);
      }
    }
  };
  
  const handleToggleListening = () => {
    if (disabled || isLoading) return;
    
    const newListeningState = !listening;
    setListening(newListeningState);
    triggerHapticFeedback();
    
    if (newListeningState) {
      onStart?.();
    } else {
      onStop?.();
    }
  };

  // Get button size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'btn-sm text-sm';
      case 'lg':
        return 'btn-lg text-lg';
      default:
        return 'btn-md text-base';
    }
  };

  // Get sound level indicator color
  const getSoundLevelColor = () => {
    if (soundLevel > 75) return 'bg-red-500';
    if (soundLevel > 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  return (
    <div className="relative inline-block">
      <motion.button
        ref={buttonRef}
        className={`voice-button flex items-center justify-center gap-2 btn 
          ${listening ? 'btn-error' : 'btn-primary'} 
          ${getSizeClasses()} 
          ${error ? 'btn-error' : ''} 
          ${className}`}
        onClick={handleToggleListening}
        disabled={disabled || isLoading}
        aria-label={listening ? 'Parar de gravar' : 'Começar a gravar'}
        aria-pressed={listening}
        aria-disabled={disabled || isLoading}
        aria-describedby={error ? 'voice-button-error' : undefined}
        data-testid="enhanced-voice-button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.05 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={isLoading ? 'loading' : listening ? 'stop' : 'start'}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <FaSpinner className="animate-spin" />
            ) : listening ? (
              <FaStop />
            ) : (
              <FaMicrophone />
            )}
            {buttonText}
          </motion.span>
        </AnimatePresence>

        {/* Recording indicator */}
        {listening && !isLoading && (
          <motion.div 
            className="relative flex h-3 w-3 ml-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </motion.div>
        )}

        {/* Sound level indicator */}
        {listening && soundLevel > 0 && (
          <motion.div 
            className={`absolute bottom-0 left-0 h-1 ${getSoundLevelColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, soundLevel)}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
        )}
      </motion.button>

      {/* Error message */}
      {error && (
        <div
          id="voice-button-error"
          role="alert"
          className="absolute top-full mt-2 p-2 text-sm text-white bg-error rounded shadow-lg z-10 w-48 text-center"
        >
          {error}
        </div>
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && !error && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full mt-2 p-2 text-sm bg-gray-800 text-white rounded shadow-lg z-10 w-48 text-center"
          >
            {listening ? 'Clique para parar de gravar' : 'Clique para começar a gravar'}
            <div className="text-xs mt-1 text-gray-300">
              Pressione Enter ou Espaço para {listening ? 'parar' : 'começar'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 