import { useState } from 'react';

export interface Step {
  id: string;
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

export function useOnboardingStep(initialStep = 0, steps = defaultSteps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  };
  
  const resetSteps = () => {
    setCurrentStep(0);
  };
  
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
    resetSteps,
    isFirstStep,
    isLastStep
  };
} 