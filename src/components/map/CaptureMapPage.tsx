import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import L from "./leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { AppContext } from "@/App";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/brand/Segmented";
import { EmptyState, ErrorState } from "@/components/brand/States";
import { BlockSkeleton } from "@/components/brand/KpiCard";
import { usePointsCatalog } from "@/hooks/usePointsCatalog";
import {
  escapeHtml,
  filterCaptures,
  formatMeasure,
  formatWhen,
  statusLabel,
  type CaptureKind,
  type CapturePoint,
  type PointStatus,
} from "@/lib/hydro";

const COLORS: Record<PointStatus, string> = {
  online: "#66E0C2",
  stale: "#FFC46B",
  offline: "#FF847A",
};

function iconFor(status: PointStatus) {
  const color = COLORS[status];
  return L.divIcon({
    className: "",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    html: `<span style="display:block;width:18px;height:18px;border-radius:999px;background:${color};border:2px solid #0A181F;box-shadow:0 0 0 4px ${color}33"></span>`,
  });
}

function popupHtml(point: CapturePoint) {
  return `<div style="font-family:Lato,sans-serif;min-width:180px">
    <strong>${escapeHtml(point.name)}</strong>
    <div style="margin-top:4px;font-size:12px;color:#203562">${escapeHtml(statusLabel(point.status))}</div>
    <div style="margin-top:8px;font-family:Roboto,sans-serif;font-size:13px">
      Caudal ${escapeHtml(formatMeasure(point.flow, "L/s", 2))}<br/>
      Nivel ${escapeHtml(formatMeasure(point.level, "m", 2))}<br/>
      Total ${escapeHtml(formatMeasure(point.total, "m³", 1))}<br/>
      ${escapeHtml(formatWhen(point.lastAt))}
    </div>
    <button type="button" data-open-point="${escapeHtml(point.id)}" style="margin-top:8px;background:#203562;color:white;border:0;border-radius:8px;padding:6px 10px;font-weight:700;cursor:pointer">Abrir telemetría</button>
  </div>`;
}

export default function CaptureMapPage() {
  const navigate = useNavigate();
  const { dispatch } = useContext(AppContext) as {
    dispatch: (_action: { type: string; payload?: unknown }) => void;
  };
  const { points, pointsQuery } = usePointsCatalog();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [status, setStatus] = useState<"all" | PointStatus>("all");
  const [kind, setKind] = useState<"all" | CaptureKind>("all");
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 200);
    return () => window.clearTimeout(timer);
  }, [query]);

  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const located = useMemo(() => {
    const filtered = filterCaptures(points, debouncedQuery, status, kind);
    return filtered.filter((point) => point.lat !== null && point.lng !== null);
  }, [points, debouncedQuery, status, kind]);
  const missing = filterCaptures(points, debouncedQuery, status, kind).length - located.length;

  useEffect(() => {
    const host = hostRef.current;
    if (!host || mapRef.current) return;
    const map = L.map(host, { zoomControl: true, minZoom: 3, maxZoom: 16 }).setView([-33.45, -70.66], 5);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap &copy; CARTO",
      maxZoom: 20,
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const group = L.markerClusterGroup({
      chunkedLoading: true,
      chunkInterval: 50,
      maxClusterRadius: 48,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 16,
      removeOutsideVisibleBounds: true,
    });
    const markers = located.map((point) => {
      const marker = L.marker([point.lat as number, point.lng as number], { icon: iconFor(point.status) });
      marker.bindPopup(popupHtml(point));
      marker.on("popupopen", () => {
        const button = marker.getPopup()?.getElement()?.querySelector("button");
        button?.addEventListener(
          "click",
          () => {
            dispatch({ type: "CHANGE_SELECTED_PROFILE", payload: { selected_profile: point.raw } });
            navigate("/telemetry");
          },
          { once: true }
        );
      });
      return marker;
    });
    group.addLayers(markers);
    map.addLayer(group);
    map.invalidateSize();
    if (located.length === 1) {
      map.setView([located[0].lat as number, located[0].lng as number], 12);
    } else if (located.length > 1) {
      map.fitBounds(L.latLngBounds(located.map((point) => [point.lat as number, point.lng as number])), {
        padding: [32, 32],
        maxZoom: 12,
      });
    }
    return () => {
      map.removeLayer(group);
    };
  }, [located, dispatch, navigate]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-navy dark:text-limebrand">Captaciones</p>
        <h2 className="text-2xl font-black">Mapa de puntos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Los marcadores se agrupan. El color sigue el estado: en línea, atención o sin transmisión.
        </p>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar punto"
          aria-label="Buscar en el mapa"
          className="lg:max-w-sm"
        />
        <Segmented
          label="Estado del mapa"
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "Todos" },
            { value: "online", label: "En línea" },
            { value: "stale", label: "Atención" },
            { value: "offline", label: "Sin tx" },
          ]}
        />
        <Segmented
          label="Tipo de captación"
          value={kind}
          onChange={setKind}
          options={[
            { value: "all", label: "Todos" },
            { value: "well", label: "Pozo" },
            { value: "surface", label: "Superficial" },
          ]}
        />
      </div>
      <p className="text-xs font-bold text-muted-foreground">
        {located.length.toLocaleString("es-CL")} con GPS
        {missing > 0 ? ` · ${missing.toLocaleString("es-CL")} sin coordenadas` : ""}
      </p>
      {pointsQuery.isError && points.length === 0 ? (
        <ErrorState title="No se pudieron cargar los puntos" onRetry={() => pointsQuery.refetch()} />
      ) : null}
      {pointsQuery.isLoading && points.length === 0 ? <BlockSkeleton className="h-24" /> : null}
      {!pointsQuery.isLoading && located.length === 0 ? (
        <EmptyState title="No hay puntos con GPS en este filtro" description="Revisa latitud y longitud en la ficha del punto." />
      ) : null}
      <div ref={hostRef} className={located.length === 0 ? "hidden" : "h-[min(75vh,760px)] overflow-hidden rounded-xl border"} />
    </div>
  );
}
