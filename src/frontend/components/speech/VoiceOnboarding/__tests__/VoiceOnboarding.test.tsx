import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import { VoiceOnboarding } from '../VoiceOnboarding';
import { useRouter } from 'next/router';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn()
  }),
}));
jest.mock('../../../ui/Toast', () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));
jest.mock('../../../speech/EnhancedVoiceButton', () => ({
  EnhancedVoiceButton: ({ onStart, isListening, disabled }) => (
    <button 
      data-testid="mock-voice-button" 
      onClick={onStart} 
      disabled={disabled}
      data-listening={isListening}
    >
      {isListening ? 'Stop' : 'Start'} Recording
    </button>
  ),
}));
jest.mock('../../../speech/VoiceVisualization', () => ({
  __esModule: true,
  default: ({ isListening, amplitude }) => (
    <div data-testid="mock-visualization" data-listening={isListening} data-amplitude={amplitude} />
  )
}));
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock Web Speech API
const mockSpeechRecognition = {
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  onresult: null,
  onend: null,
  onerror: null
};

const mockAnalyser = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  fftSize: 0,
  getByteFrequencyData: jest.fn()
};

const mockMediaStreamSource = {
  connect: jest.fn()
};

const mockAudioContext = {
  createAnalyser: jest.fn().mockReturnValue(mockAnalyser),
  createMediaStreamSource: jest.fn().mockReturnValue(mockMediaStreamSource)
};

describe('VoiceOnboarding', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock Web Speech API
    window.SpeechRecognition = jest.fn().mockImplementation(() => mockSpeechRecognition);
    window.webkitSpeechRecognition = window.SpeechRecognition;
    
    // Mock AudioContext
    window.AudioContext = jest.fn().mockImplementation(() => ({
      createAnalyser: jest.fn().mockReturnValue({
        connect: jest.fn(),
        disconnect: jest.fn(),
        fftSize: 0,
        getByteFrequencyData: jest.fn()
      }),
      createMediaStreamSource: jest.fn().mockReturnValue({
        connect: jest.fn()
      })
    }));
    window.webkitAudioContext = window.AudioContext;
    
    // Mock axios responses
    mockedAxios.post.mockResolvedValue({
      data: { name: 'Test User', _id: 'test-user-id' }
    });
    
    mockedAxios.put.mockResolvedValue({
      data: { name: 'Test User', _id: 'test-user-id', xp: 10 }
    });
  });
  
  // Test: Component renders correctly
  test('renders correctly', () => {
    render(<VoiceOnboarding onComplete={jest.fn()} />);
    expect(screen.getByText(/Bem-vindo/i)).toBeInTheDocument();
  });
  
  // Test: Processes first step correctly
  test('processes first step and moves to confirmation step', async () => {
    // Mock the implementation to manually control component state
    jest.spyOn(React, 'useState')
      .mockImplementationOnce(() => [0, jest.fn()]) // currentStep
      .mockImplementationOnce(() => [false, jest.fn()]) // isRecording
      .mockImplementationOnce(() => ['Meu nome é Test User', jest.fn()]) // transcript
      .mockImplementationOnce(() => [null, jest.fn()]) // user
      .mockImplementationOnce(() => ['Test User', jest.fn()]) // extractedName
      .mockImplementationOnce(() => [false, jest.fn()]); // isProcessing
    
    mockedAxios.post.mockResolvedValueOnce({
      data: { name: 'Test User', _id: 'test-user-id' }
    });
    
    render(<VoiceOnboarding onComplete={jest.fn()} />);
    
    // Verify initial render
    expect(screen.getByText(/Bem-vindo/i)).toBeInTheDocument();
    
    // Click the voice button to start recording
    const voiceButton = screen.getByTestId('mock-voice-button');
    fireEvent.click(voiceButton);
    
    // Verify API call
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/onboarding/voice'),
        { transcript: 'Meu nome é Test User' }
      );
    });
  });
  
  // Test: Handles confirmation step correctly
  test('processes confirmation step and completes onboarding', async () => {
    // Set up initial state to be at confirmation step
    mockedAxios.post.mockResolvedValueOnce({
      data: { name: 'Test User', _id: 'test-user-id' }
    });
    
    const mockPut = jest.fn().mockResolvedValue({
      data: { name: 'Test User', _id: 'test-user-id', xp: 10 }
    });
    mockedAxios.put = mockPut;
    
    const { rerender } = render(<VoiceOnboarding onComplete={jest.fn()} />);
    
    // Manually set the component to the confirmation step
    await act(async () => {
      // Click to start recording
      const voiceButton = screen.getByTestId('mock-voice-button');
      fireEvent.click(voiceButton);
      
      // Simulate speech recognition result
      if (mockSpeechRecognition.onresult) {
        mockSpeechRecognition.onresult({
          results: [[{ transcript: 'Meu nome é Test User' }]],
          resultIndex: 0
        });
      }
      
      // Simulate speech recognition ending
      if (mockSpeechRecognition.onend) {
        mockSpeechRecognition.onend({});
      }
    });
    
    // Wait for the confirmation step to appear
    await waitFor(() => {
      expect(screen.getByText(/Prazer em conhecê-lo!/i)).toBeInTheDocument();
    });
    
    // Click to confirm name
    const confirmButton = screen.getByTestId('mock-voice-button');
    fireEvent.click(confirmButton);
    
    // Simulate positive confirmation
    await act(async () => {
      if (mockSpeechRecognition.onresult) {
        mockSpeechRecognition.onresult({
          results: [[{ transcript: 'Sim, está correto' }]],
          resultIndex: 0
        });
      }
      
      if (mockSpeechRecognition.onend) {
        mockSpeechRecognition.onend({});
      }
    });
    
    // Check that we moved to the success step
    await waitFor(() => {
      expect(screen.getByText(/Perfeito!/i)).toBeInTheDocument();
    });
  });
});