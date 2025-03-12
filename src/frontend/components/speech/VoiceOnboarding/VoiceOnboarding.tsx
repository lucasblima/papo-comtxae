import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/router';
import { EnhancedVoiceButton } from '../../speech/EnhancedVoiceButton';
import VoiceVisualization from '../../speech/VoiceVisualization';
import { useToast } from '../../ui/Toast';
import type { SpeechRecognition, SpeechRecognitionEvent } from '../../../types/speech-recognition';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface VoiceOnboardingProps {
  onComplete?: (userData: any) => void;
  className?: string;
}

interface Step {
  id: string;
  title: string;
  instruction: string;
  placeholder?: string;
  voicePrompt: string;
}

const steps = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Papo Social!',
    instruction: 'Vamos começar com seu nome. Clique no botão e se apresente.',
    placeholder: 'Ex: "Olá, me chamo Maria" ou "Meu nome é João"',
    voicePrompt: 'Olá! Como você se chama?',
  },
  {
    id: 'confirmation',
    title: 'Prazer em conhecê-lo!',
    instruction: 'Vamos confirmar seu nome. Está correto?',
    voicePrompt: 'Entendi que seu nome é {name}. Está correto?',
  },
  {
    id: 'success',
    title: 'Perfeito!',
    instruction: 'Sua conta foi criada com sucesso!',
    voicePrompt: 'Ótimo! Sua conta foi criada. Bem-vindo ao Papo Social!',
  }
];

