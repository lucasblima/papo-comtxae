import React from 'react';
import { Step } from '../../../hooks/onboarding/useOnboardingStep';
import { UserData, OnboardingContext, OnboardingTheme } from '../../../types/onboarding';
import { WelcomeStep } from './WelcomeStep';
import { PhoneInputStep } from './PhoneInputStep';
import { ConfirmationStep } from './ConfirmationStep';
import { SuccessStep } from './SuccessStep';

interface OnboardingStepRendererProps {
  /** Configuração da etapa atual */
  step: Step;
  /** Dados do usuário */
  userData: UserData;
  /** Contexto em que o onboarding está sendo usado */
  context: OnboardingContext;
  /** Variante visual do componente */
  themeVariant: OnboardingTheme;
  /** Callback para nome coletado */
  onNameComplete: (name: string) => void;
  /** Callback para telefone coletado */
  onPhoneComplete: (phone: string) => void;
  /** Callback para confirmação concluída */
  onConfirmationComplete: () => Promise<void>;
  /** Callback para sucesso concluído */
  onSuccessComplete: () => void;
  /** Callback para voltar à etapa anterior */
  onBack: () => void;
}

/**
 * Componente para renderizar a etapa atual do onboarding
 * 
 * Seleciona e renderiza o componente adequado com base no ID da etapa.
 */
export function OnboardingStepRenderer({
  step,
  userData,
  context,
  themeVariant,
  onNameComplete,
  onPhoneComplete,
  onConfirmationComplete,
  onSuccessComplete,
  onBack
}: OnboardingStepRendererProps) {
  switch (step.id) {
    case 'welcome':
      return (
        <WelcomeStep
          step={step}
          onComplete={onNameComplete}
          context={context}
          themeVariant={themeVariant}
        />
      );
    case 'phone':
      return (
        <PhoneInputStep
          step={step}
          onComplete={onPhoneComplete}
          onBack={onBack}
          context={context}
          themeVariant={themeVariant}
        />
      );
    case 'confirmation':
      return (
        <ConfirmationStep
          step={step}
          userData={userData}
          onComplete={onConfirmationComplete}
          onBack={onBack}
          context={context}
          themeVariant={themeVariant}
        />
      );
    case 'success':
      return (
        <SuccessStep
          step={step}
          userData={userData}
          onComplete={onSuccessComplete}
          context={context}
          themeVariant={themeVariant}
        />
      );
    default:
      return null;
  }
} 