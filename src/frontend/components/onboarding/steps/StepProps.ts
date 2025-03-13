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