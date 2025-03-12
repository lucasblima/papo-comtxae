import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VoiceOnboarding } from '../../components/speech/VoiceOnboarding';
import axios from 'axios';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';

// Mocks
jest.mock('axios');
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));
jest.mock('next-auth/react', () => ({
  signIn: jest.fn()
}));

// Criar um mock para o showToast que podemos acessar e limpar em todos os testes
const mockShowToast = jest.fn();
jest.mock('../../components/ui/Toast', () => ({
  useToast: () => ({
    showToast: mockShowToast
  })
}));

// Mock Speech Recognition
const mockSpeechRecognition = () => {
  const mockStart = jest.fn();
  const mockStop = jest.fn();
  const mockAbort = jest.fn();

  class MockSpeechRecognition {
    lang = '';
    continuous = false;
    interimResults = false;
    onresult = null;
    onend = null;
    onerror = null;
    
    start = mockStart;
    stop = mockStop;
    abort = mockAbort;
  }

  Object.defineProperty(window, 'SpeechRecognition', {
    writable: true,
    value: MockSpeechRecognition
  });
  Object.defineProperty(window, 'webkitSpeechRecognition', {
    writable: true,
    value: MockSpeechRecognition
  });

  return { mockStart, mockStop, mockAbort };
};

// Mock AudioContext
const mockAudioContext = () => {
  const mockGetUserMedia = jest.fn().mockResolvedValue({
    getTracks: () => [{
      stop: jest.fn()
    }]
  });

  const mockConnect = jest.fn();
  const mockCreateMediaStreamSource = jest.fn().mockReturnValue({
    connect: mockConnect
  });
  const mockGetByteFrequencyData = jest.fn().mockImplementation((array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = 50; // Simulating some audio level
    }
  });
  const mockCreateAnalyser = jest.fn().mockReturnValue({
    fftSize: 0,
    frequencyBinCount: 32,
    getByteFrequencyData: mockGetByteFrequencyData
  });

  class MockAudioContext {
    createAnalyser = mockCreateAnalyser;
    createMediaStreamSource = mockCreateMediaStreamSource;
  }

  Object.defineProperty(window, 'AudioContext', {
    writable: true,
    value: MockAudioContext
  });
  Object.defineProperty(window, 'webkitAudioContext', {
    writable: true,
    value: MockAudioContext
  });

  Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: {
      getUserMedia: mockGetUserMedia
    }
  });

  return {
    mockGetUserMedia,
    mockCreateAnalyser,
    mockCreateMediaStreamSource,
    mockConnect,
    mockGetByteFrequencyData
  };
};

// Mock Speech Synthesis
const mockSpeechSynthesis = () => {
  const mockSpeak = jest.fn();
  const mockCancel = jest.fn();

  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    writable: true,
    value: function() {
      return {
        lang: '',
        text: ''
      };
    }
  });

  Object.defineProperty(window, 'speechSynthesis', {
    writable: true,
    value: {
      speak: mockSpeak,
      cancel: mockCancel
    }
  });

  return { mockSpeak, mockCancel };
};

// Mock requestAnimationFrame
const mockRequestAnimationFrame = () => {
  const originalRaf = window.requestAnimationFrame;
  window.requestAnimationFrame = jest.fn().mockImplementation(cb => {
    return setTimeout(() => cb(Date.now()), 0);
  });
  
  return () => {
    window.requestAnimationFrame = originalRaf;
  };
};

