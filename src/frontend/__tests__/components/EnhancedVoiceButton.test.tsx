import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { EnhancedVoiceButton } from '../../components/speech/EnhancedVoiceButton';

// Mock navigator.vibrate
const mockVibrate = jest.fn();
Object.defineProperty(navigator, 'vibrate', {
  value: mockVibrate,
  writable: true
});

describe('EnhancedVoiceButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<EnhancedVoiceButton onStart={jest.fn()} onStop={jest.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('shows default button text', () => {
    render(<EnhancedVoiceButton onStart={jest.fn()} onStop={jest.fn()} />);
    expect(screen.getByText('Falar')).toBeInTheDocument();
  });

  it('shows custom button text when provided', () => {
    const customText = 'Diga seu nome';
    render(<EnhancedVoiceButton onStart={jest.fn()} onStop={jest.fn()} buttonText={customText} />);
    expect(screen.getByText(customText)).toBeInTheDocument();
  });

  it('calls onStart when clicked and not listening', () => {
    const onStart = jest.fn();
    const onStop = jest.fn();
    render(<EnhancedVoiceButton onStart={onStart} onStop={onStop} isListening={false} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStop).not.toHaveBeenCalled();
  });

  it('calls onStop when clicked and listening', () => {
    const onStart = jest.fn();
    const onStop = jest.fn();
    render(<EnhancedVoiceButton onStart={onStart} onStop={onStop} isListening={true} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onStop).toHaveBeenCalledTimes(1);
    expect(onStart).not.toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<EnhancedVoiceButton onStart={jest.fn()} onStop={jest.fn()} disabled={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-button-class';
    render(<EnhancedVoiceButton onStart={jest.fn()} onStop={jest.fn()} className={customClass} />);
    expect(screen.getByRole('button')).toHaveClass(customClass);
  });

  it('changes appearance when in listening state', () => {
    render(<EnhancedVoiceButton onStart={jest.fn()} onStop={jest.fn()} isListening={true} />);
    // Test for visual indicators that it's in listening state
    const button = screen.getByRole('button');
    expect(button).toHaveClass('listening'); // Assuming there's a 'listening' class applied
  });

  it('handles keyboard interactions correctly', () => {
    const onStart = jest.fn();
    const onStop = jest.fn();
    render(<EnhancedVoiceButton onStart={onStart} onStop={onStop} />);
    
    const button = screen.getByRole('button');
    
    // Test Enter key
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(onStart).toHaveBeenCalledTimes(1);
    
    // Test Space key
    fireEvent.keyDown(button, { key: ' ' });
    expect(onStop).toHaveBeenCalledTimes(1);
    
    // Test Escape key while listening
    render(<EnhancedVoiceButton onStart={onStart} onStop={onStop} isListening={true} />);
    fireEvent.keyDown(button, { key: 'Escape' });
    expect(onStop).toHaveBeenCalledTimes(2);
  });

  it('triggers haptic feedback when toggling', () => {
    render(<EnhancedVoiceButton onStart={jest.fn()} onStop={jest.fn()} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockVibrate).toHaveBeenCalledWith([100]); // Start vibration
    
    fireEvent.click(button);
    expect(mockVibrate).toHaveBeenCalledWith([50, 50, 50]); // Stop vibration
  });

  it('shows loading state correctly', () => {
    render(<EnhancedVoiceButton isLoading={true} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('displays error message when provided', () => {
    const errorMessage = 'Failed to start recording';
    render(<EnhancedVoiceButton error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('visualizes sound level when provided', () => {
    render(<EnhancedVoiceButton soundLevel={75} isListening={true} />);
    const visualizer = screen.getByTestId('sound-level-indicator');
    expect(visualizer).toHaveStyle({ transform: expect.stringContaining('75') });
  });

  it('applies different size variants correctly', () => {
    const { rerender } = render(<EnhancedVoiceButton size="sm" />);
    expect(screen.getByRole('button')).toHaveClass('btn-sm');
    
    rerender(<EnhancedVoiceButton size="md" />);
    expect(screen.getByRole('button')).toHaveClass('btn-md');
    
    rerender(<EnhancedVoiceButton size="lg" />);
    expect(screen.getByRole('button')).toHaveClass('btn-lg');
  });

  it('shows tooltip on hover', async () => {
    render(<EnhancedVoiceButton />);
    const button = screen.getByRole('button');
    
    fireEvent.mouseEnter(button);
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    
    fireEvent.mouseLeave(button);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('handles disabled state properly', () => {
    const onStart = jest.fn();
    render(<EnhancedVoiceButton onStart={onStart} disabled={true} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onStart).not.toHaveBeenCalled();
    expect(mockVibrate).not.toHaveBeenCalled();
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = render(<EnhancedVoiceButton />);
    const removeEventListenerSpy = jest.spyOn(HTMLButtonElement.prototype, 'removeEventListener');
    
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalled();
  });
}); 