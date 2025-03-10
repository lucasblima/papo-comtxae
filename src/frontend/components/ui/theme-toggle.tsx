import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <label className="swap swap-rotate">
      <input 
        type="checkbox" 
        className="theme-controller" 
        value="dim"
        checked={theme === 'dark'}
        onChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      />
      <Sun className="swap-on h-6 w-6 fill-current" />
      <Moon className="swap-off h-6 w-6 fill-current" />
    </label>
  );
} 