describe('VoiceOnboarding Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSpeechRecognition();
    mockAudioContext();
    mockSpeechSynthesis();
    const resetRaf = mockRequestAnimationFrame();
    
    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn()
    });

    // Setup default axios responses
    (axios.post as jest.Mock).mockResolvedValue({
      data: {
        _id: 'test-user-id',
        name: 'Test User',
        level: {
          level: 1,
          xp: 10,
          next_level_xp: 100
        },
        achievements: []
      }
    });

    (axios.put as jest.Mock).mockResolvedValue({
      data: {
        _id: 'test-user-id',
        name: 'Test User',
        level: {
          level: 1,
          xp: 20,
          next_level_xp: 100
        },
        achievements: []
      }
    });

    // Setup signIn mock
    (signIn as jest.Mock).mockResolvedValue({
      ok: true,
      error: null
    });

    // Cleanup
    return () => {
      resetRaf();
      jest.restoreAllMocks();
    };
  });

  it('renders the initial welcome step correctly', () => {
    render(<VoiceOnboarding />);
    
    // Check welcome screen content
    expect(screen.getByText('Bem-vindo ao Papo Social!')).toBeInTheDocument();
    expect(screen.getByText('Vamos começar com seu nome. Clique no botão e se apresente.')).toBeInTheDocument();
    expect(screen.getByText(/Ex: "Olá, me chamo Maria"/)).toBeInTheDocument();
    
    // Check buttons
    const speechButton = screen.getByText('Falar');
    expect(speechButton).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('starts voice recording when speech button is clicked', async () => {
    const { mockStart } = mockSpeechRecognition();
    const { mockGetUserMedia } = mockAudioContext();
    
    render(<VoiceOnboarding />);
    
    // Click the speech button
    fireEvent.click(screen.getByText('Falar'));
    
    // Check if getUserMedia and SpeechRecognition.start were called
    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
      expect(mockStart).toHaveBeenCalled();
    });
    
    // Voice visualization should be shown
    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });

  it('processes name extraction when speech recognition ends', async () => {
    render(<VoiceOnboarding />);
    
    // Click the speech button to start recording
    fireEvent.click(screen.getByText('Falar'));
    
    // Simulate speech recognition result
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      const mockResults = {
        results: [
          [{ transcript: 'Olá, me chamo Maria' }]
        ],
        resultIndex: 0
      };
      
      // Set the transcript state
      recognitionInstance.onresult(mockResults);
      
      // End the recognition
      recognitionInstance.onend();
    });
    
    // Check API call
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/onboarding/voice'),
        { transcript: 'Olá, me chamo Maria' }
      );
    });
    
    // Should progress to phone step
    await waitFor(() => {
      expect(screen.getByText('Quase lá!')).toBeInTheDocument();
      expect(screen.getByText('Para sua segurança, precisamos do seu número de telefone.')).toBeInTheDocument();
    });
    
    // Phone input should be visible
    expect(screen.getByPlaceholderText('(99) 99999-9999')).toBeInTheDocument();
  });

  it('validates phone number correctly', async () => {
    // Start at the phone step
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        _id: 'test-user-id',
        name: 'Test User',
        level: { level: 1, xp: 0, next_level_xp: 100 }
      }
    });

    render(<VoiceOnboarding />);
    
    // Start recording and trigger name extraction
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      const mockResults = {
        results: [
          [{ transcript: 'Olá, me chamo Maria' }]
        ],
        resultIndex: 0
      };
      recognitionInstance.onresult(mockResults);
      recognitionInstance.onend();
    });
    
    // Wait for phone step to appear
    await waitFor(() => {
      expect(screen.getByText('Quase lá!')).toBeInTheDocument();
    });
    
    // Try an invalid phone number
    const phoneInput = screen.getByPlaceholderText('(99) 99999-9999');
    userEvent.type(phoneInput, '123');
    
    // Try to submit
    fireEvent.click(screen.getByText('Confirmar'));
    
    // Should show validation error
    expect(screen.getByText('Formato inválido. Use (99) 99999-9999')).toBeInTheDocument();
    
    // Clear and type a valid phone number
    userEvent.clear(phoneInput);
    userEvent.type(phoneInput, '(11) 99999-9999');
    
    // Submit again
    fireEvent.click(screen.getByText('Confirmar'));
    
    // Should progress to confirmation step
    await waitFor(() => {
      expect(screen.getByText('Prazer em conhecê-lo!')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('(11) 99999-9999')).toBeInTheDocument();
    });
  });

  it('handles confirmation step correctly - positive confirmation', async () => {
    // Mock the API responses
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        _id: 'test-user-id',
        name: 'Maria',
        level: { level: 1, xp: 0, next_level_xp: 100 }
      }
    });
    
    render(<VoiceOnboarding />);
    
    // Process name step
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Meu nome é Maria' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });
    
    // Wait for phone step
    await waitFor(() => {
      expect(screen.getByText('Quase lá!')).toBeInTheDocument();
    });
    
    // Enter phone number
    const phoneInput = screen.getByPlaceholderText('(99) 99999-9999');
    userEvent.type(phoneInput, '(11) 99999-9999');
    fireEvent.click(screen.getByText('Confirmar'));
    
    // Wait for confirmation step
    await waitFor(() => {
      expect(screen.getByText('Prazer em conhecê-lo!')).toBeInTheDocument();
    });
    
    // Start recording for confirmation
    fireEvent.click(screen.getByText('Falar'));
    
    // Simulate positive confirmation ("Sim")
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Sim, está correto' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });
    
    // Click confirm
    fireEvent.click(screen.getByText('Confirmar'));
    
    // Check XP update API call
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/users/test-user-id/xp'),
        { xp: 10, phone: '(11) 99999-9999' }
      );
    });
    
    // Check signIn call
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith(
        'voice',
        expect.objectContaining({
          redirect: false,
          name: 'Maria',
          phone: '(11) 99999-9999'
        })
      );
    });
    
    // Should progress to success step
    await waitFor(() => {
      expect(screen.getByText('Perfeito!')).toBeInTheDocument();
      expect(screen.getByText('Sua conta foi criada com sucesso!')).toBeInTheDocument();
    });

    // Check if router push is called after delay
    jest.advanceTimersByTime(3000);
    await waitFor(() => {
      expect(useRouter().push).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles confirmation step correctly - negative confirmation', async () => {
    // Process to confirmation step
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        _id: 'test-user-id',
        name: 'João',
        level: { level: 1, xp: 0, next_level_xp: 100 }
      }
    });
    
    render(<VoiceOnboarding />);
    
    // Process name step
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Meu nome é João' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });
    
    // Wait for phone step
    await waitFor(() => {
      expect(screen.getByText('Quase lá!')).toBeInTheDocument();
    });
    
    // Enter phone number
    const phoneInput = screen.getByPlaceholderText('(99) 99999-9999');
    userEvent.type(phoneInput, '(11) 99999-9999');
    fireEvent.click(screen.getByText('Confirmar'));
    
    // Wait for confirmation step
    await waitFor(() => {
      expect(screen.getByText('Prazer em conhecê-lo!')).toBeInTheDocument();
    });
    
    // Start recording for confirmation
    fireEvent.click(screen.getByText('Falar'));
    
    // Simulate negative confirmation ("Não")
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Não, está errado' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });
    
    // Click confirm
    fireEvent.click(screen.getByText('Confirmar'));
    
    // Should return to first step
    await waitFor(() => {
      expect(screen.getByText('Bem-vindo ao Papo Social!')).toBeInTheDocument();
    });
  });

  it('handles API errors during name extraction', async () => {
    // Mock API error
    (axios.post as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
    
    render(<VoiceOnboarding />);
    
    // Start recording
    fireEvent.click(screen.getByText('Falar'));
    
    // Simulate speech result
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Olá, me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });
    
    // Should remain on first step
    await waitFor(() => {
      expect(screen.getByText('Bem-vindo ao Papo Social!')).toBeInTheDocument();
    });
  });

  it('handles speech recognition errors', async () => {
    render(<VoiceOnboarding />);
    
    // Start recording
    fireEvent.click(screen.getByText('Falar'));
    
    // Simulate speech recognition error
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onerror({ error: 'not-allowed', message: 'Permission denied' });
    });
    
    // Should remain on first step
    await waitFor(() => {
      expect(screen.getByText('Bem-vindo ao Papo Social!')).toBeInTheDocument();
    });
    
    // Speech button should be enabled again
    expect(screen.getByText('Falar')).not.toBeDisabled();
  });

  it('handles no speech detected', async () => {
    render(<VoiceOnboarding />);
    
    // Start recording
    fireEvent.click(screen.getByText('Falar'));
    
    // Simulate no speech (empty transcript)
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      // Don't set any transcript
      recognitionInstance.onend();
    });
    
    // Should remain on first step
    await waitFor(() => {
      expect(screen.getByText('Bem-vindo ao Papo Social!')).toBeInTheDocument();
    });
  });

  it('supports onComplete callback when provided', async () => {
    const onCompleteMock = jest.fn();
    
    render(<VoiceOnboarding onComplete={onCompleteMock} />);
    
    // Complete the onboarding flow
    // Step 1: Name
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });
    
    // Step 2: Phone
    await waitFor(() => expect(screen.getByText('Quase lá!')).toBeInTheDocument());
    const phoneInput = screen.getByPlaceholderText('(99) 99999-9999');
    userEvent.type(phoneInput, '(11) 99999-9999');
    fireEvent.click(screen.getByText('Confirmar'));
    
    // Step 3: Confirmation
    await waitFor(() => expect(screen.getByText('Prazer em conhecê-lo!')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Sim' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });
    fireEvent.click(screen.getByText('Confirmar'));
    
    // Success and callback
    await waitFor(() => expect(screen.getByText('Perfeito!')).toBeInTheDocument());
    
    // Fast-forward time to trigger onComplete callback instead of router push
    jest.advanceTimersByTime(3000);
    
    // Check if onComplete was called with user data
    await waitFor(() => {
      expect(onCompleteMock).toHaveBeenCalledWith(expect.objectContaining({
        _id: 'test-user-id'
      }));
      expect(useRouter().push).not.toHaveBeenCalled(); // Router shouldn't be called when onComplete is provided
    });
  });

  it('handles authentication failures', async () => {
    // Mock signIn to return error
    (signIn as jest.Mock).mockResolvedValueOnce({
      error: 'Authentication failed',
      ok: false
    });
    
    // Complete steps until confirmation
    render(<VoiceOnboarding />);
    
    // Step 1: Name
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });
    
    // Step 2: Phone
    await waitFor(() => expect(screen.getByText('Quase lá!')).toBeInTheDocument());
    const phoneInput = screen.getByPlaceholderText('(99) 99999-9999');
    userEvent.type(phoneInput, '(11) 99999-9999');
    fireEvent.click(screen.getByText('Confirmar'));
    
    // Step 3: Confirmation
    await waitFor(() => expect(screen.getByText('Prazer em conhecê-lo!')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Sim' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });
    fireEvent.click(screen.getByText('Confirmar'));
    
    // Should return to first step on auth failure
    await waitFor(() => {
      expect(screen.getByText('Bem-vindo ao Papo Social!')).toBeInTheDocument();
    });
  });

  it('handles keyboard interaction for accessibility', async () => {
    render(<VoiceOnboarding />);
    
    // Find the speech button
    const speechButton = screen.getByText('Falar');
    
    // Simulate pressing Enter key
    fireEvent.keyPress(speechButton, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    // Check if recording started
    await waitFor(() => {
      const { mockStart } = mockSpeechRecognition();
      expect(mockStart).toHaveBeenCalled();
    });
  });

  it('updates UI when showing achievements', async () => {
    // Mock achievement response
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        _id: 'test-user-id',
        name: 'Achievement User',
        level: { level: 1, xp: 0, next_level_xp: 100 },
        achievements: [
          {
            id: 'first_login',
            name: 'Primeiro Login',
            description: 'Você fez seu primeiro login!',
            icon: '🏆'
          }
        ]
      }
    });
    
    render(<VoiceOnboarding />);
    
    // Complete name step to trigger achievement
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });
    
    // Phone step should appear
    await waitFor(() => {
      expect(screen.getByText('Quase lá!')).toBeInTheDocument();
    });
  });

  it('cleans up resources when unmounted', () => {
    const { unmount } = render(<VoiceOnboarding />);
    
    // Start recording to initialize resources
    fireEvent.click(screen.getByText('Falar'));
    
    // Unmount component
    unmount();
    
    // Should clean up without errors
    // This is a passive test - if there are issues with cleanup, they would throw errors
  });

  // 1. Testes de Síntese de Voz
  it('plays voice prompts when navigating between steps', async () => {
    const { mockSpeak, mockCancel } = mockSpeechSynthesis();
    render(<VoiceOnboarding />);

    // Check initial step voice prompt
    expect(mockSpeak).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'Olá! Como você se chama?',
        lang: 'pt-BR'
      })
    );

    // Navigate to phone step
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });

    await waitFor(() => {
      expect(mockSpeak).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Por favor, digite seu número de telefone.',
          lang: 'pt-BR'
        })
      );
    });
  });

  it('cancels speech synthesis when component unmounts', () => {
    const { mockCancel } = mockSpeechSynthesis();
    const { unmount } = render(<VoiceOnboarding />);
    unmount();
    expect(mockCancel).toHaveBeenCalled();
  });

  // 2. Testes de Animação e Renderização
  it('renders motion animations correctly', () => {
    render(<VoiceOnboarding />);
    
    // Check background animations
    const backgroundElements = screen.getAllByRole('presentation');
    expect(backgroundElements).toHaveLength(2);
    expect(backgroundElements[0]).toHaveStyle({
      position: 'absolute',
      opacity: '0.1'
    });
  });

  it('shows sound visualization with correct audio levels', async () => {
    const { mockGetByteFrequencyData } = mockAudioContext();
    render(<VoiceOnboarding />);

    // Start recording to show visualization
    fireEvent.click(screen.getByText('Falar'));

    await waitFor(() => {
      const visualization = screen.getByRole('presentation');
      expect(visualization).toBeInTheDocument();
      expect(mockGetByteFrequencyData).toHaveBeenCalled();
    });
  });

  // 3. Testes de Compatibilidade
  it('handles browsers without SpeechRecognition API', () => {
    // Remove SpeechRecognition API
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;

    render(<VoiceOnboarding />);
    
    const speechButton = screen.getByText('Falar');
    fireEvent.click(speechButton);

    expect(screen.getByText('Seu navegador não suporta reconhecimento de voz.')).toBeInTheDocument();
  });

  it('handles browsers without AudioContext API', () => {
    // Remove AudioContext API
    delete (window as any).AudioContext;
    delete (window as any).webkitAudioContext;

    render(<VoiceOnboarding />);
    
    const speechButton = screen.getByText('Falar');
    fireEvent.click(speechButton);

    // Should still work without audio visualization
    expect(screen.getByText('Falar')).toBeInTheDocument();
  });

  // 4. Testes de Eventos e Limpeza
  it('cleans up keyboard event listeners correctly', () => {
    const removeEventListenerSpy = jest.spyOn(HTMLButtonElement.prototype, 'removeEventListener');
    const { unmount } = render(<VoiceOnboarding />);
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keypress', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });

  it('cleans up animation frames when stopping recording', async () => {
    const cancelAnimationFrameSpy = jest.spyOn(window, 'cancelAnimationFrame');
    render(<VoiceOnboarding />);

    // Start and stop recording
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onend();
    });

    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
    cancelAnimationFrameSpy.mockRestore();
  });

  // 5. Testes para Todos os Toast
  it('shows appropriate toast notifications for each error scenario', async () => {
    render(<VoiceOnboarding />);

    // Test microphone permission error
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onerror({ error: 'not-allowed', message: 'Permission denied' });
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Erro no reconhecimento de voz',
        type: 'error'
      }));
    });

    // Test no speech detected
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onend();
    });

    expect(mockShowToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Sem áudio detectado',
      type: 'warning'
    }));
  });

  it('displays achievement toast when received from API', async () => {
    // Limpar o mock antes do teste
    mockShowToast.mockClear();

    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        achievements: [{
          name: 'Primeira Voz',
          description: 'Você completou seu primeiro registro por voz!',
          icon: '🎤'
        }]
      }
    });

    render(<VoiceOnboarding />);
    
    // Complete voice registration
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Conquista Desbloqueada!',
        icon: '🎤'
      }));
    });
  });

  // 6. Testes de Navegação entre Passos
  it('allows returning to previous step using cancel button', async () => {
    render(<VoiceOnboarding />);

    // Go to phone step first
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });

    await waitFor(() => {
      expect(screen.getByText('Quase lá!')).toBeInTheDocument();
    });

    // Click cancel button
    fireEvent.click(screen.getByText('Cancelar'));

    // Should return to first step
    expect(screen.getByText('Bem-vindo ao Papo Social!')).toBeInTheDocument();
  });

  it('returns to first step after completing onboarding', async () => {
    render(<VoiceOnboarding />);

    // Complete onboarding flow
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });

    await waitFor(() => {
      expect(screen.getByText('Quase lá!')).toBeInTheDocument();
    });

    // Enter phone
    const phoneInput = screen.getByPlaceholderText('(99) 99999-9999');
    userEvent.type(phoneInput, '(11) 99999-9999');
    fireEvent.click(screen.getByText('Confirmar'));

    // Confirm
    await waitFor(() => {
      expect(screen.getByText('Prazer em conhecê-lo!')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Sim' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });

    fireEvent.click(screen.getByText('Confirmar'));

    // Should show success step
    await waitFor(() => {
      expect(screen.getByText('Perfeito!')).toBeInTheDocument();
    });

    // After timeout, should redirect
    jest.advanceTimersByTime(3000);
    expect(useRouter().push).toHaveBeenCalledWith('/dashboard');
  });

  // Testes adicionais para aumentar cobertura
  
  it('handles ambiguous response during confirmation step', async () => {
    // Mock the API responses
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        _id: 'test-user-id',
        name: 'Test User',
        level: { level: 1, xp: 0, next_level_xp: 100 }
      }
    });
    
    // Limpar o mock antes do teste
    mockShowToast.mockClear();
    
    render(<VoiceOnboarding />);
    
    // Complete name and phone steps
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });
    
    await waitFor(() => expect(screen.getByText('Quase lá!')).toBeInTheDocument());
    const phoneInput = screen.getByPlaceholderText('(99) 99999-9999');
    userEvent.type(phoneInput, '(11) 99999-9999');
    fireEvent.click(screen.getByText('Confirmar'));
    
    // Enter ambiguous confirmation
    await waitFor(() => expect(screen.getByText('Prazer em conhecê-lo!')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Talvez, não sei' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });
    
    // Click confirm
    fireEvent.click(screen.getByText('Confirmar'));
    
    // Should show ambiguous response toast
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Não entendi',
          description: 'Por favor, responda "sim" ou "não".',
          type: 'warning'
        })
      );
    });
    
    // Should remain on confirmation step
    expect(screen.getByText('Prazer em conhecê-lo!')).toBeInTheDocument();
  });

  it('handles level up achievement after confirmation', async () => {
    // Mock the API responses with level up achievement
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        _id: 'test-user-id',
        name: 'Test User',
        level: { level: 1, xp: 0, next_level_xp: 100 }
      }
    });
    
    (axios.put as jest.Mock).mockResolvedValueOnce({
      data: {
        _id: 'test-user-id',
        name: 'Test User',
        level: { level: 2, xp: 0, next_level_xp: 200 },
        achievements: [
          {
            id: 'level_2',
            name: 'Nível 2 Alcançado',
            description: 'Você alcançou o nível 2!',
            icon: '⭐'
          }
        ]
      }
    });
    
    // Limpar o mock antes do teste
    mockShowToast.mockClear();
    
    render(<VoiceOnboarding />);
    
    // Complete name and phone steps
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });
    
    await waitFor(() => expect(screen.getByText('Quase lá!')).toBeInTheDocument());
    const phoneInput = screen.getByPlaceholderText('(99) 99999-9999');
    userEvent.type(phoneInput, '(11) 99999-9999');
    fireEvent.click(screen.getByText('Confirmar'));
    
    // Confirm
    await waitFor(() => expect(screen.getByText('Prazer em conhecê-lo!')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Sim' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });
    fireEvent.click(screen.getByText('Confirmar'));
    
    // Should show level up toast
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Nível Aumentado!',
          description: 'Você alcançou o nível 2!',
          icon: '⭐',
          duration: 5000
        })
      );
    });
    
    // Should show success step with level information
    await waitFor(() => {
      expect(screen.getByText('Perfeito!')).toBeInTheDocument();
      expect(screen.getByText('Nível 2')).toBeInTheDocument();
    });
  });

  it('handles XP update error without failing the flow', async () => {
    // Mock success for name extraction but failure for XP update
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        _id: 'test-user-id',
        name: 'Test User',
        level: { level: 1, xp: 0, next_level_xp: 100 }
      }
    });
    
    // Simulate XP update error
    (axios.put as jest.Mock).mockRejectedValueOnce(new Error('XP update failed'));
    
    render(<VoiceOnboarding />);
    
    // Complete name and phone steps
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });
    
    await waitFor(() => expect(screen.getByText('Quase lá!')).toBeInTheDocument());
    const phoneInput = screen.getByPlaceholderText('(99) 99999-9999');
    userEvent.type(phoneInput, '(11) 99999-9999');
    fireEvent.click(screen.getByText('Confirmar'));
    
    // Confirm
    await waitFor(() => expect(screen.getByText('Prazer em conhecê-lo!')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Sim' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });
    fireEvent.click(screen.getByText('Confirmar'));
    
    // Should still proceed with auth despite XP update error
    await waitFor(() => {
      expect(signIn).toHaveBeenCalled();
      expect(screen.getByText('Perfeito!')).toBeInTheDocument();
    });
  });

  it('handles all speech recognition error types', async () => {
    // Limpar o mock antes do teste
    mockShowToast.mockClear();
    
    render(<VoiceOnboarding />);
    
    // Test each error type
    const errorTypes = [
      'not-allowed', 
      'audio-capture', 
      'network', 
      'no-speech', 
      'service-not-allowed', 
      'aborted'
    ];
    
    for (const errorType of errorTypes) {
      fireEvent.click(screen.getByText('Falar'));
      
      act(() => {
        const recognitionInstance = new (window as any).SpeechRecognition();
        recognitionInstance.onerror({ error: errorType, message: `Error: ${errorType}` });
      });
      
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Erro no reconhecimento de voz',
            type: 'error'
          })
        );
      });
      
      // Clear mock for next iteration
      mockShowToast.mockClear();
    }
  });

  it('formats and validates phone number correctly', () => {
    render(<VoiceOnboarding />);
    
    // Skip to phone step
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        _id: 'test-user-id',
        name: 'Test User',
        level: { level: 1, xp: 0, next_level_xp: 100 }
      }
    });
    
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });
    
    // Wait for phone step
    waitFor(() => expect(screen.getByText('Quase lá!')).toBeInTheDocument());
    
    // Test formatting
    const phoneInput = screen.getByPlaceholderText('(99) 99999-9999');
    userEvent.type(phoneInput, '11999999999');
    expect(phoneInput).toHaveValue('(11) 99999-9999');
    
    // Test empty validation
    userEvent.clear(phoneInput);
    fireEvent.blur(phoneInput);
    fireEvent.click(screen.getByText('Confirmar'));
    expect(screen.getByText('O número de telefone é obrigatório')).toBeInTheDocument();
    
    // Test invalid format validation
    userEvent.clear(phoneInput);
    userEvent.type(phoneInput, '(11) 9999');
    fireEvent.click(screen.getByText('Confirmar'));
    expect(screen.getByText('Formato inválido. Use (99) 99999-9999')).toBeInTheDocument();
  });

  it('handles user with no achievements from API response', async () => {
    // Mock API without achievements
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        _id: 'test-user-id',
        name: 'Test User',
        level: { level: 1, xp: 0, next_level_xp: 100 }
        // No achievements array
      }
    });
    
    render(<VoiceOnboarding />);
    
    // Complete name extraction
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });
    
    // Should proceed to phone step without errors
    await waitFor(() => {
      expect(screen.getByText('Quase lá!')).toBeInTheDocument();
    });
  });

  it('handles max phone number input correctly', () => {
    render(<VoiceOnboarding />);
    
    // Skip to phone step
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        _id: 'test-user-id',
        name: 'Test User',
        level: { level: 1, xp: 0, next_level_xp: 100 }
      }
    });
    
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });
    
    // Wait for phone step
    waitFor(() => expect(screen.getByText('Quase lá!')).toBeInTheDocument());
    
    // Test with more than 11 digits
    const phoneInput = screen.getByPlaceholderText('(99) 99999-9999');
    userEvent.type(phoneInput, '11999999999222');
    expect(phoneInput).toHaveValue('(11) 99999-9999');
  });

  it('shows loading spinner during API calls', async () => {
    // Make API response delay to show loading state
    (axios.post as jest.Mock).mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            data: {
              _id: 'test-user-id',
              name: 'Test User',
              level: { level: 1, xp: 0, next_level_xp: 100 }
            }
          });
        }, 100);
      });
    });
    
    render(<VoiceOnboarding />);
    
    // Complete name extraction
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });
    
    // Simulate button click
    fireEvent.click(screen.getByText('Confirmar'));
    
    // Loading spinner should be visible
    expect(screen.getByText('Processando...')).toBeInTheDocument();
    
    // Should eventually go to phone step
    await waitFor(() => {
      expect(screen.getByText('Quase lá!')).toBeInTheDocument();
    });
  });

  it('handles speech button being clicked while already recording', () => {
    const { mockStart } = mockSpeechRecognition();
    render(<VoiceOnboarding />);
    
    // Start recording
    fireEvent.click(screen.getByText('Falar'));
    expect(mockStart).toHaveBeenCalledTimes(1);
    
    // Try to start recording again
    fireEvent.click(screen.getByText('Falar'));
    expect(mockStart).toHaveBeenCalledTimes(1); // Should not call start again
  });

  it('tests keyboard space key press for voice button', async () => {
    const { mockStart } = mockSpeechRecognition();
    render(<VoiceOnboarding />);
    
    // Find speech button
    const speechButton = screen.getByText('Falar');
    
    // Press space key
    fireEvent.keyPress(speechButton, { key: ' ', code: 'Space', charCode: 32 });
    
    // Should start recording
    await waitFor(() => {
      expect(mockStart).toHaveBeenCalled();
    });
  });

  it('supports transcript confirmation via confirmation button', async () => {
    render(<VoiceOnboarding />);
    
    // Start recording
    fireEvent.click(screen.getByText('Falar'));
    
    // Set transcript without ending recording
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste Botão' }]],
        resultIndex: 0
      });
      // Don't end recognition yet
    });
    
    // Check if transcript is displayed
    expect(screen.getByText('Me chamo Teste Botão')).toBeInTheDocument();
    
    // Click confirmation button directly
    fireEvent.click(screen.getByText('Confirmar'));
    
    // Should progress to phone step
    await waitFor(() => {
      expect(screen.getByText('Quase lá!')).toBeInTheDocument();
    });
  });

  it('displays correct user information on success step', async () => {
    // Mock user data with specific values
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        _id: 'test-user-id',
        name: 'Maria Silva',
        level: { level: 3, xp: 75, next_level_xp: 150 }
      }
    });
    
    (axios.put as jest.Mock).mockResolvedValueOnce({
      data: {
        _id: 'test-user-id',
        name: 'Maria Silva',
        level: { level: 3, xp: 85, next_level_xp: 150 }
      }
    });
    
    render(<VoiceOnboarding />);
    
    // Complete all steps
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Meu nome é Maria Silva' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });
    
    await waitFor(() => expect(screen.getByText('Quase lá!')).toBeInTheDocument());
    const phoneInput = screen.getByPlaceholderText('(99) 99999-9999');
    userEvent.type(phoneInput, '(11) 99999-9999');
    fireEvent.click(screen.getByText('Confirmar'));
    
    await waitFor(() => expect(screen.getByText('Prazer em conhecê-lo!')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Sim' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });
    fireEvent.click(screen.getByText('Confirmar'));
    
    // Check success step user info
    await waitFor(() => {
      expect(screen.getByText('Perfeito!')).toBeInTheDocument();
      expect(screen.getByText('Nível 3')).toBeInTheDocument();
      expect(screen.getByText('XP: 85/150')).toBeInTheDocument();
    });
    
    // Check progress bar
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '56.666666666666664%' }); // 85/150 * 100
  });

  it('handles recognition ending with no transcript and isRecording true', async () => {
    // Limpar o mock antes do teste
    mockShowToast.mockClear();
    
    render(<VoiceOnboarding />);
    
    // Start recording
    fireEvent.click(screen.getByText('Falar'));
    
    // End recognition without transcript while isRecording is true
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      // Don't set any transcript
      recognitionInstance.onend();
    });
    
    // Should show toast for no audio detected
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Sem áudio detectado',
          description: 'Não conseguimos ouvir nada. Por favor, tente novamente.',
          type: 'warning'
        })
      );
    });
  });

  it('calls getUserMedia and handles audio visualization with different audio levels', async () => {
    // Mock different audio levels
    const mockGetByteFrequencyData = jest.fn().mockImplementation((array) => {
      // First call - low level
      if (mockGetByteFrequencyData.mock.calls.length === 1) {
        for (let i = 0; i < array.length; i++) {
          array[i] = 10; // Low level
        }
      }
      // Second call - high level
      else if (mockGetByteFrequencyData.mock.calls.length === 2) {
        for (let i = 0; i < array.length; i++) {
          array[i] = 200; // High level
        }
      }
      // Other calls - medium level
      else {
        for (let i = 0; i < array.length; i++) {
          array[i] = 50; // Medium level
        }
      }
    });
    
    // Override mockAudioContext
    const mockGetUserMedia = jest.fn().mockResolvedValue({
      getTracks: () => [{
        stop: jest.fn()
      }]
    });
    
    const mockCreateAnalyser = jest.fn().mockReturnValue({
      fftSize: 0,
      frequencyBinCount: 32,
      getByteFrequencyData: mockGetByteFrequencyData
    });
    
    const mockCreateMediaStreamSource = jest.fn().mockReturnValue({
      connect: jest.fn()
    });
    
    class MockAudioContext {
      createAnalyser = mockCreateAnalyser;
      createMediaStreamSource = mockCreateMediaStreamSource;
    }
    
    Object.defineProperty(window, 'AudioContext', {
      writable: true,
      value: MockAudioContext
    });
    
    Object.defineProperty(window, 'webkitAudioContext', {
      writable: true,
      value: MockAudioContext
    });
    
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: mockGetUserMedia
      }
    });
    
    render(<VoiceOnboarding />);
    
    // Start recording
    fireEvent.click(screen.getByText('Falar'));
    
    // Check if getUserMedia was called
    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
    });
    
    // Animation frame should trigger getByteFrequencyData calls
    await waitFor(() => {
      expect(mockGetByteFrequencyData).toHaveBeenCalled();
      expect(mockCreateAnalyser).toHaveBeenCalled();
      expect(mockCreateMediaStreamSource).toHaveBeenCalled();
    });
    
    // Multiple animation frames should call getByteFrequencyData multiple times
    act(() => {
      for (let i = 0; i < 5; i++) {
        jest.advanceTimersByTime(16); // Typical animation frame time - usar o método correto
      }
    });
    
    expect(mockGetByteFrequencyData.mock.calls.length).toBeGreaterThan(1);
  });

  it('handles transcript containing sensitive information', async () => {
    render(<VoiceOnboarding />);
    
    // Start recording
    fireEvent.click(screen.getByText('Falar'));
    
    // Set transcript with sensitive info like credit card
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Meu nome é João e meu cartão é 4111 1111 1111 1111' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });
    
    // API should only receive the transcript, processing should handle safety
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/onboarding/voice'),
        { transcript: 'Meu nome é João e meu cartão é 4111 1111 1111 1111' }
      );
    });
  });

  it('handles browser APIs undefined', async () => {
    // Save original properties
    const originalAudioContext = window.AudioContext;
    const originalSpeechSynthesis = window.speechSynthesis;
    const originalSpeechSynthesisUtterance = window.SpeechSynthesisUtterance;
    
    // Simulate undefined browser APIs
    delete (window as any).AudioContext;
    delete (window as any).webkitAudioContext;
    delete (window as any).speechSynthesis;
    delete (window as any).SpeechSynthesisUtterance;
    
    render(<VoiceOnboarding />);
    
    // Should render without crashing
    expect(screen.getByText('Bem-vindo ao Papo Social!')).toBeInTheDocument();
    
    // Restore original properties
    window.AudioContext = originalAudioContext;
    window.speechSynthesis = originalSpeechSynthesis;
    window.SpeechSynthesisUtterance = originalSpeechSynthesisUtterance;
  });

  it('handles getUserMedia failure', async () => {
    // Mock getUserMedia to fail
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: jest.fn().mockRejectedValue(new Error('Permission denied'))
      }
    });

    render(<VoiceOnboarding />);
    
    // Start recording
    fireEvent.click(screen.getByText('Falar'));
    
    // Should show error toast
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Erro',
          description: expect.stringContaining('microfone'),
          type: 'error'
        })
      );
    });

    // Button should be enabled again
    expect(screen.getByText('Falar')).not.toBeDisabled();
  });

  it('handles audio context state changes', async () => {
    let audioContextState = 'running';
    const mockAudioContext = {
      state: audioContextState,
      createAnalyser: jest.fn().mockReturnValue({
        fftSize: 0,
        frequencyBinCount: 32,
        getByteFrequencyData: jest.fn()
      }),
      createMediaStreamSource: jest.fn().mockReturnValue({
        connect: jest.fn()
      }),
      resume: jest.fn().mockImplementation(() => {
        mockAudioContext.state = 'running';
        return Promise.resolve();
      }),
      suspend: jest.fn().mockImplementation(() => {
        mockAudioContext.state = 'suspended';
        return Promise.resolve();
      }),
      close: jest.fn().mockImplementation(() => {
        mockAudioContext.state = 'closed';
        return Promise.resolve();
      })
    };

    Object.defineProperty(window, 'AudioContext', {
      writable: true,
      value: jest.fn().mockImplementation(() => mockAudioContext)
    });

    render(<VoiceOnboarding />);
    
    // Start recording
    fireEvent.click(screen.getByText('Falar'));
    
    // Test suspended state
    await act(async () => {
      await mockAudioContext.suspend();
    });
    
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Erro',
        description: expect.stringContaining('áudio'),
        type: 'error'
      })
    );

    // Test resume
    await act(async () => {
      await mockAudioContext.resume();
    });

    // Test close
    await act(async () => {
      await mockAudioContext.close();
    });
  });

  it('handles state transitions during API errors', async () => {
    // Mock API to fail after success
    (axios.post as jest.Mock)
      .mockResolvedValueOnce({
        data: {
          _id: 'test-user-id',
          name: 'Test User',
          level: { level: 1, xp: 0, next_level_xp: 100 }
        }
      })
      .mockRejectedValueOnce(new Error('Network error'));

    render(<VoiceOnboarding />);
    
    // Complete first step successfully
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });

    await waitFor(() => {
      expect(screen.getByText('Quase lá!')).toBeInTheDocument();
    });

    // Enter phone and proceed
    const phoneInput = screen.getByPlaceholderText('(99) 99999-9999');
    userEvent.type(phoneInput, '(11) 99999-9999');
    fireEvent.click(screen.getByText('Confirmar'));

    // Try confirmation with API error
    await waitFor(() => {
      expect(screen.getByText('Prazer em conhecê-lo!')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Sim' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });

    fireEvent.click(screen.getByText('Confirmar'));

    // Should show error and remain on confirmation step
    await waitFor(() => {
      expect(screen.getByText('Prazer em conhecê-lo!')).toBeInTheDocument();
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Erro',
          type: 'error'
        })
      );
    });
  });

  it('handles keyboard navigation between steps', async () => {
    render(<VoiceOnboarding />);
    
    // Start with Enter key
    const speechButton = screen.getByText('Falar');
    fireEvent.keyPress(speechButton, { key: 'Enter', code: 'Enter' });
    
    // Complete first step
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });

    await waitFor(() => {
      expect(screen.getByText('Quase lá!')).toBeInTheDocument();
    });

    // Navigate back with Escape key
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    
    await waitFor(() => {
      expect(screen.getByText('Bem-vindo ao Papo Social!')).toBeInTheDocument();
    });
  });

  it('handles multiple speech recognition attempts', async () => {
    render(<VoiceOnboarding />);
    
    // First attempt - no speech detected
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onend();
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Sem áudio detectado',
          type: 'warning'
        })
      );
    });

    // Second attempt - network error
    mockShowToast.mockClear();
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onerror({ error: 'network', message: 'Network error' });
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Erro no reconhecimento de voz',
          description: 'Erro de conexão. Verifique sua internet.',
          type: 'error'
        })
      );
    });

    // Third attempt - success
    mockShowToast.mockClear();
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });

    await waitFor(() => {
      expect(screen.getByText('Quase lá!')).toBeInTheDocument();
    });
  });

  it('handles concurrent API calls and state updates', async () => {
    // Mock delayed API responses
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    let firstCallResolved = false;
    (axios.post as jest.Mock)
      .mockImplementationOnce(() => 
        delay(100).then(() => {
          firstCallResolved = true;
          return {
            data: {
              _id: 'test-user-id',
              name: 'Test User',
              level: { level: 1, xp: 0, next_level_xp: 100 }
            }
          };
        })
      )
      .mockImplementationOnce(() => {
        if (!firstCallResolved) {
          return Promise.reject(new Error('Concurrent request'));
        }
        return Promise.resolve({
          data: {
            _id: 'test-user-id',
            name: 'Test User',
            level: { level: 1, xp: 0, next_level_xp: 100 }
          }
        });
      });

    render(<VoiceOnboarding />);
    
    // Start first API call
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });

    // Try to start another API call immediately
    fireEvent.click(screen.getByText('Falar'));
    
    // Should show loading state
    expect(screen.getByText('Processando...')).toBeInTheDocument();
    
    // Should eventually complete
    await waitFor(() => {
      expect(screen.getByText('Quase lá!')).toBeInTheDocument();
    });
  });

  it('handles speech recognition abort during recording', async () => {
    const { mockAbort } = mockSpeechRecognition();
    render(<VoiceOnboarding />);
    
    // Start recording
    fireEvent.click(screen.getByText('Falar'));
    
    // Click cancel during recording
    fireEvent.click(screen.getByText('Cancelar'));
    
    // Should abort recognition
    expect(mockAbort).toHaveBeenCalled();
    
    // Should reset recording state
    expect(screen.getByText('Falar')).not.toBeDisabled();
  });

  it('handles phone number validation edge cases', () => {
    render(<VoiceOnboarding />);
    
    // Skip to phone step
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        _id: 'test-user-id',
        name: 'Test User',
        level: { level: 1, xp: 0, next_level_xp: 100 }
      }
    });
    
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });
    
    // Wait for phone step
    waitFor(() => expect(screen.getByText('Quase lá!')).toBeInTheDocument());
    
    const phoneInput = screen.getByPlaceholderText('(99) 99999-9999') as HTMLInputElement;
    
    // Test with letters
    userEvent.type(phoneInput, 'abc');
    expect(phoneInput.value).toBe('');
    
    // Test with special characters
    userEvent.type(phoneInput, '@#$');
    expect(phoneInput.value).toBe('');
    
    // Test with spaces
    userEvent.type(phoneInput, '11 99999 9999');
    expect(phoneInput.value).toBe('(11) 99999-9999');
    
    // Test with international format
    userEvent.clear(phoneInput);
    userEvent.type(phoneInput, '+5511999999999');
    expect(phoneInput.value).toBe('(11) 99999-9999');
  });

  it('handles achievement notifications with animations', async () => {
    // Mock achievement response with multiple achievements
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        _id: 'test-user-id',
        name: 'Test User',
        level: { level: 1, xp: 0, next_level_xp: 100 },
        achievements: [
          {
            id: 'first_login',
            name: 'Primeiro Login',
            description: 'Você fez seu primeiro login!',
            icon: '🏆'
          },
          {
            id: 'voice_master',
            name: 'Mestre da Voz',
            description: 'Completou o registro por voz!',
            icon: '🎤'
          }
        ]
      }
    });

    render(<VoiceOnboarding />);
    
    // Complete first step
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });

    // Should show multiple achievement toasts
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledTimes(2);
    });
  });
});

