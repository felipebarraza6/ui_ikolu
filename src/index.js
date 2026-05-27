import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./styles/mobile.css";
import "./styles/components.css";
import "./styles/global-animations.css";
import { ConfigProvider, App, theme } from "antd";
import AppStore from "./App";
import reportWebVitals from "./reportWebVitals";
import es_ES from "antd/lib/locale/es_ES";
import { BrowserRouter } from "react-router-dom";
import "./components/smart_data/i18n";
import { createIkoluTheme } from "./theme";
import IkoluEmotionProvider from "./theme/EmotionThemeProvider";
import { ThemeProvider, useAppTheme } from "./contexts/ThemeContext";

const ThemedApp = () => {
  const { algorithm } = useAppTheme();
  const themeConfig = createIkoluTheme(algorithm);

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

reportWebVitals();
