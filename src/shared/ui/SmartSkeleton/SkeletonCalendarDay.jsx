import React from "react";
import ShimmerBar from "./ShimmerBar";
import "./skeleton.css";

const SkeletonCalendarDay = ({ active = false, style = {} }) => {
  return (
    <div
      className={`skeleton-calendar-day ${active ? "active" : ""}`}
      style={style}
    >
      <ShimmerBar width={50} height={12} active={active} style={{ background: active ? "rgba(255,255,255,0.3)" : undefined }} />
      <ShimmerBar width={28} height={24} active={active} style={{ background: active ? "rgba(255,255,255,0.4)" : undefined }} />
      <ShimmerBar width={55} height={12} active={active} style={{ background: active ? "rgba(255,255,255,0.3)" : undefined }} />
    </div>
  );
};

export default SkeletonCalendarDay;