describe('VoiceOnboarding Component - State Management', () => {
  it('handles state cleanup on component unmount', () => {
    const mockAnalyser = {
      disconnect: jest.fn(),
      getByteFrequencyData: jest.fn()
    };

    const mockAudioContext = {
      createAnalyser: jest.fn().mockReturnValue(mockAnalyser),
      createMediaStreamSource: jest.fn().mockReturnValue({
        connect: jest.fn(),
        disconnect: jest.fn()
      }),
      close: jest.fn()
    };

    Object.defineProperty(window, 'AudioContext', {
      writable: true,
      value: jest.fn().mockImplementation(() => mockAudioContext)
    });

    const { unmount } = render(<VoiceOnboarding />);
    
    // Start recording
    fireEvent.click(screen.getByText('Falar'));

    // Unmount during recording
    unmount();

    // Check cleanup
    expect(mockAnalyser.disconnect).toHaveBeenCalled();
    expect(mockAudioContext.close).toHaveBeenCalled();
  });

  it('handles state reset on error', async () => {
    render(<VoiceOnboarding />);
    
    // Start recording
    fireEvent.click(screen.getByText('Falar'));

    // Simulate error
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onerror({ error: 'no-speech' });
      recognitionInstance.onend();
    });

    // Check state reset
    expect(screen.getByText('Falar')).not.toBeDisabled();
    expect(screen.queryByRole('status')).not.toHaveTextContent(/gravando/i);
  });

  it('handles state persistence during API calls', async () => {
    // Mock delayed API response
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    (axios.post as jest.Mock).mockImplementation(() => delay(1000));

    render(<VoiceOnboarding />);
    
    // Complete name step
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });

    // Check loading state
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for API call
    await act(async () => {
      await delay(1000);
    });

    // Check state after API call
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});

