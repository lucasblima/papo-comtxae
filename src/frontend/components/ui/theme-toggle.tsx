import { FaMoon, FaSun } from "react-icons/fa"
import { useTheme } from "next-themes"

/**
 * ThemeToggle: A button component that toggles between light and dark themes
 * using DaisyUI's theme system and react-icons.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      className="btn btn-ghost btn-circle"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <FaSun className="h-5 w-5" />
      ) : (
        <FaMoon className="h-5 w-5" />
      )}
    </button>
  )
} 