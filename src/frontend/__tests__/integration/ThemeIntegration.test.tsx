import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from 'next-themes';
import { ThemeToggle } from '../../components/ui/theme-toggle';

// Criar um componente de teste que utiliza o tema DaisyUI
const TestApp = () => (
  <div className="min-h-screen bg-base-100 text-base-content" data-testid="app-container">
    <nav className="navbar bg-base-200">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">Papo Social</a>
      </div>
      <div className="flex-none">
        <ThemeToggle />
      </div>
    </nav>
    <main className="container mx-auto p-4">
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Tema DaisyUI</h2>
          <p>Este componente usa as classes do DaisyUI.</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary">Botão</button>
          </div>
        </div>
      </div>
    </main>
  </div>
);

// Mock para next-themes
const mockSetTheme = jest.fn();
jest.mock('next-themes', () => ({
  ...jest.requireActual('next-themes'),
  useTheme: () => ({
    theme: 'light',
    setTheme: mockSetTheme,
  }),
}));

describe('Theme Integration Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the app with DaisyUI components', () => {
    render(
      <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
        <TestApp />
      </ThemeProvider>
    );
    
    // Verificar se os componentes DaisyUI estão presentes
    expect(screen.getByTestId('app-container')).toBeInTheDocument();
    expect(screen.getByText('Papo Social')).toBeInTheDocument();
    expect(screen.getByText('Tema DaisyUI')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Botão' })).toHaveClass('btn-primary');
  });

  it('toggles theme when theme toggle is clicked', () => {
    render(
      <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
        <TestApp />
      </ThemeProvider>
    );
    
    // Encontrar o botão de alternar tema
    const themeToggle = screen.getByRole('button', { name: 'Toggle theme' });
    expect(themeToggle).toBeInTheDocument();
    
    // Clicar no botão de tema
    fireEvent.click(themeToggle);
    
    // Verificar se o tema foi alterado
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
}); 