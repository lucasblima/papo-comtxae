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
      <div className="flex flex-col items-center gap-4">
        {/* Voice Input Button with Animation and Ripple Effect */}
        <div className="relative">
          <div className={`absolute inset-0 rounded-full ${isListening ? 'animate-ping bg-error/30' : 'bg-transparent'}`}></div>
          <button
            onClick={toggleListening}
            className={`btn btn-circle btn-lg ${isListening ? 'btn-error' : 'btn-primary'} relative z-10`}
            data-testid="voice-input-button"
          >
            {isListening ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
          <div className="badge badge-lg absolute -top-3 -right-3 badge-secondary">
            {isListening ? 'Ativo' : 'Pronto'}
          </div>
          <span className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm font-bold ${isListening ? 'text-error' : 'text-primary'}`}>
            {isListening ? 'Parar' : 'Falar'}
          </span>
        </div>

        {/* Status Indicators with improved styling */}
        <div className="w-full max-w-xs mt-4">
          {errorMsg && (
            <div className="alert alert-error shadow-lg">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-bold">Erro</h3>
                  <div className="text-xs">{errorMsg}</div>
                </div>
              </div>
            </div>
          )}
          
          {isListening && (
            <div className="alert alert-info shadow-lg">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-bold">Ouvindo</h3>
                  <div className="text-xs">Fale seu comando agora...</div>
                </div>
              </div>
              <div className="flex-none">
                <div className="loading loading-bars loading-xs"></div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Tips with better styling */}
        <div className="collapse collapse-arrow bg-base-200 w-full max-w-md rounded-box mt-2">
          <input type="checkbox" /> 
          <div className="collapse-title text-sm font-medium flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Como usar o comando de voz?
          </div>
          <div className="collapse-content"> 
            <div className="steps steps-vertical text-xs">
              <div className="step step-primary">Clique no botão do microfone</div>
              <div className="step step-primary">Aguarde o sinal de "Ouvindo"</div>
              <div className="step step-primary">Fale seu comando claramente</div>
              <div className="step step-primary">O sistema processará automaticamente</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceInput;
