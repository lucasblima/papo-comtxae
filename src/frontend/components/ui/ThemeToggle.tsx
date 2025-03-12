import React from 'react';
import { FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "next-themes";

export interface ThemeToggleProps {
  /** Optional class name for styling */
  className?: string;
}

/**
 * ThemeToggle: A button component that toggles between light and dark themes
 * using DaisyUI's theme system and next-themes.
 * 
 * @example
 * <ThemeToggle className="my-custom-class" />
 */
export function ThemeToggle({
  className = '',
}: ThemeToggleProps): React.ReactElement {
  const { theme, setTheme } = useTheme();

  return (
    <button
      className={`btn btn-ghost btn-circle ${className}`}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
      data-testid="theme-toggle"
    >
      {theme === "dark" ? (
        <FaSun className="h-5 w-5" />
      ) : (
        <FaMoon className="h-5 w-5" />
      )}
    </button>
  );
} 