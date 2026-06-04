import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./styles/global-animations.css";
import "./styles/theme-variables.css";
import "./styles/animations.css";
import { ConfigProvider, App } from "antd";
import AppStore from "./App";
import es_ES from "antd/lib/locale/es_ES";
import { BrowserRouter } from "react-router-dom";
import { createIkoluTheme } from "./theme";
import IkoluEmotionProvider from "./theme/EmotionThemeProvider";
import { ThemeProvider, useAppTheme } from "./contexts/ThemeContext";

const ThemedApp = () => {
  const { algorithm, isDark } = useAppTheme();
  const themeConfig = createIkoluTheme(algorithm, isDark);

  return (
    <App>
      <ConfigProvider locale={es_ES} theme={themeConfig}>
        <IkoluEmotionProvider>
          <BrowserRouter>
            <AppStore />
          </BrowserRouter>
        </IkoluEmotionProvider>
      </ConfigProvider>
    </App>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  </React.StrictMode>
);