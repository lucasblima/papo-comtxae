/**
 * Interfaces compartilhadas para os componentes de etapas do onboarding
 */
import { Step } from '../../../hooks/onboarding/useOnboardingStep';
import { OnboardingContext, OnboardingTheme } from '../../../types/onboarding';

/**
 * Props base comuns a todos os componentes de etapas
 */
export interface BaseStepProps {
  /** Configuração da etapa */
  step: Step;
  /** Contexto em que o onboarding está sendo usado */
  context?: OnboardingContext;
  /** Variante visual do componente */
  themeVariant?: OnboardingTheme;
}

/**
 * Common props interface for all onboarding step components
 */
export interface StepProps {
  /** Function to navigate to the next step */
  onNext: () => void;
  /** Function to navigate to the previous step */
  onBack: () => void;
  /** Additional data that can be passed to the step */
  data?: Record<string, any>;
} 