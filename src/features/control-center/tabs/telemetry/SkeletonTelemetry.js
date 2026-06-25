import React from "react";
import { Flex } from "antd";
import { SkeletonCalendarDay, SkeletonTable } from "../../../../shared/ui/SmartSkeleton";

const SkeletonTelemetry = () => {
  return (
    <div style={{ marginBottom: 24 }}>
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
          { title: "Punto", key: "pointName", width: 140 },
          { title: "Consumo (m³)", key: "consumption", width: 130, align: "right" },
          { title: "Caudal prom. (L/s)", key: "avg_flow", width: 120, align: "right" },
          { title: "Nivel prom. (m)", key: "avg_level", width: 100, align: "right" },
          { title: "", key: "actions", width: 120, align: "center" },
        ]}
        rows={10}
      />
    </div>
  );
};

export default React.memo(SkeletonTelemetry);
