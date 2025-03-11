import React, { useState, useEffect, useRef } from 'react';
import { VoiceInputProps } from './types';

/**
 * VoiceInput: A component that handles voice input using the Web Speech API
 * 
 * @example
 * <VoiceInput 
 *   onResult={(text) => console.log(text)}
 *   onProcessing={(isProcessing) => setLoading(isProcessing)}
 *   language="pt-BR"
 * />
 */
export const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onResult, 
  onProcessing, 
  language = 'pt-BR' 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Verificar suporte a reconhecimento de voz
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setErrorMsg('Reconhecimento de voz não suportado neste navegador.');
      return;
    }

    // Configurar o reconhecimento de voz
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      onProcessing(true);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      onProcessing(false);
    };

    recognitionRef.current.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
        
      onResult(transcript);
    };

    recognitionRef.current.onerror = (event: any) => {
      setErrorMsg(`Erro no reconhecimento de voz: ${event.error}`);
      setIsListening(false);
      onProcessing(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, onProcessing, onResult]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setErrorMsg(null);
      } catch (error) {
        console.error('Erro ao iniciar reconhecimento de voz:', error);
        setErrorMsg('Erro ao iniciar reconhecimento de voz.');
      }
    }
  };

  return (
    <div className="voice-input-container" data-testid="voice-input-component">
      <button
        onClick={toggleListening}
        disabled={!!errorMsg}
        className={`voice-button ${isListening ? 'listening' : ''} ${errorMsg ? 'error' : ''}`}
        aria-label={isListening ? 'Parar de ouvir' : 'Começar a ouvir'}
        data-testid="voice-toggle-button"
      >
        {isListening ? 'Parar' : 'Falar'}
      </button>
      
      {errorMsg && (
        <div className="error-message" data-testid="voice-error-message">
          {errorMsg}
        </div>
      )}
    </div>
  );
};

export default VoiceInput; 