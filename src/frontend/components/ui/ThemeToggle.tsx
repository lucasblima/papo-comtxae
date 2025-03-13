import { useEffect, useState } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from 'next-themes';

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
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Ensure hydration completes before showing theme-specific content
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Render a placeholder with consistent dimensions during SSR and initial client render
  if (!mounted) {
    return (
      <button 
        className={`btn btn-ghost btn-circle ${className}`}
        aria-label="Loading theme toggle"
      >
        <div className="h-5 w-5" />
      </button>
    );
  }
  
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'lemonade' ? 'forest' : 'lemonade');
  };

  // Only render theme-specific content after hydration
  const isDark = resolvedTheme !== 'lemonade';
  const Icon = isDark ? FaSun : FaMoon;
  const iconTitle = `Switch to ${isDark ? 'Lemonade' : 'Forest'} theme`;

  return (
    <button
      className={`btn btn-ghost btn-circle ${className}`}
      onClick={toggleTheme}
      aria-label={iconTitle}
      data-testid="theme-toggle"
    >
      <Icon 
        className={`h-5 w-5 ${isDark ? 'text-yellow-400' : 'text-gray-700'}`}
        title={iconTitle}
      />
    </button>
  );
} 