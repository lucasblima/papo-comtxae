import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export interface VoiceVisualizationProps {
  /** Whether the microphone is actively listening */
  isListening?: boolean;
  /** The current volume level (0-100) */
  volume?: number;
  /** Amplitude value (0 to 1) - alternative to volume */
  amplitude?: number;
  /** Color of the visualization */
  color?: string;
  /** Size of the visualization */
  size?: 'sm' | 'md' | 'lg';
  /** Optional class name for styling */
  className?: string;
}

/**
 * VoiceVisualization: A component that provides visual feedback for voice input
 * 
 * @example
 * <VoiceVisualization isListening={true} volume={50} />
 * <VoiceVisualization isListening={true} amplitude={0.5} color="#4F46E5" />
 */
export function VoiceVisualization({
  isListening = false,
  volume,
  amplitude = 0.5,
  color = '#4F46E5',
  size = 'md',
  className = ''
}: VoiceVisualizationProps): React.ReactElement {
  const [bars, setBars] = useState<number[]>([]);
  
  // If volume is provided, convert it to amplitude (0-1 range)
  const effectiveAmplitude = volume !== undefined 
    ? Math.min(1, Math.max(0, volume / 100))
    : amplitude;
  
  // Number of bars in the visualization
  const barCount = size === 'sm' ? 3 : size === 'md' ? 5 : 7;
  
  // Base size of visualization container
  const containerSize = size === 'sm' ? 'h-8 w-16' : size === 'md' ? 'h-12 w-24' : 'h-16 w-32';
  
  // Generate random bar heights when listening
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        const newBars = Array(barCount).fill(0).map(() => {
          return effectiveAmplitude * (0.5 + Math.random() * 0.5);
        });
        setBars(newBars);
      }, 100);
      
      return () => clearInterval(interval);
    } else {
      setBars(Array(barCount).fill(0.1));
      return () => {};
    }
  }, [isListening, barCount, effectiveAmplitude]);
  
  return (
    <div className={`flex items-end justify-center space-x-1 ${containerSize} ${className}`}>
      {bars.map((height, index) => (
        <motion.div
          key={index}
          className="bg-primary rounded-full w-1.5"
          style={{ 
            backgroundColor: color,
            height: '100%',
            transformOrigin: 'bottom'
          }}
          animate={{ 
            scaleY: height,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
        />
      ))}
    </div>
  );
} 