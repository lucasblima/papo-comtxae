import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { VoiceVisualization } from './VoiceVisualization';
import type { SpeechRecognition, SpeechRecognitionEvent } from '../../types/speech-recognition.d';

export interface VoiceAuthenticationProps {
  /** Optional class name for styling */
  className?: string;
  /** Callback on successful authentication */
  onSuccess?: (name: string) => void;
  /** Callback on authentication error */
  onError?: (error: string) => void;
  /** Callback when user cancels */
  onCancel?: () => void;
  /** Custom prompt message */
  prompt?: string;
  /** Redirect URL after successful authentication */
  redirectUrl?: string;
}

/**
 * VoiceAuthentication: A component that handles voice-based authentication
 * 
 * @example
 * <VoiceAuthentication 
 *   onSuccess={(name) => console.log(`Welcome, ${name}`)} 
 *   redirectUrl="/dashboard" 
 * />
 */
export function VoiceAuthentication({
  className = '',
  onSuccess,
  onError,
  onCancel,
  prompt = 'Diga seu nome para se identificar',
  redirectUrl = '/dashboard'
}: VoiceAuthenticationProps): React.ReactElement {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [volume, setVolume] = useState(0);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const router = useRouter();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  
  // Initialize speech recognition
  useEffect(() => {
    initializeSpeechRecognition();
    
    return () => {
      stopRecording();
    };
  }, []);
  
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
            const transcriptText = event.results[last]?.[0]?.transcript;
            const confidence = event.results[last]?.[0]?.confidence || 0;
            
            if (transcriptText) {
              setTranscript(transcriptText);
              
              // Extract name from speech
              const name = extractNameFromSpeech(transcriptText);
              if (name && confidence > 0.7) {
                authenticateUser(name, confidence);
              }
            }
          }
        };
        
        recognition.onend = () => {
          setIsRecording(false);
          
          // If we have transcript but status is still listening, process it
          if (transcript && status === 'listening') {
            setStatus('processing');
            const name = extractNameFromSpeech(transcript);
            if (name) {
              authenticateUser(name, 0.8); // Default confidence if not available
            } else {
              setStatus('error');
              setErrorMessage('Não consegui identificar seu nome. Por favor, tente novamente.');
              if (onError) onError('Nome não identificado');
            }
          }
        };
        
        recognition.onerror = (event) => {
          setIsRecording(false);
          setStatus('error');
          const errorMsg = 'Erro no reconhecimento de voz. Por favor, tente novamente.';
          setErrorMessage(errorMsg);
          if (onError) onError(errorMsg);
        };
        
        recognitionRef.current = recognition;
      } else {
        setStatus('error');
        const errorMsg = 'Seu navegador não suporta reconhecimento de voz. Por favor, use um navegador mais recente.';
        setErrorMessage(errorMsg);
        if (onError) onError(errorMsg);
      }
    }
  };
  
  // Helper function to extract name from speech
  const extractNameFromSpeech = (text: string): string | null => {
    // Simple extraction - in production, use NLP for better results
    const lowerText = text.toLowerCase();
    
    // Common Brazilian name patterns
    const namePatterns = [
      /meu nome é (\w+)/i,
      /me chamo (\w+)/i,
      /sou (?:o|a) (\w+)/i,
      /(?:^|\s)(\w+)(?:\s|$)/i, // Just pick the first word if nothing else matches
    ];
    
    for (const pattern of namePatterns) {
      const match = lowerText.match(pattern);
      if (match && match[1]) {
        // Capitalize first letter
        return match[1].charAt(0).toUpperCase() + match[1].slice(1);
      }
    }
    
    // If no patterns match, just return the first word
    const words = text.trim().split(/\s+/);
    if (words.length > 0 && words[0]) {
      const name = words[0];
      return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }
    
    return null;
  };
  
  // Function to authenticate user with voice
  const authenticateUser = async (name: string, confidence: number) => {
    setStatus('processing');
    
    try {
      // Extract voice characteristics (simplified for MVP)
      // In a real app, you'd use more sophisticated voice feature extraction
      const voiceData = {
        pitch: Math.random() * 100 + 100, // Placeholder for actual pitch analysis
        cadence: Math.random() * 20 + 60, // Placeholder for speech cadence
        volume: volume // Use measured volume
      };
      
      // Call NextAuth signIn method
      const result = await signIn('voice-credentials', {
        name,
        voiceData: JSON.stringify(voiceData),
        confidence: confidence.toString(),
        redirect: false
      });
      
      if (result?.error) {
        setStatus('error');
        setErrorMessage('Erro na autenticação. Por favor, tente novamente.');
        if (onError) onError(result.error);
      } else {
        setStatus('success');
        if (onSuccess) onSuccess(name);
        
        // Redirect after successful authentication
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1500);
      }
    } catch (error) {
      setStatus('error');
      const errorMsg = 'Erro ao processar autenticação. Por favor, tente novamente.';
      setErrorMessage(errorMsg);
      if (onError) onError(errorMsg);
    }
  };
  
  const startRecording = async () => {
    setIsRecording(true);
    setTranscript('');
    setErrorMessage('');
    setStatus('listening');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      // Create audio context for volume visualization
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('AudioContext not supported in this browser');
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
            if (analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              
              // Calculate average volume with proper typing
              for (let i = 0; i < bufferLength; i++) {
                // Ensure we're only accessing valid indices and dataArray is defined
                sum += dataArray[i] || 0;
              }
              
              const avg = sum / bufferLength;
              setVolume(avg);
              
              if (isRecording) {
                requestAnimationFrame(checkVolume);
              }
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
      setIsRecording(false);
      setStatus('error');
      const errorMsg = 'Erro ao acessar seu microfone. Verifique as permissões.';
      setErrorMessage(errorMsg);
      if (onError) onError(errorMsg);
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
    
    if (status === 'listening' && onCancel) {
      onCancel();
    }
  };
  
  // Handle cancel button click
  const handleCancel = () => {
    stopRecording();
    if (onCancel) onCancel();
  };
  
  // Render based on status
  return (
    <div className={`flex flex-col items-center p-6 rounded-lg bg-base-200 ${className}`}>
      <h2 className="text-2xl font-bold mb-6 text-center">Entrada por Voz</h2>
      
      {status === 'idle' && (
        <>
          <p className="mb-6 text-center">{prompt}</p>
          <button 
            className="btn btn-primary btn-lg"
            onClick={startRecording}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Falar
          </button>
        </>
      )}
      
      {status === 'listening' && (
        <>
          <p className="mb-4 text-center">Estou ouvindo...</p>
          <div className="mb-6">
            <VoiceVisualization volume={volume} isListening={true} className="h-24" />
          </div>
          <p className="mb-4 text-center font-medium">{transcript || "Diga seu nome..."}</p>
          <button 
            className="btn btn-outline"
            onClick={handleCancel}
          >
            Cancelar
          </button>
        </>
      )}
      
      {status === 'processing' && (
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p>Processando sua identificação...</p>
        </div>
      )}
      
      {status === 'success' && (
        <div className="text-center">
          <div className="mb-4 text-5xl">✅</div>
          <p className="text-xl mb-2">Identificação bem-sucedida!</p>
          <p>Redirecionando para sua área personalizada...</p>
        </div>
      )}
      
      {status === 'error' && (
        <div className="text-center">
          <div className="mb-4 text-5xl">❌</div>
          <p className="text-error mb-4">{errorMessage}</p>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setStatus('idle');
              setErrorMessage('');
            }}
          >
            Tentar Novamente
          </button>
        </div>
      )}
    </div>
  );
} 