import React from 'react';
import { motion } from 'framer-motion';
import { VoiceVisualization } from './VoiceVisualization';

interface EnhancedVoiceButtonProps {
  isListening: boolean;
  isProcessing?: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  listeningColor?: string;
  idleColor?: string;
}

/**
 * EnhancedVoiceButton: Botão de interação por voz com feedback visual
 */
export function EnhancedVoiceButton({
  isListening,
  isProcessing = false,
  onClick,
  size = 'md',
  className = '',
  listeningColor = '#EF4444', // red-500
  idleColor = '#4F46E5', // indigo-600
}: EnhancedVoiceButtonProps): React.ReactElement {
  // Determine button dimensions based on size
  const dimensions = {
    sm: { button: 'w-12 h-12', icon: 'w-8 h-8', text: 'text-xs' },
    md: { button: 'w-16 h-16', icon: 'w-12 h-12', text: 'text-sm' },
    lg: { button: 'w-20 h-20', icon: 'w-16 h-16', text: 'text-base' }
  }[size];

  return (
    <button
      onClick={onClick}
      disabled={isProcessing}
      className={`relative flex items-center justify-center ${dimensions.button} rounded-full transition-all
        ${isListening 
          ? 'bg-red-500 hover:bg-red-600' 
          : 'bg-indigo-500 hover:bg-indigo-600'} 
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}`}
      data-testid="voice-button"
    >
      <div className="absolute">
        <VoiceVisualization 
          isListening={isListening} 
          size={size} 
          color={isListening ? listeningColor : idleColor}
          amplitude={isListening ? 0.8 : 0.2}
        />
      </div>
      <motion.div
        animate={{ scale: isListening ? 1.2 : 1 }}
        transition={{ 
          repeat: isListening ? Infinity : 0, 
          duration: 1,
          repeatType: "reverse" 
        }}
        className={`${dimensions.icon} rounded-full flex items-center justify-center
          ${isListening ? 'bg-red-600' : 'bg-indigo-600'}`}
      >
        <span className="text-white text-2xl">
          {isListening ? '■' : '▶'}
        </span>
      </motion.div>
    </button>
  );
} 