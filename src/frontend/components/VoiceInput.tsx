import React, { useState, useEffect, useRef } from 'react';

interface VoiceInputProps {
  onResult: (text: string) => void;
  onProcessing: (isProcessing: boolean) => void;
  language?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ 
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
      setErrorMsg(`Erro: ${event.error}`);
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
      setErrorMsg(null);
      recognitionRef.current?.start();
    }
  };

  return (
    <div className="voice-input mt-4">
      <button
        onClick={toggleListening}
        className={`px-4 py-2 rounded-full font-medium text-white flex items-center justify-center ${
          isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        <span className="mr-2">
          {isListening ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </span>
        {isListening ? 'Parar' : 'Falar'}
      </button>
      
      {errorMsg && (
        <div className="text-red-500 mt-2 text-sm">{errorMsg}</div>
      )}
      
      {isListening && (
        <div className="text-sm text-gray-500 mt-2 animate-pulse">
          Ouvindo... Fale agora
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
