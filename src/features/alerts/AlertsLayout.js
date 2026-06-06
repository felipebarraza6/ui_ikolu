import React from "react";
import { Row, Col } from "antd";
import { SmartKPICard } from "../../shared/ui";
import { BellOutlined, WarningOutlined, CheckCircleOutlined } from "@ant-design/icons";

/**
 * Layout del módulo de Alertas con KPIs reutilizando SmartKPICard.
 */
const AlertsLayout = ({ kpis, children }) => {
  return (
    <div className="ocean-layout" style={{ padding: 16 }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} md={8}>
          <SmartKPICard
            title="Total Alertas"
            value={kpis.total}
            icon={<BellOutlined />}
            color="#1890ff"
          />
        </Col>
        <Col xs={12} md={8}>
          <SmartKPICard
            title="Activas"
            value={kpis.active}
            icon={<WarningOutlined />}
            color="#faad14"
          />
        </Col>
        <Col xs={12} md={8}>
          <SmartKPICard
            title="Críticas"
            value={kpis.critical}
            icon={<CheckCircleOutlined />}
            color="#ff4d4f"
          />
        </Col>
      </Row>
      {children}
    </div>
  );
};

export default React.memo(AlertsLayout);
