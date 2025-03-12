import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { VoiceAuthentication } from '../../components/speech/VoiceAuthentication';

/**
 * Onboarding stages
 */
type OnboardingStage = 'welcome' | 'voice-setup' | 'confirmation' | 'complete';

/**
 * Onboarding page for new users
 * 
 * This page guides users through the registration process using voice identification
 */
export default function OnboardingPage() {
  const router = useRouter();
  const [stage, setStage] = useState<OnboardingStage>('welcome');
  const [userName, setUserName] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Handle voice authentication successful result
  const handleVoiceSuccess = async (name: string) => {
    setUserName(name);
    setStage('confirmation');
  };
  
  // Handle voice authentication errors
  const handleVoiceError = (error: string) => {
    setError(error);
  };
  
  // Handle confirmation of the user's name
  const handleConfirmation = async (confirmed: boolean) => {
    if (!confirmed) {
      // User didn't confirm their name, go back to voice setup
      setStage('voice-setup');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Create account using voice authentication provider
      const result = await signIn('voice', {
        redirect: false,
        name: userName,
        voiceData: JSON.stringify({ timestamp: Date.now() })
      });
      
      if (result?.error) {
        setError('Ocorreu um erro ao criar sua conta. Tente novamente.');
        setStage('voice-setup');
      } else if (result?.ok) {
        setStage('complete');
      }
    } catch (err) {
      setError('Ocorreu um erro ao processar sua solicitação. Tente novamente.');
      console.error('Onboarding error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Redirect to dashboard after completing onboarding
  const handleComplete = () => {
    router.push('/dashboard');
  };
  
  // Render specific content based on current stage
  const renderStageContent = () => {
    switch (stage) {
      case 'welcome':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">Bem-vindo ao Papo Social!</h2>
            <p className="mb-6">
              Este é um lugar onde sua voz é sua identidade.
              Sem senhas complicadas, apenas você sendo você.
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => setStage('voice-setup')}
            >
              Começar
            </button>
          </div>
        );
        
      case 'voice-setup':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">Diga seu nome</h2>
            <p className="mb-6">
              Precisamos reconhecer sua voz. Por favor, diga seu nome
              claramente quando o microfone estiver ativo.
            </p>
            
            <VoiceAuthentication 
              onSuccess={handleVoiceSuccess}
              onError={handleVoiceError}
              onCancel={() => setError('')}
              prompt="Diga seu nome para se identificar"
              className="w-full mb-4"
            />
            
            {error && (
              <div className="alert alert-error mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
          </div>
        );
        
      case 'confirmation':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">Confirmação</h2>
            <p className="mb-6">
              Olá, <span className="font-bold text-primary">{userName}</span>!
              Este é seu nome correto?
            </p>
            
            <div className="flex justify-center gap-4">
              <button 
                className="btn btn-outline"
                onClick={() => handleConfirmation(false)}
                disabled={loading}
              >
                Não, refazer
              </button>
              <button 
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                onClick={() => handleConfirmation(true)}
                disabled={loading}
              >
                Sim, confirmar
              </button>
            </div>
          </div>
        );
        
      case 'complete':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">Conta Criada!</h2>
            <div className="mb-6">
              <div className="badge badge-primary badge-lg gap-2 p-4 mb-4">
                <span className="text-xl">🎖️</span>
                Primeiro Login
              </div>
              <p className="mt-2">
                Você ganhou 100 pontos de experiência e desbloqueou seu primeiro distintivo!
              </p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={handleComplete}
            >
              Ir para o Painel
            </button>
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <Head>
        <title>Cadastro - Papo Social</title>
        <meta name="description" content="Crie sua conta no Papo Social" />
      </Head>
      
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center mb-4">
            <span className="text-primary">Papo</span> Social
          </h1>
          
          {/* Progress indicator */}
          <ul className="steps steps-vertical lg:steps-horizontal w-full mb-6">
            <li className={`step ${stage !== 'welcome' ? 'step-primary' : ''}`}>Boas-vindas</li>
            <li className={`step ${stage === 'voice-setup' || stage === 'confirmation' || stage === 'complete' ? 'step-primary' : ''}`}>Configuração</li>
            <li className={`step ${stage === 'confirmation' || stage === 'complete' ? 'step-primary' : ''}`}>Confirmação</li>
            <li className={`step ${stage === 'complete' ? 'step-primary' : ''}`}>Pronto!</li>
          </ul>
          
          {/* Stage-specific content */}
          {renderStageContent()}
          
          {/* Only show "already have account" link on welcome and voice-setup stages */}
          {(stage === 'welcome' || stage === 'voice-setup') && (
            <div className="mt-6 text-center">
              <p>
                Já tem uma conta?{' '}
                <Link href="/login" className="link link-primary">
                  Entrar
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 