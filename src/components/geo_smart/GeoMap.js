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
.marker-pulse {
  position: absolute;
  width: 32px;
  height: 32px;
  left: -10px;
  top: -18px;
  border-radius: 50%;
  background: #1f3461;
  animation: marker-pulse 1.8s infinite;
  z-index: 0;
  opacity: 0.18;
  box-shadow: 0 0 8px #1f3461;
}
.marker-favicon {
  position: absolute;
  left: 0;
  top: 0;
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
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 3px rgba(29, 58, 112, 0.4);
}
`;

const createIcon = () => {
  // Marker con favicon y pulso azul
  const faviconPath = require("../../assets/images/favicon.ico");
  return new L.divIcon({
    html: `<div class="marker-favicon"><img src="${faviconPath}" alt="marker" /></div><div class="marker-pulse"></div>`,
    iconSize: [16, 16],
    className: "custom-marker-icon",
  });
};

const getMarkerColor = (caudal, flowGranted) => {
  if (caudal === 0) return "#8c8c8c";
  if (flowGranted > 0 && caudal > flowGranted) return "#ff4d4f";
  return "#1890ff";
};

const GeoMap = ({ geoData, onPointClick, onMapLoaded }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef(null);

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
    if (!map || !markers) return;

    markers.clearLayers();

    const validPoints = geoData.filter((p) => p.hasGPS);
    if (validPoints.length > 0) {
      validPoints.forEach((point) => {
        const iconColor = getMarkerColor(
          point.currentCaudal,
          point.flowGranted
        );
        const marker = L.marker([point.lat, point.lon], {
          icon: createIcon(),
        }).bindPopup(
          `<b>${point.title}</b><br>Caudal: ${point.currentCaudal} L/s`
        );

        marker.on("click", () => {
          onPointClick(point);
          map.setView([point.lat, point.lon], 15);
        });

        markers.addLayer(marker);
      });

      const bounds = L.latLngBounds(validPoints.map((p) => [p.lat, p.lon]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [geoData, onPointClick]);

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
