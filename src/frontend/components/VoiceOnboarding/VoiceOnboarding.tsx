import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/router';
import { EnhancedVoiceButton } from '../EnhancedVoiceButton/EnhancedVoiceButton';
import { VoiceVisualization } from '../VoiceVisualization/VoiceVisualization';
import { useToast } from '../ui/Toast';

// Import speech recognition types
import '../../types/speech-recognition.d';

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

const steps: Step[] = [
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
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.interimResults = true;
        
        recognition.onresult = (event) => {
          const last = event.results.length - 1;
          const result = event.results[last][0].transcript;
          setTranscript(result);
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
        return () => {};
      }
    }
    
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
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
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
      // Confirmação negativa
      setCurrentStep(0);
      setTranscript('');
      setExtractedName('');
      showToast({
        title: 'Nome Incorreto',
        description: 'Vamos tentar novamente. Por favor, diga seu nome.',
        type: 'info'
      });
    }
  };
  
  // Parar gravação
  const stopRecording = () => {
    if (!isRecording) return;
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(false);
  };
  
  // Renderizar o passo atual
  const renderStep = () => {
    const currentStepData = steps[currentStep];
    if (!currentStepData) return null;
    
    return (
      <motion.div
        key={currentStepData.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold mb-4">{currentStepData.title}</h2>
        <p className="text-lg mb-6">
          {currentStepData.instruction.replace('{name}', extractedName)}
        </p>
        
        {currentStep === 0 && currentStepData.placeholder && (
          <p className="text-sm text-gray-600 mb-4">
            {currentStepData.placeholder}
          </p>
        )}
        
        <div className="flex flex-col items-center gap-4">
          <EnhancedVoiceButton
            isRecording={isRecording}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
          />
          
          {isRecording && (
            <VoiceVisualization volume={audioVolume} />
          )}
          
          {transcript && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <p className="text-gray-800">{transcript}</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  };
  
  return (
    <div className={`voice-onboarding ${className}`} data-testid="voice-onboarding">
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
}

export default VoiceOnboarding; 