import React from 'react';
import { useSpeechRecognition } from '../../../hooks/speech/useSpeechRecognition';
import { useAudioVisualization } from '../../../hooks/speech/useAudioVisualization';
import { OnboardingService } from '../../../services/onboardingService';
import { Step } from '../../../hooks/onboarding/useOnboardingStep';

interface WelcomeStepProps {
  step: Step;
  onComplete: (name: string) => void;
}

export function WelcomeStep({ step, onComplete }: WelcomeStepProps) {
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
      const result = await OnboardingService.processTranscript(transcript);
      if (result.success && result.name) {
        onComplete(result.name);
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      <h2 className="text-2xl font-bold text-gray-800">{step.title}</h2>
      <p className="text-gray-600 text-center">{step.instruction}</p>
      
      {step.placeholder && (
        <p className="text-sm text-gray-500 italic">{step.placeholder}</p>
      )}

      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          className={`px-6 py-3 rounded-full font-medium transition-all ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isRecording ? 'Parar Gravação' : 'Começar Gravação'}
        </button>

        {isRecording && (
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-100"
              style={{ width: `${Math.min(audioVolume * 100, 100)}%` }}
            />
          </div>
        )}

        {transcript && (
          <div className="w-full max-w-md p-4 bg-gray-100 rounded-lg">
            <p className="text-gray-800">{transcript}</p>
          </div>
        )}
      </div>
    </div>
  );
} 