import React, { memo } from "react";
import { Row, Col, Flex, Typography, theme, Segmented } from "antd";
import {
  FaMapMarkerAlt,
  FaBroadcastTower,
  FaClipboardCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
import { SmartKPICard } from "../../shared/ui";
import { smarthydro } from "../../theme/smarthydro.tokens";
import ControlCenterChat from "./ControlCenterChat";

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
    <div style={{ 
      marginBottom: 24,
      padding: "0 8px",
    }}>
      {/* KPIs */}
      <Row id="cc-kpi-cards" gutter={[16, 16]} style={{ marginBottom: 24 }} className="fade-in">
        <Col xs={12} sm={6} md={6}>
          <div className="card-lift">
            <SmartKPICard
              icon={<FaMapMarkerAlt style={{ fontSize: 18, color: "#90E0EF" }} />}
              label="Total Puntos"
              value={overview.total_points || 0}
              gradient={smarthydro.gradients.oceanDeep}
            />
          </div>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <div className="card-lift">
            <SmartKPICard
              icon={<FaBroadcastTower style={{ fontSize: 18, color: "#90E0EF" }} />}
              label="Telemetría Activa"
              value={`${overview.points_with_telemetry || 0}`}
              suffix={`/${overview.total_points || 0}`}
              gradient={smarthydro.gradients.cyan}
            />
          </div>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <div className="card-lift">
            <SmartKPICard
              icon={<FaClipboardCheck style={{ fontSize: 18, color: "#90E0EF" }} />}
              label="Cumplimiento Normativo"
              value={overview.points_with_compliance || 0}
              gradient={smarthydro.gradients.teal}
            />
          </div>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <div className="card-lift">
            <SmartKPICard
              icon={<FaExclamationTriangle style={{ fontSize: 18, color: "#90E0EF" }} />}
              label="Warnings"
              value={warningsList.length}
              gradient={smarthydro.gradients.coral}
              onClick={
                warningsList.length > 0
                  ? () => {
                      const firstPoint = Object.keys(warningsRaw)[0];
                      if (firstPoint) onWarningClick(firstPoint);
                    }
                  : undefined
              }
            />
          </div>
        </Col>
      </Row>

      {/* Chat IA */}
      <ControlCenterChat points={points} chatQuota={chatQuota} />

      {/* Tabs + Children (Outlet) */}
      <div 
        className="glass"
        style={{ 
          marginTop: 24,
          padding: 24,
          borderRadius: 24,
        }}
      >
        <Flex justify="flex-end" style={{ marginBottom: 16 }}>
          <Segmented
            options={[
              {
                value: "telemetry",
                label: (
                  <Flex align="center" gap={8}>
                    <FaBroadcastTower style={{ fontSize: 14, color: "#90E0EF" }} />
                    <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>Telemetría</span>
                  </Flex>
                ),
              },
              {
                value: "compliance",
                label: (
                  <Flex align="center" gap={8}>
                    <FaClipboardCheck style={{ fontSize: 14, color: "#90E0EF" }} />
                    <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>Cumplimiento</span>
                  </Flex>
                ),
              },
            ]}
            value={activeTab}
            onChange={onTabChange}
            style={{ 
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: 12,
              padding: 4,
            }}
          />
        </Flex>

        {children}
      </div>
    </div>
  );
});

ControlCenterLayout.displayName = "ControlCenterLayout";

export default ControlCenterLayout;
