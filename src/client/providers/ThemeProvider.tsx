"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolvedTheme: "dark" | "light";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  attribute = "class",
  enableSystem = true,
  disableTransitionOnChange = false,
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string; // kept for API parity
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean; // kept for API parity
}) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey) as Theme | null;
      if (stored) setThemeState(stored);
    } catch (e) {}
  }, [storageKey]);

  useEffect(() => {
    const root = document.documentElement;
    const getSystem = () => (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const resolved = theme === 'system' && enableSystem ? getSystem() : (theme === 'system' ? 'light' : theme);
    setResolvedTheme(resolved as 'dark' | 'light');

    if (disableTransitionOnChange) {
      root.classList.add('notransition');
      root.offsetHeight;
      window.setTimeout(() => root.classList.remove('notransition'), 0);
    }

    root.classList.remove('light', 'dark');
    root.classList.add(resolved);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      if (resolved === 'dark') meta.setAttribute('content', '#09090b');
      else meta.setAttribute('content', '#ffffff');
    }
  }, [theme, enableSystem, disableTransitionOnChange]);

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch (e) {}
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export default ThemeProvider;
