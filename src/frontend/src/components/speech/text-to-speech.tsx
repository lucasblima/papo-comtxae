'use client'

interface TextToSpeechProps {
  text: string
  onSpeak?: () => void
  onStop?: () => void
}

export const TextToSpeech = ({ text, onSpeak, onStop }: TextToSpeechProps) => {
  const speak = () => {
    if (!text) return

    // Verifica se a API de síntese de voz está disponível
    if ('speechSynthesis' in window) {
      // Para qualquer fala atual
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'pt-BR'
      
      utterance.onstart = () => {
        if (onSpeak) onSpeak()
      }
      
      utterance.onend = () => {
        if (onStop) onStop()
      }
      
      window.speechSynthesis.speak(utterance)
    } else {
      alert("Desculpe, seu navegador não suporta a funcionalidade de texto para voz.")
    }
  }

  return { speak }
}
