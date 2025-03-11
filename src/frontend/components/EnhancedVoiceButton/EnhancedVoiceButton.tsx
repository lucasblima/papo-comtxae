import React from 'react';
import { motion } from 'framer-motion';
import { FaMicrophone } from 'react-icons/fa';

export interface EnhancedVoiceButtonProps {
  /** Whether the button is currently recording */
  isRecording: boolean;
  /** Click handler for the button */
  onClick: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Optional class name for styling */
  className?: string;
}

/**
 * EnhancedVoiceButton: An animated button component for voice input
 * 
 * @example
 * <EnhancedVoiceButton 
 *   isRecording={true}
 *   onClick={() => console.log('clicked')}
 * />
 */
export function EnhancedVoiceButton({
  isRecording,
  onClick,
  disabled = false,
  className = ''
}: EnhancedVoiceButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative
        p-4
        rounded-full
        bg-primary
        text-white
        hover:bg-primary-dark
        focus:outline-none
        focus:ring-2
        focus:ring-primary
        focus:ring-offset-2
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={isRecording ? {
        scale: [1, 1.1, 1],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }
      } : {}}
      data-testid="enhanced-voice-button"
    >
      <FaMicrophone className="w-6 h-6" />
      
      {isRecording && (
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-primary"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{
            scale: 1.5,
            opacity: 0
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}
    </motion.button>
  );
}

export default EnhancedVoiceButton; 