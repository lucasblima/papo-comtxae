import React from 'react';
import { motion } from 'framer-motion';

interface OnboardingBackgroundProps {
  /** Se as animações devem ser exibidas */
  enabled: boolean;
}

/**
 * Componente para renderizar o background animado do onboarding
 * 
 * Apresenta efeitos visuais sutis que podem ser ativados ou desativados.
 */
export function OnboardingBackground({ enabled }: OnboardingBackgroundProps) {
  if (!enabled) return null;
  
  return (
    <div className="absolute inset-0 opacity-10 pointer-events-none">
      <motion.div 
        className="absolute w-64 h-64 rounded-full bg-primary"
        style={{ top: '-10%', left: '-10%' }}
        animate={{ 
          x: [0, 20, 0], 
          y: [0, 10, 0],
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 15,
          ease: 'easeInOut' 
        }}
      />
      <motion.div 
        className="absolute w-64 h-64 rounded-full bg-secondary"
        style={{ bottom: '-10%', right: '-10%' }}
        animate={{ 
          x: [0, -20, 0], 
          y: [0, -10, 0],
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 20,
          ease: 'easeInOut' 
        }}
      />
    </div>
  );
} 