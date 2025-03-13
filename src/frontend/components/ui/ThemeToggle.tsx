import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useThemeContext } from '../../contexts/ThemeContext';

export interface ThemeToggleProps {
  /** Optional class name for styling */
  className?: string;
}

/**
 * ThemeToggle: Um componente para alternar entre temas claro e escuro
 * 
 * @example
 * <ThemeToggle className="absolute top-4 right-4" />
 */
export function ThemeToggle({ className = '' }: ThemeToggleProps): React.ReactElement {
  const { theme, toggleTheme } = useThemeContext();
  
  return (
    <button
      onClick={toggleTheme}
      className={`btn btn-circle btn-sm ${className}`}
      aria-label={theme === 'lemonade' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
      data-testid="theme-toggle"
    >
      {theme === 'lemonade' ? <FaMoon /> : <FaSun />}
    </button>
  );
} 