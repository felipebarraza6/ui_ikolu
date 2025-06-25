import React, { useState, useContext } from "react";
import { Space, Modal, Typography, Button } from "antd";
import Registers from "./Registers";
import CodeQR from "./CodeQR";
import DgaCompliance from "./DgaCompliance";
import { useResponsive } from "../../hooks/useResponsive";
import { AppContext } from "../../App";
import { BarChartOutlined } from "@ant-design/icons";

const { Title } = Typography;

/**
 * 📊 DGA RESPONSIVO
 *
 * Estructura:
 * - Indicadores arriba (registros totales, caudal autorizado, último registro, estado QR)
 * - Información del punto de captación DGA abajo
 * - Optimizado para móvil y desktop
 */
const ResponsiveDga = () => {
  const { isMobile } = useResponsive();
  const { state } = useContext(AppContext);
  const [isDiagnosticModalVisible, setIsDiagnosticModalVisible] =
    useState(false);

  // Obtener datos desde el perfil (módulo m2)
  const dataDga = state.selected_profile?.modules?.m2 || [];

  const showDiagnosticModal = () => {
    setIsDiagnosticModalVisible(true);
  };

  const handleCancelDiagnosticModal = () => {
    setIsDiagnosticModalVisible(false);
  };

  return (
    <div style={{ maxWidth: "1600px", margin: "24px auto", padding: "0 24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <CodeQR onDiagnoseClick={showDiagnosticModal} />
        <Registers />
      </Space>
      <Modal
        title={
          <Space>
            <BarChartOutlined />
            <span>Diagnóstico Inteligente DGA - MEE</span>
          </Space>
        }
        visible={isDiagnosticModalVisible}
        onCancel={() => setIsDiagnosticModalVisible(false)}
        footer={null}
        width="95%"
        style={{ top: 20 }}
        bodyStyle={{
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#f5f5f5",
        }}
      >
        <DgaCompliance dataDga={dataDga} />
      </Modal>
    </div>
  );
};

export default ResponsiveDga;
