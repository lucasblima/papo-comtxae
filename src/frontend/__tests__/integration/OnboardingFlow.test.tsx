import React, { ReactElement } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '../../components/ui/Toast';
import Home from '../../pages/index';
import { MockSpeechRecognition } from '../__mocks__/speechRecognitionMock';

// Import our mocks
import '../__mocks__/speechRecognitionMock';
import '../__mocks__/audioContextMock';

// Add type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor | undefined;
    webkitSpeechRecognition: SpeechRecognitionConstructor | undefined;
  }
}

// Add types for our mock events
interface MockSpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

interface MockSpeechRecognitionResultList {
  [index: number]: {
    [index: number]: MockSpeechRecognitionResult;
  };
  length: number;
}

interface MockSpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: MockSpeechRecognitionResultList;
}

interface MockSpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

// Add type for request body
interface XPUpdateBody {
  phone?: string;
  xp?: number;
}

// Setup MSW server for API mocking
const server = setupServer(
  // Mock onboarding voice API
  http.post('*/onboarding/voice', () => {
    return HttpResponse.json({
      _id: 'user-123',
      name: 'Maria Silva',
      level: {
        level: 1,
        xp: 10,
        next_level_xp: 100
      },
      achievements: [{
        id: 'first_voice',
        name: 'Primeira Voz',
        description: 'Usou reconhecimento de voz pela primeira vez',
        icon: '🎤'
      }]
    });
  }),
  
  // Mock XP API with proper typing
  http.put('*/users/:userId/xp', async ({ params, request }) => {
    const body = await request.json() as XPUpdateBody;
    return HttpResponse.json({
      _id: params.userId,
      name: 'Maria Silva',
      phone: body.phone,
      level: {
        level: 1,
        xp: 20,
        next_level_xp: 100
      },
      achievements: [
        {
          id: 'first_voice',
          name: 'Primeira Voz',
          description: 'Usou reconhecimento de voz pela primeira vez',
          icon: '🎤'
        },
        {
          id: 'phone_verified',
          name: 'Número Verificado',
          description: 'Verificou seu número de telefone com sucesso',
          icon: '📱'
        }
      ]
    });
  })
);

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    route: '/',
    asPath: '/',
    query: {},
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}));

// Test helper to render with providers
const renderWithProviders = (ui: ReactElement) => {
  return render(
    <SessionProvider session={null}>
      <ToastProvider>
        {ui}
      </ToastProvider>
    </SessionProvider>
  );
};

// Helper to create mock speech recognition event
const createMockSpeechRecognitionEvent = (transcript: string, confidence = 0.9): MockSpeechRecognitionEvent => {
  const event = new Event('result') as MockSpeechRecognitionEvent;
  event.resultIndex = 0;
  event.results = {
    0: {
      0: { transcript, confidence }
    },
    length: 1
  };
  return event;
};

// Helper to create mock error event
const createMockSpeechRecognitionErrorEvent = (errorType: string): MockSpeechRecognitionErrorEvent => {
  const event = new Event('error') as MockSpeechRecognitionErrorEvent;
  event.error = errorType;
  event.message = `Speech recognition error: ${errorType}`;
  return event;
};

