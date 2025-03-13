import React, { useState, useEffect } from 'react';
import { Step } from '../../../hooks/onboarding/useOnboardingStep';
import { EnhancedVoiceVisualizer } from '../../speech/EnhancedVoiceVisualizer';

interface SuccessStepProps {
  step: Step;
  userData: {
    name: string;
  };
  onComplete: () => void;
}

export function SuccessStep({ step, userData, onComplete }: SuccessStepProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    // Atualizar o progresso para simular uma animação
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 0.033, 1));
    }, 33);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [onComplete]);

  // Simular volume baseado no progresso
  const simulatedVolume = Math.sin(progress * Math.PI * 4) * 0.5 + 0.5;

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      <div className="w-64 h-64 relative">
        <EnhancedVoiceVisualizer
          state="response-ready"
          volume={simulatedVolume}
          visualizationType="fluid"
          className="absolute top-0 left-0 w-full h-full"
        />

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center z-10">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800">{step.title}</h2>
      <p className="text-gray-600 text-center">{step.instruction}</p>

      <div className="text-center space-y-2">
        <p className="text-lg text-gray-800">
          Bem-vindo(a), <span className="font-medium">{userData.name}</span>!
        </p>
        <p className="text-sm text-gray-500">
          Você será redirecionado em alguns segundos...
        </p>
      </div>

      {/* Barra de progresso */}
      <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress * 100}%` }}
        ></div>
      </div>
    </div>
  );
} 