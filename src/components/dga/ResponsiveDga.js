import React, { useState, useContext, useEffect } from "react";
import { Space, Drawer, Spin, Flex, Button } from "antd";
import Registers from "./Registers";
import CodeQR from "./CodeQR";
import DgaCompliance from "./DgaCompliance";
import { useResponsive } from "../../hooks/useResponsive";
import { AppContext } from "../../App";
import { BarChartOutlined, CloseOutlined } from "@ant-design/icons";

/**
 * 📊 DGA RESPONSIVO — Rediseñado
 */
const ResponsiveDga = () => {
  const { isMobile } = useResponsive();
  const { state } = useContext(AppContext);
  const [isDiagnosticVisible, setIsDiagnosticVisible] = useState(false);
  const [dataDga, setDataDga] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profileId = state.selected_profile?.id;
    if (!profileId) {
      setDataDga([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Usar datos del perfil ya cargados en contexto (más rápido)
    const m2Data = state.selected_profile?.modules?.m2 || [];
    setDataDga(m2Data);
    setLoading(false);
  }, [state.selected_profile]);

  return (
    <div
      style={{
        maxWidth: "1600px",
        margin: isMobile ? "12px auto" : "0 auto",
        padding: isMobile ? "0 8px" : "0",
        minHeight: "90vh",
      }}
    >
      <Space
        direction="vertical"
        size={isMobile ? "middle" : "large"}
        style={{ width: "100%" }}
      >
        {loading ? (
          <Flex justify="center" align="center" style={{ minHeight: 300 }}>
            <Spin size="large" />
          </Flex>
        ) : (
          <>
            <CodeQR onDiagnoseClick={() => setIsDiagnosticVisible(true)} />
            <Registers dataDga={dataDga} loading={loading} />
          </>
        )}
      </Space>

      <Drawer
        title={
          <span style={{ color: "#BDC00C", fontWeight: 700, fontSize: 17 }}>
            DIAGNÓSTICO INTELIGENTE DGA - MEE
          </span>
        }
        placement="right"
        onClose={() => setIsDiagnosticVisible(false)}
        open={isDiagnosticVisible}
        width={isMobile ? "100%" : 900}
        styles={{
          body: { background: "#f5f5f5", padding: 0 },
          header: {
            background: "#0f152e",
            borderBottom: "1px solid rgba(255,107,53,0.25)",
          },
          mask: { background: "rgba(0,0,0,0.75)" },
        }}
        closeIcon={<span style={{ color: "#BDC00C", fontSize: 18 }}>✕</span>}
        extra={
          <Button
            icon={<CloseOutlined />}
            onClick={() => setIsDiagnosticVisible(false)}
            style={{
              background: "transparent",
              borderColor: "rgba(255,255,255,0.3)",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            Cerrar
          </Button>
        }
      >
        <DgaCompliance dataDga={dataDga || []} />
      </Drawer>
    </div>
  );
};

export default ResponsiveDga;
