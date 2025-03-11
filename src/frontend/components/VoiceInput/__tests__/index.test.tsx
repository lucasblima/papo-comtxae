import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VoiceInput } from '../index';

// Mock Web Speech API
const mockSpeechRecognition = {
  start: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

const mockOnResult = jest.fn();
const mockOnProcessing = jest.fn();

// Mock window.SpeechRecognition before all tests
beforeAll(() => {
  // Save original implementations
  global.window.SpeechRecognition = undefined;
  global.window.webkitSpeechRecognition = function() {
    return mockSpeechRecognition;
  };
});

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
  mockSpeechRecognition.continuous = false;
  mockSpeechRecognition.interimResults = false;
  mockSpeechRecognition.lang = '';
  mockSpeechRecognition.onstart = null;
  mockSpeechRecognition.onend = null;
  mockSpeechRecognition.onresult = null;
  mockSpeechRecognition.onerror = null;
});

describe('VoiceInput Component', () => {
  it('renders correctly', () => {
    render(
      <VoiceInput 
        onResult={mockOnResult}
        onProcessing={mockOnProcessing}
      />
    );
    
    expect(screen.getByTestId('voice-input-component')).toBeInTheDocument();
    expect(screen.getByTestId('voice-toggle-button')).toBeInTheDocument();
    expect(screen.getByText('Falar')).toBeInTheDocument();
  });
  
  it('toggles listening state when button is clicked', () => {
    render(
      <VoiceInput 
        onResult={mockOnResult}
        onProcessing={mockOnProcessing}
      />
    );
    
    // Initial state
    const button = screen.getByTestId('voice-toggle-button');
    expect(button).toHaveTextContent('Falar');
    
    // Set up onstart handler to update UI
    mockSpeechRecognition.onstart();
    
    // Click to start listening
    fireEvent.click(button);
    
    // Expect recognition to start
    expect(mockSpeechRecognition.start).toHaveBeenCalledTimes(1);
  });
  
  it('stops listening when clicked during active listening', () => {
    render(
      <VoiceInput 
        onResult={mockOnResult}
        onProcessing={mockOnProcessing}
      />
    );
    
    // Set up initial state as listening
    mockSpeechRecognition.onstart();
    
    // Click to stop listening
    fireEvent.click(screen.getByTestId('voice-toggle-button'));
    
    // Set up onend handler to update UI
    mockSpeechRecognition.onend();
    
    // Expect recognition to stop
    expect(mockSpeechRecognition.stop).toHaveBeenCalledTimes(1);
  });
  
  it('calls onResult when speech is recognized', () => {
    render(
      <VoiceInput 
        onResult={mockOnResult}
        onProcessing={mockOnProcessing}
      />
    );
    
    // Simulate speech recognition result
    const mockEvent = {
      results: [
        [{ transcript: 'Hello' }],
        [{ transcript: ' world' }]
      ]
    };
    
    // Trigger the onresult handler
    mockSpeechRecognition.onresult(mockEvent);
    
    // Check if onResult was called with the correct transcript
    expect(mockOnResult).toHaveBeenCalledWith('Hello world');
  });
}); 