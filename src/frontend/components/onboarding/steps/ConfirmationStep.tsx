import React, { useState } from 'react';
import { useSpeechRecognition } from '../../../hooks/speech/useSpeechRecognition';
import { useAudioVisualization } from '../../../hooks/speech/useAudioVisualization';
import { OnboardingService } from '../../../services/onboardingService';
import { Step } from '../../../hooks/onboarding/useOnboardingStep';
import { EnhancedVoiceVisualizer } from '../../speech/EnhancedVoiceVisualizer';

interface ConfirmationStepProps {
  step: Step;
  userData: {
    name: string;
    phone: string;
  };
  onComplete: () => void;
  onBack: () => void;
}

export function ConfirmationStep({
  step,
  userData,
  onComplete,
  onBack,
}: ConfirmationStepProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  
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
      setIsProcessing(true);
      const result = await OnboardingService.processTranscript(transcript);
      if (result.success) {
        const response = await OnboardingService.createUser(userData);
        if (response) {
          setIsProcessing(false);
          onComplete();
        } else {
          setIsProcessing(false);
        }
      } else {
        setIsProcessing(false);
      }
    }
  };

  // Determinar o estado da visualização
  const visualizerState = isProcessing 
    ? 'processing' 
    : isRecording 
      ? 'listening' 
      : transcript 
        ? 'response-ready' 
        : 'ready';

  const voicePrompt = step.voicePrompt
    .replace('{name}', userData.name)
    .replace('{phone}', userData.phone);

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      <h2 className="text-2xl font-bold text-gray-800">{step.title}</h2>
      <p className="text-gray-600 text-center">{step.instruction}</p>

      <div className="w-full max-w-md bg-white rounded-lg shadow p-6 space-y-4">
        <div className="space-y-2">
          <p className="text-gray-600">Nome:</p>
          <p className="text-gray-800 font-medium">{userData.name}</p>
        </div>
        <div className="space-y-2">
          <p className="text-gray-600">Telefone:</p>
          <p className="text-gray-800 font-medium">{userData.phone}</p>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4 w-full">
        {/* Visualizador de voz aprimorado */}
        <EnhancedVoiceVisualizer 
          state={visualizerState}
          volume={audioVolume}
          visualizationType="fluid"
          className="mb-4"
        />

        <div className="flex justify-center gap-4">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
            disabled={isProcessing}
          >
            Voltar
          </button>
          
          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processando...' : isRecording ? 'Parar Gravação' : 'Confirmar com Voz'}
          </button>
        </div>

        {transcript && (
          <div className="w-full max-w-md p-4 bg-gray-100 rounded-lg mt-4">
            <p className="text-gray-800">{transcript}</p>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500 text-center">{voicePrompt}</p>
    </div>
  );
} 