import React, { useState } from 'react';
import { VoiceAuthentication } from '../../speech/VoiceAuthentication';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { StepProps } from './StepProps';

/**
 * Voice Input Step Component
 * 
 * Captures the user's name via voice input during the onboarding process.
 */
export function VoiceInputStep({ onNext, onBack }: StepProps): React.ReactElement {
  const { updateUserData } = useOnboarding();
  const [error, setError] = useState('');
  const [alternateMethod, setAlternateMethod] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle voice authentication success
  const handleVoiceSuccess = async (name: string) => {
    updateUserData({ name });
    onNext();
  };

  // Handle voice authentication error
  const handleVoiceError = (errorMsg: string) => {
    setError(errorMsg);
  };

  // Show alternate text input method
  const handleShowTextInput = () => {
    setAlternateMethod(true);
    setError('');
  };

  // Handle text form submission
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setError('Por favor, digite seu nome');
      return;
    }

    setIsSubmitting(true);
    updateUserData({ name: nameInput });
    
    // Simulate a slight delay for better UX
    setTimeout(() => {
      setIsSubmitting(false);
      onNext();
    }, 500);
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">
        {alternateMethod ? 'Digite seu nome' : 'Diga seu nome'}
      </h2>
      
      <p className="mb-6">
        {alternateMethod 
          ? 'Por favor, digite seu nome no campo abaixo'
          : 'Por favor, diga seu nome claramente quando o microfone estiver ativo'}
      </p>
      
      {/* Voice input section */}
      {!alternateMethod && (
        <div className="flex flex-col items-center">
          <VoiceAuthentication 
            onSuccess={handleVoiceSuccess}
            onError={handleVoiceError}
            onCancel={() => setError('')}
            prompt="Diga seu nome"
            className="w-full mb-6"
          />
          
          {error && (
            <div className="alert alert-error mb-4 w-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <div className="divider">OU</div>
          
          <button 
            className="btn btn-outline"
            onClick={handleShowTextInput}
          >
            Prefiro digitar meu nome
          </button>
        </div>
      )}
      
      {/* Text input alternate method */}
      {alternateMethod && (
        <form onSubmit={handleTextSubmit}>
          <div className="form-control">
            <input 
              type="text" 
              placeholder="Digite seu nome" 
              className={`input input-bordered w-full ${error ? 'input-error' : ''}`}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              required
            />
            {error && (
              <label className="label">
                <span className="label-text-alt text-error">{error}</span>
              </label>
            )}
          </div>
          
          <div className="flex justify-between mt-6">
            <button 
              type="button"
              className="btn btn-outline"
              onClick={onBack}
              disabled={isSubmitting}
            >
              Voltar
            </button>
            
            <button 
              type="submit"
              className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              Continuar
            </button>
          </div>
        </form>
      )}
      
      {/* Back button only in voice mode */}
      {!alternateMethod && (
        <div className="mt-6">
          <button 
            className="btn btn-outline w-full"
            onClick={onBack}
          >
            Voltar
          </button>
        </div>
      )}
    </div>
  );
} 