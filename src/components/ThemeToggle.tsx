import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/ThemeContext"
import { useAuth } from "@/contexts/AuthContext"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { user, updateUser } = useAuth()

  const toggleTheme = () => {
    let newTheme: 'light' | 'dark';

    if (theme === 'system') {
      const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      newTheme = systemIsDark ? 'light' : 'dark';
    } else {
      newTheme = theme === 'light' ? 'dark' : 'light';
    }

    setTheme(newTheme);

    // Persist preference if user is logged in
    if (user) {
      updateUser({
        preferences: {
          ...user.preferences,
          theme: newTheme
        }
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 px-0"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
