import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { VoiceOnboarding } from '../index';
import { useRouter } from 'next/router';

// Mock dependencies
jest.mock('axios');
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('../../ui/Toast', () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));
jest.mock('../../VoiceInput/EnhancedVoiceButton', () => ({
  EnhancedVoiceButton: ({ onClick, isListening, isProcessing }: any) => (
    <button 
      data-testid="mock-voice-button" 
      onClick={onClick} 
      disabled={isProcessing}
      data-listening={isListening}
    >
      {isListening ? 'Stop' : 'Start'} Recording
    </button>
  ),
}));
jest.mock('../../VoiceInput/VoiceVisualization', () => ({
  VoiceVisualization: () => <div data-testid="mock-visualization" />
}));
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<any>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren<any>) => <>{children}</>,
}));

// Define types for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    AudioContext: any;
    webkitAudioContext: any;
  }
}

// Mock Web Speech API
const mockSpeechRecognition = {
  start: jest.fn(),
  abort: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// Mock AudioContext and related APIs
const mockAudioContext = {
  createAnalyser: jest.fn().mockReturnValue({
    fftSize: 0,
    frequencyBinCount: 128,
    getByteFrequencyData: jest.fn(),
  }),
  createMediaStreamSource: jest.fn().mockReturnValue({
    connect: jest.fn(),
  }),
};

const mockMediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({
    getTracks: jest.fn().mockReturnValue([{ stop: jest.fn() }]),
  }),
};

describe('VoiceOnboarding', () => {
  beforeEach(() => {
    // Setup mocks
    (global as any).SpeechRecognition = jest.fn().mockImplementation(() => mockSpeechRecognition);
    (global as any).webkitSpeechRecognition = jest.fn().mockImplementation(() => mockSpeechRecognition);
    (global as any).AudioContext = jest.fn().mockImplementation(() => mockAudioContext);
    (global as any).webkitAudioContext = jest.fn().mockImplementation(() => mockAudioContext);
    
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: mockMediaDevices,
      writable: true,
    });
    
    // Mock router
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
    
    // Mock axios
    (axios.post as jest.Mock).mockResolvedValue({
      data: {
        _id: '123',
        name: 'Test User',
        achievements: [],
      },
    });
    
    (axios.put as jest.Mock).mockResolvedValue({
      data: {
        _id: '123',
        name: 'Test User',
        achievements: [],
      },
    });
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    jest.resetAllMocks();
  });
  
  test('renders the welcome step initially', () => {
    render(<VoiceOnboarding />);
    
    expect(screen.getByText('Bem-vindo ao Papo Social!')).toBeInTheDocument();
    expect(screen.getByText('Vamos começar com seu nome. Clique no botão e se apresente.')).toBeInTheDocument();
  });
  
  test('starts recording when voice button is clicked', async () => {
    render(<VoiceOnboarding />);
    
    const voiceButton = screen.getByTestId('mock-voice-button');
    fireEvent.click(voiceButton);
    
    await waitFor(() => {
      expect(mockMediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    });
  });
  
  test('processes first step and moves to confirmation step', async () => {
    // Mock the SpeechRecognition behavior
    const mockRecognition = {
      lang: '',
      continuous: false,
      interimResults: false,
      onresult: null as any,
      onend: null as any,
      start: jest.fn(),
      abort: jest.fn(),
    };
    
    (global as any).SpeechRecognition = jest.fn().mockImplementation(() => mockRecognition);
    
    render(<VoiceOnboarding />);
    
    // Simulate clicking the voice button
    const voiceButton = screen.getByTestId('mock-voice-button');
    fireEvent.click(voiceButton);
    
    // Simulate speech recognition result
    if (mockRecognition.onresult) {
      mockRecognition.onresult({
        results: [[{ transcript: 'Meu nome é Test User' }]],
      } as any);
    }
    
    // Simulate recognition end
    if (mockRecognition.onend) {
      mockRecognition.onend({} as any);
    }
    
    // Wait for API call to complete
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/onboarding/voice'),
        { transcript: 'Meu nome é Test User' }
      );
    });
    
    // Check that we moved to the confirmation step
    await waitFor(() => {
      expect(screen.getByText('Prazer em conhecê-lo!')).toBeInTheDocument();
    });
  });
  
  test('calls onComplete callback when process is finished', async () => {
    const onCompleteMock = jest.fn();
    
    // Mock the SpeechRecognition behavior
    const mockRecognition = {
      lang: '',
      continuous: false,
      interimResults: false,
      onresult: null as any,
      onend: null as any,
      start: jest.fn(),
      abort: jest.fn(),
    };
    
    (global as any).SpeechRecognition = jest.fn().mockImplementation(() => mockRecognition);
    
    render(<VoiceOnboarding onComplete={onCompleteMock} />);
    
    // Move to confirmation step
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        _id: '123',
        name: 'Test User',
        achievements: [],
      },
    });
    
    // Simulate first step
    const voiceButton = screen.getByTestId('mock-voice-button');
    fireEvent.click(voiceButton);
    
    if (mockRecognition.onresult) {
      mockRecognition.onresult({
        results: [[{ transcript: 'Meu nome é Test User' }]],
      } as any);
    }
    
    if (mockRecognition.onend) {
      mockRecognition.onend({} as any);
    }
    
    // Wait for first step to complete
    await waitFor(() => {
      expect(screen.getByText('Prazer em conhecê-lo!')).toBeInTheDocument();
    });
    
    // Simulate confirmation step
    fireEvent.click(screen.getByTestId('mock-voice-button'));
    
    if (mockRecognition.onresult) {
      mockRecognition.onresult({
        results: [[{ transcript: 'Sim, está correto' }]],
      } as any);
    }
    
    if (mockRecognition.onend) {
      mockRecognition.onend({} as any);
    }
    
    // Wait for success step
    await waitFor(() => {
      expect(screen.getByText('Perfeito!')).toBeInTheDocument();
    });
    
    // Wait for onComplete to be called (after timeout)
    jest.useFakeTimers();
    jest.advanceTimersByTime(3000);
    
    await waitFor(() => {
      expect(onCompleteMock).toHaveBeenCalledWith(expect.objectContaining({
        _id: '123',
        name: 'Test User',
      }));
    });
    
    jest.useRealTimers();
  });
}); 