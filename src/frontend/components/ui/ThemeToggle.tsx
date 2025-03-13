import React from 'react';
import { FaSun, FaTree } from "react-icons/fa";
import { useTheme } from "next-themes";

export interface ThemeToggleProps {
  /** Optional class name for styling */
  className?: string;
}

/**
 * ThemeToggle: A button component that toggles between Lemonade (light) and Forest (dark) themes
 * using DaisyUI's theme system and next-themes.
 * 
 * @example
 * <ThemeToggle className="my-custom-class" />
 */
export function ThemeToggle({
  className = '',
}: ThemeToggleProps): React.ReactElement {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === "lemonade" ? "forest" : "lemonade");
  };

  return (
    <button
      className={`btn btn-circle ${className}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "lemonade" ? "Forest" : "Lemonade"} theme`}
      data-testid="theme-toggle"
    >
      {theme === "forest" ? (
        <FaSun className="h-5 w-5 text-yellow-400" title="Switch to Lemonade theme" />
      ) : (
        <FaTree className="h-5 w-5 text-green-600" title="Switch to Forest theme" />
      )}
    </button>
  );
} 