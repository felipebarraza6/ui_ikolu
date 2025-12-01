import React, { useState, useContext, useEffect } from "react";
import { Space, Modal } from "antd";
import Registers from "./Registers";
import CodeQR from "./CodeQR";
import DgaCompliance from "./DgaCompliance";
import { useResponsive } from "../../hooks/useResponsive";
import { AppContext } from "../../App";
import { BarChartOutlined } from "@ant-design/icons";
import sh from "../../api/sh/endpoints";

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

  const [dataDga, setDataDga] = useState([]);
  const [loading, setLoading] = useState(true);

  // Siempre obtener datos frescos de la API, no del localStorage
  useEffect(() => {
    const fetchDgaData = async () => {
      const profileId = state.selected_profile?.id;
      if (!profileId) {
        setDataDga([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Obtener perfil completo desde la API para tener datos actualizados
        const userProfileResponse = await sh.get_profile();
        const allProfiles = userProfileResponse?.user?.catchment_points ?? [];
        const selected_profile_data =
          allProfiles.find((p) => p.id === profileId) || allProfiles[0] || {};

        // Actualizar el estado con datos frescos
        if (selected_profile_data) {
          dispatch({
            type: "UPDATE",
            payload: {
              user: userProfileResponse.user,
              selected_profile: selected_profile_data,
            },
          });

          // Obtener datos del módulo m2 directamente del perfil actualizado
          const freshM2Data = selected_profile_data?.modules?.m2 || [];
          setDataDga(freshM2Data);
        }
      } catch (error) {
        console.error("Error al cargar datos DGA desde la API:", error);
        setDataDga([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDgaData();

    // Configurar actualización periódica cada 5 minutos
    const intervalId = setInterval(() => {
      fetchDgaData();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [state.selected_profile?.id, dispatch]);

  const showDiagnosticModal = () => {
    setIsDiagnosticModalVisible(true);
  };

  const handleCancelDiagnosticModal = () => {
    setIsDiagnosticModalVisible(false);
  };

  return (
    <div
      style={{
        maxWidth: "1600px",
        margin: isMobile ? "12px auto" : "0 auto",
        padding: isMobile ? "0 8px" : "0",
      }}
    >
      <Space
        direction="vertical"
        size={isMobile ? "middle" : "large"}
        style={{ width: "100%" }}
      >
        <CodeQR onDiagnoseClick={showDiagnosticModal} />
        <Registers dataDga={dataDga} loading={loading} />
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
        <DgaCompliance dataDga={dataDga || []} />
      </Modal>
    </div>
  );
};

export default ResponsiveDga;
