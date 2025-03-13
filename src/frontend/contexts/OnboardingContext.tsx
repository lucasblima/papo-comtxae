import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserData, OnboardingStep, OnboardingContext as OnboardingContextType, OnboardingTheme } from '../types/onboarding';
import { useOnboardingStep, Step } from '../hooks/onboarding/useOnboardingStep';

interface OnboardingContextValue {
  // Estado do usuário
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
  
  // Controle de etapas
  currentStep: number;
  steps: Step[];
  getCurrentStep: () => Step | undefined;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: number) => void;
  setInitialStep: (stepId: OnboardingStep) => void;
  resetSteps: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  
  // Configuração visual
  context: OnboardingContextType;
  themeVariant: OnboardingTheme;
  setContext: (context: OnboardingContextType) => void;
  setThemeVariant: (variant: OnboardingTheme) => void;
  
  // Configurações
  disableAnimations: boolean;
  disableVoice: boolean;
  setDisableAnimations: (disable: boolean) => void;
  setDisableVoice: (disable: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
  initialStep?: OnboardingStep;
  initialContext?: OnboardingContextType;
  initialThemeVariant?: OnboardingTheme;
  disableAnimations?: boolean;
  disableVoice?: boolean;
}

export function OnboardingProvider({
  children,
  initialStep = 'welcome',
  initialContext = 'landing',
  initialThemeVariant = 'default',
  disableAnimations = false,
  disableVoice = false
}: OnboardingProviderProps) {
  // Inicializar o hook de etapas
  const stepControls = useOnboardingStep();
  
  // Estado do usuário
  const [userData, setUserData] = useState<UserData>({
    name: '',
    phone: '',
  });
  
  // Configurações visuais
  const [context, setContext] = useState<OnboardingContextType>(initialContext);
  const [themeVariant, setThemeVariant] = useState<OnboardingTheme>(initialThemeVariant);
  
  // Configurações
  const [disableAnimationsState, setDisableAnimations] = useState(disableAnimations);
  const [disableVoiceState, setDisableVoice] = useState(disableVoice);
  
  // Definir etapa inicial
  React.useEffect(() => {
    stepControls.setInitialStep(initialStep);
  }, [initialStep]);
  
  // Função para atualizar dados do usuário
  const updateUserData = (data: Partial<UserData>) => {
    setUserData(prev => ({ ...prev, ...data }));
  };
  
  const value: OnboardingContextValue = {
    // Estado do usuário
    userData,
    updateUserData,
    
    // Controle de etapas
    ...stepControls,
    
    // Configuração visual
    context,
    themeVariant,
    setContext,
    setThemeVariant,
    
    // Configurações
    disableAnimations: disableAnimationsState,
    disableVoice: disableVoiceState,
    setDisableAnimations,
    setDisableVoice
  };
  
  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

/**
 * Hook para acessar o contexto de onboarding
 * 
 * @returns Contexto de onboarding
 * @throws Erro se usado fora de um OnboardingProvider
 */
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
} 