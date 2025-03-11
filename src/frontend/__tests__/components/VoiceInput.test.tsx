import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VoiceInput } from '../../components/speech/VoiceInput';

// Define types for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    AudioContext: any;
    webkitAudioContext: any;
    SpeechSynthesisUtterance: any;
    speechSynthesis: any;
  }
}

// Mock the Web Speech API
const mockSpeechRecognition = {
  start: jest.fn(),
  abort: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// Mock required components
jest.mock('../../components/speech/VoiceInput/EnhancedVoiceButton', () => ({
  EnhancedVoiceButton: ({ onClick, isListening, isProcessing }: any) => (
    <button 
      data-testid="voice-input-button"
      onClick={onClick} 
      disabled={isProcessing}
      data-listening={isListening}
    >
      Falar
    </button>
  ),
}));

describe('VoiceInput Component', () => {
  const mockOnResult = jest.fn();
  const mockOnProcessing = jest.fn();

  beforeEach(() => {
    // Setup mocks
    (global as any).SpeechRecognition = jest.fn().mockImplementation(() => mockSpeechRecognition);
    (global as any).webkitSpeechRecognition = jest.fn().mockImplementation(() => mockSpeechRecognition);
    
    jest.clearAllMocks();
  });

  it('renders the voice input button', () => {
    render(
      <VoiceInput 
        onResult={mockOnResult} 
        onProcessing={mockOnProcessing} 
      />
    );
    
    const button = screen.getByTestId('voice-input-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Falar');
  });

  it('renders the help section', () => {
    render(
      <VoiceInput 
        onResult={mockOnResult} 
        onProcessing={mockOnProcessing} 
      />
    );
    
    const helpToggle = screen.getByTestId('voice-help-toggle');
    expect(helpToggle).toBeInTheDocument();
    
    const helpTitle = screen.getByText('Como usar o comando de voz?');
    expect(helpTitle).toBeInTheDocument();
  });
}); 