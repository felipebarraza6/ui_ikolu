import React from "react";
import { Skeleton } from "antd";

const SkeletonKPI = ({ gradient, variant = "ocean", style = {} }) => {
  const isVoid = variant === "void";
  return (
    <div
      style={{
        background: isVoid ? "rgba(255,255,255,0.05)" : (gradient || "#1a1a1a"),
        borderRadius: isVoid ? 16 : 24,
        padding: "20px 16px 16px 16px",
        border: isVoid ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.08)",
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
      <Skeleton.Input active size="small" style={{ width: 40, height: 22 }} />
    </div>
  );
};

export default SkeletonKPI;
