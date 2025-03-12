import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VoiceAuthentication } from './VoiceAuthentication';

// Access the mock SpeechRecognition for testing
import { setupSpeechRecognitionMock } from '../../test/mocks/speechRecognition';

describe('VoiceAuthentication Component', () => {
  // Set up the mock before each test
  let mockSpeechRecognition: ReturnType<typeof setupSpeechRecognitionMock>;
  
  beforeEach(() => {
    // Reset and get a fresh mock
    jest.clearAllMocks();
    mockSpeechRecognition = setupSpeechRecognitionMock();
  });

  test('renders with default prompt', () => {
    render(<VoiceAuthentication onSuccess={jest.fn()} />);
    
    // Initial state should show the prompt and microphone button
    expect(screen.getByText('Diga seu nome para se identificar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar/i })).toBeInTheDocument();
  });

  test('shows listening state when microphone is activated', async () => {
    render(<VoiceAuthentication onSuccess={jest.fn()} />);
    
    // Click the microphone button
    const micButton = screen.getByRole('button', { name: /iniciar/i });
    fireEvent.click(micButton);
    
    // Should show listening indicators
    await waitFor(() => {
      expect(screen.getByText(/ouvindo/i)).toBeInTheDocument();
    });
    
    // Stop button should be visible
    expect(screen.getByRole('button', { name: /parar/i })).toBeInTheDocument();
  });

  test('extracts name from speech and calls onSuccess', async () => {
    const successMock = jest.fn();
    
    render(<VoiceAuthentication onSuccess={successMock} />);
    
    // Start recording
    const startButton = screen.getByRole('button', { name: /iniciar/i });
    fireEvent.click(startButton);
    
    // Simulate a speech recognition result
    act(() => {
      mockSpeechRecognition.simulateResult('Meu nome é Carlos');
    });
    
    // Should call onSuccess with the extracted name
    await waitFor(() => {
      expect(successMock).toHaveBeenCalledWith('Carlos');
    });
  });

  test('shows error state on recognition error', async () => {
    const errorMock = jest.fn();
    
    render(<VoiceAuthentication onSuccess={jest.fn()} onError={errorMock} />);
    
    // Start recording
    fireEvent.click(screen.getByRole('button', { name: /iniciar/i }));
    
    // Simulate an error
    act(() => {
      mockSpeechRecognition.simulateError('not-allowed', 'Microphone access denied');
    });
    
    // Should show an error message
    await waitFor(() => {
      expect(screen.getByText(/erro/i)).toBeInTheDocument();
    });
    
    // Error callback should have been called
    expect(errorMock).toHaveBeenCalled();
  });

  test('allows cancellation of voice input', async () => {
    const cancelMock = jest.fn();
    
    render(<VoiceAuthentication 
      onSuccess={jest.fn()} 
      onCancel={cancelMock}
    />);
    
    // Start recording
    fireEvent.click(screen.getByRole('button', { name: /iniciar/i }));
    
    // Cancel the recording
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);
    
    // Should call onCancel
    expect(cancelMock).toHaveBeenCalled();
    
    // Should return to initial state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /iniciar/i })).toBeInTheDocument();
    });
  });
}); 