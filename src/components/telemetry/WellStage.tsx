import { lazy, Suspense } from "react";
import { BlockSkeleton } from "@/components/brand/KpiCard";
import { Segmented } from "@/components/brand/Segmented";
import type { CaptureKind, ViewMode, WellProfile } from "@/lib/hydro";
import { WellSvg } from "./WellSvg";

const WellCanvas = lazy(() => import("./WellCanvas"));

const ACCENT = { online: "#66E0C2", stale: "#FFC46B", offline: "#FF847A" };

export function WellStage({
  mode,
  onMode,
  kind,
  fill,
  flow,
  level,
  total,
  profile,
  status,
}: {
  mode: ViewMode;
  onMode: (_mode: ViewMode) => void;
  kind: CaptureKind;
  fill: number;
  flow: number | null;
  level: number | null;
  total: number | null;
  profile: WellProfile;
  status: "online" | "stale" | "offline";
}) {
  const accent = ACCENT[status];
  const pumpRatio = profile.depth && profile.pumpDepth ? Math.min(1, profile.pumpDepth / profile.depth) : null;
  const sensorRatio = profile.depth && profile.sensorDepth ? Math.min(1, profile.sensorDepth / profile.depth) : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold">{kind === "surface" ? "Captación superficial" : "Pozo"}</p>
        <Segmented
          label="Vista del punto"
          value={mode}
          onChange={onMode}
          options={[
            { value: "2d", label: "2D" },
            { value: "3d", label: "3D" },
          ]}
        />
      </div>
      <div className="h-72 overflow-hidden rounded-xl border bg-[#0A181F]">
        {mode === "3d" ? (
          <Suspense fallback={<BlockSkeleton className="h-full bg-white/10" />}>
            <WellCanvas kind={kind} fill={fill} accent={accent} pumpRatio={pumpRatio} sensorRatio={sensorRatio} />
          </Suspense>
        ) : (
          <WellSvg kind={kind} fill={fill} flow={flow} level={level} total={total} profile={profile} accent={accent} />
        )}
      </div>
      <p className="text-xs text-muted-foreground">Arrastra la vista 3D para orbitar. El nivel usa el rango del período.</p>
    </div>
  );
}
