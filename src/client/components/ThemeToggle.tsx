"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
        <Monitor className="h-5 w-5" />
      </Button>
    );
  }

  const toggleTheme = () => {
    if (theme === "system") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  };

  const getThemeIcon = () => {
    if (theme === "dark" || (theme === "system" && resolvedTheme === "dark")) {
      return <Moon className="h-5 w-5" />;
    } else if (theme === "light" || (theme === "system" && resolvedTheme === "light")) {
      return <Sun className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  const getThemeLabel = () => {
    if (theme === "dark") return "Dark";
    if (theme === "light") return "Light";
    return "System";
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="relative w-9 h-9 p-0 transition-all duration-200 hover:bg-accent hover:shadow-md"
      aria-label={`Switch to ${theme === "dark" ? "light" : theme === "light" ? "dark" : "system"} theme`}
      title={`Current: ${getThemeLabel()}`}
    >
      <div className="absolute inset-0 rounded-md bg-gradient-to-br from-transparent via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200" />
      <div className="relative">
        {getThemeIcon()}
        {/* Subtle indicator for current theme */}
        <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full ${
          theme === "dark" ? "bg-yellow-400" : 
          theme === "light" ? "bg-blue-400" : 
          "bg-gray-400"
        }`} />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}