import { useState } from 'react';
import { OnboardingStep } from '../../types/onboarding';

export interface Step {
  id: OnboardingStep;
  title: string;
  instruction: string;
  placeholder?: string;
  voicePrompt: string;
  showPhoneInput?: boolean;
}

export const defaultSteps: Step[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Papo Social!',
    instruction: 'Vamos começar com seu nome. Clique no botão e se apresente.',
    placeholder: 'Ex: "Olá, me chamo Maria" ou "Meu nome é João"',
    voicePrompt: 'Olá! Como você se chama?',
  },
  {
    id: 'phone',
    title: 'Quase lá!',
    instruction: 'Para sua segurança, precisamos do seu número de telefone.',
    voicePrompt: 'Por favor, digite seu número de telefone.',
    showPhoneInput: true,
  },
  {
    id: 'confirmation',
    title: 'Prazer em conhecê-lo!',
    instruction: 'Vamos confirmar seus dados. Está tudo correto?',
    voicePrompt: 'Entendi que seu nome é {name} e seu telefone é {phone}. Está correto?',
  },
  {
    id: 'success',
    title: 'Perfeito!',
    instruction: 'Sua conta foi criada com sucesso!',
    voicePrompt: 'Ótimo! Sua conta foi criada. Bem-vindo ao Papo Social!',
  }
];

/**
 * Hook para gerenciar as etapas do processo de onboarding
 * 
 * @param initialStepIndex - Índice da etapa inicial (padrão: 0)
 * @param steps - Array de etapas personalizado (padrão: defaultSteps)
 */
export function useOnboardingStep(initialStepIndex = 0, steps = defaultSteps) {
  const [currentStep, setCurrentStep] = useState(initialStepIndex);
  
  /**
   * Avança para a próxima etapa
   */
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  /**
   * Retorna para a etapa anterior
   */
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  /**
   * Vai para uma etapa específica pelo índice
   */
  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  };
  
  /**
   * Define a etapa inicial pelo ID
   */
  const setInitialStep = (stepId: OnboardingStep) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex);
    }
  };
  
  /**
   * Reinicia o processo voltando para a primeira etapa
   */
  const resetSteps = () => {
    setCurrentStep(0);
  };
  
  /**
   * Retorna a etapa atual
   */
  const getCurrentStep = () => steps[currentStep];
  
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  
  return {
    currentStep,
    steps,
    getCurrentStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    setInitialStep,
    resetSteps,
    isFirstStep,
    isLastStep
  };
} 