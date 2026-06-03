import React from "react";
import { Flex } from "antd";
import ShimmerBar from "./ShimmerBar";
import ShimmerCircle from "./ShimmerCircle";
import "./skeleton.css";

const SkeletonKPI = ({ icon, label, style = {} }) => {
  return (
    <div className="skeleton-kpi-card" style={style}>
      <Flex vertical align="center" gap={8} style={{ position: "relative", zIndex: 1 }}>
        {icon && (
          <div style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 4,
            marginBottom: 8,
          }}>
            {icon}
          </div>
        )}
        <div style={{
          width: 80,
          height: 12,
          background: "rgba(255, 255, 255, 0.3)",
          borderRadius: 4,
        }} />
        <ShimmerBar width={40} height={24} style={{ background: "rgba(255, 255, 255, 0.4)" }} />
      </Flex>
    </div>
  );
};

export default SkeletonKPI;
