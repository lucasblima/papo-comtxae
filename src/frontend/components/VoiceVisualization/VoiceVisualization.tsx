import React from 'react';
import { motion } from 'framer-motion';

export interface VoiceVisualizationProps {
  /** The current volume level (0-100) */
  volume: number;
  /** Optional class name for styling */
  className?: string;
}

/**
 * VoiceVisualization: A component that provides visual feedback for voice input
 * 
 * @example
 * <VoiceVisualization volume={50} />
 */
export function VoiceVisualization({ volume, className = '' }: VoiceVisualizationProps) {
  // Normalize volume to 0-100 range
  const normalizedVolume = Math.min(100, Math.max(0, volume));
  
  // Calculate the number of active bars based on volume
  const totalBars = 20;
  const activeBars = Math.floor((normalizedVolume / 100) * totalBars);
  
  return (
    <div 
      className={`voice-visualization flex items-center justify-center gap-1 h-12 ${className}`}
      data-testid="voice-visualization"
    >
      {Array.from({ length: totalBars }).map((_, index) => (
        <motion.div
          key={index}
          className={`w-1 rounded-full ${index < activeBars ? 'bg-primary' : 'bg-gray-300'}`}
          initial={{ height: '10%' }}
          animate={{ 
            height: index < activeBars 
              ? `${Math.max(20, Math.min(100, (normalizedVolume * (1 + Math.sin(index / 2)) / 2)))}%` 
              : '10%'
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20
          }}
        />
      ))}
    </div>
  );
}

export default VoiceVisualization; 