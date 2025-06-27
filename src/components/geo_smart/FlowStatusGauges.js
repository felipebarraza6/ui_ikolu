import React from "react";
import { Row, Col, Card, Progress, Typography, Flex, theme } from "antd";
import moment from "moment";
import { FaArrowUpFromGroundWater } from "react-icons/fa6";

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
        const flowGranted = Number(profile.dga?.flow_granted_dga ?? 0);
        const lastMeasurement = profile.modules?.m1?.date_time_medition;

        const percentage = flowGranted > 0 ? (caudal / flowGranted) * 100 : 0;

        return (
          <div>
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
            </Flex>
          </div>
        );
      })}
    </Flex>
  );
};

export default FlowStatusGauges;