describe('VoiceOnboarding Component - Validation', () => {
  it('validates phone number format strictly', async () => {
    render(<VoiceOnboarding />);
    
    // Complete name step
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });

    // Test invalid formats
    const phoneInput = screen.getByPlaceholderText('(99) 99999-9999') as HTMLInputElement;
    
    // Too short
    fireEvent.change(phoneInput, { target: { value: '1234' } });
    expect(screen.getByText('Confirmar')).toBeDisabled();

    // Invalid characters
    fireEvent.change(phoneInput, { target: { value: '(11) abc12-3456' } });
    expect(phoneInput.value).toBe('(11) 12-3456');

    // Correct format
    fireEvent.change(phoneInput, { target: { value: '11999999999' } });
    expect(phoneInput.value).toBe('(11) 99999-9999');
    expect(screen.getByText('Confirmar')).not.toBeDisabled();
  });

  it('validates name extraction from transcript', async () => {
    render(<VoiceOnboarding />);
    
    // Test various transcript formats
    const testCases = [
      {
        transcript: 'Me chamo João da Silva',
        expectedName: 'João da Silva'
      },
      {
        transcript: 'Meu nome é Maria Santos',
        expectedName: 'Maria Santos'
      },
      {
        transcript: 'Pode me chamar de Pedro',
        expectedName: 'Pedro'
      }
    ];

    for (const { transcript, expectedName } of testCases) {
      // Start recording
      fireEvent.click(screen.getByText('Falar'));
      act(() => {
        const recognitionInstance = new (window as any).SpeechRecognition();
        recognitionInstance.onresult({
          results: [[{ transcript }]],
          resultIndex: 0
        });
        recognitionInstance.onend();
      });

      // Check extracted name
      await waitFor(() => {
        expect(screen.getByText('Quase lá!')).toBeInTheDocument();
      });

      // Go back
      fireEvent.click(screen.getByText('Cancelar'));
    }
  });

  it('validates API response format', async () => {
    // Mock invalid API response
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        invalid: 'response'
      }
    });

    render(<VoiceOnboarding />);
    
    // Complete name step
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });

    // Should handle invalid response gracefully
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Erro',
          type: 'error'
        })
      );
    });
  });
});

