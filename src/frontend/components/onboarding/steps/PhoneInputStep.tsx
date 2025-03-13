import React, { useState, ChangeEvent } from 'react';
import { usePhoneValidation } from '../../../hooks/form/usePhoneValidation';
import { Step } from '../../../hooks/onboarding/useOnboardingStep';
import { useSpeechRecognition } from '../../../hooks/speech/useSpeechRecognition';
import { useAudioVisualization } from '../../../hooks/speech/useAudioVisualization';
import { EnhancedVoiceVisualizer } from '../../speech/EnhancedVoiceVisualizer';

interface PhoneInputStepProps {
  step: Step;
  onComplete: (phone: string) => void;
  onBack: () => void;
}

export function PhoneInputStep({ step, onComplete, onBack }: PhoneInputStepProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const {
    phoneNumber,
    phoneError,
    validatePhoneNumber,
    handlePhoneChange,
  } = usePhoneValidation();

  const { startRecording, stopRecording } = useSpeechRecognition({
    onRecognitionEnd: (transcript) => {
      // Extrair apenas os números do texto reconhecido
      const numbersOnly = transcript.replace(/\D/g, '');
      
      // Formatar como número de telefone brasileiro
      let formattedNumber = '';
      
      if (numbersOnly.length > 0) {
        if (numbersOnly.length <= 2) {
          formattedNumber = `(${numbersOnly}`;
        } else if (numbersOnly.length <= 7) {
          formattedNumber = `(${numbersOnly.slice(0, 2)}) ${numbersOnly.slice(2)}`;
        } else {
          formattedNumber = `(${numbersOnly.slice(0, 2)}) ${numbersOnly.slice(2, 7)}-${numbersOnly.slice(7, 11)}`;
        }
      }
      
      // Criar um evento sintético para simular a mudança no input
      const syntheticEvent = {
        target: {
          value: formattedNumber
        }
      } as ChangeEvent<HTMLInputElement>;
      
      handlePhoneChange(syntheticEvent);
      setIsProcessing(false);
    }
  });

  const { audioVolume } = useAudioVisualization(isRecording);

  const handleStartRecording = () => {
    setIsRecording(true);
    startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
    setIsRecording(false);
    setIsProcessing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePhoneNumber(phoneNumber)) {
      onComplete(phoneNumber);
    }
  };

  // Determinar o estado do visualizador
  let visualizerState: 'ready' | 'listening' | 'processing' | 'response-ready' = 'ready';
  if (isRecording) {
    visualizerState = 'listening';
  } else if (isProcessing) {
    visualizerState = 'processing';
  }

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      <h2 className="text-2xl font-bold text-gray-800">{step.title}</h2>
      <p className="text-gray-600 text-center">{step.instruction}</p>

      <div className="w-full max-w-md flex flex-col items-center mb-4">
        <EnhancedVoiceVisualizer 
          state={visualizerState}
          volume={audioVolume}
          visualizationType="bars"
          className="h-20 w-full"
        />
        
        <div className="mt-4 flex justify-center space-x-4">
          {!isRecording ? (
            <button
              type="button"
              onClick={handleStartRecording}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
              disabled={isProcessing}
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2a3 3 0 00-3 3v4a3 3 0 006 0V5a3 3 0 00-3-3z"></path>
                <path d="M5 10v1a5 5 0 0010 0v-1a1 1 0 112 0v1a7 7 0 01-7 7h0a7 7 0 01-7-7v-1a1 1 0 012 0z"></path>
              </svg>
              Falar telefone
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStopRecording}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
              Parar
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div className="flex flex-col space-y-2">
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="(99) 99999-9999"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              phoneError
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:ring-blue-200'
            }`}
          />
          {phoneError && (
            <p className="text-sm text-red-500">{phoneError}</p>
          )}
        </div>

        <div className="flex justify-between space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            Voltar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            disabled={isProcessing}
          >
            Continuar
          </button>
        </div>
      </form>
    </div>
  );
} 