import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { VoiceOnboarding } from '../components/VoiceOnboarding';
import { AssociationSelection } from '../components/AssociationSelection';
import { ToastProvider } from '../components/ui/Toast';

enum OnboardingStep {
  VOICE_INTRODUCTION = 'voice-introduction',
  ASSOCIATION_SELECTION = 'association-selection',
  COMPLETE = 'complete'
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(OnboardingStep.VOICE_INTRODUCTION);
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();
  
  const handleVoiceOnboardingComplete = (user: any) => {
    setUserData(user);
    setCurrentStep(OnboardingStep.ASSOCIATION_SELECTION);
  };
  
  const handleAssociationSelectionComplete = () => {
    setCurrentStep(OnboardingStep.COMPLETE);
    // Redireciona após uma breve pausa
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };
  
  const renderCurrentStep = () => {
    switch(currentStep) {
      case OnboardingStep.VOICE_INTRODUCTION:
        return <VoiceOnboarding onComplete={handleVoiceOnboardingComplete} />;
        
      case OnboardingStep.ASSOCIATION_SELECTION:
        if (!userData || !userData._id) {
          // Fallback se não tivermos dados do usuário
          return <div className="p-8 text-center">
            <h2 className="text-xl">Erro ao processar usuário</h2>
            <button 
              className="btn btn-primary mt-4" 
              onClick={() => setCurrentStep(OnboardingStep.VOICE_INTRODUCTION)}
            >
              Voltar ao início
            </button>
          </div>;
        }
        return <AssociationSelection 
          userId={userData._id} 
          onComplete={handleAssociationSelectionComplete}
        />;
        
      case OnboardingStep.COMPLETE:
        return (
          <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold">Configuração concluída!</h2>
              <p className="mt-2">Redirecionando você para o dashboard...</p>
            </div>
          </div>
        );
    }
  };
  
  return (
    <ToastProvider>
      <Head>
        <title>Bem-vindo ao Papo Social</title>
        <meta name="description" content="Comece sua jornada no Papo Social" />
      </Head>
      
      <main className="min-h-screen bg-base-200">
        <div className="container mx-auto pt-8 pb-16">
          {/* Progress bar */}
          <div className="max-w-xl mx-auto mb-8 px-4">
            <div className="w-full bg-base-300 rounded-full h-2 mb-2">
              <div 
                data-testid="progress-bar"
                className="bg-primary h-2 rounded-full transition-all duration-500" 
                style={{ 
                  width: currentStep === OnboardingStep.VOICE_INTRODUCTION ? '33%' : 
                         currentStep === OnboardingStep.ASSOCIATION_SELECTION ? '66%' : '100%' 
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-base-content/60">
              <span>Introdução</span>
              <span>Associações</span>
              <span>Concluído</span>
            </div>
          </div>
          
          {/* Dynamic content */}
          {renderCurrentStep()}
        </div>
      </main>
    </ToastProvider>
  );
} 