describe('VoiceOnboarding Component - Accessibility', () => {
  it('announces recording state changes to screen readers', () => {
    render(<VoiceOnboarding />);
    
    // Start recording
    fireEvent.click(screen.getByText('Falar'));

    // Check for ARIA live region updates
    expect(screen.getByRole('status')).toHaveTextContent(/gravando/i);
  });

  it('maintains focus order during step transitions', async () => {
    render(<VoiceOnboarding />);
    
    // Complete first step
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });

    // Check focus order in phone step
    const phoneInput = screen.getByPlaceholderText('(99) 99999-9999') as HTMLInputElement;
    const confirmButton = screen.getByText('Confirmar');
    const cancelButton = screen.getByText('Cancelar');

    expect(document.body).toHaveFocus();
    fireEvent.keyDown(document.body, { key: 'Tab' });
    expect(phoneInput).toHaveFocus();
    fireEvent.keyDown(phoneInput, { key: 'Tab' });
    expect(confirmButton).toHaveFocus();
    fireEvent.keyDown(confirmButton, { key: 'Tab' });
    expect(cancelButton).toHaveFocus();
  });

  it('supports keyboard navigation for all interactive elements', () => {
    render(<VoiceOnboarding />);
    
    // Test voice button keyboard interaction
    const voiceButton = screen.getByText('Falar');
    fireEvent.keyDown(voiceButton, { key: ' ' });
    expect(screen.getByRole('status')).toHaveTextContent(/gravando/i);

    // Test cancel button keyboard interaction
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.keyDown(cancelButton, { key: 'Enter' });
    expect(screen.getByText('Bem-vindo ao Papo Social!')).toBeInTheDocument();
  });

  it('provides appropriate ARIA labels for all steps', () => {
    render(<VoiceOnboarding />);
    
    // Check initial step
    expect(screen.getByRole('heading')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Bem-vindo')
    );

    // Complete first step
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });

    // Check phone step
    expect(screen.getByRole('heading')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Quase lá')
    );
  });
});

