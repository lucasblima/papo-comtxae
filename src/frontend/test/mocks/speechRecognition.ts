/**
 * Mock implementations for the Web Speech API
 * Use these mocks in your Jest tests for components that use speech recognition
 */

import type { 
  SpeechRecognition, 
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent 
} from '../../types/speech-recognition';

class MockSpeechRecognition implements SpeechRecognition {
  // Properties
  grammars = {} as any;
  lang = 'pt-BR';
  continuous = false;
  interimResults = false;
  maxAlternatives = 1;
  serviceURI = '';
  
  // Event handlers
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null = null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null = null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null = null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null = null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null = null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null = null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null = null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null = null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null = null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null = null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null = null;
  
  // Mock control properties
  isListening = false;
  mockTranscript = '';
  
  // EventTarget implementation
  addEventListener(): void {}
  removeEventListener(): void {}
  dispatchEvent(): boolean { return true; }
  
  // Methods
  start(): void {
    this.isListening = true;
    if (this.onstart) {
      this.onstart.call(this, new Event('start'));
    }
  }
  
  stop(): void {
    this.isListening = false;
    if (this.onend) {
      this.onend.call(this, new Event('end'));
    }
  }
  
  abort(): void {
    this.isListening = false;
    if (this.onend) {
      this.onend.call(this, new Event('end'));
    }
  }
  
  /**
   * Simulate speech recognition results
   * @param text The transcribed text to simulate
   * @param confidence The confidence level (0-1)
   */
  simulateResult(text: string, confidence = 0.9): void {
    this.mockTranscript = text;
    
    if (!this.isListening || !this.onresult) return;
    
    // Create a mock result object
    const resultEvent = {
      resultIndex: 0,
      results: {
        0: {
          0: {
            transcript: text,
            confidence: confidence
          },
          isFinal: true,
          length: 1,
          item: (index: number) => ({ transcript: text, confidence })
        },
        length: 1,
        item: (index: number) => ({
          0: { transcript: text, confidence },
          isFinal: true,
          length: 1,
          item: (index: number) => ({ transcript: text, confidence })
        })
      },
      bubbles: false,
      cancelable: false,
      timeStamp: Date.now(),
      type: 'result'
    } as unknown as SpeechRecognitionEvent;
    
    this.onresult.call(this, resultEvent);
  }
  
  /**
   * Simulate a speech recognition error
   * @param errorType The type of error to simulate
   * @param message The error message
   */
  simulateError(errorType: 'no-speech' | 'network' | 'not-allowed', message = 'Mock error'): void {
    if (!this.onerror) return;
    
    const errorEvent = {
      error: errorType,
      message: message,
      type: 'error',
      timeStamp: Date.now(),
      bubbles: false,
      cancelable: false
    } as unknown as SpeechRecognitionErrorEvent;
    
    this.onerror.call(this, errorEvent);
  }
}

/**
 * Set up Web Speech API mocks for testing
 * Call this in your jest.setup.js file or at the beginning of your test
 */
export function setupSpeechRecognitionMock(): MockSpeechRecognition {
  const mockSpeechRecognition = new MockSpeechRecognition();
  
  // Set up global constructor
  global.SpeechRecognition = jest.fn().mockImplementation(() => mockSpeechRecognition);
  global.webkitSpeechRecognition = jest.fn().mockImplementation(() => mockSpeechRecognition);
  
  return mockSpeechRecognition;
}

/**
 * Mock for AudioContext and related audio analysis objects
 */
export function setupAudioContextMock(): void {
  // Mock AnalyserNode
  const mockAnalyser = {
    fftSize: 0,
    frequencyBinCount: 0,
    getByteFrequencyData: jest.fn((array) => {
      // Fill the array with random values for testing
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    })
  };
  
  // Mock AudioContext with minimal required properties
  const mockAudioContextInstance = {
    createAnalyser: jest.fn(() => mockAnalyser),
    createMediaStreamSource: jest.fn(() => ({
      connect: jest.fn()
    })),
    // Add minimal required properties to satisfy the AudioContext interface
    baseLatency: 0.01,
    outputLatency: 0.01,
    destination: {} as AudioDestinationNode,
    currentTime: 0,
    sampleRate: 44100,
    state: 'running' as AudioContextState,
    listener: {} as AudioListener,
    close: jest.fn(() => Promise.resolve()),
    suspend: jest.fn(() => Promise.resolve()),
    resume: jest.fn(() => Promise.resolve()),
    createBuffer: jest.fn(),
    createBufferSource: jest.fn(() => ({ connect: jest.fn() } as unknown as AudioBufferSourceNode)),
    createMediaElementSource: jest.fn(),
    createGain: jest.fn(() => ({ connect: jest.fn() } as unknown as GainNode)),
    createOscillator: jest.fn()
  };
  
  // Create constructor mock functions
  const AudioContextMock: jest.Mock = jest.fn(() => mockAudioContextInstance);
  
  // Set up globals with proper type assertions
  (global as any).AudioContext = AudioContextMock;
  (global as any).webkitAudioContext = AudioContextMock;
  
  // Mock MediaStream for getUserMedia
  const mockMediaStream = {
    active: true,
    id: 'mock-stream-id',
    getTracks: jest.fn(() => []),
    getAudioTracks: jest.fn(() => []),
    getVideoTracks: jest.fn(() => []),
    addTrack: jest.fn(),
    removeTrack: jest.fn(),
    clone: jest.fn(() => mockMediaStream)
  } as unknown as MediaStream;
  
  // Set up navigator.mediaDevices
  if (!navigator.mediaDevices) {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: jest.fn(() => Promise.resolve(mockMediaStream))
      },
      writable: true
    });
  } else {
    navigator.mediaDevices.getUserMedia = jest.fn(() => Promise.resolve(mockMediaStream));
  }
} 