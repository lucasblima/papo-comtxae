import React from 'react';
import { VoiceVisualization } from './VoiceVisualization';

interface VoiceOnboardingProps {
  className?: string;
  onComplete?: () => void;
}

interface OnboardingStep {
  title: string;
  description: string;
}

/**
 * VoiceOnboarding: Component that helps users understand how to use voice features
 * 
 * This component guides new users through the voice interaction capabilities
 * of the application, showing them how to speak to the system.
 */
export function VoiceOnboarding({ 
  className = '',
  onComplete
}: VoiceOnboardingProps): React.ReactElement {
  const [step, setStep] = React.useState(0);
  
  // Steps for the onboarding process
  const steps: OnboardingStep[] = [
    {
      title: "Bem-vindo ao assistente de voz",
      description: "Vamos aprender como usar o recurso de voz"
    },
    {
      title: "Fale com clareza",
      description: "Fale pausadamente e com clareza para melhor reconhecimento"
    },
    {
      title: "Experimente agora",
      description: "Clique no botão abaixo e diga 'Olá'"
    }
  ];
  
  // Ensure step is within bounds
  const currentStep = steps[Math.min(step, steps.length - 1)];
  
  const handleNextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete?.();
    }
  };
  
  return (
    <div className={`voice-onboarding ${className}`}>
      <h2 className="text-xl font-bold mb-2">{currentStep.title}</h2>
      <p className="mb-4">{currentStep.description}</p>
      
      {step === 2 && (
        <div className="mb-4">
          <VoiceVisualization />
        </div>
      )}
      
      <div className="flex justify-between">
        <button 
          className="btn btn-outline"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          Anterior
        </button>
        
        <button 
          className="btn btn-primary"
          onClick={handleNextStep}
        >
          {step < steps.length - 1 ? 'Próximo' : 'Concluir'}
        </button>
      </div>
    </div>
  );
} 