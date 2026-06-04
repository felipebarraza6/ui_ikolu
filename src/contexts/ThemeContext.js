import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { theme } from "antd";

const THEME_KEY = "ikolu-theme";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored) return stored === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    } catch {}

    if (isDark) {
      document.body.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.body.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, [isDark]);

  const algorithm = isDark ? theme.darkAlgorithm : theme.defaultAlgorithm;
  const toggleTheme = useCallback(() => setIsDark((prev) => !prev), []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, algorithm }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within ThemeProvider");
  return ctx;
};

export default ThemeContext;
