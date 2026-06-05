import React from "react";
import { Flex, theme } from "antd";
import ShimmerBar from "../../../shared/ui/SmartSkeleton/ShimmerBar";
import { SkeletonTable } from "../../../shared/ui/SmartSkeleton";

const { useToken } = theme;

const SkeletonTelemetry = () => {
  const { token } = useToken();

  const dayCardStyle = {
    flex: 1,
    minHeight: 100,
    padding: "10px 8px",
    margin: "0 4px",
    borderRadius: token.borderRadiusLG,
    background: token.colorBgContainer,
    border: `1.5px solid ${token.colorBorder}`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  };

  const dayCards = Array.from({ length: 7 }, (_, i) => (
    <div key={i} style={dayCardStyle}>
      <ShimmerBar width={60} height={10} />
      <ShimmerBar width={30} height={22} />
      <ShimmerBar width={45} height={10} />
    </div>
  ));

  const columns = [
    { title: "#", key: "status", width: 40, align: "center" },
    { title: "Punto", key: "pointName", width: 140 },
    { title: "Consumo (m³)", key: "consumption", width: 130, align: "right" },
    { title: "Caudal prom. (L/s)", key: "avg_flow", width: 120, align: "right" },
    { title: "Nivel prom. (m)", key: "avg_level", width: 100, align: "right" },
    { title: "", key: "actions", width: 120, align: "center" },
  ];

  return (
    <div style={{ padding: "8px 0 0" }}>
      <Flex vertical gap={16}>
        <Flex gap={12}>
          {dayCards}
        </Flex>
        <SkeletonTable columns={columns} rows={6} size="small" scroll={{ x: "max-content" }} />
      </Flex>
    </div>
  );
};

export default React.memo(SkeletonTelemetry);
