import React from "react";
import { Flex, Pagination, theme } from "antd";
import { SkeletonTable } from "../../../../shared/ui/SmartSkeleton";

const { useToken } = theme;

const SkeletonCompliance = ({ pageSize = 10 }) => {
  const { token } = useToken();
  return (
    <div style={{ marginBottom: 24 }}>
      {/* Toolbar skeleton */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={8} style={{ marginBottom: 12 }}>
        <div
          style={{
            width: 180,
            height: 18,
            borderRadius: token.borderRadiusSM,
            background: token.colorFillSecondary,
          }}
        />
        <div
          style={{
            width: 260,
            height: 28,
            borderRadius: token.borderRadiusSM,
            background: token.colorFillSecondary,
          }}
        />
      </Flex>

      {/* Compliance Table skeleton */}
      <SkeletonTable
        columns={[
          { title: "Punto", key: "point_name", width: 100 },
          { title: "Tipo", key: "type", width: 100, align: "center" },
          { title: "Consumo", key: "consumption", width: 120, align: "center" },
          { title: "Caudal", key: "flow", width: 120, align: "center" },
          { title: "Nivel F.", key: "water_table", width: 85, align: "right" },
          { title: "Auditoría", key: "audit", width: 140, align: "center" },
          { title: "Cumplimiento", key: "compliance_toggle", width: 110, align: "center" },
          { title: "", key: "actions", width: 110, align: "center" },
        ]}
        rows={pageSize}
      />

      {/* Pagination skeleton */}
      <Flex justify="flex-end" style={{ marginTop: 12 }}>
        <Pagination
          current={1}
          pageSize={pageSize}
          total={pageSize}
          disabled
          showSizeChanger
          size="small"
        />
      </Flex>
    </div>
  );
};

export default React.memo(SkeletonCompliance);
