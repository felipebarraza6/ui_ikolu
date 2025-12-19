import React from "react";
import { Typography, Flex, Card, Row, Col } from "antd";
import { FaClock, FaWater, FaTint } from "react-icons/fa";
import { WarningOutlined } from "@ant-design/icons";
import moment from "moment";
import { formatSafeDate } from "../../utils/dateFormatter";
import { formatFlow } from "../../utils/numberFormatter";

const { Text } = Typography;

/**
 * Componente para mostrar medidores de caudal estilo gasolina
 * Corregido para mostrar:
 * - Caudal REAL actual (no siempre 0)
 * - Hora correcta del último registro
 * - Máximo caudal del día
 */
const FlowStatusGauges = ({ profiles }) => {
  if (!profiles || profiles.length === 0) {
    return null;
  }

  // Solo perfiles con datos de telemetría HOY
  const activeProfiles = profiles.filter((p) => {
    const hasM1 = p.modules?.m1 && p.modules.m1.flow !== undefined;
    const hasToday = Array.isArray(p.modules?.today) && p.modules.today.length > 0;
    return hasM1 || hasToday;
  });

  if (activeProfiles.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "#888", padding: 24 }}>
        No hay datos de caudal disponibles para mostrar hoy.
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]} justify="center">
      {activeProfiles.map((profile) => {
        // Priorizar m1 para datos actuales
        const m1 = profile.modules?.m1;
        const todayData = profile.modules?.today || [];

        // Obtener caudal actual (priorizar m1, luego último de today)
        let caudal = 0;
        let lastMeasurement = null;

        if (m1 && m1.flow !== undefined && m1.flow !== null) {
          caudal = Number(m1.flow) || 0;
          lastMeasurement = m1.date_time_medition;
        } else if (todayData.length > 0) {
          const last = todayData[todayData.length - 1];
          caudal = Number(last?.flow) || 0;
          lastMeasurement = last?.date_time_medition;
        }

        // Calcular máximo caudal del día
        let maxFlow = caudal;
        if (todayData.length > 0) {
          const flows = todayData.map((d) => Number(d.flow) || 0);
          maxFlow = Math.max(...flows, caudal);
        }

        // Calcular porcentaje para el medidor (caudal actual vs máximo)
        const percentage = maxFlow > 0 ? (caudal / maxFlow) * 100 : 0;

        // Verificar si el caudal ha variado hoy
        const allFlows = todayData.map(d => Number(d.flow) || 0);
        const hasVariation = allFlows.length > 1 && new Set(allFlows).size > 1;

        // Configuración del medidor
        const gaugeColor = caudal === 0 ? "#bdbdbd" : "#1976d2";
        const strokeWidth = 16;
        const radius = 40;
        const circumference = Math.PI * radius;
        const arcLength = (percentage / 100) * circumference;
        const emptyLength = circumference - arcLength;

        // Formatear hora
        const formattedTime = formatSafeDate(lastMeasurement, "DD/MM HH:mm", "Sin datos");

        return (
          <Col
            key={profile.id || profile.title}
            xs={24}
            sm={12}
            md={8}
            lg={6}
            xl={6}
          >
            <Card
              size="small"
              bordered={false}
              style={{
                textAlign: "center",
                background: "white",
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                padding: 16,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                minHeight: 240,
              }}
            >
              {/* Título del punto */}
              <Text
                strong
                style={{
                  fontSize: 14,
                  color: "#1f3461",
                  lineHeight: 1.3,
                  marginBottom: 8,
                  display: "block",
                  minHeight: 40,
                  maxHeight: 40,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={profile.title}
              >
                {profile.title}
              </Text>

              {/* Medidor tipo gasolina */}
              <div
                style={{
                  position: "relative",
                  margin: "12px 0",
                  width: 120,
                  height: 70,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width={120}
                  height={70}
                  viewBox="0 0 120 70"
                  style={{ display: "block" }}
                >
                  {/* Fondo gris */}
                  <path
                    d="M20,60 A40,40 0 0,1 100,60"
                    fill="none"
                    stroke="#e0e0e0"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                  />
                  {/* Agua azul o gris si es 0 */}
                  <path
                    d="M20,60 A40,40 0 0,1 100,60"
                    fill="none"
                    stroke={gaugeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={`${arcLength},${emptyLength}`}
                  />
                </svg>

                {/* Valor del caudal */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                    marginTop: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 700,
                      color: caudal === 0 ? "#bbb" : "#1f3461",
                      lineHeight: 1,
                    }}
                  >
                    {caudal.toFixed(1)}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#888",
                      marginTop: 2,
                      fontWeight: 500,
                    }}
                  >
                    L/s
                  </div>
                </div>
              </div>

              {/* Alerta si no ha variado */}
              {!hasVariation && todayData.length > 1 && (
                <div
                  style={{
                    color: "#fa8c16",
                    fontSize: 11,
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
                  <WarningOutlined style={{ marginRight: 4 }} />
                  Sin variación hoy
                </div>
              )}

              {/* Información adicional */}
              <Flex
                vertical
                gap={4}
                style={{
                  width: "100%",
                  fontSize: 11,
                  color: "#666",
                  marginTop: "auto",
                }}
              >
                <Flex align="center" justify="center" gap={6}>
                  <FaWater style={{ fontSize: 12, color: "#1976d2" }} />
                  <Text style={{ fontSize: 11, color: "#666" }}>
                    Máx: <strong style={{ color: "#1f3461" }}>{formatFlow(maxFlow)}</strong> L/s
                  </Text>
                </Flex>

                <Flex align="center" justify="center" gap={6}>
                  <FaClock style={{ fontSize: 12, color: "#1976d2" }} />
                  <Text style={{ fontSize: 11, color: "#666" }}>
                    {formattedTime}
                  </Text>
                </Flex>

                {todayData.length > 0 && (
                  <Flex align="center" justify="center" gap={6}>
                    <FaTint style={{ fontSize: 12, color: "#1976d2" }} />
                    <Text style={{ fontSize: 11, color: "#666" }}>
                      {todayData.length} registros
                    </Text>
                  </Flex>
                )}
              </Flex>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default FlowStatusGauges;
