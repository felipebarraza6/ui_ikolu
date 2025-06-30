import React from "react";
import { Progress, Typography, Flex, theme } from "antd";
import moment from "moment";

const { Text } = Typography;
const { useToken } = theme;

const FlowStatusGauges = ({ profiles }) => {
  const { token } = useToken();

  if (!profiles || profiles.length === 0) {
    return null;
  }

  const activeProfiles = profiles.filter(
    (p) => p.modules?.m1?.flow !== undefined
  );

  return (
    <Flex wrap="wrap" gap="middle" justify="space-between">
      {activeProfiles.map((profile) => {
        const caudal = Number(profile.modules?.m1?.flow ?? 0);
        const todayData = profile.modules?.m22 || [];

        // Validación robusta de datos m22
        const validFlowData = todayData.filter(
          (d) =>
            d && typeof d === "object" && "flow" in d && !isNaN(Number(d.flow))
        );

        const maxFlow = Math.max(
          ...validFlowData.map((d) => Number(d.flow) || 0),
          0
        );
        const lastMeasurement = profile.modules?.m1?.date_time_medition;

        const percentage = maxFlow > 0 ? (caudal / maxFlow) * 100 : 0;

        // Logs para debugging (solo en desarrollo)
        if (process.env.NODE_ENV === "development") {
          console.log(`🔍 ${profile.title}:`, {
            caudal,
            maxFlow,
            percentage: percentage.toFixed(2),
            validDataCount: validFlowData.length,
            totalDataCount: todayData.length,
          });
        }

        return (
          <div key={profile.id}>
            <Flex vertical align="center" justify="space-between" gap="small">
              <Progress
                type="dashboard"
                percent={percentage}
                status="active"
                strokeColor={token.colorPrimary}
                format={() => `${caudal.toFixed(2)} l/s`}
              />
              <Text strong>{profile.title}</Text>
              <Text
                type="secondary"
                style={{ fontSize: "0.75rem", textAlign: "center" }}
              >
                {lastMeasurement
                  ? moment(lastMeasurement).format("YYYY-MM-DD HH:mm")
                  : "Sin fecha"}
              </Text>
              {/* Información adicional para validación */}
              <Text
                type="secondary"
                style={{ fontSize: "0.7rem", textAlign: "center" }}
              >
                Max: {maxFlow.toFixed(2)} l/s | Datos: {validFlowData.length}
              </Text>
            </Flex>
          </div>
        );
      })}
    </Flex>
  );
};

export default FlowStatusGauges;
