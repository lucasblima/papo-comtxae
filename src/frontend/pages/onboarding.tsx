import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { signIn, useSession } from 'next-auth/react';
import { VoiceVisualization } from '../components/VoiceVisualization';
import { AchievementNotification } from '../components/AchievementNotification';

// Import SpeechRecognition types
import type { SpeechRecognition } from '../types/speech-recognition.d';

enum OnboardingStep {
  WELCOME = 'welcome',
  RECORDING = 'recording',
  PROCESSING = 'processing',
  SUCCESS = 'success'
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(OnboardingStep.WELCOME);
  const [transcript, setTranscript] = useState('');
  const [extractedName, setExtractedName] = useState('');
  const [volume, setVolume] = useState(0);
  const [showAchievement, setShowAchievement] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  
  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  
  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.interimResults = true;
        
        recognition.onresult = (event) => {
          const last = event.results.length - 1;
          const result = event.results[last]?.transcript;
          if (result) {
            setTranscript(result);
          }
        };
        
        recognition.onend = () => {
          if (currentStep === OnboardingStep.RECORDING && transcript) {
            processVoiceInput();
          }
        };
        
        recognitionRef.current = recognition;
      }
    }
    
    return () => {
      stopRecording();
    };
  }, [currentStep, transcript]);
  
  const startRecording = async () => {
    setCurrentStep(OnboardingStep.RECORDING);
    setTranscript('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      // Create audio context for volume visualization
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      
        if (audioContextRef.current) {
          analyserRef.current = audioContextRef.current.createAnalyser();
          const source = audioContextRef.current.createMediaStreamSource(stream);
          
          if (analyserRef.current) {
            source.connect(analyserRef.current);
            
            // Set up volume monitoring
            analyserRef.current.fftSize = 256;
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            const checkVolume = () => {
              if (analyserRef.current) {
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                  sum += dataArray[i] || 0;
                }
                const avg = sum / bufferLength;
                setVolume(avg);
                
                if (currentStep === OnboardingStep.RECORDING) {
                  requestAnimationFrame(checkVolume);
                }
              }
            };
            
            checkVolume();
          }
        }
      }
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };
  
  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors when stopping recognition that isn't started
      }
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(e => console.error(e));
    }
    
    setVolume(0);
  };
  
  const processVoiceInput = async () => {
    setCurrentStep(OnboardingStep.PROCESSING);
    stopRecording();
    
    // Simple name extraction - in a real app, this would use NLP
    const nameRegex = /(?:me chamo|meu nome[^\w]?[eé]|sou o|sou a|sou|eu sou)[^\w]*([\w\s]{2,})/i;
    const match = transcript.match(nameRegex);
    
    let name = '';
    if (match && match[1]) {
      name = match[1].trim();
    } else {
      // Fallback: just take the last word if it's longer than 2 characters
      const words = transcript.split(' ');
      const potentialName = words[words.length - 1];
      if (potentialName && potentialName.length > 2) {
        name = potentialName;
      }
    }
    
    if (name) {
      setExtractedName(name);
      
      try {
        // Use Next Auth to sign in/register the user
        const result = await signIn('voice-credentials', {
          name: name,
          redirect: false,
        });
        
        if (result?.error) {
          console.error('Authentication error:', result.error);
          setCurrentStep(OnboardingStep.WELCOME);
          return;
        }
        
        // Show success state
        setCurrentStep(OnboardingStep.SUCCESS);
        
        // Show achievement notification after a short delay
        setTimeout(() => {
          setShowAchievement(true);
        }, 1000);
        
        // Redirect to home after viewing achievement
        setTimeout(() => {
          router.push('/');
        }, 5000);
      } catch (error) {
        console.error('Error during authentication:', error);
        setCurrentStep(OnboardingStep.WELCOME);
      }
    } else {
      // If we couldn't extract a name, go back to welcome
      setCurrentStep(OnboardingStep.WELCOME);
    }
  };
  
  return (
    <>
      <Head>
        <title>Bem-vindo ao Papo Social</title>
        <meta name="description" content="Comece sua jornada no Papo Social" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <main className="min-h-screen bg-gradient-to-b from-base-200 to-base-100 flex flex-col items-center justify-center p-4">
        <motion.div
          className="max-w-md w-full bg-base-100 shadow-lg rounded-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {currentStep === OnboardingStep.WELCOME && (
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-6">Bem-vindo ao Papo Social!</h1>
              <p className="mb-8">Vamos começar com seu nome. Clique no botão abaixo e se apresente.</p>
              <button 
                className="btn btn-primary btn-lg w-full"
                onClick={startRecording}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Clique para falar
              </button>
              <p className="mt-4 text-sm text-base-content/70">
                Exemplo: "Olá, me chamo Maria" ou "Meu nome é João"
              </p>
            </div>
          )}
          
          {currentStep === OnboardingStep.RECORDING && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6">Estou ouvindo...</h2>
              <div className="mb-8">
                <VoiceVisualization volume={volume} className="h-32" />
              </div>
              <p className="mb-4">{transcript || "Diga seu nome..."}</p>
              <button 
                className="btn btn-outline w-full"
                onClick={stopRecording}
              >
                Cancelar
              </button>
            </div>
          )}
          
          {currentStep === OnboardingStep.PROCESSING && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6">Processando...</h2>
              <div className="flex justify-center mb-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
              <p>Analisando sua resposta...</p>
            </div>
          )}
          
          {currentStep === OnboardingStep.SUCCESS && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6">Olá, {extractedName}!</h2>
              <p className="mb-8">Cadastro realizado com sucesso! Bem-vindo(a) ao Papo Social.</p>
              <div className="text-center text-green-600 text-4xl mb-4">
                <span>✅</span>
              </div>
              {showAchievement && (
                <AchievementNotification 
                  title="Primeiro Contato" 
                  description="Parabéns por se juntar ao Papo Social!" 
                  icon="🎖️"
                  onClose={() => setShowAchievement(false)}
                />
              )}
            </div>
          )}
          
          {/* Optional: Phone Number Alternative */}
          {currentStep === OnboardingStep.WELCOME && (
            <div className="mt-8 pt-6 border-t border-base-300 text-center">
              <p className="text-sm text-base-content/70 mb-2">
                Prefere usar seu número de telefone?
              </p>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => router.push('/phone-login')}
              >
                Entrar com telefone
              </button>
            </div>
          )}
        </motion.div>
      </main>
    </>
  );
} 