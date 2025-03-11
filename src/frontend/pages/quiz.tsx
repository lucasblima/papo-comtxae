import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ThemeToggle } from '../components/ui';
import { VoiceVisualization } from '../components/VoiceVisualization';
import { AchievementNotification } from '../components/AchievementNotification';

// Import SpeechRecognition types
import type { SpeechRecognition } from '../types/speech-recognition.d';

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
          if (transcript) {
            checkAnswer();
          }
        };
        
        recognitionRef.current = recognition;
      }
    }
    
    return () => {
      stopRecording();
    };
  }, [transcript]);
  
  const startRecording = async () => {
    setIsRecording(true);
    setTranscript('');
    setResult(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      // Create audio context for volume visualization
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
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
                sum += dataArray[i];
              }
              const avg = sum / bufferLength;
              setVolume(avg);
              
              if (isRecording) {
                requestAnimationFrame(checkVolume);
              }
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
    <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-100" data-theme="dim">
      <Head>
        <title>Quiz do Papo Social</title>
        <meta name="description" content="Responda perguntas e ganhe distintivos no Papo Social" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Simple header with theme toggle */}
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" />
            </svg>
            <span className="text-xl font-bold">Papo Social</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="badge badge-primary gap-2">
            {earnedBadges.length} Distintivo{earnedBadges.length !== 1 ? 's' : ''}
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="bg-base-100 shadow-lg rounded-lg p-6"
          >
            <h1 className="text-2xl font-bold mb-8 text-center">
              Pergunta {currentQuestionIndex + 1} de {questions.length}
            </h1>
            
            <h2 className="text-xl mb-6">{currentQuestion.question}</h2>
            
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-start">
                  <div className="badge mr-2">{index + 1}</div>
                  <p>{option}</p>
                </div>
              ))}
            </div>
            
            {isRecording ? (
              <div className="text-center">
                <div className="mb-6">
                  <VoiceVisualization volume={volume} className="h-24" />
                </div>
                <p className="mb-4">{transcript || "Diga sua resposta..."}</p>
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
                    className="btn btn-primary btn-lg"
                    onClick={startRecording}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          </motion.div>
          
          {/* Progress indicator */}
          <div className="mt-8">
            <div className="flex justify-between mb-2">
              <span>Progresso</span>
              <span>{Math.round((currentQuestionIndex / questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-base-300 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${(currentQuestionIndex / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Badges earned */}
          {earnedBadges.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Seus Distintivos:</h2>
              <div className="flex flex-wrap gap-3">
                {earnedBadges.map((badge, index) => (
                  <div key={index} className="badge badge-lg gap-2 p-4 bg-base-300">
                    <span className="text-xl">{badge.icon}</span>
                    {badge.title}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Simplified Footer */}
      <footer className="footer footer-center p-6 bg-base-100 text-base-content">
        <div>
          <p>© 2024 Papo Social - Todos os direitos reservados</p>
        </div>
      </footer>
      
      {showAchievement && (
        <AchievementNotification 
          title={currentQuestion.badge.title}
          description={currentQuestion.badge.description}
          icon={currentQuestion.badge.icon}
          onClose={() => setShowAchievement(false)}
        />
      )}
    </div>
  );
} 