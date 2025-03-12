/**
 * Mock implementation of the Web Speech API SpeechRecognition functionality
 * This allows us to test voice-related components without actual browser APIs
 */

class MockSpeechRecognitionEvent {
  constructor(public results: { [key: number]: { [key: number]: { transcript: string; confidence: number } } } = {}) {}
}

class MockSpeechRecognition {
  lang: string = '';
  continuous: boolean = false;
  interimResults: boolean = false;
  
  // Event handlers
  onstart: (() => void) | null = null;
  onresult: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onend: (() => void) | null = null;

  // Mock control methods
  start() {
    if (this.onstart) this.onstart();
  }

  abort() {
    if (this.onend) this.onend();
  }

  stop() {
    if (this.onend) this.onend();
  }

  // Test helper methods
  mockResult(transcript: string, confidence: number = 0.9) {
    if (this.onresult) {
      const results = {
        0: {
          0: { transcript, confidence }
        },
        length: 1
      };
      this.onresult(new MockSpeechRecognitionEvent(results));
    }
  }

  mockError(errorType: string = 'aborted') {
    if (this.onerror) {
      this.onerror({ error: errorType });
    }
  }

  mockEnd() {
    if (this.onend) this.onend();
  }
}

// Expose the mock classes
export { MockSpeechRecognition, MockSpeechRecognitionEvent };

// Setup global mocks
global.SpeechRecognition = MockSpeechRecognition as any;
global.webkitSpeechRecognition = MockSpeechRecognition as any; 