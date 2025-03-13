import React from 'react';
import { useRouter } from 'next/router';
import { FaCheck, FaTrophy } from 'react-icons/fa';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { StepProps } from './StepProps';

/**
 * Success Step Component
 * 
 * The final step in the onboarding process that confirms account creation
 * and shows achievements to the user.
 */
export function SuccessStep({ onNext }: StepProps): React.ReactElement {
  const router = useRouter();
  const { userData } = useOnboarding();
  
  // Handle navigation to dashboard
  const handleGoDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="w-full text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-success/20 rounded-full p-4">
          <FaCheck className="text-success w-8 h-8" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mb-4">Conta Criada com Sucesso!</h2>
      
      <p className="mb-8">
        Bem-vindo ao Papo Social, {userData.name}! Sua conta foi criada e 
        você já pode usar a plataforma.
      </p>
      
      <div className="card bg-base-200 mb-8 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="badge badge-primary badge-lg p-4">
            <FaTrophy className="mr-2" /> 100 XP
          </div>
          <h3 className="text-lg font-bold">Conquista desbloqueada!</h3>
        </div>
        
        <div className="flex justify-center gap-4">
          <div className="card bg-base-100 p-4 shadow-md">
            <div className="text-3xl mb-2">🎖️</div>
            <div className="font-medium">Primeiro Login</div>
            <div className="text-xs text-base-content/70">Criou sua conta com sucesso</div>
          </div>
          
          <div className="card bg-base-100 p-4 shadow-md">
            <div className="text-3xl mb-2">🔊</div>
            <div className="font-medium">Voz Reconhecida</div>
            <div className="text-xs text-base-content/70">Usou autenticação por voz</div>
          </div>
        </div>
      </div>
      
      <button 
        className="btn btn-primary btn-lg w-full"
        onClick={handleGoDashboard}
      >
        Ir para o Painel
      </button>
    </div>
  );
} 