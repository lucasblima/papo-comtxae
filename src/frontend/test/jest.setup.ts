/**
 * Jest Setup File
 * 
 * This file is executed before each test file runs.
 * It sets up global mocks, polyfills, and other test environment configurations.
 */

// Import the mock utilities
import { setupSpeechRecognitionMock, setupAudioContextMock } from './mocks/speechRecognition';

// Set up browser environment polyfills
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver
});

// Set up Web Speech API mocks
setupSpeechRecognitionMock();
setupAudioContextMock();

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    route: '/',
    pathname: '',
    query: {},
    asPath: '',
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
  })),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        name: 'Test User',
        email: 'test@example.com',
        image: null,
        xp: 100,
        level: 2,
        badges: [
          { id: '1', name: 'First Login', icon: '🎖️', description: 'Logged in for the first time' }
        ]
      },
      expires: '2100-01-01T00:00:00.000Z'
    },
    status: 'authenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}));

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
}); 