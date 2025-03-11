import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EnhancedVoiceButton } from '../EnhancedVoiceButton';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }: React.PropsWithChildren<any>) => (
        <div {...props}>{children}</div>
      ),
    },
  };
});

// Mock VoiceVisualization component
jest.mock('../VoiceVisualization', () => ({
  VoiceVisualization: ({ isListening, size, color }: any) => (
    <div data-testid="mock-visualization" data-listening={isListening} data-size={size} data-color={color}>
      Visualization
    </div>
  ),
}));

describe('EnhancedVoiceButton', () => {
  // Test case: Should render with correct play button when not listening
  test('renders play button when isListening is false', () => {
    render(
      <EnhancedVoiceButton 
        isListening={false} 
        onClick={() => {}} 
      />
    );
    
    const button = screen.getByTestId('voice-button');
    expect(button).toHaveClass('bg-indigo-500');
    expect(button).toHaveTextContent('▶');
  });

  // Test case: Should render with correct stop button when listening
  test('renders stop button when isListening is true', () => {
    render(
      <EnhancedVoiceButton 
        isListening={true} 
        onClick={() => {}} 
      />
    );
    
    const button = screen.getByTestId('voice-button');
    expect(button).toHaveClass('bg-red-500');
    expect(button).toHaveTextContent('■');
  });

  // Test case: Should call onClick handler when button is clicked
  test('calls onClick handler when button is clicked', () => {
    const handleClick = jest.fn();
    render(
      <EnhancedVoiceButton 
        isListening={false} 
        onClick={handleClick} 
      />
    );
    
    const button = screen.getByTestId('voice-button');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Test case: Should be disabled when isProcessing is true
  test('is disabled when isProcessing is true', () => {
    render(
      <EnhancedVoiceButton 
        isListening={false} 
        onClick={() => {}} 
        isProcessing={true}
      />
    );
    
    const button = screen.getByTestId('voice-button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50');
    expect(button).toHaveClass('cursor-not-allowed');
  });

  // Test case: Should render with different sizes
  test('renders with different sizes', () => {
    const { rerender } = render(
      <EnhancedVoiceButton 
        isListening={false} 
        onClick={() => {}} 
        size="sm"
      />
    );
    
    let button = screen.getByTestId('voice-button');
    expect(button).toHaveClass('w-12');
    expect(button).toHaveClass('h-12');
    
    rerender(
      <EnhancedVoiceButton 
        isListening={false} 
        onClick={() => {}} 
        size="md"
      />
    );
    
    button = screen.getByTestId('voice-button');
    expect(button).toHaveClass('w-16');
    expect(button).toHaveClass('h-16');
    
    rerender(
      <EnhancedVoiceButton 
        isListening={false} 
        onClick={() => {}} 
        size="lg"
      />
    );
    
    button = screen.getByTestId('voice-button');
    expect(button).toHaveClass('w-20');
    expect(button).toHaveClass('h-20');
  });
}); 