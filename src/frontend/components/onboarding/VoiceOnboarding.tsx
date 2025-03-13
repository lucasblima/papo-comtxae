import React from 'react';
import { 
  UserData, 
  OnboardingContext, 
  OnboardingTheme, 
  OnboardingStep 
} from '../../types/onboarding';
import { OnboardingProvider } from '../../contexts/OnboardingContext';
import { VoiceOnboardingContent } from './VoiceOnboardingContent';

/**
 * Props para o componente VoiceOnboarding
 */
export interface VoiceOnboardingProps {
  /** Callback chamado quando o onboarding é concluído com sucesso */
  onComplete?: (userData: UserData) => void;
  /** Classes CSS adicionais para o componente */
  className?: string;
  /** Etapa inicial do onboarding (padrão: 'welcome') */
  initialStep?: OnboardingStep;
  /** Etapas que devem ser puladas */
  skipSteps?: OnboardingStep[];
  /** Contexto em que o onboarding está sendo usado */
  context?: OnboardingContext;
  /** Variante visual do componente */
  themeVariant?: OnboardingTheme;
  /** Se true, não exibe animações de fundo */
  disableAnimations?: boolean;
  /** Se true, não reproduz prompts de voz */
  disableVoice?: boolean;
}

/**
 * Componente de onboarding por voz
 * 
 * Guia o usuário através de um processo de onboarding por etapas usando interações de voz.
 * Pode ser usado em diferentes contextos (landing page, página dedicada) com diferentes 
 * variantes visuais.
 * 
 * @example
 * // Uso básico
 * <VoiceOnboarding onComplete={(userData) => console.log(userData)} />
 * 
 * @example
 * // Uso com opções avançadas
 * <VoiceOnboarding
 *   context="dedicated-page"
 *   themeVariant="expanded"
 *   skipSteps={['phone']}
 *   initialStep="welcome"
 *   onComplete={handleComplete}
 * />
 */
export function VoiceOnboarding({ 
  onComplete, 
  className = '',
  initialStep = 'welcome',
  skipSteps = [],
  context = 'landing',
  themeVariant = 'default',
  disableAnimations = false,
  disableVoice = false
}: VoiceOnboardingProps) {
  return (
    <OnboardingProvider
      initialStep={initialStep}
      initialContext={context}
      initialThemeVariant={themeVariant}
      disableAnimations={disableAnimations}
      disableVoice={disableVoice}
    >
      <VoiceOnboardingContent 
        onComplete={onComplete}
        className={className}
        skipSteps={skipSteps}
      />
    </OnboardingProvider>
  );
} 