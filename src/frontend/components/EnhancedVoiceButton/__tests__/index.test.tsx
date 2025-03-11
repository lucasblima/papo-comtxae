import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EnhancedVoiceButton } from '../index';

// Mock dependencies
jest.mock('../../VoiceVisualization', () => ({
  VoiceVisualization: () => <div data-testid="mocked-voice-visualization" />
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe('EnhancedVoiceButton Component', () => {
  const mockOnClick = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders correctly when not listening', () => {
    render(
      <EnhancedVoiceButton
        isListening={false}
        onClick={mockOnClick}
      />
    );
    
    const button = screen.getByTestId('enhanced-voice-button');
    expect(button).toBeInTheDocument();
    expect(screen.getByText('▶')).toBeInTheDocument();
    expect(screen.getByTestId('mocked-voice-visualization')).toBeInTheDocument();
  });
  
  it('renders correctly when listening', () => {
    render(
      <EnhancedVoiceButton
        isListening={true}
        onClick={mockOnClick}
      />
    );
    
    const button = screen.getByTestId('enhanced-voice-button');
    expect(button).toBeInTheDocument();
    expect(screen.getByText('■')).toBeInTheDocument();
    expect(screen.getByTestId('mocked-voice-visualization')).toBeInTheDocument();
  });
  
  it('handles click events', () => {
    render(
      <EnhancedVoiceButton
        isListening={false}
        onClick={mockOnClick}
      />
    );
    
    fireEvent.click(screen.getByTestId('enhanced-voice-button'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
  
  it('is disabled when processing', () => {
    render(
      <EnhancedVoiceButton
        isListening={false}
        isProcessing={true}
        onClick={mockOnClick}
      />
    );
    
    const button = screen.getByTestId('enhanced-voice-button');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  });
  
  it('applies different sizes correctly', () => {
    const { rerender } = render(
      <EnhancedVoiceButton
        isListening={false}
        onClick={mockOnClick}
        size="sm"
      />
    );
    
    let button = screen.getByTestId('enhanced-voice-button');
    expect(button).toHaveClass('w-12 h-12');
    
    rerender(
      <EnhancedVoiceButton
        isListening={false}
        onClick={mockOnClick}
        size="md"
      />
    );
    
    button = screen.getByTestId('enhanced-voice-button');
    expect(button).toHaveClass('w-16 h-16');
    
    rerender(
      <EnhancedVoiceButton
        isListening={false}
        onClick={mockOnClick}
        size="lg"
      />
    );
    
    button = screen.getByTestId('enhanced-voice-button');
    expect(button).toHaveClass('w-20 h-20');
  });
}); 