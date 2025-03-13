import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { FaMicrophone } from 'react-icons/fa';
import { ThemeToggle } from '../components/ui/ThemeToggle';

/**
 * LandingPage: Página inicial do Papo Social que inicia o diálogo de boas-vindas
 * e redireciona para a página de onboarding.
 */
export default function LandingPage(): React.ReactElement {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Função para sintetizar a fala de boas-vindas
  const speakWelcomeMessage = () => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const welcomeMessage = "Olá! Bem-vindo ao Papo Social. Clique em Começar Agora para criar sua conta.";
      
      window.speechSynthesis.cancel(); // Cancela qualquer fala anterior
      
      const utterance = new SpeechSynthesisUtterance(welcomeMessage);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Inicia a fala quando o componente carrega
      window.speechSynthesis.speak(utterance);
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
    }
  };

  // Função para iniciar o processo de onboarding
  const startOnboarding = () => {
    router.push('/onboarding');
  };

  // Redireciona para o dashboard se o usuário já estiver autenticado
  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  // Inicia a fala automaticamente quando a página carregar
  useEffect(() => {
    // Pequeno delay para garantir que o browser está pronto
    const timer = setTimeout(() => {
      speakWelcomeMessage();
    }, 800);
    
    return () => {
      clearTimeout(timer);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <>
      <Head>
        <title>Papo Social - Conectando por voz</title>
        <meta name="description" content="Papo Social - Uma plataforma por voz para conectar comunidades" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-primary/10 to-base-100 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <div className="text-center max-w-md animate-in">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-content relative">
              <FaMicrophone className="w-12 h-12" />
              {isSpeaking && (
                <div className="absolute -right-2 -top-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center animate-pulse">
                  🔊
                </div>
              )}
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">
            Papo Social
          </h1>
          
          <p className="text-xl mb-8">Conectando comunidades através da voz</p>
          
          <div className="grid gap-4">
            <button 
              className="btn btn-primary btn-lg w-full"
              onClick={startOnboarding}
            >
              Começar Agora
            </button>
            
            <button 
              className="btn btn-outline btn-sm"
              onClick={speakWelcomeMessage}
              disabled={isSpeaking}
            >
              {isSpeaking ? 'Falando...' : 'Ouvir novamente'}
            </button>
          </div>
          
          <p className="mt-6 text-sm text-base-content/70">
            Entre para conectar-se com sua comunidade através da voz
          </p>
        </div>
      </main>
    </>
  );
}
