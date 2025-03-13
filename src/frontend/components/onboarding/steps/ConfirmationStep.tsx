import React, { useState } from 'react';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { signIn } from 'next-auth/react';
import { StepProps } from './StepProps';

/**
 * Confirmation Step Component
 * 
 * Allows users to review and confirm their information before completing
 * the signup process.
 */
export function ConfirmationStep({ onNext, onBack }: StepProps): React.ReactElement {
  const { userData } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle account creation
  const handleCreateAccount = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      // Create account using voice authentication provider
      const result = await signIn('voice', {
        redirect: false,
        name: userData.name,
        phone: userData.phone,
        voiceData: JSON.stringify({ timestamp: Date.now() })
      });
      
      if (result?.error) {
        setError('Ocorreu um erro ao criar sua conta. Tente novamente.');
      } else if (result?.ok) {
        onNext();
      }
    } catch (err) {
      setError('Ocorreu um erro ao processar sua solicitação. Tente novamente.');
      console.error('Account creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6">Confirme seus dados</h2>
      
      <div className="bg-base-200 p-4 rounded-lg mb-6">
        <div className="mb-3">
          <div className="text-sm text-base-content/70">Nome</div>
          <div className="font-medium text-lg">{userData.name}</div>
        </div>
        
        <div>
          <div className="text-sm text-base-content/70">Telefone</div>
          <div className="font-medium text-lg">{userData.phone}</div>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      <p className="mb-6">
        Ao clicar em "Criar conta", você concorda com nossos{' '}
        <a href="#" className="link link-primary">Termos de Uso</a> e{' '}
        <a href="#" className="link link-primary">Política de Privacidade</a>.
      </p>
      
      <div className="flex justify-between">
        <button 
          className="btn btn-outline"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Voltar
        </button>
        
        <button 
          className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
          onClick={handleCreateAccount}
          disabled={isSubmitting}
        >
          Criar conta
        </button>
      </div>
    </div>
  );
} 