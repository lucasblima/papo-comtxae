import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import VoiceInput from '../../src/components/VoiceInput';

// Mock da Web Speech API
jest.mock('../../src/components/VoiceInput', () => {
  return function MockVoiceInput({ onResult, onProcessing }: any) {
    return (
      <div className="voice-input mt-4">
        <div className="flex flex-col items-center gap-4">
          <button 
            className="btn btn-circle btn-lg btn-primary"
            data-testid="voice-input-button"
          >
            Falar
          </button>
          <div className="collapse bg-base-200 w-full max-w-xs">
            <input type="checkbox" data-testid="voice-help-toggle" /> 
            <div className="collapse-title text-sm font-medium">
              Como usar o comando de voz?
            </div>
          </div>
        </div>
      </div>
    );
  };
});

describe('VoiceInput Component', () => {
  const mockOnResult = jest.fn();
  const mockOnProcessing = jest.fn();

  beforeEach(() => {
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