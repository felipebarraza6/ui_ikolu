import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./styles/mobile.css";
import "./styles/components.css";
import "./styles/global-animations.css";
import { ConfigProvider, App } from "antd";
import AppStore from "./App";
import reportWebVitals from "./reportWebVitals";
import es_ES from "antd/lib/locale/es_ES";
import { BrowserRouter } from "react-router-dom";
import "./components/smart_data/i18n";
import { ikoluTheme } from "./theme";
import IkoluEmotionProvider from "./theme/EmotionThemeProvider";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App>
      <ConfigProvider locale={es_ES} theme={ikoluTheme}>
        <IkoluEmotionProvider>
          <BrowserRouter>
            <AppStore />
          </BrowserRouter>
        </IkoluEmotionProvider>
      </ConfigProvider>
    </App>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
