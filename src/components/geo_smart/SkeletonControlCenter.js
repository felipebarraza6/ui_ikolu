import React from "react";
import { Row, Col, Flex, Segmented } from "antd";
import { FaMapMarkerAlt, FaBroadcastTower, FaClipboardCheck, FaExclamationTriangle } from "react-icons/fa";
import { SkeletonKPI } from "../../shared/ui/SmartSkeleton";
import SkeletonTelemetry from "./SkeletonTelemetry";
import SkeletonCompliance from "./SkeletonCompliance";

const SkeletonControlCenter = ({ activeTab = "telemetry" }) => {
  return (
    <div style={{ marginBottom: 24 }}>
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Col xs={12} sm={6} md={6}>
          <SkeletonKPI icon={<FaMapMarkerAlt style={{ fontSize: 16 }} />} label="Total Puntos" />
        </Col>
        <Col xs={12} sm={6} md={6}>
          <SkeletonKPI icon={<FaBroadcastTower style={{ fontSize: 16 }} />} label="Telemetría Activa" />
        </Col>
        <Col xs={12} sm={6} md={6}>
          <SkeletonKPI icon={<FaClipboardCheck style={{ fontSize: 16 }} />} label="Cumplimiento Normativo" />
        </Col>
        <Col xs={12} sm={6} md={6}>
          <SkeletonKPI icon={<FaExclamationTriangle style={{ fontSize: 16 }} />} label="Warnings" />
        </Col>
      </Row>

      <Flex justify="flex-end" style={{ marginBottom: 8 }}>
        <Segmented
          options={[
            { label: "Telemetría", value: "telemetry" },
            { label: "Cumplimiento", value: "compliance" },
          ]}
          value={activeTab}
          disabled
        />
      </Flex>

      {activeTab === "telemetry" ? <SkeletonTelemetry /> : <SkeletonCompliance />}
    </div>
  );
};

export default React.memo(SkeletonControlCenter);
