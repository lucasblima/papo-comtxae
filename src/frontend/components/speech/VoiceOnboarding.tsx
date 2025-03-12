import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { EnhancedVoiceButton } from './EnhancedVoiceButton';
import { VoiceVisualization } from './VoiceVisualization';
import { useToast } from '../ui/Toast';

// Define proper types for Speech Recognition
interface SpeechRecognitionErrorEvent extends Event {
  error: 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'no-speech' | 'service-not-allowed';
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

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
  showPhoneInput?: boolean;
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
    id: 'phone',
    title: 'Quase lá!',
    instruction: 'Para sua segurança, precisamos do seu número de telefone.',
    voicePrompt: 'Por favor, digite seu número de telefone.',
    showPhoneInput: true,
  },
  {
    id: 'confirmation',
    title: 'Prazer em conhecê-lo!',
    instruction: 'Vamos confirmar seus dados. Está tudo correto?',
    voicePrompt: 'Entendi que seu nome é {name} e seu telefone é {phone}. Está correto?',
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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
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
          
          if (transcript) {
            if (currentStep === 0) {
              processFirstStep();
            } else if (currentStep === 1) {
              processConfirmationStep();
            }
          } else if (isRecording) {
            // If recording ended but no transcript was received
            showToast({
              title: 'Sem áudio detectado',
              description: 'Não conseguimos ouvir nada. Por favor, tente novamente.',
              type: 'warning',
            });
          }
        };
        
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          
          const errorMessages = {
            'not-allowed': 'Não foi possível acessar o microfone. Verifique as permissões.',
            'audio-capture': 'Não foi possível capturar áudio. Verifique seu microfone.',
            'network': 'Erro de conexão. Verifique sua internet.',
            'no-speech': 'Nenhum áudio detectado. Tente falar mais alto.',
            'service-not-allowed': 'Serviço de reconhecimento não disponível.',
            'aborted': 'Reconhecimento de voz interrompido.'
          };

          showToast({
            title: 'Erro no reconhecimento de voz',
            description: errorMessages[event.error] || 'Erro desconhecido. Tente novamente.',
            type: 'error',
          });
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
  
  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
    if (!phone) {
      setPhoneError('O número de telefone é obrigatório');
      return false;
    }
    if (!phoneRegex.test(phone)) {
      setPhoneError('Formato inválido. Use (99) 99999-9999');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      let formatted = numbers;
      if (numbers.length > 2) formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      if (numbers.length > 7) formatted = `${formatted.slice(0, 10)}-${formatted.slice(10)}`;
      return formatted;
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    if (formatted.length === 15) {
      validatePhoneNumber(formatted);
    }
  };

  const handlePhoneSubmit = () => {
    if (validatePhoneNumber(phoneNumber)) {
      setCurrentStep(2); // Move to confirmation step
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
      setCurrentStep(1); // Move to phone number step
      setTranscript('');
      
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
  const processConfirmationStep = async () => {
    const lowerTranscript = transcript.toLowerCase();
    setIsProcessing(true);
    
    try {
      if (lowerTranscript.includes('sim') || 
          lowerTranscript.includes('correto') || 
          lowerTranscript.includes('isso mesmo')) {
        // Confirmação positiva
        setCurrentStep(3);
        
        // Add XP ao usuário
        if (user && user._id) {
          try {
            const response = await axios.put(`${API_URL}/users/${user._id}/xp`, { 
              xp: 10,
              phone: phoneNumber 
            });
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
          } catch (err) {
            console.error('Erro ao adicionar XP:', err);
            // Continue with auth even if XP update fails
          }
        }
        
        // Authenticate with NextAuth
        try {
          const result = await signIn('voice', {
            redirect: false,
            name: extractedName,
            phone: phoneNumber,
            voiceData: JSON.stringify({ 
              timestamp: Date.now(),
              userId: user?._id || extractedName
            })
          });
          
          if (result?.error) {
            throw new Error(result.error);
          }
          
          // Redirecionar após um tempo
          setTimeout(() => {
            if (onComplete) {
              onComplete(user);
            } else {
              router.push('/dashboard');
            }
          }, 3000);
        } catch (error) {
          console.error('Authentication error:', error);
          showToast({
            title: 'Erro de Autenticação',
            description: 'Houve um erro ao criar sua conta. Por favor, tente novamente.',
            type: 'error',
          });
          // Return to first step on auth failure
          setCurrentStep(0);
        }
      } else if (lowerTranscript.includes('não') || 
                lowerTranscript.includes('errado') || 
                lowerTranscript.includes('incorreto')) {
        // Confirmação negativa, volta para o passo 1
        setCurrentStep(0);
        setTranscript('');
        setPhoneNumber('');
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
    } catch (error) {
      console.error('Error processing confirmation:', error);
      showToast({
        title: 'Erro',
        description: 'Ocorreu um erro ao processar sua resposta. Tente novamente.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const getCurrentStepContent = () => {
    const step = steps[currentStep];
    if (!step) return null;
    
    let voicePrompt = step.voicePrompt;
    if (step.id === 'confirmation') {
      voicePrompt = voicePrompt
        .replace('{name}', extractedName)
        .replace('{phone}', phoneNumber);
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
            ? step.instruction
            : step.instruction}
        </p>
        
        {step.id === 'welcome' && (
          <p className="text-sm text-gray-500 italic mt-2">
            {step.placeholder}
          </p>
        )}
        
        {step.id === 'phone' && (
          <div className="w-full max-w-xs">
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="(99) 99999-9999"
              className={`input input-bordered w-full ${phoneError ? 'input-error' : ''}`}
            />
            {phoneError && (
              <p className="text-error text-sm mt-1">{phoneError}</p>
            )}
          </div>
        )}
        
        {step.id === 'confirmation' && (
          <div className="space-y-4">
            <div className="text-xl font-bold py-2 px-4 bg-secondary/10 rounded-md">
              {extractedName}
            </div>
            <div className="text-lg py-2 px-4 bg-secondary/10 rounded-md">
              {phoneNumber}
            </div>
          </div>
        )}
        
        {step.id !== 'success' && (
          <div className="mt-6 relative flex flex-col items-center space-y-4">
            {step.id === 'phone' ? (
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep(0)}
                  className="btn btn-outline"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePhoneSubmit}
                  className="btn btn-primary"
                  disabled={!phoneNumber || !!phoneError}
                >
                  Confirmar
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      if (isRecording) {
                        if (recognitionRef.current) {
                          recognitionRef.current.abort();
                        }
                        setIsRecording(false);
                      }
                      setCurrentStep(Math.max(0, currentStep - 1));
                    }}
                    className="btn btn-outline"
                  >
                    Cancelar
                  </button>
                  <EnhancedVoiceButton 
                    isListening={isRecording}
                    onStart={startRecording}
                    onStop={() => setIsRecording(false)}
                    className={isProcessing ? "opacity-50" : ""}
                    disabled={isProcessing}
                    buttonText={isProcessing ? "Processando..." : "Falar"}
                  />
                  {transcript && (
                    <button
                      onClick={() => {
                        if (currentStep === 0) {
                          processFirstStep();
                        } else if (currentStep === 2) {
                          processConfirmationStep();
                        }
                      }}
                      className="btn btn-primary"
                      disabled={isProcessing}
                    >
                      Confirmar
                    </button>
                  )}
                </div>
                
                {isRecording && (
                  <div className="mt-4">
                    <VoiceVisualization isListening={isRecording} volume={audioVolume} />
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
              </>
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
  
  // Add keyboard handler for accessibility
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!isRecording && !isLoading) {
        startRecording();
      } else if (isRecording) {
        setIsRecording(false);
      }
    }
  };

  useEffect(() => {
    const button = buttonRef.current;
    if (button) {
      button.addEventListener('keypress', handleKeyPress);
    }
    return () => {
      if (button) {
        button.removeEventListener('keypress', handleKeyPress);
      }
    };
  }, [isRecording, isLoading]);
  
  return (
    <div 
      role="main"
      aria-live="polite"
      className={`min-h-[70vh] flex flex-col items-center justify-center px-4 ${className}`}
    >
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