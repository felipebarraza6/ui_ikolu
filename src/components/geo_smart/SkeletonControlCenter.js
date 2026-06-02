import React from "react";
import { Row, Col, Flex } from "antd";
import { FaMapMarkerAlt, FaBroadcastTower, FaClipboardCheck, FaExclamationTriangle } from "react-icons/fa";
import { SkeletonKPI, SkeletonCalendarDay, SkeletonTable } from "../../shared/ui/SmartSkeleton";
import "./skeleton.css";

const SkeletonControlCenter = () => {
  return (
    <div style={{ marginBottom: 24 }}>
      {/* KPI Cards */}
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Col xs={12} sm={6} md={6}>
          <SkeletonKPI icon={<FaMapMarkerAlt style={{ fontSize: 16, color: "rgba(255,255,255,0.8)" }} />} label="Total Puntos" />
        </Col>
        <Col xs={12} sm={6} md={6}>
          <SkeletonKPI icon={<FaBroadcastTower style={{ fontSize: 16, color: "rgba(255,255,255,0.8)" }} />} label="Telemetría Activa" />
        </Col>
        <Col xs={12} sm={6} md={6}>
          <SkeletonKPI icon={<FaClipboardCheck style={{ fontSize: 16, color: "rgba(255,255,255,0.8)" }} />} label="Cumplimiento Normativo" />
        </Col>
        <Col xs={12} sm={6} md={6}>
          <SkeletonKPI icon={<FaExclamationTriangle style={{ fontSize: 16, color: "rgba(255,255,255,0.8)" }} />} label="Warnings" />
        </Col>
      </Row>

      {/* Segmented Tabs */}
      <Flex justify="flex-end" style={{ marginBottom: 8 }}>
        <div style={{
          display: "flex",
          gap: 4,
          padding: "2px",
          borderRadius: 6,
          background: "var(--skeleton-surface)",
          border: "1px solid var(--skeleton-border)",
        }}>
          {[
            { active: true, label: "Telemetría" },
            { active: false, label: "Cumplimiento" },
          ].map((item, i) => (
            <div 
              key={i}
              style={{ 
                padding: "6px 16px", 
                borderRadius: 4, 
                background: item.active ? "var(--skeleton-primary)" : "transparent",
                minWidth: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                className="smart-shimmer-bar"
                style={{
                  width: "100%",
                  height: 16,
                  borderRadius: 3,
                  background: item.active
                    ? "linear-gradient(90deg, rgba(255,255,255,0.15) 25%, rgba(255,255,255,0.3) 37%, rgba(255,255,255,0.15) 63%)"
                    : undefined,
                  backgroundSize: "200% 100%",
                  animation: "smart-shimmer 1.4s ease-in-out infinite",
                }}
              />
            </div>
          ))}
        </div>
      </Flex>

      {/* Calendar Days */}
      <Flex gap={12} style={{ marginBottom: 16 }}>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <SkeletonCalendarDay key={i} active={i === 7} />
        ))}
      </Flex>

      {/* Telemetry Table */}
      <SkeletonTable
        columns={[
          { title: "#", key: "status", width: 40, align: "center" },
          { title: "Punto", key: "point", width: 140 },
          { title: "Consumo (m³)", key: "consumption", width: 130, align: "right" },
          { title: "Caudal prom. (L/s)", key: "flow", width: 120, align: "right" },
          { title: "Nivel prom. (m)", key: "level", width: 100, align: "right" },
          { title: "", key: "actions", width: 120, align: "center" },
        ]}
        rows={5}
      />
    </div>
  );
};

export default React.memo(SkeletonControlCenter);
