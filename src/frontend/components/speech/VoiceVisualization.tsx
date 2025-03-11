import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export interface VoiceVisualizationProps {
  isListening: boolean;
  amplitude?: number; // 0 to 1, optional amplitude value
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * VoiceVisualization: Componente para visualização de áudio durante interação por voz
 */
export function VoiceVisualization({
  isListening,
  amplitude = 0.5, // default amplitude if not provided
  color = '#4F46E5', // default indigo color
  size = 'md'
}: VoiceVisualizationProps): React.ReactElement {
  const [bars, setBars] = useState<number[]>([]);
  
  // Number of bars in the visualization
  const barCount = size === 'sm' ? 3 : size === 'md' ? 5 : 7;
  
  // Base size of visualization container
  const containerSize = size === 'sm' ? 40 : size === 'md' ? 60 : 80;
  
  // Generate random bar heights for animation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isListening) {
      interval = setInterval(() => {
        const newBars = Array.from({ length: barCount }, () => {
          return Math.random() * amplitude;
        });
        setBars(newBars);
      }, 100);
    } else {
      setBars(Array(barCount).fill(0.1));
    }
    
    // Always return a cleanup function
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isListening, amplitude, barCount]);

  // Determine bar width based on size and count
  const barWidth = Math.max(3, Math.floor((containerSize * 0.8) / barCount));
  const barGap = Math.max(2, Math.floor(barWidth / 2));
  const maxBarHeight = containerSize * 0.8;

  return (
    <div 
      className="flex items-center justify-center"
      style={{ 
        width: `${containerSize}px`, 
        height: `${containerSize}px`,
      }}
      data-testid="voice-visualization"
    >
      <div className="flex items-end justify-center space-x-1">
        {bars.map((height, index) => (
          <motion.div
            key={index}
            animate={{ 
              height: `${Math.max(5, height * maxBarHeight)}px` 
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 10
            }}
            style={{ 
              width: `${barWidth}px`,
              backgroundColor: color,
              borderRadius: '2px'
            }}
          />
        ))}
      </div>
    </div>
  );
} 