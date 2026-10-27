import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ConfigProvider, App as AntApp } from "antd";
import AppStore from "./App";
import reportWebVitals from "./reportWebVitals";
import es_ES from "antd/locale/es_ES";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import "./components/smart_data/i18n";
import { queryClient } from "./api/nereus/queryClient";
import { ThemeProvider } from "./theme/ThemeProvider";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";

const root = ReactDOM.createRoot(document.getElementById("root"));
const theme = {
  token: {
    colorPrimary: "#203562",
    colorLink: "#203562",
    colorLinkHover: "#203562",
    colorLinkActive: "#203562",
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#f5222d",
    colorInfo: "#203562",
    fontFamily: "Lato, Roboto, sans-serif",
  },
  components: {
    Button: {
      colorPrimary: "#203562",
    },
  },
};

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={300}>
          <AntApp>
            <ConfigProvider locale={es_ES} theme={theme}>
              <BrowserRouter>
                <AppStore />
              </BrowserRouter>
            </ConfigProvider>
          </AntApp>
          <Toaster position="top-right" />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();
