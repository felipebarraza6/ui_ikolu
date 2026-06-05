import React, { useEffect } from "react";
import { notification } from "antd";
import { CloudDownloadOutlined } from "@ant-design/icons";
import AppRouter from "./AppRouter";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { TourProvider } from "./contexts/TourContext";
import { setDownloadCallback } from "./api/sh/config";

const App = () => {
  useEffect(() => {
    setDownloadCallback((filename) => {
      notification.open({
        message: `${filename}`,
        description: "Archivo descargado exitosamente!",
        placement: "topRight",
        icon: <CloudDownloadOutlined style={{ color: "#69802A" }} />,
      });
    });
  }, []);

  return (
    <AuthProvider>
      <DataProvider>
        <TourProvider>
          <AppRouter />
        </TourProvider>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;