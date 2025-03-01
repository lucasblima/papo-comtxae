'use client'

import React from 'react';
import { useState } from 'react'
import { SpeechToText } from '../../components/speech/speech-to-text'
import { TextToSpeech } from '../../components/speech/text-to-speech'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { VolumeIcon, MicIcon } from 'lucide-react'

export default function VoiceDemoPage() {
  const [transcript, setTranscript] = useState('')
  const [exampleText, setExampleText] = useState(
    'Este é um exemplo de texto que pode ser lido em voz alta. ' +
    'A tecnologia de conversão de texto em voz ajuda pessoas com diferentes níveis de letramento.'
  )

  const examples = [
    {
      title: "Texto Simples",
      content: "Olá! Bem-vindo ao Papo Social. Aqui você pode compartilhar ideias com sua comunidade."
    },
    {
      title: "Explicação",
      content: "Para enviar uma mensagem, digite seu texto e clique no botão enviar. Você também pode usar a voz para escrever mensagens."
    },
    {
      title: "Notícia",
      content: "Nova funcionalidade! Agora você pode ouvir qualquer texto do Papo Social em voz alta, facilitando o acesso para todos."
    }
  ]

  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const handleStartListening = () => {
    setIsListening(true)
  }

  const handleStopListening = () => {
    setIsListening(false)
  }

  const handleTranscriptChange = (text: string) => {
    setTranscript(text)
  }

  const handleSelectExample = (text: string) => {
    setExampleText(text)
  }

  const handleSpeakText = () => {
    const tts = TextToSpeech({
      text: exampleText,
      onSpeak: () => setIsSpeaking(true),
      onStop: () => setIsSpeaking(false)
    })
    tts.speak()
  }

  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-3xl font-bold">Demonstração de Tecnologias de Voz</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seção de Fala para Texto */}
        <div className="space-y-4">
          <SpeechToText
            onTranscript={handleTranscriptChange}
            isListening={isListening}
            showVisualFeedback={true}
            autoStart={isListening}
            language="pt-BR"
          />
        </div>
        
        {/* Seção de Texto para Fala */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <VolumeIcon className="h-5 w-5" />
                Texto para Fala
              </CardTitle>
              <CardDescription>
                Selecione um exemplo ou escreva seu próprio texto para ouvir
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Exemplos:</h3>
                <div className="flex flex-wrap gap-2">
                  {examples.map((example, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      onClick={() => handleSelectExample(example.content)}
                    >
                      {example.title}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <textarea 
                  className="w-full min-h-[150px] p-3 rounded-md border"
                  value={exampleText}
                  onChange={(e) => setExampleText(e.target.value)}
                  placeholder="Digite ou cole um texto aqui para ouvir..."
                />
              </div>
              
              <Button 
                onClick={handleSpeakText}
                className="flex items-center gap-2"
                disabled={!exampleText || isSpeaking}
              >
                <VolumeIcon className="h-4 w-4" />
                {isSpeaking ? "Falando..." : "Falar Texto"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}