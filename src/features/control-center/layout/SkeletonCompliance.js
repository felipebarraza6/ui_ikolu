import React from "react";
import { Flex, theme } from "antd";
import ShimmerBar from "../../../shared/ui/SmartSkeleton/ShimmerBar";
import { SkeletonTable } from "../../../shared/ui/SmartSkeleton";

const { useToken } = theme;

const SkeletonCompliance = () => {
  const { token } = useToken();

  const columns = [
    { title: "Punto", key: "point_name", width: 100 },
    { title: "Tipo", key: "type", width: 100, align: "center" },
    { title: "Consumo", key: "consumption", width: 120, align: "center" },
    { title: "Caudal", key: "flow", width: 120, align: "center" },
    { title: "Nivel F.", key: "water_table", width: 85, align: "right" },
    { title: "Auditoría", key: "audit", width: 140, align: "center" },
    { title: "", key: "actions", width: 110, align: "center" },
  ];

  return (
    <Flex vertical gap={12} style={{ padding: "8px 0 0" }}>
      <ShimmerBar width={360} height={32} style={{ borderRadius: token.borderRadius }} />
      <SkeletonTable columns={columns} rows={5} size="small" scroll={{ x: "max-content" }} />
    </Flex>
  );
};

export default React.memo(SkeletonCompliance);
