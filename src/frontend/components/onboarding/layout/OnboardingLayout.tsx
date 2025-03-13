import React, { ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { OnboardingContext, OnboardingTheme } from '../../../types/onboarding';
import { OnboardingBackground } from './OnboardingBackground';
import { OnboardingProgress } from './OnboardingProgress';

interface OnboardingLayoutProps {
  /** Conteúdo do componente */
  children: ReactNode;
  /** Índice da etapa atual */
  currentStep: number;
  /** Contexto em que o onboarding está sendo usado */
  context: OnboardingContext;
  /** Variante visual do componente */
  themeVariant: OnboardingTheme;
  /** Se as animações devem ser exibidas */
  animationsEnabled: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Componente de layout para o onboarding
 * 
 * Fornece a estrutura visual para o processo de onboarding,
 * incluindo o container, card, background e indicador de progresso.
 */
export function OnboardingLayout({
  children,
  currentStep,
  context,
  themeVariant,
  animationsEnabled,
  className = ''
}: OnboardingLayoutProps) {
  return (
    <div 
      role="main"
      aria-live="polite"
      className={getContainerClasses(context, className)}
    >
      <div className={getCardClasses(themeVariant)}>
        {/* Background animado */}
        <OnboardingBackground enabled={animationsEnabled} />
        
        {/* Indicador de progresso */}
        <OnboardingProgress 
          currentStep={currentStep} 
          themeVariant={themeVariant} 
        />
        
        {/* Conteúdo das etapas */}
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Gera as classes CSS para o container com base no contexto
 */
function getContainerClasses(context: OnboardingContext, className: string): string {
  let baseClasses = `flex flex-col items-center justify-center px-4 ${className}`;
  
  // Altura do container com base no contexto
  if (context === 'landing') {
    baseClasses += ' min-h-[70vh]';
  } else if (context === 'dedicated-page') {
    baseClasses += ' min-h-[90vh]';
  }
  
  return baseClasses;
}

/**
 * Gera as classes CSS para o card com base na variante de tema
 */
function getCardClasses(themeVariant: OnboardingTheme): string {
  let baseClasses = 'bg-base-100 shadow-xl rounded-xl p-8 relative overflow-hidden';
  
  // Largura do card com base na variante
  switch (themeVariant) {
    case 'minimal':
      return `${baseClasses} w-full max-w-md`;
    case 'expanded':
      return `${baseClasses} w-full max-w-4xl`;
    default:
      return `${baseClasses} w-full max-w-3xl`;
  }
} 