import React from "react";
import ShimmerBar from "./ShimmerBar";
import "./skeleton.css";

const SkeletonCalendarDay = ({ active = false, style = {} }) => {
  return (
    <div
      className={`skeleton-calendar-day ${active ? "active" : ""}`}
      style={style}
    >
      <ShimmerBar width={50} height={12} active={false} style={{ background: active ? "rgba(255,255,255,0.3)" : "var(--skeleton-bg)", position: "relative", zIndex: 1 }} />
      <ShimmerBar width={28} height={24} active={false} style={{ background: active ? "rgba(255,255,255,0.4)" : "var(--skeleton-bg)", position: "relative", zIndex: 1 }} />
      <ShimmerBar width={55} height={12} active={false} style={{ background: active ? "rgba(255,255,255,0.3)" : "var(--skeleton-bg)", position: "relative", zIndex: 1 }} />
    </div>
  );
};

export default SkeletonCalendarDay;
