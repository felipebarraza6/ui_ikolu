import React from "react";
import { Flex } from "antd";
import { SkeletonTable } from "../../../../shared/ui/SmartSkeleton";

const SkeletonCompliance = () => {
  return (
    <div style={{ marginBottom: 24 }}>
      {/* Compliance Table - Sin columna Estado */}
      <SkeletonTable
        columns={[
          { title: "Punto", key: "point_name", width: 100 },
          { title: "Tipo", key: "type", width: 100, align: "center" },
          { title: "Consumo", key: "consumption", width: 120, align: "center" },
          { title: "Caudal", key: "flow", width: 120, align: "center" },
          { title: "Nivel F.", key: "water_table", width: 85, align: "right" },
          { title: "Auditoría", key: "audit", width: 140, align: "center" },
          { title: "", key: "actions", width: 110, align: "center" },
        ]}
        rows={5}
      />
    </div>
  );
};

export default React.memo(SkeletonCompliance);
