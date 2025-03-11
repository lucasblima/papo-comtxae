/**
 * TypeScript definitions for the Web Speech API
 * These types are needed because TypeScript doesn't include full definitions for the Web Speech API
 */

export interface SpeechRecognitionErrorEvent extends Event {
  error: 'no-speech' | 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported';
  message: string;
}

export interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal?: boolean;
}

export interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: any;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: (event: Event) => void;
  onaudiostart: (event: Event) => void;
  onend: (event: Event) => void;
  onerror: (event: Event) => void;
  onnomatch: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onsoundend: (event: Event) => void;
  onsoundstart: (event: Event) => void;
  onspeechend: (event: Event) => void;
  onspeechstart: (event: Event) => void;
  onstart: (event: Event) => void;
  abort(): void;
  start(): void;
  stop(): void;
}

export interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
  
  interface AudioContext extends BaseAudioContext {}
  
  interface Window {
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}

export {};