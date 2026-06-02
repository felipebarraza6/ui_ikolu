import React, { memo } from "react";
import { Row, Col, Flex, Typography, Tag, theme, Segmented } from "antd";
import {
  FaMapMarkerAlt,
  FaBroadcastTower,
  FaClipboardCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
import KPICard from "./KPICard";
import ControlCenterChat from "./ControlCenterChat";
import { ikoluTokens, kpiGradients } from "../../theme";

const { Text } = Typography;
const { useToken } = theme;

const ControlCenterLayout = memo(({
  overview,
  points,
  warningsList,
  warningsRaw,
  chatQuota,
  activeTab,
  onTabChange,
  onWarningClick,
  children,
}) => {
  const { token } = useToken();

  return (
    <div style={{ marginBottom: 24 }}>
      {/* KPIs */}
      <Row id="cc-kpi-cards" gutter={[12, 12]} style={{ marginBottom: 8 }}>
        <Col xs={12} sm={6} md={6}>
          <KPICard
            icon={<FaMapMarkerAlt style={{ fontSize: 20, color: ikoluTokens.colorWhite }} />}
            label="Total Puntos"
            value={overview.total_points || 0}
            gradient={kpiGradients.primary}
          />
        </Col>
        <Col xs={12} sm={6} md={6}>
          <KPICard
            icon={<FaBroadcastTower style={{ fontSize: 20, color: ikoluTokens.colorWhite }} />}
            label="Telemetría Activa"
            value={`${overview.points_with_telemetry || 0}`}
            suffix={`/${overview.total_points || 0}`}
            gradient={kpiGradients.secondary}
          />
        </Col>
        <Col xs={12} sm={6} md={6}>
          <KPICard
            icon={<FaClipboardCheck style={{ fontSize: 20, color: ikoluTokens.colorWhite }} />}
            label="Cumplimiento Normativo"
            value={overview.points_with_compliance || 0}
            gradient={kpiGradients.secondary}
          />
        </Col>
        <Col xs={12} sm={6} md={6}>
          <KPICard
            icon={<FaExclamationTriangle style={{ fontSize: 20, color: ikoluTokens.colorWhite }} />}
            label="Warnings"
            value={warningsList.length}
            gradient={kpiGradients.secondary}
            onClick={
              warningsList.length > 0
                ? () => {
                    const firstPoint = Object.keys(warningsRaw)[0];
                    if (firstPoint) onWarningClick(firstPoint);
                  }
                : undefined
            }
          />
        </Col>
      </Row>

      {/* Chat IA */}
      <ControlCenterChat points={points} chatQuota={chatQuota} />

      {/* Tabs + Children (Outlet) */}
      <div style={{ marginTop: 10 }}>
        <Flex justify="flex-end" style={{ marginBottom: 8 }}>
          <Segmented
            options={[
              {
                value: "telemetry",
                label: (
                  <Flex align="center" gap={6}>
                    <FaBroadcastTower style={{ fontSize: 14 }} />
                    <span>Telemetría</span>
                  </Flex>
                ),
              },
              {
                value: "compliance",
                label: (
                  <Flex align="center" gap={6}>
                    <FaClipboardCheck style={{ fontSize: 14 }} />
                    <span>Cumplimiento</span>
                  </Flex>
                ),
              },
            ]}
            value={activeTab}
            onChange={onTabChange}
            style={{ background: token.colorBgLayout }}
          />
        </Flex>

        {children}
      </div>
    </div>
  );
});

ControlCenterLayout.displayName = "ControlCenterLayout";

export default ControlCenterLayout;
