import React, { useState, useEffect, useRef } from 'react';
import { EnhancedVoiceButton } from './EnhancedVoiceButton';
import { VoiceVisualization } from './VoiceVisualization';

export interface VoiceInputProps {
  onResult?: (text: string) => void;
  onProcessing?: (isProcessing: boolean) => void;
  placeholder?: string;
  autoStart?: boolean;
  visualize?: boolean;
  language?: string;
  buttonSize?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export function VoiceInput({
  onResult,
  onProcessing,
  placeholder = "Clique para falar...",
  autoStart = false,
  visualize = true,
  language = 'pt-BR',
  buttonSize = 'md',
  className = '',
  disabled = false
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [volume, setVolume] = useState(0);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Setup speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = language;
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onresult = (event: any) => {
          const last = event.results.length - 1;
          const result = event.results[last]?.[0]?.transcript || '';
          setTranscript(result);
          if (event.results[last]?.isFinal && onResult) {
            onResult(result);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          if (onProcessing) onProcessing(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          if (onProcessing) onProcessing(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [language, onProcessing, onResult]);

  // Start listening automatically if autoStart is true
  useEffect(() => {
    if (autoStart && !disabled) {
      toggleListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, disabled]);

  const toggleListening = async () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (onProcessing) onProcessing(false);
      
      // Stop audio context
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    } else {
      try {
        setIsListening(true);
        if (onProcessing) onProcessing(true);
        
        // Setup audio context for visualization
        if (visualize) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;
          
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
          }
          
          if (!analyserRef.current && audioContextRef.current) {
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            
            const checkVolume = () => {
              if (!analyserRef.current) return;
              
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i] || 0;
              }
              const avg = sum / (dataArray.length || 1);
              setVolume(avg);
              
              if (isListening) {
                requestAnimationFrame(checkVolume);
              }
            };
            
            checkVolume();
          }
        }
        
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting voice input:', error);
        setIsListening(false);
        if (onProcessing) onProcessing(false);
      }
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <EnhancedVoiceButton
        isListening={isListening}
        isProcessing={disabled}
        onClick={toggleListening}
        size={buttonSize}
      />
      
      {visualize && isListening && (
        <div className="mt-2">
          <VoiceVisualization 
            isListening={isListening}
            amplitude={volume / 100} // Convert volume to amplitude (0-1)
          />
        </div>
      )}
      
      {transcript && (
        <p className="mt-2 text-sm opacity-75 max-w-xs text-center">
          "{transcript}"
        </p>
      )}
      
      {!transcript && !isListening && (
        <p className="mt-2 text-sm opacity-50 max-w-xs text-center">
          {placeholder}
        </p>
      )}
    </div>
  );
} 