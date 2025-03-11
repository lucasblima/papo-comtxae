import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from 'next-themes';
import Home from '../../pages/index';

// Mock components and services
jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: Array<React.ReactElement> }) => {
      return <>{children}</>;
    },
  };
});

// Mock VoiceInput component
jest.mock('../../components/speech/VoiceInput', () => {
  return {
    __esModule: true,
    VoiceInput: ({ onResult, onProcessing }: any) => (
      <button data-testid="voice-input-button">Falar</button>
    ),
  };
});

jest.mock('axios', () => ({
  post: jest.fn(() => Promise.resolve({ data: { action: '' } })),
  get: jest.fn(() => Promise.resolve({ data: [] })),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
      {component}
    </ThemeProvider>
  );
};

describe('Home page', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('renders the page title', () => {
    renderWithTheme(<Home />);
    // Instead of checking for specific text, just verify that the head title renders
    const titleElement = document.querySelector('title');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement?.textContent).toContain('Papo Social');
  });

  it('renders the voice assistant card title', () => {
    renderWithTheme(<Home />);
    const assistantTitle = screen.getByText('Assistente por Voz');
    expect(assistantTitle).toBeInTheDocument();
  });

  it('renders the voice input button', () => {
    renderWithTheme(<Home />);
    const button = screen.getByTestId('voice-input-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Falar');
  });

  it('renders welcome message', () => {
    renderWithTheme(<Home />);
    const welcomeMessage = screen.getByText(/Bem-vindo ao Papo Social/i);
    expect(welcomeMessage).toBeInTheDocument();
  });
  
  it('renders navigation elements', () => {
    renderWithTheme(<Home />);
    const navItems = screen.getAllByRole('listitem');
    expect(navItems.length).toBeGreaterThan(0);
  });

  it('renders footer with contact information', () => {
    renderWithTheme(<Home />);
    const contactLink = screen.getByText('Contato');
    expect(contactLink).toBeInTheDocument();
  });
}); 