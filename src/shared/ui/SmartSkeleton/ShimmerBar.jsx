import React from "react";
import "./skeleton.css";

const ShimmerBar = ({ width, height, style = {}, active = true }) => {
  return (
    <div
      className={active ? "smart-shimmer-bar" : undefined}
      style={{
        width,
        height,
        borderRadius: 4,
        background: active ? undefined : "var(--skeleton-bg)",
        ...style,
      }}
    />
  );
};

export default ShimmerBar;