export function VoiceOnboarding({ onComplete, className = '' }: VoiceOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [user, setUser] = useState<any>(null);
  const [extractedName, setExtractedName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);
  const { showToast } = useToast();
  const router = useRouter();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Configuração do reconhecimento de voz
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.interimResults = true;
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          if (event.results && event.results.length > 0) {
            const last = event.results.length - 1;
            if (event.results[last] && event.results[last][0]) {
              const result = event.results[last][0].transcript;
              setTranscript(result);
            }
          }
        };
        
        recognition.onend = () => {
          setIsRecording(false);
          if (currentStep === 0 && transcript) {
            processFirstStep();
          } else if (currentStep === 1 && transcript) {
            processConfirmationStep();
          }
        };
        
        recognitionRef.current = recognition;
        
        return () => {
          recognition.abort();
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
          }
        };
      } else {
        showToast({
          title: 'Erro',
          description: 'Seu navegador não suporta reconhecimento de voz.',
          type: 'error',
        });
        // Retornar uma função de limpeza vazia para este caminho também
        return () => {};
      }
    }
    
    // Retornar uma função de limpeza vazia para o caso de window não estar definido
    return () => {};
  }, [currentStep, transcript]);
  
  // Iniciar gravação de áudio
  const startRecording = async () => {
    if (isRecording) return;
    
    try {
      setIsRecording(true);
      
      // Create audio context for visualization
      if (typeof window !== 'undefined' && 
          typeof AudioContext !== 'undefined' && 
          typeof navigator.mediaDevices !== 'undefined' &&
          typeof navigator.mediaDevices.getUserMedia === 'function') {
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        
        if (!audioContextRef.current) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) {
            audioContextRef.current = new AudioContextClass();
          }
        }
        
        if (audioContextRef.current && typeof audioContextRef.current.createAnalyser === 'function') {
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
          
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
          
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          
          const checkVolume = () => {
            if (!analyserRef.current || !isRecording) return;
            
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            
            // TypeScript não consegue garantir que dataArray[i] existe, então usamos uma abordagem mais segura
            for (let i = 0; i < dataArray.length; i++) {
              // Usando a notação do operador ternário para lidar com possíveis valores undefined
              sum += (dataArray[i] || 0);
            }
            
            const avg = sum / dataArray.length;
            setAudioVolume(avg);
            
            if (isRecording) {
              requestAnimationFrame(checkVolume);
            }
          };
          
          checkVolume();
        }
      }
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      setIsRecording(false);
      showToast({
        title: 'Erro',
        description: 'Não foi possível acessar o microfone. Verifique as permissões.',
        type: 'error'
      });
    }
  };
  
  // Processar primeiro passo (obter nome)
  const processFirstStep = async () => {
    if (!transcript) return;
    
    setIsProcessing(true);
    
    try {
      const response = await axios.post(`${API_URL}/onboarding/voice`, {
        transcript: transcript
      });
      
      setUser(response.data);
      setExtractedName(response.data.name);
      setCurrentStep(1);
      
      // Mostrar conquista
      if (response.data.achievements && response.data.achievements.length > 0) {
        const achievement = response.data.achievements[0];
        showToast({
          title: 'Conquista Desbloqueada!',
          description: `${achievement.name}: ${achievement.description}`,
          type: 'success',
          icon: achievement.icon || '🏆',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Erro ao processar voz:', error);
      showToast({
        title: 'Erro',
        description: 'Não foi possível processar sua voz. Tente novamente.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Processar confirmação do nome
  const processConfirmationStep = () => {
    const lowerTranscript = transcript.toLowerCase();
    
    if (lowerTranscript.includes('sim') || 
        lowerTranscript.includes('correto') || 
        lowerTranscript.includes('isso mesmo')) {
      // Confirmação positiva
      setCurrentStep(2);
      
      // Adiciona XP ao usuário
      if (user && user._id) {
        axios.put(`${API_URL}/users/${user._id}/xp`, { xp: 10 })
          .then(response => {
            setUser(response.data);
            
            // Verificar se ganhou nível
            if (response.data.achievements && 
                response.data.achievements.some((a: any) => a.id.startsWith('level_'))) {
              const levelAchievement = response.data.achievements.find((a: any) => a.id.startsWith('level_'));
              if (levelAchievement) {
                showToast({
                  title: 'Nível Aumentado!',
                  description: levelAchievement.description,
                  type: 'success',
                  icon: '⭐',
                  duration: 5000,
                });
              }
            }
          })
          .catch(err => console.error('Erro ao adicionar XP:', err));
      }
      
      // Redirecionar após um tempo
      setTimeout(() => {
        if (onComplete) {
          onComplete(user);
        } else {
          router.push('/dashboard');
        }
      }, 3000);
    } else if (lowerTranscript.includes('não') || 
               lowerTranscript.includes('errado') || 
               lowerTranscript.includes('incorreto')) {
      // Confirmação negativa, volta para o passo 1
      setCurrentStep(0);
      setTranscript('');
      showToast({
        title: 'Vamos tentar novamente',
        description: 'Por favor, diga seu nome quando estiver pronto.',
        type: 'info',
      });
    } else {
      // Resposta ambígua
      showToast({
        title: 'Não entendi',
        description: 'Por favor, responda "sim" ou "não".',
        type: 'warning',
      });
    }
  };
  
  const getCurrentStepContent = () => {
    const step = steps[currentStep];
    if (!step) return null; // This should never happen with our steps definition
    
    // Substitui placeholders no texto
    let voicePrompt = step.voicePrompt;
    if (step.id === 'confirmation' && extractedName) {
      voicePrompt = voicePrompt.replace('{name}', extractedName);
    }
    
    return (
      <motion.div
        key={step.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center space-y-6 text-center"
      >
        <h2 className="text-3xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          {step.title}
        </h2>
        
        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-lg">
          {step.id === 'confirmation' 
            ? step.instruction.replace('{name}', extractedName) 
            : step.instruction}
        </p>
        
        {step.id === 'welcome' && (
          <p className="text-sm text-gray-500 italic mt-2">
            {step.placeholder}
          </p>
        )}
        
        {step.id === 'confirmation' && (
          <div className="text-xl font-bold mt-2 py-2 px-4 bg-secondary/10 rounded-md">
            {extractedName}
          </div>
        )}
        
        {step.id !== 'success' && (
          <div className="mt-6 relative">
            <EnhancedVoiceButton 
              isListening={isRecording}
              onStart={startRecording}
              onStop={() => setIsRecording(false)}
              className={isProcessing ? "opacity-50" : ""}
              disabled={isProcessing}
              buttonText={isProcessing ? "Processando..." : "Falar"}
            />
            
            {isRecording && (
              <div className="mt-4">
                <VoiceVisualization isListening={isRecording} amplitude={audioVolume} />
              </div>
            )}
            
            {transcript && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-base-200 rounded-lg max-w-md mx-auto"
              >
                <p className="font-medium">{transcript}</p>
              </motion.div>
            )}
          </div>
        )}
        
        {step.id === 'success' && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-4 text-6xl"
          >
            🎉
          </motion.div>
        )}
        
        {isProcessing && (
          <div className="mt-4">
            <span className="loading loading-spinner loading-md text-primary"></span>
            <p className="text-sm text-gray-500 mt-2">Processando...</p>
          </div>
        )}
        
        {user && step.id === 'success' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-base-200 rounded-lg shadow-lg"
          >
            <h3 className="font-bold mb-2">Nível {user.level.level}</h3>
            <div className="w-full bg-base-300 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${(user.level.xp / user.level.next_level_xp) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm mt-1">XP: {user.level.xp}/{user.level.next_level_xp}</p>
          </motion.div>
        )}
        
        {/* Sistema de text-to-speech para prompts de voz */}
        {voicePrompt && (
          <button 
            className="sr-only"
            onClick={() => {
              const speech = new SpeechSynthesisUtterance(voicePrompt);
              speech.lang = 'pt-BR';
              speechSynthesis.speak(speech);
            }}
            aria-hidden="true"
          >
            Ler prompt
          </button>
        )}
      </motion.div>
    );
  };
  
  // Play voice prompt when step changes
  useEffect(() => {
    const step = steps[currentStep];
    if (step && step.voicePrompt) {
      let voicePrompt = step.voicePrompt;
      if (step.id === 'confirmation' && extractedName) {
        voicePrompt = voicePrompt.replace('{name}', extractedName);
      }
      
      // Check if SpeechSynthesisUtterance is available (not in test environment)
      if (typeof window !== 'undefined' && 
          typeof SpeechSynthesisUtterance !== 'undefined' && 
          typeof speechSynthesis !== 'undefined') {
        const speech = new SpeechSynthesisUtterance(voicePrompt);
        speech.lang = 'pt-BR';
        speechSynthesis.speak(speech);
        
        return () => {
          speechSynthesis.cancel();
        };
      }
    }
    
    // Adicionar retorno vazio para caminhos que não retornam função de limpeza
    return () => {};
  }, [currentStep, extractedName]);
  
  return (
    <div className={`min-h-[70vh] flex flex-col items-center justify-center px-4 ${className}`}>
      <div className="w-full max-w-3xl bg-base-100 shadow-xl rounded-xl p-8 relative overflow-hidden">
        {/* Fundo animado */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <motion.div 
            className="absolute w-64 h-64 rounded-full bg-primary"
            style={{ top: '-10%', left: '-10%' }}
            animate={{ 
              x: [0, 20, 0], 
              y: [0, 10, 0],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 15,
              ease: 'easeInOut' 
            }}
          />
          <motion.div 
            className="absolute w-64 h-64 rounded-full bg-secondary"
            style={{ bottom: '-10%', right: '-10%' }}
            animate={{ 
              x: [0, -20, 0], 
              y: [0, -10, 0],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 20,
              ease: 'easeInOut' 
            }}
          />
        </div>
        
        {/* Conteúdo do passo atual */}
        <AnimatePresence mode="wait">
          {getCurrentStepContent()}
        </AnimatePresence>
      </div>
    </div>
  );
} 