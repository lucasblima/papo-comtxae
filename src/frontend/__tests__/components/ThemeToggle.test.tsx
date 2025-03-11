import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from 'next-themes';
import { ThemeToggle } from '../../components/ui/theme-toggle';

// Mock next-themes
jest.mock('next-themes', () => {
  const originalModule = jest.requireActual('next-themes');
  return {
    ...originalModule,
    useTheme: () => ({
      theme: 'light',
      setTheme: jest.fn(),
    }),
  };
});

describe('ThemeToggle Component', () => {
  it('renders the theme toggle button', () => {
    render(
      <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    const themeToggle = screen.getByRole('button');
    expect(themeToggle).toBeInTheDocument();
  });

  it('toggles theme when clicked', () => {
    const mockSetTheme = jest.fn();
    
    // Override the mock for this specific test
    jest.spyOn(require('next-themes'), 'useTheme').mockImplementation(() => ({
      theme: 'light',
      setTheme: mockSetTheme,
    }));
    
    render(
      <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    const themeToggle = screen.getByRole('button');
    fireEvent.click(themeToggle);
    
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
}); 