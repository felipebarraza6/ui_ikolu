import React from "react";
import { Skeleton } from "antd";
import { useAppTheme } from "../../../contexts/ThemeContext";

const SkeletonKPI = ({ style = {} }) => {
  const { isDark } = useAppTheme();

  return (
    <div
      style={{
        background: isDark ? "#1a1a1a" : "#FFFFFF",
        borderRadius: 8,
        padding: "20px 16px",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#F0F0F0"}`,
        boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        ...style,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <Skeleton.Input
            active
            size="small"
            style={{ width: 80, marginBottom: 16 }}
          />
          <Skeleton.Input
            active
            size="default"
            style={{ width: 60, height: 32 }}
          />
        </div>
        <Skeleton.Avatar active size={40} shape="square" />
      </div>
    </div>
  );
};

export default SkeletonKPI;
