import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

type Theme = 'lemonade' | 'forest' | 'system';
type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDarkTheme: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'lemonade',
  setTheme: () => {},
  toggleTheme: () => {},
  isDarkTheme: false
});

export const useThemeContext = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

/**
 * ThemeProvider: Provedor de contexto para gerenciar temas na aplicação
 * Integra com o DaisyUI e Next-Themes
 */
export function ThemeProvider({ 
  children, 
  defaultTheme = 'lemonade' 
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sincroniza o tema com o localStorage
  useEffect(() => {
    // Precisamos garantir que estamos no cliente para acessar localStorage
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('papo-social-theme') as Theme | null;
      if (savedTheme) {
        setTheme(savedTheme);
      }
      setMounted(true);
    }
  }, []);

  // Atualiza o estado dark/light
  useEffect(() => {
    setIsDarkTheme(theme === 'forest');
    
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem('papo-social-theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme, mounted]);

  // Função para alternar entre temas
  const toggleTheme = () => {
    setTheme(theme === 'lemonade' ? 'forest' : 'lemonade');
  };

  // Context value
  const contextValue = {
    theme,
    setTheme,
    toggleTheme,
    isDarkTheme
  };

  // Aguarda a montagem para evitar problemas de hidratação
  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    );
  }

  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme={theme}
      enableSystem={false}
      themes={["lemonade", "forest"]}
    >
      <ThemeContext.Provider value={contextValue}>
        {children}
      </ThemeContext.Provider>
    </NextThemesProvider>
  );
} 