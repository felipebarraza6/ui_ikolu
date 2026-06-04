import React from "react";

const animations = {
  telemetry: 'telemetry-dot-blink 2s ease-in-out infinite',
  warning: 'warning-dot-blink 1.2s ease-in-out infinite',
  critical: 'critical-dot-blink 0.8s ease-in-out infinite',
};

const BlinkingDot = ({
  size = 12,
  color = '#ffffff',
  variant = 'telemetry',
  active = true,
  style = {},
}) => (
  <div style={{
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: color,
    animation: active ? animations[variant] || 'none' : 'none',
    boxShadow: `0 0 ${size}px ${size / 4}px ${color}40`,
    flexShrink: 0,
    ...style,
  }} />
);

export default BlinkingDot;
