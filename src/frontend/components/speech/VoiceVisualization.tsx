import React, { useEffect, useRef } from 'react';

interface VoiceVisualizationProps {
  /** The current volume level (0-255) */
  volume: number;
  /** Whether the component is actively listening */
  isListening?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * A component that visualizes voice input with animated bars
 * 
 * @example
 * <VoiceVisualization volume={75} isListening={true} className="h-24" />
 */
export function VoiceVisualization({ 
  volume, 
  isListening = false,
  className = '' 
}: VoiceVisualizationProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  /**
   * Helper function to convert hex colors to rgba
   * This handles both #rgb and #rrggbb formats as well as CSS variables
   */
  const hexToRgba = (hex: string, alpha: number = 1): string => {
    try {
      // If color is already in rgb/rgba format, parse it
      if (hex.startsWith('rgb')) {
        const rgbValues = hex.match(/\d+/g);
        if (rgbValues && rgbValues.length >= 3) {
          return `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${alpha})`;
        }
      }
      
      // Handle CSS variable format (DaisyUI often uses HSL format)
      if (!hex.startsWith('#')) {
        // Just use a default known color that works well
        return `rgba(87, 13, 248, ${alpha})`;
      }
      
      // Remove hash sign if present
      hex = hex.replace('#', '');
      
      // Expand shorthand hex
      if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
      }
      
      // Convert to rgb
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      // Return rgba
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch (error) {
      console.error('Color parsing error:', error);
      // Fallback color
      return `rgba(87, 13, 248, ${alpha})`;
    }
  };
  
  // Animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match its display size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create visualization bars
    const barWidth = 6;
    const barGap = 4;
    const totalBarWidth = barWidth + barGap;
    const numBars = Math.floor(canvas.width / totalBarWidth);
    
    // Just use a fixed color that we know works well
    // DaisyUI's CSS variables aren't compatible with Canvas API
    const primaryColorRgba = hexToRgba('#570df8', 1.0);      // Solid color
    const primaryColorTransparent = hexToRgba('#570df8', 0.85); // Semi-transparent
    
    // Generate random heights with volume influence
    const normalizedVolume = Math.min(255, Math.max(0, volume)) / 255;
    const baseHeight = canvas.height * 0.1;
    const maxVariableHeight = canvas.height * 0.7;
    
    for (let i = 0; i < numBars; i++) {
      // For active listening, make bars dynamic based on volume and position
      let barHeight;
      
      if (isListening) {
        // Create a wave-like pattern influenced by volume
        const positionFactor = Math.sin((i / numBars) * Math.PI * 2);
        const randomFactor = Math.random() * 0.3 + 0.7; // 0.7-1.0 random factor
        
        // Combine factors with volume for natural-looking animation
        barHeight = baseHeight + maxVariableHeight * normalizedVolume * positionFactor * randomFactor;
      } else {
        // When not listening, show minimal activity
        const minHeight = canvas.height * 0.05;
        const smallRandomHeight = canvas.height * 0.1 * Math.random();
        barHeight = minHeight + smallRandomHeight;
      }
      
      // Ensure height is positive and within canvas
      barHeight = Math.max(2, Math.min(barHeight, canvas.height * 0.9));
      
      // Position bar from bottom of canvas
      const x = i * (barWidth + barGap);
      const y = canvas.height - barHeight;
      
      // Draw with rounded corners and gradient
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 3);
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
      gradient.addColorStop(0, primaryColorTransparent); // Lighter at top
      gradient.addColorStop(1, primaryColorRgba);        // Darker at bottom
      
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }, [volume, isListening]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className={`w-full ${className}`}
      aria-label="Voice visualization"
    />
  );
} 