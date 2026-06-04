import React from "react";
import { Skeleton } from "antd";
import { useAppTheme } from "../../../contexts/ThemeContext";

const SkeletonKPI = ({ style = {} }) => {
  const { isDark } = useAppTheme();

  return (
    <div
      style={{
        background: isDark ? "#1a1a1a" : "#FFFFFF",
        borderRadius: 24,
        padding: "20px 16px 16px 16px",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#F0F0F0"}`,
        boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
        minHeight: 88,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        ...style,
      }}
    >
      <Skeleton.Avatar active size={40} shape="circle" />
      <Skeleton.Input active size="small" style={{ width: 80 }} />
      <Skeleton.Input active size="default" style={{ width: 60, height: 28 }} />
    </div>
  );
};

export default SkeletonKPI;
