import React, { useState } from 'react';
import { useSpeechRecognition } from '../../../hooks/speech/useSpeechRecognition';
import { useAudioVisualization } from '../../../hooks/speech/useAudioVisualization';
import { OnboardingService } from '../../../services/onboardingService';
import { Step } from '../../../hooks/onboarding/useOnboardingStep';
import { EnhancedVoiceVisualizer } from '../../speech/EnhancedVoiceVisualizer';

interface WelcomeStepProps {
  step: Step;
  onComplete: (name: string) => void;
}

export function WelcomeStep({ step, onComplete }: WelcomeStepProps) {
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
      setIsProcessing(false);
      if (result.success && result.name) {
        onComplete(result.name);
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

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      <h2 className="text-2xl font-bold text-gray-800">{step.title}</h2>
      <p className="text-gray-600 text-center">{step.instruction}</p>
      
      {step.placeholder && (
        <p className="text-sm text-gray-500 italic">{step.placeholder}</p>
      )}

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
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processando...' : isRecording ? 'Parar Gravação' : 'Começar Gravação'}
          </button>

          {transcript && !isRecording && !isProcessing && (
            <button
              onClick={handleStopRecording}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium transition-all"
            >
              Confirmar
            </button>
          )}
        </div>

        {transcript && (
          <div className="w-full max-w-md p-4 bg-gray-100 rounded-lg mt-4">
            <p className="text-gray-800">{transcript}</p>
          </div>
        )}
      </div>
    </div>
  );
} 