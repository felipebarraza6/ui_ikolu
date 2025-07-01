import React from "react";
import { Typography, Flex, Card } from "antd";
import { FaClock, FaWater } from "react-icons/fa";
import moment from "moment";

const { Text } = Typography;

const FlowStatusGauges = ({ profiles }) => {
  if (!profiles || profiles.length === 0) {
    return null;
  }

  // Solo perfiles con datos en modules.today
  const activeProfiles = profiles.filter(
    (p) => Array.isArray(p.modules?.today) && p.modules.today.length > 0
  );

  if (activeProfiles.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "#888", padding: 24 }}>
        No hay datos de caudal para mostrar hoy.
      </div>
    );
  }

  return (
    <Flex wrap="wrap" gap={24} justify="flex-start">
      {activeProfiles.map((profile) => {
        const todayData = profile.modules.today;
        const last = todayData[todayData.length - 1];
        const caudal = Number(last?.flow) || 0;
        const maxFlow = Math.max(
          ...todayData.map((d) => Number(d.flow) || 0),
          0
        );
        const lastMeasurement = last?.date_time_medition;
        const percentage = maxFlow > 0 ? (caudal / maxFlow) * 100 : 0;
        const allEqual = todayData.every((d) => Number(d.flow) === caudal);

        // Medidor azul siempre
        const gaugeColor = "#1976d2";
        const strokeWidth = 16;
        const radius = 48;
        const centerX = 60;
        const centerY = 60;
        const circumference = Math.PI * radius;
        const arcLength = (percentage / 100) * circumference;
        const emptyLength = circumference - arcLength;

        return (
          <Flex wrap="wrap" gap={24} justify="center">
            <Card
              size="small"
              bordered={false}
              style={{
                textAlign: "center",
                background: "white",
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                padding: 16,
                width: 200,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Título */}
              <Text
                strong
                style={{
                  fontSize: 13,
                  color: "#1f3461",
                  lineHeight: 1.2,
                  marginBottom: 5,
                  display: "block",
                  minHeight: 24,
                }}
              >
                {profile.title}
              </Text>

              {/* Medidor tipo gasolina (media luna completa, azul) */}
              <div
                style={{
                  position: "relative",
                  margin: "8px 0 0 0",
                  width: 120,
                  height: 70,
                }}
              >
                <svg
                  width={120}
                  height={70}
                  viewBox="0 0 120 70"
                  style={{ display: "block", margin: "0 auto" }}
                >
                  {/* Fondo gris */}
                  <path
                    d="M20,60 A40,40 0 0,1 100,60"
                    fill="none"
                    stroke="#e0e0e0"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                  />
                  {/* Agua azul */}
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
                    top: 38,
                    left: 0,
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: caudal === 0 ? "#bbb" : "#1f3461",
                      lineHeight: 1,
                    }}
                  >
                    {caudal.toFixed(1)}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "#888",
                      marginTop: 2,
                    }}
                  >
                    L/s
                  </div>
                </div>
              </div>

              {/* Mensaje si el caudal no ha cambiado hoy */}
              {allEqual && todayData.length > 1 && (
                <div style={{ color: "#888", fontSize: 11, marginTop: 6 }}>
                  El caudal no ha cambiado hoy
                </div>
              )}

              {/* Información adicional */}
              <div style={{ fontSize: 11, color: "#888", marginTop: 8 }}>
                <div style={{ marginTop: 20 }}>
                  <FaWater style={{ marginRight: 2, fontSize: 10 }} />
                  Máx: {maxFlow.toFixed(1)}
                </div>
                <div>
                  <FaClock style={{ marginRight: 2, fontSize: 10 }} />
                  {lastMeasurement
                    ? moment(lastMeasurement).format("HH:mm")
                    : "-"}
                </div>
              </div>
            </Card>
          </Flex>
        );
      })}
    </Flex>
  );
};

export default FlowStatusGauges;
