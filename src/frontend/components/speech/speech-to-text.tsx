'use client'

import { useState, useEffect, useRef } from 'react'
import { FaMicrophone, FaStopCircle, FaVolumeUp } from 'react-icons/fa'

interface SpeechToTextProps {
  onTranscript: (text: string) => void
  isListening: boolean
  showVisualFeedback?: boolean
  autoStart?: boolean
  language?: string
}

// Definindo tipos para SpeechRecognition para evitar erros de TypeScript
interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionAlternative {
  [index: number]: SpeechRecognitionResult;
  length: number;
  isFinal?: boolean;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export const SpeechToText = ({ onTranscript, isListening }: SpeechToTextProps) => {
  useEffect(() => {
    if (!isListening) return
    
    // Implementação do reconhecimento de voz
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      alert("Seu navegador não suporta reconhecimento de voz.")
      return
    }
    
    const recognition = new SpeechRecognition()
    recognition.lang = 'pt-BR'
    recognition.continuous = true
    recognition.interimResults = true
    
    recognition.onresult = (event: any) => {
      let fullTranscript = '';
      
      // Usando um método mais simples e seguro para evitar erros de TypeScript
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i]) {
          const result = event.results[i][0];
          if (result && result.transcript) {
            fullTranscript += result.transcript;
          }
        }
      }
      
      onTranscript(fullTranscript)
    }
    
    recognition.start()
    
    return () => {
      recognition.stop()
    }
  }, [isListening, onTranscript])

  return null // Componente não renderiza nada visualmente
}

export function SpeechToTextComponent({
  onTranscript,
  showVisualFeedback = true,
  autoStart = false,
  language = 'pt-BR'
}: SpeechToTextProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Verificar se o navegador suporta reconhecimento de fala
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setErrorMessage('Seu navegador não suporta reconhecimento de fala. Tente usar o Chrome.')
      return
    }

    // Inicializar o objeto de reconhecimento
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = language

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      setInterimTranscript(interimTranscript)
      
      if (finalTranscript) {
        setTranscript(prev => {
          const newTranscript = prev ? `${prev} ${finalTranscript}` : finalTranscript
          if (onTranscript) onTranscript(newTranscript)
          return newTranscript
        })
      }
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error('Erro de reconhecimento de fala:', event.error)
      setErrorMessage(`Erro: ${event.error}`)
      setIsListening(false)
    }

    recognitionRef.current.onend = () => {
      // Se ainda estamos "ouvindo" quando terminar, reinicie
      if (isListening) {
        recognitionRef.current.start()
      }
    }

    // Auto-iniciar se configurado
    if (autoStart) {
      startListening()
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, autoStart])

  const startListening = () => {
    setErrorMessage('')
    try {
      recognitionRef.current.start()
      setIsListening(true)
    } catch (error) {
      console.error('Erro ao iniciar reconhecimento:', error)
    }
  }

  const stopListening = () => {
    try {
      recognitionRef.current.stop()
      setIsListening(false)
    } catch (error) {
      console.error('Erro ao parar reconhecimento:', error)
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const resetTranscript = () => {
    setTranscript('')
    setInterimTranscript('')
    if (onTranscript) onTranscript('')
  }

  return (
    <div className="card w-full bg-base-100">
      <div className="card-header">
        <h2 className="card-title flex items-center gap-2">
          <FaVolumeUp className="h-5 w-5" />
          Reconhecimento de Voz
        </h2>
        <p className="text-base-content/70">
          Fale claramente para que seu texto seja reconhecido
        </p>
      </div>
      
      <div className="card-body">
        {errorMessage && (
          <div className="mb-4 p-3 bg-error/10 text-error rounded-md text-sm">
            {errorMessage}
          </div>
        )}

        {showVisualFeedback && (
          <div className="relative mb-4 p-4 bg-base-200 rounded-md min-h-[100px] max-h-[300px] overflow-auto">
            <p className="whitespace-pre-wrap break-words">
              {transcript}
              <span className="text-base-content/70">{interimTranscript}</span>
            </p>
            {isListening && (
              <span className="absolute right-4 top-4 h-3 w-3 rounded-full bg-primary animate-pulse" />
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button 
            className={`btn ${isListening ? "btn-error" : "btn-primary"} flex items-center gap-2`}
            onClick={toggleListening}
          >
            {isListening ? (
              <>
                <FaStopCircle className="h-4 w-4" />
                Parar
              </>
            ) : (
              <>
                <FaMicrophone className="h-4 w-4" />
                Começar a Escutar
              </>
            )}
          </button>
          
          {transcript && (
            <button className="btn btn-outline" onClick={resetTranscript}>
              Limpar Texto
            </button>
          )}
        </div>
      </div>
      
      <div className="card-footer text-sm text-base-content/70">
        {isListening ? "Escutando..." : "Clique em 'Começar a Escutar' e fale"}
      </div>
    </div>
  )
}
