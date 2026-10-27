import { formatMeasure, type CaptureKind, type WellProfile } from "@/lib/hydro";

export function WellSvg({
  kind,
  fill,
  flow,
  level,
  total,
  profile,
  accent,
}: {
  kind: CaptureKind;
  fill: number;
  flow: number | null;
  level: number | null;
  total: number | null;
  profile: WellProfile;
  accent: string;
}) {
  const water = Math.min(0.96, Math.max(0.08, fill));
  if (kind === "surface") {
    const surfaceY = 150 - water * 40;
    return (
      <svg viewBox="0 0 360 280" className="h-full w-full" role="img" aria-label="Captación superficial">
        <rect width="360" height="280" fill="#0A181F" rx="16" />
        <path d="M0 90 C80 70 140 120 220 100 C280 86 320 110 360 96 L360 280 L0 280 Z" fill="#14343A" />
        <path d={`M0 ${surfaceY} C70 ${surfaceY - 16} 130 ${surfaceY + 10} 200 ${surfaceY - 6} C270 ${surfaceY - 18} 320 ${surfaceY + 4} 360 ${surfaceY - 8} L360 230 L0 230 Z`} fill="#2E9BC4" opacity="0.9" />
        <circle cx="180" cy={surfaceY - 8} r="10" fill={accent} />
        <rect x="168" y={surfaceY - 46} width="6" height="36" fill="#E8F2F1" />
        <text x="20" y="36" fill="#E8F2F1" fontSize="13" fontFamily="Lato, sans-serif">
          {`Caudal ${formatMeasure(flow, "L/s", 2)}`}
        </text>
        <text x="20" y="56" fill="#9FD4FF" fontSize="12" fontFamily="Roboto, sans-serif">
          {`Total ${formatMeasure(total, "m³", 1)}`}
        </text>
      </svg>
    );
  }

  const shaftTop = 70;
  const shaftHeight = 180;
  const waterHeight = shaftHeight * water;
  const waterY = shaftTop + shaftHeight - waterHeight;
  const depth = profile.depth;
  const markerY = (meters: number | null) => {
    if (!depth || meters === null) return null;
    const ratio = Math.min(1, Math.max(0, meters / depth));
    return shaftTop + shaftHeight * ratio;
  };
  const pumpY = markerY(profile.pumpDepth);
  const sensorY = markerY(profile.sensorDepth);

  return (
    <svg viewBox="0 0 360 300" className="h-full w-full" role="img" aria-label="Corte del pozo">
      <rect width="360" height="300" fill="#0A181F" rx="16" />
      <rect x="0" y="78" width="360" height="222" fill="#14343A" />
      <rect x="148" y={shaftTop} width="64" height={shaftHeight} fill="#102028" stroke={accent} strokeWidth="2" />
      <rect x="152" y={waterY} width="56" height={waterHeight} fill="#22A0AC" opacity="0.9" />
      <ellipse cx="180" cy={shaftTop} rx="40" ry="10" fill="#46585A" />
      <ellipse cx="180" cy={waterY} rx="28" ry="6" fill="#8EF0D8" opacity="0.7" />
      {pumpY !== null ? <rect x="166" y={pumpY - 8} width="28" height="14" rx="2" fill={accent} /> : null}
      {sensorY !== null ? <circle cx="196" cy={sensorY} r="5" fill="#FFC46B" /> : null}
      <text x="18" y="32" fill="#E8F2F1" fontSize="13" fontFamily="Lato, sans-serif">
        {`Nivel ${formatMeasure(level, "m", 2)}`}
      </text>
      <text x="18" y="52" fill="#9FD4FF" fontSize="12" fontFamily="Roboto, sans-serif">
        {`Caudal ${formatMeasure(flow, "L/s", 2)} · ${formatMeasure(total, "m³", 1)}`}
      </text>
      <text x="228" y="120" fill="#B7C8C7" fontSize="11" fontFamily="Lato, sans-serif">
        {depth ? `Prof. ${formatMeasure(depth, "m", 1)}` : "Sin ficha de profundidad"}
      </text>
      {profile.pumpDepth ? (
        <text x="228" y="140" fill="#B7C8C7" fontSize="11" fontFamily="Lato, sans-serif">
          {`Bomba ${formatMeasure(profile.pumpDepth, "m", 1)}`}
        </text>
      ) : null}
      {profile.sensorDepth ? (
        <text x="228" y="160" fill="#B7C8C7" fontSize="11" fontFamily="Lato, sans-serif">
          {`Sensor ${formatMeasure(profile.sensorDepth, "m", 1)}`}
        </text>
      ) : null}
    </svg>
  );
}
