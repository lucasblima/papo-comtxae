import React, { useState } from 'react';
import { useSpeechRecognition } from '../../../hooks/speech/useSpeechRecognition';
import { useAudioVisualization } from '../../../hooks/speech/useAudioVisualization';
import { OnboardingService } from '../../../services/onboardingService';
import { Step } from '../../../hooks/onboarding/useOnboardingStep';
import { EnhancedVoiceVisualizer } from '../../speech/EnhancedVoiceVisualizer';
import { UserData } from '../../../types/onboarding';
import { FaArrowLeft, FaCheck, FaTimes } from 'react-icons/fa';
import { BaseStepProps } from './StepProps';

/**
 * Props específicas para o componente ConfirmationStep
 */
export interface ConfirmationStepProps extends BaseStepProps {
  /** Dados do usuário coletados nas etapas anteriores */
  userData: UserData;
  /** Callback chamado quando a confirmação é concluída */
  onComplete: () => void;
  /** Callback para voltar à etapa anterior */
  onBack: () => void;
}

/**
 * Componente para a etapa de confirmação de dados
 * 
 * Exibe os dados coletados e solicita confirmação do usuário.
 */
export function ConfirmationStep({ 
  step, 
  userData, 
  onComplete, 
  onBack,
  context = 'landing',
  themeVariant = 'default'
}: ConfirmationStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
    resetTranscript,
  } = useSpeechRecognition({
    continuous: false,
    interimResults: true,
  });

  const { audioVolume } = useAudioVisualization(isRecording);

  const handleStartRecording = async () => {
    resetTranscript();
    await startRecording();
  };

  const handleStopRecording = async () => {
    stopRecording();
    if (transcript) {
      setIsLoading(true);
      const result = await OnboardingService.processTranscript(transcript);
      if (result.success) {
        const response = await OnboardingService.createUser(userData);
        if (response) {
          setIsLoading(false);
          onComplete();
        } else {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }
  };

  // Determinar o estado da visualização
  const visualizerState = isLoading 
    ? 'processing' 
    : isRecording 
      ? 'listening' 
      : transcript 
        ? 'response-ready' 
        : 'ready';

  const voicePrompt = step.voicePrompt
    .replace('{name}', userData.name)
    .replace('{phone}', userData.phone);

  // Ajusta estilos com base no contexto e tema
  const getContainerClasses = () => {
    let classes = "flex flex-col items-center w-full";
    
    if (context === 'dedicated-page') {
      classes += ' min-h-[250px]';
    }
    
    if (themeVariant === 'expanded') {
      classes += ' max-w-2xl mx-auto';
    } else if (themeVariant === 'minimal') {
      classes += ' p-2';
    } else {
      classes += ' p-4';
    }
    
    return classes;
  };
  
  // Ajusta estilos para o card de dados
  const getCardClasses = () => {
    let classes = "bg-base-200 rounded-lg p-6 w-full mt-6";
    
    if (themeVariant === 'expanded') {
      classes += ' max-w-lg mx-auto shadow-lg';
    } else if (themeVariant === 'minimal') {
      classes += ' p-4';
    }
    
    return classes;
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onComplete();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={getContainerClasses()}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{step.title}</h2>
        <p className="text-gray-600 mt-2">{step.instruction}</p>
      </div>
      
      <div className={getCardClasses()}>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Confira seus dados:</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">Nome:</span>
              <span className="font-medium">{userData.name}</span>
            </div>
            
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">Telefone:</span>
              <span className="font-medium">{userData.phone}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <button 
            type="button" 
            onClick={onBack}
            className="btn btn-outline gap-2"
            disabled={isLoading}
          >
            <FaArrowLeft /> Voltar
          </button>
          
          <div className="space-x-2">
            <button 
              type="button" 
              onClick={onBack}
              className="btn btn-outline btn-error gap-2"
              disabled={isLoading}
            >
              <FaTimes /> Corrigir
            </button>
            
            <button 
              type="button" 
              onClick={handleConfirm}
              className={`btn btn-success gap-2 ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              <FaCheck /> Confirmar
            </button>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 text-center">{voicePrompt}</p>
    </div>
  );
} 