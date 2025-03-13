import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ThemeToggle } from '../components/ui';
import { VoiceVisualization } from '../components/speech/VoiceVisualization';
import { AchievementNotification } from '../components/ui';

// Import SpeechRecognition types
import type { SpeechRecognition, SpeechRecognitionEvent } from '../types/speech-recognition.d';

// Definição para o webkitAudioContext
interface Window {
  webkitAudioContext: typeof AudioContext;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  badge: {
    title: string;
    description: string;
    icon: string;
  };
}

// Sample quiz questions about community engagement
const questions: QuizQuestion[] = [
  {
    id: 1,
    question: "Qual a melhor forma de iniciar um projeto comunitário?",
    options: [
      "Trabalhando sozinho sem consultar ninguém",
      "Ouvindo as necessidades da comunidade primeiro",
      "Aplicando soluções de outras comunidades sem adaptação",
      "Esperando que o governo tome iniciativa"
    ],
    correctAnswer: "Ouvindo as necessidades da comunidade primeiro",
    badge: {
      title: "Ouvinte Atento",
      description: "Você entende a importância de ouvir primeiro!",
      icon: "👂"
    }
  },
  {
    id: 2,
    question: "Como podemos aumentar a participação em reuniões comunitárias?",
    options: [
      "Tornando as reuniões obrigatórias",
      "Mantendo as mesmas pessoas falando sempre",
      "Criando um ambiente acolhedor onde todos possam falar",
      "Reduzindo a frequência de reuniões"
    ],
    correctAnswer: "Criando um ambiente acolhedor onde todos possam falar",
    badge: {
      title: "Facilitador",
      description: "Você sabe como criar espaços inclusivos!",
      icon: "🤝"
    }
  },
  {
    id: 3,
    question: "Qual a importância da comunicação por voz em comunidades?",
    options: [
      "Nenhuma, a comunicação escrita é suficiente",
      "Aumenta a acessibilidade para pessoas com diferentes níveis de alfabetização",
      "Apenas para manter registros oficiais",
      "Só é útil para comunicações de emergência"
    ],
    correctAnswer: "Aumenta a acessibilidade para pessoas com diferentes níveis de alfabetização",
    badge: {
      title: "Comunicador Universal",
      description: "Você valoriza a comunicação acessível a todos!",
      icon: "🗣️"
    }
  }
];

