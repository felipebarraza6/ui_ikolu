import React, { useState, useContext, useEffect } from "react";
import { Space, Modal, Typography, Button } from "antd";
import Registers from "./Registers";
import CodeQR from "./CodeQR";
import DgaCompliance from "./DgaCompliance";
import { useResponsive } from "../../hooks/useResponsive";
import { AppContext } from "../../App";
import { BarChartOutlined } from "@ant-design/icons";
import sh from "../../api/sh/endpoints";

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
  const { state, dispatch } = useContext(AppContext);
  const [isDiagnosticModalVisible, setIsDiagnosticModalVisible] =
    useState(false);

  // Obtener datos desde el perfil (módulo m2)
  const dataDga = state.selected_profile?.modules?.m2 || [];

  // Recargar datos del perfil al montar el componente
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const profileId = state.selected_profile?.id;
        if (!profileId) return;

        const userProfileResponse = await sh.get_profile();
        const allProfiles = userProfileResponse?.user?.catchment_points ?? [];
        const selected_profile_data =
          allProfiles.find((p) => p.id === profileId) || allProfiles[0] || {};

        // Actualizar el perfil con los datos más recientes
        dispatch({
          type: "UPDATE",
          payload: {
            user: userProfileResponse.user,
            selected_profile: selected_profile_data,
          },
        });
      } catch (error) {
        console.error("Error al cargar datos del perfil DGA:", error);
      }
    };

    loadProfileData();
  }, [state.selected_profile?.id]);

  const showDiagnosticModal = () => {
    setIsDiagnosticModalVisible(true);
  };

  const handleCancelDiagnosticModal = () => {
    setIsDiagnosticModalVisible(false);
  };

  return (
    <div style={{ maxWidth: "1600px", margin: isMobile ? "12px auto" : "0 auto", padding: isMobile ? "0 8px" : "0" }}>
      <Space direction="vertical" size={isMobile ? "middle" : "large"} style={{ width: "100%" }}>
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
        centered
        bodyStyle={{
          maxHeight: "80vh",
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