describe('Onboarding User Journey', () => {
  // Start MSW server before tests
  beforeAll(() => server.listen());
  // Reset handlers after each test
  afterEach(() => server.resetHandlers());
  // Close server after all tests
  afterAll(() => server.close());
  
  it('completes the full onboarding flow from landing page', async () => {
    renderWithProviders(<Home />);
    
    // 1. Landing page shows welcome text
    expect(screen.getByText('Papo Social')).toBeInTheDocument();
    expect(screen.getByText('Uma experiência por voz')).toBeInTheDocument();
    
    // 2. User clicks on "Começar agora"
    fireEvent.click(screen.getByText('Começar agora'));
    
    // 3. Onboarding component appears
    await waitFor(() => {
      expect(screen.getByText('Bem-vindo ao Papo Social!')).toBeInTheDocument();
    });
    
    // 4. Start voice recording for name
    const voiceButton = screen.getByText('Falar');
    expect(voiceButton).toBeEnabled();
    fireEvent.click(voiceButton);
    
    // 5. Verify loading state is shown
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // 6. Simulate voice input
    const recognitionInstance = new MockSpeechRecognition();
    if (recognitionInstance.onresult) {
      recognitionInstance.onresult(createMockSpeechRecognitionEvent('Olá, meu nome é Maria'));
    }
    
    if (recognitionInstance.onend) {
      recognitionInstance.onend();
    }
    
    // 7. Check that we moved to phone step
    await waitFor(() => {
      expect(screen.getByText('Quase lá!')).toBeInTheDocument();
    });
    
    // 8. Enter phone number
    const phoneInput = screen.getByPlaceholderText('(99) 99999-9999');
    fireEvent.change(phoneInput, { target: { value: '(11) 98765-4321' } });
    
    // 9. Confirm phone number
    const confirmButton = screen.getByText('Confirmar');
    expect(confirmButton).toBeEnabled();
    fireEvent.click(confirmButton);
    
    // 10. Check that we moved to confirmation step
    await waitFor(() => {
      expect(screen.getByText('Prazer em conhecê-lo!')).toBeInTheDocument();
    });
    
    // 11. Confirm with voice
    fireEvent.click(screen.getByText('Falar'));
    
    if (recognitionInstance.onresult) {
      recognitionInstance.onresult(createMockSpeechRecognitionEvent('Sim, está correto'));
    }
    
    if (recognitionInstance.onend) {
      recognitionInstance.onend();
    }
    
    // 12. Check that we moved to success step
    await waitFor(() => {
      expect(screen.getByText('Perfeito!')).toBeInTheDocument();
      expect(screen.getByText(/conta foi criada com sucesso/i)).toBeInTheDocument();
    });
  });
  
  it('shows error toast and recovery options on voice recognition failure', async () => {
    renderWithProviders(<Home />);
    
    // Start onboarding
    fireEvent.click(screen.getByText('Começar agora'));
    
    // Start voice recording
    await waitFor(() => {
      fireEvent.click(screen.getByText('Falar'));
    });
    
    // Simulate permission denied error
    const recognitionInstance = new MockSpeechRecognition();
    if (recognitionInstance.onerror) {
      recognitionInstance.onerror(createMockSpeechRecognitionErrorEvent('not-allowed'));
    }
    
    // Should show error toast with recovery instructions
    await waitFor(() => {
      expect(screen.getByText(/Erro no reconhecimento de voz/i)).toBeInTheDocument();
      expect(screen.getByText(/Verifique as permissões do microfone/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument();
    });
  });
  
  it('validates phone number format correctly', async () => {
    renderWithProviders(<Home />);
    
    // Navigate to phone step
    fireEvent.click(screen.getByText('Começar agora'));
    const recognitionInstance = new MockSpeechRecognition();
    if (recognitionInstance.onresult) {
      recognitionInstance.onresult(createMockSpeechRecognitionEvent('Olá, meu nome é Maria'));
    }
    if (recognitionInstance.onend) {
      recognitionInstance.onend();
    }
    
    await waitFor(() => {
      expect(screen.getByText('Quase lá!')).toBeInTheDocument();
    });
    
    // Test invalid phone number
    const phoneInput = screen.getByPlaceholderText('(99) 99999-9999');
    fireEvent.change(phoneInput, { target: { value: '123456' } });
    
    expect(screen.getByText('Formato inválido. Use (99) 99999-9999')).toBeInTheDocument();
    expect(screen.getByText('Confirmar')).toBeDisabled();
    
    // Test valid phone number
    fireEvent.change(phoneInput, { target: { value: '(11) 98765-4321' } });
    expect(screen.queryByText('Formato inválido')).not.toBeInTheDocument();
    expect(screen.getByText('Confirmar')).toBeEnabled();
  });
}); 