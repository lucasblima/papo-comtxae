import React from 'react';
import { OnboardingTheme } from '../../../types/onboarding';

interface OnboardingProgressProps {
  /** Índice da etapa atual */
  currentStep: number;
  /** Variante visual do tema */
  themeVariant: OnboardingTheme;
}

/**
 * Componente para exibir o progresso do onboarding
 * 
 * Exibe um indicador de progresso baseado na etapa atual.
 * Só é exibido na variante expandida.
 */
export function OnboardingProgress({ 
  currentStep, 
  themeVariant 
}: OnboardingProgressProps) {
  // Só exibe o progresso na variante expandida
  if (themeVariant !== 'expanded') return null;
  
  return (
    <div className="mb-6">
      <ul className="steps steps-horizontal w-full">
        <li className={`step ${currentStep >= 0 ? 'step-primary' : ''}`}>Boas-vindas</li>
        <li className={`step ${currentStep >= 1 ? 'step-primary' : ''}`}>Telefone</li>
        <li className={`step ${currentStep >= 2 ? 'step-primary' : ''}`}>Confirmação</li>
        <li className={`step ${currentStep >= 3 ? 'step-primary' : ''}`}>Concluído</li>
      </ul>
    </div>
  );
} 