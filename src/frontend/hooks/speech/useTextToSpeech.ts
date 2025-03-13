interface UseTextToSpeechOptions {
  lang?: string;
}

export function useTextToSpeech({ lang = 'pt-BR' }: UseTextToSpeechOptions = {}) {
  const speak = (text: string) => {
    if (typeof window !== 'undefined' && 
        typeof SpeechSynthesisUtterance !== 'undefined' && 
        typeof speechSynthesis !== 'undefined') {
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = lang;
      speechSynthesis.speak(speech);
    }
  };

  const cancel = () => {
    if (typeof window !== 'undefined' && 
        typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel();
    }
  };

  return {
    speak,
    cancel
  };
} 