import React from "react";
import "./skeleton.css";

const ShimmerCircle = ({ size, style = {}, active = true }) => {
  return (
    <div
      className={active ? "smart-shimmer-circle" : undefined}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: "50%",
        background: active ? undefined : "var(--skeleton-bg)",
        ...style,
      }}
    />
  );
};

export default ShimmerCircle;
