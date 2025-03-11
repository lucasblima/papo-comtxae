import React from 'react';
import { render, screen } from '@testing-library/react';
import { VoiceVisualization } from '../index';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe('VoiceVisualization Component', () => {
  it('renders correctly when not listening', () => {
    render(<VoiceVisualization isListening={false} />);
    const visualization = screen.getByTestId('voice-visualization');
    expect(visualization).toBeInTheDocument();
  });
  
  it('renders correctly when listening', () => {
    render(<VoiceVisualization isListening={true} />);
    const visualization = screen.getByTestId('voice-visualization');
    expect(visualization).toBeInTheDocument();
  });
  
  it('applies correct size based on prop', () => {
    const { rerender } = render(<VoiceVisualization isListening={false} size="sm" />);
    let visualization = screen.getByTestId('voice-visualization');
    expect(visualization).toHaveStyle({ width: '40px', height: '40px' });
    
    rerender(<VoiceVisualization isListening={false} size="md" />);
    visualization = screen.getByTestId('voice-visualization');
    expect(visualization).toHaveStyle({ width: '60px', height: '60px' });
    
    rerender(<VoiceVisualization isListening={false} size="lg" />);
    visualization = screen.getByTestId('voice-visualization');
    expect(visualization).toHaveStyle({ width: '80px', height: '80px' });
  });
  
  it('renders with default amplitude when not specified', () => {
    render(<VoiceVisualization isListening={true} />);
    // Default amplitude of 0.5 is used internally
    const visualization = screen.getByTestId('voice-visualization');
    expect(visualization).toBeInTheDocument();
  });
  
  it('renders with custom color when specified', () => {
    render(<VoiceVisualization isListening={true} color="#FF0000" />);
    const visualization = screen.getByTestId('voice-visualization');
    expect(visualization).toBeInTheDocument();
    // Note: We can't easily test the bar colors because they're rendered dynamically
  });
}); 