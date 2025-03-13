import React from 'react';
import { useRouter } from 'next/router';
import { useToast } from '../ui/Toast';
import { OnboardingStep, UserData } from '../../types/onboarding';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { OnboardingLayout } from './layout/OnboardingLayout';
import { OnboardingStepRenderer } from './steps/OnboardingStepRenderer';
import { VoicePromptHandler } from './handlers/VoicePromptHandler';
import { handleConfirmationComplete } from './handlers/OnboardingHandlers';

/**
 * Props para o componente VoiceOnboardingContent
 */
export interface VoiceOnboardingContentProps {
  /** Callback chamado quando o onboarding é concluído com sucesso */
  onComplete?: ((userData: UserData) => void) | undefined;
  /** Classes CSS adicionais para o componente */
  className?: string;
  /** Etapas que devem ser puladas */
  skipSteps?: OnboardingStep[];
}

/**
 * Componente de conteúdo para o onboarding por voz
 * 
 * Gerencia os dados, a navegação entre etapas e a interação com serviços.
 */
export function VoiceOnboardingContent({
  onComplete,
  className = '',
  skipSteps = []
}: VoiceOnboardingContentProps) {
  const router = useRouter();
  const { showToast } = useToast();
  
  const {
    currentStep,
    getCurrentStep,
    goToNextStep,
    goToPreviousStep,
    userData,
    updateUserData,
    context,
    themeVariant,
    disableAnimations,
    disableVoice
  } = useOnboarding();

  // Manipuladores de eventos das etapas
  const handleNameComplete = (name: string) => {
    updateUserData({ name });
    goToNextStep();
  };

  const handlePhoneComplete = (phone: string) => {
    updateUserData({ phone });
    goToNextStep();
  };

  const handleConfirmationCompleteWrapper = async () => {
    await handleConfirmationComplete({
      userData,
      showToast,
      goToNextStep
    });
  };

  // Manipulador para a etapa de sucesso
  const handleSuccessComplete = () => {
    if (onComplete) {
      onComplete(userData);
    } else {
      router.push('/dashboard');
    }
  };

  // Obter a etapa atual
  const step = getCurrentStep();
  if (!step) return null;

  return (
    <>
      {/* Gerenciador de prompts de voz (não-visual) */}
      <VoicePromptHandler
        step={step}
        userData={userData}
        currentStep={currentStep}
        disableVoice={disableVoice}
      />
      
      {/* Layout do onboarding */}
      <OnboardingLayout
        currentStep={currentStep}
        context={context}
        themeVariant={themeVariant}
        animationsEnabled={!disableAnimations}
        className={className}
      >
        {/* Renderizador de etapas */}
        <OnboardingStepRenderer
          step={step}
          userData={userData}
          context={context}
          themeVariant={themeVariant}
          onNameComplete={handleNameComplete}
          onPhoneComplete={handlePhoneComplete}
          onConfirmationComplete={handleConfirmationCompleteWrapper}
          onSuccessComplete={handleSuccessComplete}
          onBack={goToPreviousStep}
        />
      </OnboardingLayout>
    </>
  );
} 