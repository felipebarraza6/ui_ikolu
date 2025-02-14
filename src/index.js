import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ConfigProvider, App, Button } from "antd";
import AppStore from "./App";
import wallpaper from "./assets/images/walldga.png";
import reportWebVitals from "./reportWebVitals";
import es_ES from "antd/lib/locale/es_ES";

const root = ReactDOM.createRoot(document.getElementById("root"));
const theme = {
  token: {
    colorPrimary: "rgb(31, 52, 97, 0.8)",
    colorLink: "rgb(31, 52, 97)",
    colorLinkHover: "rgb(31, 52, 97)",
    colorLinkActive: "rgb(31, 52, 97)",
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorPrimaryBorder: "white",
    colorError: "#f5222d",
    colorInfo: "#1890ff",
    colorBgImage: `url(${wallpaper})`, // Added background image property
  },
  components: {
    Badge: {
      colorInfo: "rgb(31, 52, 97)",
    },
    Button: {
      colorPrimary: "rgb(31, 52, 97)",
      borderColor: "white",
    },
  },
};

root.render(
  <React.StrictMode>
    <App>
      <ConfigProvider locale={es_ES} theme={theme}>
        <AppStore />
      </ConfigProvider>
    </App>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
