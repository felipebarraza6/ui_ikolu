import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";

const markerPulseStyle = `
@keyframes marker-pulse {
  0% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.8); opacity: 0.1; }
  100% { transform: scale(1.8); opacity: 0; }
}
.marker-favicon {
  position: absolute;
  left: 8px;
  top: 8px;
  width: 16px;
  height: 16px;
  z-index: 1;
  background: none;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(31,52,97,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}
.marker-pulse {
  position: absolute;
  left: 0;
  top: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1f3461;
  animation: marker-pulse 1.8s infinite;
  z-index: 0;
  opacity: 0.18;
  box-shadow: 0 0 8px #1f3461;
}
.marker-pulse-red {
  position: absolute;
  left: 0;
  top: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ff4d4f;
  animation: marker-pulse 1.8s infinite;
  z-index: 0;
  opacity: 0.18;
  box-shadow: 0 0 8px #ff4d4f;
}
.marker-favicon img {
  width: 100%;
  height: 100%;
  display: block;
}
.custom-marker-icon {
  filter: none;
}
.marker-pin {
  display: none;
}
.marker-cluster-small div,
.marker-cluster-medium div,
.marker-cluster-large div {
  background-color: rgba(29, 58, 112, 0.8) !important;
  color: #fff !important;
  border-radius: 50% !important;
  border: 2px solid #fff !important;
  box-shadow: 0 0 0 3px rgba(29, 58, 112, 0.4) !important;
  width: 48px !important;
  height: 48px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 1.5rem !important;
  font-weight: bold !important;
  text-align: center !important;
  line-height: 48px !important;
  margin: auto !important;
  padding: 0 !important;
}
`;

const createIcon = (isTelemetry) => {
  const faviconPath = require("../../assets/images/favicon.ico");
  const pulseClass = isTelemetry ? "marker-pulse" : "marker-pulse-red";
  return new L.divIcon({
    html: `<div class="marker-favicon"><img src="${faviconPath}" alt="marker" /></div><div class="${pulseClass}"></div>`,
    iconSize: [16, 16],
    className: "custom-marker-icon",
  });
};

const getMarkerColor = (caudal, flowGranted) => {
  if (caudal === 0) return "#8c8c8c";
  if (flowGranted > 0 && caudal > flowGranted) return "#ff4d4f";
  return "#1890ff";
};

const GeoMap = ({ geoData, onPointClick, onMapLoaded, selectedPoint }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef(null);
  const labelLayerRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById("geo-marker-pulse-style")) {
      const style = document.createElement("style");
      style.id = "geo-marker-pulse-style";
      style.innerHTML = markerPulseStyle;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      const map = L.map(mapRef.current, {
        center: [-33.45, -70.66],
        zoom: 6,
        preferCanvas: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      mapInstanceRef.current = map;
      markersRef.current = L.markerClusterGroup();
      map.addLayer(markersRef.current);

      // Capa para labels
      labelLayerRef.current = L.layerGroup().addTo(map);

      if (onMapLoaded) {
        onMapLoaded(map);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onMapLoaded]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const markers = markersRef.current;
    const labelLayer = labelLayerRef.current;
    if (!map || !markers || !geoData) return;

    markers.clearLayers();
    if (labelLayer) labelLayer.clearLayers();

    const validPoints = geoData.filter((p) => p.hasGPS);
    if (validPoints.length > 0) {
      validPoints.forEach((point) => {
        const marker = L.marker([point.lat, point.lon], {
          icon: createIcon(point.isTelemetry),
        });
        marker.on("click", () => {
          onPointClick(point);
          map.setView([point.lat, point.lon], 15);
        });
        markers.addLayer(marker);

        // Si es el punto seleccionado, agrega el label visual
        if (selectedPoint && selectedPoint.id === point.id && labelLayer) {
          const labelIcon = L.divIcon({
            html: `
              <div style="display: flex; align-items: center;">
                <svg width="40" height="40" style="overflow: visible;">
                  <line x1="0" y1="40" x2="30" y2="10" stroke="#2196f3" stroke-width="3" />
                </svg>
                <span style="
                  background: #2196f3;
                  color: #fff;
                  font-weight: bold;
                  font-size: 15px;
                  border-radius: 8px;
                  box-shadow: 0 2px 8px #e3f2fd;
                  padding: 2px 12px;
                  margin-left: 4px;
                  text-shadow: 0 1px 4px #1976d2;
                  ">
                  ${point.title}
                </span>
              </div>
            `,
            className: "custom-label-icon",
            iconAnchor: [-10, 40], // Ajusta para que la línea salga del favicon
          });
          const labelMarker = L.marker([point.lat, point.lon], {
            icon: labelIcon,
            interactive: false,
            keyboard: false,
          });
          labelLayer.addLayer(labelMarker);
        }
      });

      const bounds = L.latLngBounds(validPoints.map((p) => [p.lat, p.lon]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [geoData, onPointClick, selectedPoint]);

  return (
    <div
      ref={mapRef}
      style={{
        height: "100%",
        width: "100%",
        zIndex: 1,
        overflow: "hidden",
        borderRadius: "12px",
      }}
    />
  );
};

export default GeoMap;
