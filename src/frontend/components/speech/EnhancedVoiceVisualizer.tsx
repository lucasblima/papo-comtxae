import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Paleta de cores do Papo Social
const PAPO_SOCIAL_COLORS = {
  primaryGreen: '#9CC033',    // Verde limão
  secondaryBlue: '#001F5F',   // Azul marinho
  accentOrange: '#F68B33',    // Laranja
  accentYellow: '#F5C644',    // Amarelo
  accentLightBlue: '#83C7CB', // Azul claro
  accentPink: '#F27889',      // Rosa
};

export interface EnhancedVoiceVisualizerProps {
  /** Estado atual da visualização */
  state: 'ready' | 'listening' | 'processing' | 'response-ready';
  /** Nível de volume de áudio (0-100) */
  volume: number;
  /** Estilo de visualização */
  visualizationType?: 'wave' | 'bars' | 'circle' | 'fluid';
  /** Cor personalizada baseada na comunidade */
  communityColor?: string;
  /** Classes CSS adicionais */
  className?: string;
  /** Texto descritivo para acessibilidade */
  ariaLabel?: string;
}

/**
 * Componente aprimorado para visualização de voz que mostra feedback visual dinâmico
 * sobre o estado do reconhecimento de voz
 */
export function EnhancedVoiceVisualizer({
  state = 'ready',
  volume = 0,
  visualizationType = 'fluid',
  communityColor,
  className = '',
  ariaLabel = 'Visualização de voz',
}: EnhancedVoiceVisualizerProps): React.ReactElement {
  // Normalizar volume para 0-1
  const normalizedVolume = Math.min(Math.max(volume / 100, 0), 1);
  
  // Determinar cores baseadas no estado
  const getStateColors = () => {
    switch (state) {
      case 'listening':
        return {
          primary: communityColor || PAPO_SOCIAL_COLORS.primaryGreen,
          secondary: PAPO_SOCIAL_COLORS.accentLightBlue,
          accent: PAPO_SOCIAL_COLORS.accentOrange,
        };
      case 'processing':
        return {
          primary: PAPO_SOCIAL_COLORS.accentYellow,
          secondary: PAPO_SOCIAL_COLORS.accentOrange,
          accent: PAPO_SOCIAL_COLORS.primaryGreen,
        };
      case 'response-ready':
        return {
          primary: PAPO_SOCIAL_COLORS.accentPink,
          secondary: PAPO_SOCIAL_COLORS.accentOrange,
          accent: PAPO_SOCIAL_COLORS.primaryGreen,
        };
      default: // ready
        return {
          primary: PAPO_SOCIAL_COLORS.secondaryBlue,
          secondary: PAPO_SOCIAL_COLORS.accentLightBlue,
          accent: PAPO_SOCIAL_COLORS.secondaryBlue,
        };
    }
  };

  const colors = getStateColors();

  // Renderizar barras de visualização
  const renderBars = () => {
    const bars = [];
    const barCount = 10;
    
    for (let i = 0; i < barCount; i++) {
      // Calcular altura baseada no volume e posição
      const heightFactor = 
        state === 'listening' 
          ? Math.sin((i / barCount) * Math.PI + Date.now() * 0.003) * 0.5 + 0.5
          : 0.2 + Math.random() * 0.2;
      
      const height = state === 'ready' 
        ? '15%' 
        : `${15 + heightFactor * normalizedVolume * 70}%`;
      
      // Calcular atraso para efeito de onda
      const delay = i * 0.05;
      
      bars.push(
        <motion.div
          key={i}
          className="bar"
          initial={{ height: '15%' }}
          animate={{ 
            height,
            backgroundColor: colors.primary,
          }}
          transition={{
            height: { type: 'spring', stiffness: 300, damping: 15, delay },
            backgroundColor: { duration: 0.5 }
          }}
          style={{
            backgroundColor: colors.primary,
            marginLeft: i > 0 ? '4px' : '0',
            borderRadius: '2px',
            flex: 1,
          }}
        />
      );
    }
    
    return (
      <div className="flex items-end justify-center h-full w-full space-x-1">
        {bars}
      </div>
    );
  };

  // Renderizar visualização tipo onda
  const renderWave = () => {
    return (
      <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
        <motion.path
          d={`M 0,50 ${Array.from({ length: 10 }).map((_, i) => {
            const x = i * 20;
            const heightFactor = state === 'listening' ? normalizedVolume * 40 : 10;
            return `S ${x + 10},${50 - heightFactor} ${x + 20},50`;
          }).join(' ')} S 200,50 200,50`}
          fill="none"
          stroke={colors.primary}
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ 
            pathLength: 1,
            pathOffset: state === 'listening' ? [0, 0.5] : 0 
          }}
          transition={{ 
            pathLength: { duration: 2, ease: "easeOut" },
            pathOffset: { 
              duration: 2, 
              repeat: state === 'listening' ? Infinity : 0,
              ease: "linear"
            }
          }}
        />
      </svg>
    );
  };

  // Renderizar visualização tipo círculo
  const renderCircle = () => {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <motion.div
          className="absolute rounded-full"
          animate={{
            width: state === 'listening' 
              ? [40 + normalizedVolume * 60 + '%', 60 + normalizedVolume * 40 + '%']
              : '50%',
            height: state === 'listening' 
              ? [40 + normalizedVolume * 60 + '%', 60 + normalizedVolume * 40 + '%']
              : '50%',
            borderColor: colors.primary,
            borderWidth: state === 'processing' ? [1, 3, 1] : 2,
          }}
          transition={{
            width: { 
              repeat: state === 'listening' ? Infinity : 0, 
              duration: 1.5,
              repeatType: 'reverse',
            },
            height: { 
              repeat: state === 'listening' ? Infinity : 0, 
              duration: 1.5,
              repeatType: 'reverse',
            },
            borderWidth: { 
              repeat: state === 'processing' ? Infinity : 0, 
              duration: 1,
              repeatType: 'reverse',
            }
          }}
          style={{
            backgroundColor: state === 'response-ready' 
              ? colors.primary
              : 'transparent',
            opacity: state === 'ready' ? 0.5 : 0.8,
          }}
        />
      </div>
    );
  };

  // Renderizar visualização tipo fluido
  const renderFluid = () => {
    return (
      <div className="relative w-full h-full overflow-hidden rounded-full">
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            background: `radial-gradient(circle, ${colors.secondary} 0%, ${colors.primary} 100%)`,
          }}
          transition={{
            background: { duration: 0.5 }
          }}
        >
          {/* Bolhas/Ondas Fluidas */}
          {state === 'listening' && Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white opacity-20"
              initial={{ 
                width: '20%', 
                height: '20%',
                x: Math.random() * 100 - 50,
                y: Math.random() * 100 - 50,
                scale: 0
              }}
              animate={{ 
                scale: [0, 1 + normalizedVolume * 2],
                opacity: [0.5, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 2 + i * 0.5,
                delay: i * 0.3,
                ease: "easeOut"
              }}
            />
          ))}
          
          {/* Indicador do estado atual */}
          <motion.div 
            className="relative rounded-full bg-white z-10"
            animate={{
              width: state === 'processing' ? '30%' : '40%',
              height: state === 'processing' ? '30%' : '40%',
              opacity: state === 'response-ready' ? [0.3, 0.8] : 0.3,
            }}
            transition={{
              width: { 
                repeat: state === 'processing' ? Infinity : 0,
                duration: 0.8,
                repeatType: 'reverse'
              },
              height: { 
                repeat: state === 'processing' ? Infinity : 0,
                duration: 0.8,
                repeatType: 'reverse'
              },
              opacity: {
                repeat: state === 'response-ready' ? Infinity : 0,
                duration: 0.8,
                repeatType: 'reverse'
              }
            }}
          />
        </motion.div>
      </div>
    );
  };

  // Escolher o tipo de visualização
  const renderVisualization = () => {
    switch (visualizationType) {
      case 'wave':
        return renderWave();
      case 'bars':
        return renderBars();
      case 'circle':
        return renderCircle();
      case 'fluid':
      default:
        return renderFluid();
    }
  };

  // Status text para acessibilidade
  const getStatusText = () => {
    switch (state) {
      case 'listening':
        return 'Escutando...';
      case 'processing':
        return 'Processando...';
      case 'response-ready':
        return 'Resposta pronta';
      default:
        return 'Pronto para escutar';
    }
  };

  return (
    <div 
      className={`enhanced-voice-visualizer relative ${className}`}
      style={{ 
        height: "120px", 
        width: "100%", 
        maxWidth: "300px",
        position: "relative",
        marginLeft: "auto",
        marginRight: "auto",
      }}
      role="img"
      aria-label={`${ariaLabel}: ${getStatusText()}`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          {renderVisualization()}
        </motion.div>
      </AnimatePresence>
      
      {/* Texto de status para acessibilidade visual */}
      <div className="sr-only">{getStatusText()}</div>
    </div>
  );
} 