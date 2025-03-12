import React, { useState, useEffect, useRef } from 'react';
import { EnhancedVoiceButton } from './EnhancedVoiceButton';
import { VoiceVisualization } from './VoiceVisualization';

export interface VoiceInputProps {
  /** Function called with the recognized text */
  onResult?: (text: string) => void;
  /** Function called when processing state changes */
  onProcessing?: (isProcessing: boolean) => void;
  /** Placeholder text shown before voice input starts */
  placeholder?: string;
  /** Whether to start voice recognition automatically */
  autoStart?: boolean;
  /** Whether to show visualization */
  visualize?: boolean;
  /** Language for speech recognition */
  language?: string;
  /** Size of the voice button */
  buttonSize?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
}

/**
 * VoiceInput: A component that handles voice input using the Web Speech API
 * 
 * @example
 * <VoiceInput 
 *   onResult={(text) => console.log(text)}
 *   onProcessing={(isProcessing) => setLoading(isProcessing)}
 *   language="pt-BR"
 *   visualize={true}
 * />
 */
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Start listening function
  const startListening = () => {
    if (recognitionRef.current && !isListening && !disabled) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        if (onProcessing) onProcessing(true);
        setupVolumeDetection();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  // Stop listening function
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        if (onProcessing) onProcessing(false);
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
    
    // Clean up audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    
    // Release media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  // Setup speech recognition
  useEffect(() => {
    // Check browser support
    if (typeof window === 'undefined' || 
        (!window.SpeechRecognition && !window.webkitSpeechRecognition)) {
      setErrorMsg('Reconhecimento de voz não suportado neste navegador.');
      return;
    }

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
        
        // If this is a final result, call the onResult callback
        if (event.results[last]?.isFinal && onResult) {
          onResult(result);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setErrorMsg(`Erro: ${event.error}`);
        setIsListening(false);
        if (onProcessing) onProcessing(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (onProcessing) onProcessing(false);
      };
    }

    // Auto-start if enabled
    if (autoStart) {
      startListening();
    }

    // Cleanup
    return () => {
      stopListening();
    };
  }, [language, autoStart]);

  // Rest of the implementation...
  
  // Function to set up volume detection
  const setupVolumeDetection = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const analyser = audioContextRef.current.createAnalyser();
      analyserRef.current = analyser;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyser);
      
      analyser.fftSize = 32;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const getVolume = () => {
        if (!isListening || !analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const normalizedVolume = Math.min(100, average * 2); // Scale to 0-100
        setVolume(normalizedVolume);
        
        if (isListening) {
          requestAnimationFrame(getVolume);
        }
      };
      
      getVolume();
    } catch (error) {
      console.error('Error setting up volume detection:', error);
    }
  };

  // Render the component
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {errorMsg && (
        <div className="text-error mb-2">{errorMsg}</div>
      )}
      
      <div className="flex flex-col items-center">
        {visualize && isListening && (
          <VoiceVisualization 
            isListening={isListening} 
            volume={volume} 
            size={buttonSize}
          />
        )}
        
        <div className="mt-2">
          <EnhancedVoiceButton
            isListening={isListening}
            onClick={isListening ? stopListening : startListening}
            size={buttonSize}
            disabled={disabled}
          />
        </div>
        
        {transcript && (
          <div className="mt-4 text-center max-w-md">
            <p className="font-medium">{transcript}</p>
          </div>
        )}
        
        {!isListening && !transcript && (
          <p className="text-sm text-gray-500 mt-2">{placeholder}</p>
        )}
      </div>
    </div>
  );
} 