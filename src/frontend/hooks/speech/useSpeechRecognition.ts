import { useState, useEffect, useRef } from 'react';
import { useToast } from '../../components/ui/Toast';

// Define proper types for Speech Recognition
interface SpeechRecognitionErrorEvent extends Event {
  error: 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'no-speech' | 'service-not-available';
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onTranscriptChange?: (transcript: string) => void;
  onRecognitionEnd?: (transcript: string) => void;
}

export function useSpeechRecognition({
  lang = 'pt-BR',
  continuous = false,
  interimResults = true,
  onTranscriptChange,
  onRecognitionEnd
}: UseSpeechRecognitionOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI();
        recognition.lang = lang;
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          if (event.results && event.results.length > 0) {
            const last = event.results.length - 1;
            if (event.results[last] && event.results[last][0]) {
              const result = event.results[last][0].transcript;
              setTranscript(result);
              onTranscriptChange?.(result);
            }
          }
        };
        
        recognition.onend = () => {
          setIsRecording(false);
          
          if (transcript) {
            onRecognitionEnd?.(transcript);
          } else if (isRecording) {
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
            'service-not-available': 'Serviço de reconhecimento não disponível.',
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
        };
      } else {
        showToast({
          title: 'Erro',
          description: 'Seu navegador não suporta reconhecimento de voz.',
          type: 'error',
        });
      }
    }
    
    return () => {};
  }, [lang, continuous, interimResults, onTranscriptChange, onRecognitionEnd, isRecording, transcript, showToast]);

  const startRecording = () => {
    if (isRecording) return;
    
    try {
      setIsRecording(true);
      
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

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setIsRecording(false);
  };

  const resetTranscript = () => {
    setTranscript('');
  };

  return {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
    resetTranscript
  };
} 