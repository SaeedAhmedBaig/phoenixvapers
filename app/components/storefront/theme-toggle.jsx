"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../lib/theme";
import { Button } from "../ui/button";

export function ThemeToggle({ className }) {
  const { theme, toggle } = useTheme();
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggle}
      className={className}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
