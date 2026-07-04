import React from "react";

/**
 * Fondo dinámico de flujo hídrico para el panel de marca.
 *
 * Versión optimizada: menos partículas, sin blur por partícula y
 * animaciones de opacidad por CSS para reducir carga de renderizado.
 */
const WaterBackground = () => {
  const flows = [
    { path: "M-100,220 C300,180 600,260 900,220 S1500,140 1900,220", duration: 20, particles: 3 },
    { path: "M-100,320 C350,280 650,360 950,320 S1550,240 1900,320", duration: 26, particles: 3 },
    { path: "M-100,420 C320,460 680,380 920,420 S1520,500 1900,420", duration: 23, particles: 2 },
    { path: "M-100,520 C380,560 620,480 960,520 S1480,600 1900,520", duration: 29, particles: 2 },
    { path: "M-100,620 C300,580 700,660 900,620 S1540,540 1900,620", duration: 24, particles: 2 },
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {/* Gradiente de profundidad */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(165deg, #031020 0%, #061d38 40%, #0a3150 75%, #0c4a6d 100%)",
        }}
      />

      {/* Brillo superficial tipo reflejo */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: "65vw",
          height: "65vw",
          background:
            "radial-gradient(circle, rgba(58,137,210,0.22) 0%, rgba(12,60,95,0.08) 40%, rgba(0,0,0,0) 70%)",
          filter: "blur(70px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-5%",
          right: "-15%",
          width: "50vw",
          height: "50vw",
          background:
            "radial-gradient(circle, rgba(201,217,54,0.1) 0%, rgba(12,60,95,0.06) 35%, rgba(0,0,0,0) 65%)",
          filter: "blur(90px)",
        }}
      />

      {/* SVG de corrientes */}
      <svg
        viewBox="0 0 1800 900"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.85,
        }}
      >
        <defs>
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(58,137,210,0)" />
            <stop offset="30%" stopColor="rgba(58,137,210,0.15)" />
            <stop offset="50%" stopColor="rgba(201,217,54,0.12)" />
            <stop offset="70%" stopColor="rgba(58,137,210,0.15)" />
            <stop offset="100%" stopColor="rgba(58,137,210,0)" />
          </linearGradient>
        </defs>

        {flows.map((flow, flowIdx) => (
          <g key={flowIdx}>
            {/* Rastro de la corriente */}
            <path
              d={flow.path}
              fill="none"
              stroke="url(#flowGradient)"
              strokeWidth={1.5 + flowIdx * 0.4}
              strokeLinecap="round"
              style={{ opacity: 0.35 }}
            />

            {/* Partículas viajando por la corriente */}
            {Array.from({ length: flow.particles }).map((_, pIdx) => {
              const size = 2 + (pIdx % 2);
              const delay = (pIdx * flow.duration) / flow.particles;
              const isLime = pIdx % 2 === 0;
              return (
                <circle
                  key={`${flowIdx}-${pIdx}`}
                  r={size}
                  fill={isLime ? "rgba(201,217,54,0.65)" : "rgba(255,255,255,0.45)"}
                  style={{
                    willChange: "transform, opacity",
                    opacity: 0,
                    animation: `flow-pulse ${flow.duration}s ease-in-out ${-delay}s infinite`,
                  }}
                >
                  <animateMotion
                    dur={`${flow.duration}s`}
                    begin={`${-delay}s`}
                    repeatCount="indefinite"
                    path={flow.path}
                  />
                </circle>
              );
            })}
          </g>
        ))}
      </svg>

      {/* Niebla/planicie inferior */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "25vh",
          background:
            "linear-gradient(180deg, rgba(3,16,32,0) 0%, rgba(3,16,32,0.4) 60%, rgba(3,16,32,0.7) 100%)",
          pointerEvents: "none",
        }}
      />

      <style>{`
        @keyframes flow-pulse {
          0% { opacity: 0; }
          25% { opacity: 0.85; }
          60% { opacity: 0.55; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default WaterBackground;
