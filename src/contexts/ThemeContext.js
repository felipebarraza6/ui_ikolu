import React, { createContext, useContext, useEffect, useMemo } from "react";
import { theme } from "antd";
import { createIkoluTheme } from "../theme";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    document.body.classList.add("dark");
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  const algorithm = theme.darkAlgorithm;

  // Generar configuración para consumo en componentes
  const themeConfig = useMemo(() => createIkoluTheme(algorithm, true), [algorithm]);

  const contextValue = useMemo(
    () => ({ isDark: true, setIsDark: () => {}, toggleTheme: () => {}, algorithm, themeConfig }),
    [algorithm, themeConfig]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
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
