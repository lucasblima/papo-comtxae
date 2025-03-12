import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceVisualizationProps {
  /** The current volume level (0-255) */
  volume: number;
  /** Whether the component is actively listening */
  isListening?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Color theme for the visualization */
  theme?: {
    primary?: string;
    secondary?: string;
    background?: string;
  };
  /** Number of bars to display (default: auto-calculated) */
  barCount?: number;
  /** Animation speed multiplier (1 = normal, 2 = faster, 0.5 = slower) */
  animationSpeed?: number;
  /** Visualization style ('bars' | 'wave' | 'circle') */
  style?: 'bars' | 'wave' | 'circle';
  /** Height of the visualization in pixels */
  height?: number;
  /** Whether to show the volume level numerically */
  showVolumeLevel?: boolean;
  /** Custom aria-label for accessibility */
  ariaLabel?: string;
}

/**
 * A component that visualizes voice input with animated visualizations
 * 
 * @example
 * <VoiceVisualization 
 *   volume={75} 
 *   isListening={true} 
 *   className="h-24"
 *   theme={{ primary: "#570df8", secondary: "#1f6feb" }}
 *   style="bars"
 *   showVolumeLevel={true}
 * />
 */
export function VoiceVisualization({ 
  volume, 
  isListening = false,
  className = '',
  theme = {},
  barCount,
  animationSpeed = 1,
  style = 'bars',
  height = 100,
  showVolumeLevel = false,
  ariaLabel = 'Voice visualization'
}: VoiceVisualizationProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const previousVolumeRef = useRef<number>(volume);
  
  // Memoize theme colors to prevent unnecessary recalculations
  const colors = useMemo(() => ({
    primary: theme.primary || '#570df8',
    secondary: theme.secondary || '#1f6feb',
    background: theme.background || 'transparent'
  }), [theme]);

  /**
   * Enhanced color conversion with error handling and caching
   */
  const hexToRgba = useCallback((hex: string, alpha: number = 1): string => {
    try {
      // Cache key for memoization
      const cacheKey = `${hex}-${alpha}`;
      
      // If color is already in rgb/rgba format, parse it
      if (hex.startsWith('rgb')) {
        const rgbValues = hex.match(/\d+/g);
        if (rgbValues && rgbValues.length >= 3) {
          return `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${alpha})`;
        }
      }
      
      // Handle CSS variable format
      if (!hex.startsWith('#')) {
        return `rgba(87, 13, 248, ${alpha})`; // Default fallback
      }
      
      // Standard hex processing
      const cleanHex = hex.replace('#', '');
      const expandedHex = cleanHex.length === 3 
        ? cleanHex.split('').map(char => char + char).join('')
        : cleanHex;
      
      const r = parseInt(expandedHex.substring(0, 2), 16);
      const g = parseInt(expandedHex.substring(2, 4), 16);
      const b = parseInt(expandedHex.substring(4, 6), 16);
      
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch (error) {
      console.error('Color parsing error:', error);
      return `rgba(87, 13, 248, ${alpha})`; // Fallback color
    }
  }, []);

  /**
   * Draw visualization based on current style
   */
  const drawVisualization = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Clear canvas with background
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const normalizedVolume = Math.min(255, Math.max(0, volume)) / 255;
    const smoothedVolume = normalizedVolume * 0.7 + (previousVolumeRef.current / 255) * 0.3;
    previousVolumeRef.current = volume;

    switch (style) {
      case 'wave':
        drawWaveVisualization(ctx, canvas, smoothedVolume);
        break;
      case 'circle':
        drawCircleVisualization(ctx, canvas, smoothedVolume);
        break;
      default:
        drawBarsVisualization(ctx, canvas, smoothedVolume);
    }
  }, [volume, style, colors, hexToRgba]);

  /**
   * Draw bars visualization
   */
  const drawBarsVisualization = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement,
    normalizedVolume: number
  ) => {
    const barWidth = 6;
    const barGap = 4;
    const totalBarWidth = barWidth + barGap;
    const numBars = barCount || Math.floor(canvas.width / totalBarWidth);
    
    const primaryColorRgba = hexToRgba(colors.primary, 1.0);
    const secondaryColorRgba = hexToRgba(colors.secondary, 0.85);
    
    const baseHeight = canvas.height * 0.1;
    const maxVariableHeight = canvas.height * 0.7;
    
    for (let i = 0; i < numBars; i++) {
      let barHeight;
      
      if (isListening) {
        const positionFactor = Math.sin((i / numBars) * Math.PI * 2 + Date.now() * 0.002 * animationSpeed);
        const randomFactor = Math.random() * 0.3 + 0.7;
        barHeight = baseHeight + maxVariableHeight * normalizedVolume * positionFactor * randomFactor;
      } else {
        const minHeight = canvas.height * 0.05;
        const smallRandomHeight = canvas.height * 0.1 * Math.random();
        barHeight = minHeight + smallRandomHeight;
      }
      
      barHeight = Math.max(2, Math.min(barHeight, canvas.height * 0.9));
      
      const x = i * (barWidth + barGap);
      const y = canvas.height - barHeight;
      
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 3);
      
      const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
      gradient.addColorStop(0, secondaryColorRgba);
      gradient.addColorStop(1, primaryColorRgba);
      
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  };

  /**
   * Draw wave visualization
   */
  const drawWaveVisualization = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement,
    normalizedVolume: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    
    const amplitude = canvas.height * 0.4 * normalizedVolume;
    const frequency = 0.02 * animationSpeed;
    
    for (let x = 0; x < canvas.width; x++) {
      const y = canvas.height / 2 + 
        Math.sin(x * frequency + Date.now() * 0.01) * amplitude * 
        (isListening ? 1 : 0.2);
      
      ctx.lineTo(x, y);
    }
    
    ctx.strokeStyle = hexToRgba(colors.primary, 0.8);
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  /**
   * Draw circle visualization
   */
  const drawCircleVisualization = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement,
    normalizedVolume: number
  ) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;
    
    // Draw outer circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius * (0.5 + normalizedVolume * 0.5), 0, Math.PI * 2);
    ctx.strokeStyle = hexToRgba(colors.primary, 0.3);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw animated inner circle
    const innerRadius = maxRadius * 0.8 * (0.5 + normalizedVolume * 0.5);
    ctx.beginPath();
    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
      const radiusOffset = Math.sin(angle * 8 + Date.now() * 0.003 * animationSpeed) * 
        (normalizedVolume * 20) * (isListening ? 1 : 0.2);
      const x = centerX + (innerRadius + radiusOffset) * Math.cos(angle);
      const y = centerY + (innerRadius + radiusOffset) * Math.sin(angle);
      
      if (angle === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, innerRadius
    );
    gradient.addColorStop(0, hexToRgba(colors.secondary, 0.4));
    gradient.addColorStop(1, hexToRgba(colors.primary, 0.8));
    
    ctx.fillStyle = gradient;
    ctx.fill();
  };

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    // Style for crisp lines
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const animate = () => {
      drawVisualization(ctx, canvas);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawVisualization, height]);

  return (
    <div 
      className={`relative ${className}`}
      style={{ height: `${height}px` }}
      role="img"
      aria-label={`${ariaLabel}${isListening ? ' - Recording in progress' : ''}`}
    >
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
      
      <AnimatePresence>
        {showVolumeLevel && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-2 right-2 px-2 py-1 text-xs font-mono bg-black/50 text-white rounded"
            aria-live="polite"
          >
            {Math.round((volume / 255) * 100)}%
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 