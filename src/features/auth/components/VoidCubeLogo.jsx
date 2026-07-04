import React from "react";

/**
 * Logo cubo 3D minimal para Ikolu Void.
 *
 * Cubo isométrico con caras translúcidas granuladas, marco tenue
 * y un único punto brillante en el centro.
 */
const floatStyles = `
  @keyframes void-float {
    0%, 100% { transform: translate3d(0, 0, 0); }
    50% { transform: translate3d(0, -6px, 0); }
  }
  .void-cube-wrap {
    animation: void-float 4s ease-in-out infinite;
    display: inline-block;
    will-change: transform;
    transform: translateZ(0);
    backface-visibility: hidden;
  }
  .void-cube-wrap:hover {
    animation-play-state: paused;
  }
`;

const VoidCubeLogo = ({
  size = 80,
  onClick,
  className = "",
  brightness = 1,
  glowSize = 1,
}) => {
  const a = (base) => Math.min(1, Math.max(0, base * brightness));

  return (
    <span className="void-cube-wrap">
      <style>{floatStyles}</style>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={className}
        onClick={onClick}
        style={{
          cursor: onClick ? "pointer" : "default",
          filter: `drop-shadow(0 12px 26px rgba(0,0,0,${a(0.5)}))`,
          transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          display: "block",
        }}
        onMouseEnter={(e) => {
          if (onClick) e.currentTarget.style.transform = "scale(1.06) rotate(-2deg)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1) rotate(0deg)";
        }}
      >
      <defs>
        <filter id="voidGrain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.1"
            numOctaves="5"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            type="matrix"
            values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${a(0.45)} 0`}
            in="noise"
            result="coloredNoise"
          />
          <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="grain" />
          <feBlend mode="overlay" in="grain" in2="SourceGraphic" />
        </filter>

        <linearGradient id="topFace" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={`rgba(230,240,250,${a(0.45)})`} />
          <stop offset="100%" stopColor={`rgba(140,155,175,${a(0.22)})`} />
        </linearGradient>
        <linearGradient id="leftFace" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={`rgba(180,195,215,${a(0.38)})`} />
          <stop offset="100%" stopColor={`rgba(100,115,135,${a(0.16)})`} />
        </linearGradient>
        <linearGradient id="rightFace" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={`rgba(200,215,230,${a(0.32)})`} />
          <stop offset="100%" stopColor={`rgba(120,135,155,${a(0.13)})`} />
        </linearGradient>

        <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation={2 * glowSize} result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Sombra inferior */}
      <ellipse
        cx="50"
        cy="92"
        rx="30"
        ry="7"
        fill={`rgba(0,0,0,${a(0.35)})`}
        filter="url(#softGlow)"
      />

      {/* Marco exterior tenue */}
      <path
        d="M50 10 L90 32 L90 72 L50 94 L10 72 L10 32 Z"
        fill="none"
        stroke={`rgba(255,255,255,${a(0.30)})`}
        strokeWidth="0.8"
      />

      {/* Caras granuladas */}
      <path
        d="M10 32 L50 54 L50 94 L10 72 Z"
        fill="url(#leftFace)"
        stroke={`rgba(255,255,255,${a(0.18)})`}
        strokeWidth="0.6"
        filter="url(#voidGrain)"
      />
      <path
        d="M50 54 L90 32 L90 72 L50 94 Z"
        fill="url(#rightFace)"
        stroke={`rgba(255,255,255,${a(0.18)})`}
        strokeWidth="0.6"
        filter="url(#voidGrain)"
      />
      <path
        d="M10 32 L50 10 L90 32 L50 54 Z"
        fill="url(#topFace)"
        stroke={`rgba(255,255,255,${a(0.22)})`}
        strokeWidth="0.6"
        filter="url(#voidGrain)"
      />

      {/* Núcleo brillante central */}
      <circle cx="50" cy="52" r="3.6" fill={`rgba(255,255,255,${a(0.70)})`} filter="url(#softGlow)" />
      <circle cx="50" cy="52" r="1.6" fill="#ffffff" filter="url(#softGlow)" />
      </svg>
    </span>
  );
};

export default VoidCubeLogo;
