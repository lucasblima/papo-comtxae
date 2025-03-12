import React from 'react';
import { Step } from '../../../hooks/onboarding/useOnboardingStep';

interface SuccessStepProps {
  step: Step;
  userData: {
    name: string;
  };
  onComplete: () => void;
}

export function SuccessStep({ step, userData, onComplete }: SuccessStepProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
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
    </div>
  );
} 