export default function QuizPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [volume, setVolume] = useState(0);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [showAchievement, setShowAchievement] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<Array<QuizQuestion['badge']>>([]);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  
  const currentQuestion = questions[currentQuestionIndex];
  
  // Initialize speech recognition
  useEffect(() => {
    initializeSpeechRecognition();
    
    return () => {
      stopRecording();
    };
  }, [transcript]);
  
  // Function to initialize speech recognition with proper error handling
  const initializeSpeechRecognition = () => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.interimResults = true;
        
        // Type-safe event handler
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          if (event?.results?.length > 0) {
            const last = event.results.length - 1;
            const transcript = event.results[last]?.[0]?.transcript;
            if (transcript) {
              setTranscript(transcript);
            }
          }
        };
        
        recognition.onend = () => {
          setIsRecording(false);
          if (transcript) {
            checkAnswer();
          }
        };
        
        recognitionRef.current = recognition;
      }
    }
  };
  
  const startRecording = async () => {
    setIsRecording(true);
    setTranscript('');
    setResult(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      // Create audio context for volume visualization
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.error('AudioContext not supported in this browser');
        return;
      }
      
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
            if (isRecording) {
              analyserRef.current?.getByteFrequencyData(dataArray);
              let sum = 0;
              
              // Calculate average volume
              for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
              }
              
              const avg = sum / bufferLength;
              setVolume(avg);
              
              requestAnimationFrame(checkVolume);
            }
          };
          
          // Start volume monitoring
          checkVolume();
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
    setIsRecording(false);
    
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
  
  const checkAnswer = () => {
    // Return early if currentQuestion is undefined
    if (!currentQuestion) {
      console.error("No current question available");
      return;
    }

    // Simple string matching - in a real app, this would use NLP to be more flexible
    const userAnswer = transcript.toLowerCase();
    const correctAnswer = currentQuestion.correctAnswer.toLowerCase();
    
    // Check if the user's response contains the correct answer
    const isCorrect = userAnswer.includes(correctAnswer) || 
      currentQuestion.options.findIndex(
        option => option.toLowerCase() === userAnswer || 
        userAnswer.includes(option.toLowerCase())
      ) === currentQuestion.options.findIndex(
        option => option.toLowerCase() === correctAnswer
      );
    
    setResult(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      // Add badge to earned badges
      setEarnedBadges([...earnedBadges, currentQuestion.badge]);
      
      // Show achievement notification
      setShowAchievement(true);
      
      // Move to next question after delay
      setTimeout(() => {
        setShowAchievement(false);
        
        // If there are more questions, go to the next one
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setResult(null);
          setTranscript('');
        }
      }, 3000);
    } else {
      // For incorrect answers, allow retry after a delay
      setTimeout(() => {
        setResult(null);
        setTranscript('');
      }, 2000);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-100">
      <Head>
        <title>Quiz do Papo Social</title>
        <meta name="description" content="Responda perguntas e ganhe distintivos no Papo Social" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navbar com theme toggle */}
      <div className="navbar bg-base-100 shadow-sm">
        <div className="navbar-start">
          <Link href="/" className="btn btn-ghost normal-case text-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" />
            </svg>
            <span className="hidden sm:inline font-bold">Papo Social</span>
          </Link>
        </div>
        <div className="navbar-center">
          <ul className="menu menu-horizontal px-1 hidden md:flex">
            <li><Link href="/">Início</Link></li>
            <li><Link href="/about">Sobre</Link></li>
            <li><Link href="/quiz" className="active">Quiz</Link></li>
          </ul>
        </div>
        <div className="navbar-end">
          <div className="badge badge-primary badge-lg gap-2 mr-2">
            {earnedBadges.length} Distintivo{earnedBadges.length !== 1 ? 's' : ''}
          </div>
          <ThemeToggle />
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="card bg-base-100 shadow-xl"
          >
            <div className="card-body">
              <h1 className="card-title text-2xl justify-center mb-4">
                Pergunta {currentQuestionIndex + 1} de {questions.length}
              </h1>
              
              <div className="divider"></div>
              
              {currentQuestion && (
                <>
                  <h2 className="text-xl mb-6 font-medium">{currentQuestion.question}</h2>
                  
                  <div className="space-y-3 mb-8">
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center p-2 rounded-lg hover:bg-base-200 transition-colors">
                        <div className="badge badge-primary mr-3">{index + 1}</div>
                        <p>{option}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {isRecording ? (
                <div className="text-center">
                  <div className="mb-6">
                    <VoiceVisualization volume={volume} className="h-24" />
                  </div>
                  <div className="chat chat-start w-full max-w-md mx-auto mb-4">
                    <div className="chat-bubble">
                      {transcript || "Diga sua resposta..."}
                    </div>
                  </div>
                  <button 
                    className="btn btn-outline"
                    onClick={stopRecording}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  {result === null ? (
                    <button 
                      className="btn btn-primary btn-lg gap-2"
                      onClick={startRecording}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      Responder por voz
                    </button>
                  ) : (
                    <div className={`alert ${result === 'correct' ? 'alert-success' : 'alert-error'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        {result === 'correct' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                      <span>{result === 'correct' ? 'Correto!' : 'Incorreto! Tente novamente.'}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Progress indicator */}
              <div className="mt-4">
                <div className="flex justify-between mb-2">
                  <span>Progresso</span>
                  <span>{Math.round((currentQuestionIndex / questions.length) * 100)}%</span>
                </div>
                <progress 
                  className="progress progress-primary w-full" 
                  value={(currentQuestionIndex / questions.length) * 100} 
                  max="100"
                ></progress>
              </div>
            </div>
          </motion.div>
          
          {/* Badges earned */}
          {earnedBadges.length > 0 && (
            <div className="card bg-base-100 shadow-xl mt-8">
              <div className="card-body">
                <h2 className="card-title">Seus Distintivos</h2>
                <div className="flex flex-wrap gap-3 mt-2">
                  {earnedBadges.map((badge, index) => (
                    <div key={index} className="badge badge-lg gap-2 p-4 badge-outline">
                      <span className="text-xl">{badge.icon}</span>
                      {badge.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Improved Footer */}
      <footer className="footer footer-center p-10 bg-base-200 text-base-content rounded">
        <div className="grid grid-flow-col gap-4">
          <Link href="/about" className="link link-hover">Sobre nós</Link>
          <Link href="/contact" className="link link-hover">Contato</Link>
          <Link href="/terms" className="link link-hover">Termos de uso</Link>
          <Link href="/privacy" className="link link-hover">Privacidade</Link>
        </div>
        <div>
          <p>© 2024 Papo Social - Todos os direitos reservados</p>
        </div>
      </footer>

      {/* Achievement Notification */}
      {showAchievement && currentQuestion && (
        <AchievementNotification
          title={`Novo Distintivo: ${currentQuestion.badge.title}`}
          description={currentQuestion.badge.description}
          icon={currentQuestion.badge.icon}
        />
      )}
    </div>
  );
} 