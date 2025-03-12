import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EnhancedVoiceButton } from '../../EnhancedVoiceButton';
import '@testing-library/jest-dom';

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
jest.mock('../../VoiceVisualization', () => ({
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
        onStart={() => {}} 
      />
    );
    
    const button = screen.getByTestId('enhanced-voice-button');
    expect(button).toHaveClass('btn-primary');
  });

  // Test case: Should render with correct stop button when listening
  test('renders stop button when isListening is true', () => {
    render(
      <EnhancedVoiceButton 
        isListening={true} 
        onStart={() => {}} 
      />
    );
    
    const button = screen.getByTestId('enhanced-voice-button');
    expect(button).toHaveClass('btn-error');
  });

  // Test case: Should call onClick when button is clicked
  test('calls onStart handler when clicked', () => {
    const handleStart = jest.fn();
    render(
      <EnhancedVoiceButton 
        isListening={false} 
        onStart={handleStart} 
      />
    );
    
    const button = screen.getByTestId('enhanced-voice-button');
    fireEvent.click(button);
    expect(handleStart).toHaveBeenCalledTimes(1);
  });

  // Test case: Should be disabled when disabled prop is true
  test('is disabled when disabled prop is true', () => {
    render(
      <EnhancedVoiceButton 
        isListening={false} 
        onStart={() => {}}
        disabled={true}
      />
    );
    
    const button = screen.getByTestId('enhanced-voice-button');
    expect(button).toBeDisabled();
  });
  
  // Custom button text test
  test('displays custom button text when provided', () => {
    render(
      <EnhancedVoiceButton 
        isListening={false} 
        onStart={() => {}}
        buttonText="Custom Text"
      />
    );
    
    expect(screen.getByText('Custom Text')).toBeInTheDocument();
  });
}); 