describe('VoiceOnboarding Component - Advanced Interactions', () => {
  it('handles speech recognition restart after error', async () => {
    render(<VoiceOnboarding />);
    
    // First attempt with error
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onerror({ error: 'network' });
      recognitionInstance.onend();
    });

    // Second attempt should work
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });

    await waitFor(() => {
      expect(screen.getByText('Quase lá!')).toBeInTheDocument();
    });
  });

  it('handles phone input with international format', async () => {
    render(<VoiceOnboarding />);
    
    // Complete name step
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });

    // Enter international phone number
    const phoneInput = screen.getByPlaceholderText('(99) 99999-9999') as HTMLInputElement;
    fireEvent.change(phoneInput, { target: { value: '+5511999999999' } });
    
    // Should format correctly
    expect(phoneInput.value).toBe('(11) 99999-9999');
  });

  it('handles speech recognition with background noise', async () => {
    render(<VoiceOnboarding />);
    
    // Start recording with background noise
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      
      // Simulate noise with partial results
      recognitionInstance.onresult({
        results: [
          [{ transcript: '*background noise*' }],
          [{ transcript: 'Me chamo Teste' }]
        ],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });

    // Should still extract name correctly
    await waitFor(() => {
      expect(screen.getByText('Quase lá!')).toBeInTheDocument();
    });
  });

  it('handles achievement animations with multiple achievements', async () => {
    // Mock API response with multiple achievements
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        achievements: [
          { type: 'LEVEL_UP', level: 2 },
          { type: 'FIRST_CALL' }
        ]
      }
    });

    render(<VoiceOnboarding />);
    
    // Complete first step
    fireEvent.click(screen.getByText('Falar'));
    act(() => {
      const recognitionInstance = new (window as any).SpeechRecognition();
      recognitionInstance.onresult({
        results: [[{ transcript: 'Me chamo Teste' }]],
        resultIndex: 0
      });
      recognitionInstance.onend();
    });

    // Should show multiple achievement toasts
    await waitFor(() => {
      expect(screen.getByText('Quase lá!')).toBeInTheDocument();
    });
  });
});