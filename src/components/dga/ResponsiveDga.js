import React, { useEffect, useContext, useState } from "react";
import { Card, Typography, Row, Col, Statistic, Flex } from "antd";
import {
  FileTextOutlined,
  QrcodeOutlined,
  DropboxOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import QueueAnim from "rc-queue-anim";
import Registers from "./Registers";
import { AppContext } from "../../App";
import CodeQR from "./CodeQR";
import {
  formatInteger,
  formatFlow,
  formatLevel,
} from "../../utils/numberFormatter";

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
  // 📱 Detectar móvil
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const { state } = useContext(AppContext);
  const dataDga = state.selected_profile.modules.m2;
  const profileDga = state.selected_profile.dga;

  // Detectar cambios de pantalla
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calcular estadísticas
  const totalRegistros = dataDga ? dataDga.length : 0;
  const ultimoRegistro =
    dataDga && dataDga.length > 0 ? dataDga[dataDga.length - 1] : null;
  const caudalAutorizado = profileDga ? profileDga.flow_granted_dga : 0;
  const totalAutorizado = profileDga ? profileDga.total_granted_dga : 0;

  return (
    <div style={{ padding: isMobile ? "10px" : "0px" }}>
      <QueueAnim delay={300} type={["top", "left"]}>
        <div key={"dga"}>
          {isMobile ? (
            // 📱 LAYOUT MÓVIL: Stack vertical
            <div>
              {/* Registros arriba */}
              <Card style={{ marginBottom: 16 }}>
                <Registers dataDga={dataDga} />
              </Card>

              {/* QR abajo */}
              <Card
                style={{
                  background: "rgb(0, 111, 179)",
                  borderRadius: "12px",
                }}
                bodyStyle={{ padding: "16px" }}
              >
                <CodeQR dataProfile={profileDga} />
              </Card>
            </div>
          ) : (
            // 💻 LAYOUT DESKTOP: Side by side
            <Flex align="top" justify="space-between" vertical={isMobile}>
              <Registers dataDga={dataDga} />
              <CodeQR dataProfile={profileDga} />
            </Flex>
          )}
        </div>
      </QueueAnim>
    </div>
  );
};

export default ResponsiveDga;
