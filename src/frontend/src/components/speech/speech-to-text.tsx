'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card'
import { MicIcon, StopCircleIcon, VolumeIcon } from 'lucide-react'

interface SpeechToTextProps {
  onTranscript: (text: string) => void
  isListening: boolean
  showVisualFeedback?: boolean
  autoStart?: boolean
  language?: string
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
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('')
      
      onTranscript(transcript)
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <VolumeIcon className="h-5 w-5" />
          Reconhecimento de Voz
        </CardTitle>
        <CardDescription>
          Fale claramente para que seu texto seja reconhecido
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {errorMessage && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {errorMessage}
          </div>
        )}

        {showVisualFeedback && (
          <div className="relative mb-4 p-4 bg-muted rounded-md min-h-[100px] max-h-[300px] overflow-auto">
            <p className="whitespace-pre-wrap break-words">
              {transcript}
              <span className="text-muted-foreground">{interimTranscript}</span>
            </p>
            {isListening && (
              <span className="absolute right-4 top-4 h-3 w-3 rounded-full bg-primary animate-pulse" />
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button 
            variant={isListening ? "destructive" : "default"}
            onClick={toggleListening}
            className="flex items-center gap-2"
          >
            {isListening ? (
              <>
                <StopCircleIcon className="h-4 w-4" />
                Parar
              </>
            ) : (
              <>
                <MicIcon className="h-4 w-4" />
                Começar a Escutar
              </>
            )}
          </Button>
          
          {transcript && (
            <Button variant="outline" onClick={resetTranscript}>
              Limpar Texto
            </Button>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="text-sm text-muted-foreground">
        {isListening ? "Escutando..." : "Clique em 'Começar a Escutar' e fale"}
      </CardFooter>
    </Card>
  )
}
