import React, { useEffect } from 'react';
import { Step } from '../../../hooks/onboarding/useOnboardingStep';
import { UserData } from '../../../types/onboarding';
import { useTextToSpeech } from '../../../hooks/speech/useTextToSpeech';

interface VoicePromptHandlerProps {
  /** Configuração da etapa atual */
  step?: Step;
  /** Dados do usuário */
  userData: UserData;
  /** Índice da etapa atual */
  currentStep: number;
  /** Se os prompts de voz devem ser desativados */
  disableVoice: boolean;
}

/**
 * Componente responsável por gerenciar os prompts de voz do onboarding
 * 
 * Reproduz prompts de voz com base na etapa atual e dados do usuário.
 * Funciona de forma invisível, não renderizando nenhum elemento visível.
 */
export function VoicePromptHandler({
  step,
  userData,
  currentStep,
  disableVoice
}: VoicePromptHandlerProps) {
  const { speak, cancel } = useTextToSpeech();
  
  // Gerenciar prompts de voz
  useEffect(() => {
    if (disableVoice || !step?.voicePrompt) return;
    
    let prompt = step.voicePrompt;
    
    // Substituir placeholders com dados do usuário na etapa de confirmação
    if (step.id === 'confirmation') {
      prompt = prompt
        .replace('{name}', userData.name)
        .replace('{phone}', userData.phone);
    }
    
    speak(prompt);
    
    // Cancelar fala ao desmontar
    return () => cancel();
  }, [currentStep, userData.name, userData.phone, disableVoice, step]);
  
  // Componente funcional sem renderização visível
  return null;
} 