import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Alert,
  Spin,
  Flex,
  Typography,
  Tag,
  Button,
  Divider,
  Table,
} from "antd";
import {
  EnvironmentOutlined,
  BarChartOutlined,
  DropboxOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  LinkOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { formatInteger, formatFlow } from "../../utils/numberFormatter";
import { useResponsive } from "../../hooks/useResponsive";
import { AppContext } from "../../App";

const { Title, Text } = Typography;

/**
 * 🗺️ GEO SMART - Panel de Monitoreo Geográfico
 *
 * Muestra un mapa con todos los puntos de captación y sus estadísticas
 * - Mapa interactivo con marcadores de ubicación
 * - Panel de detalles a la derecha
 * - Datos reales de caudal y consumo
 */
const GeoSmart = () => {
  const { state } = useContext(AppContext);
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [geoData, setGeoData] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [stats, setStats] = useState({
    totalPoints: 0,
    pointsWithGPS: 0,
    pointsWithoutGPS: 0,
    totalCaudal: 0,
    totalConsumption: 0,
    avgCaudal: 0,
  });

  useEffect(() => {
    if (state.profile_client && state.profile_client.length > 0) {
      processGeoData();
    } else {
      setLoading(false);
    }
  }, [state.profile_client]);

  useEffect(() => {
    if (geoData.length > 0 && !mapLoaded) {
      initializeMap();
    }
  }, [geoData, mapLoaded]);

  useEffect(() => {
    if (!document.getElementById("geo-marker-pulse-style")) {
      const style = document.createElement("style");
      style.id = "geo-marker-pulse-style";
      style.innerHTML = markerPulseStyle;
      document.head.appendChild(style);
    }
  }, []);

  const processGeoData = () => {
    const profiles = state.profile_client || [];

    const processedData = profiles.map((profile) => {
      // Extraer datos reales del perfil
      const hasGPS =
        profile.lat &&
        profile.lon &&
        profile.lat !== "0" &&
        profile.lon !== "0";
      const lat = hasGPS ? parseFloat(profile.lat.replace(",", ".")) : null;
      const lon = hasGPS ? parseFloat(profile.lon.replace(",", ".")) : null;

      // Obtener último dato de caudal del módulo m1
      const lastM1Data = profile.modules?.m1 || {};
      const currentCaudal = Number(lastM1Data.flow) || 0;
      const totalConsumption =
        Number(lastM1Data.total_today_diff) ||
        Number(lastM1Data.total_consumed_today) ||
        0;
      const yesterdayConsumption =
        Number(lastM1Data.total_consumed_yesterday) || 0;

      // Obtener datos DGA
      const dgaData = profile.dga || {};
      const codeDga = dgaData.code_dga || "Sin código";
      const flowGranted = dgaData.flow_granted_dga || 0;
      const typeDga = dgaData.type_dga || "Sin tipo";

      const waterTable =
        lastM1Data.water_table !== undefined
          ? Number(lastM1Data.water_table)
          : null;
      const total =
        lastM1Data.total !== undefined ? Number(lastM1Data.total) : null;

      const dateTimeMedition = lastM1Data.date_time_medition || null;
      const totalToday =
        lastM1Data.total_today_diff !== undefined
          ? Number(lastM1Data.total_today_diff)
          : null;

      return {
        id: profile.id,
        title: profile.title,
        frecuency: profile.frecuency,
        lat,
        lon,
        hasGPS,
        currentCaudal,
        totalConsumption,
        yesterdayConsumption,
        codeDga,
        flowGranted,
        typeDga,
        lastMeasurement: lastM1Data.date_time_medition,
        lastLogger: lastM1Data.date_time_last_logger,
        daysNotConnection: lastM1Data.days_not_conection,
        // Datos adicionales del perfil
        configData: profile.config_data || {},
        profileIkolu: profile.profile_ikolu || {},
        waterTable,
        total,
        totalToday,
        dateTimeMedition,
      };
    });

    setGeoData(processedData);

    // Calcular estadísticas
    const totalPoints = processedData.length;
    const pointsWithGPS = processedData.filter((p) => p.hasGPS).length;
    const pointsWithoutGPS = totalPoints - pointsWithGPS;

    const totalCaudal = processedData.reduce(
      (sum, p) => sum + p.currentCaudal,
      0
    );
    const totalConsumption = processedData.reduce(
      (sum, p) => sum + p.totalConsumption,
      0
    );
    const avgCaudal = totalPoints > 0 ? totalCaudal / totalPoints : 0;

    setStats({
      totalPoints,
      pointsWithGPS,
      pointsWithoutGPS,
      totalCaudal,
      totalConsumption,
      avgCaudal,
    });

    setLoading(false);
  };

  const getMarkerColor = (caudal, flowGranted) => {
    if (!flowGranted || flowGranted === 0) {
      if (caudal > 80) return "#ff4d4f"; // Rojo - alto caudal
      if (caudal > 50) return "#faad14"; // Amarillo - medio caudal
      return "#52c41a"; // Verde - bajo caudal
    }

    // Si hay caudal autorizado, comparar con él
    const percentage = (caudal / flowGranted) * 100;
    if (percentage > 90) return "#ff4d4f"; // Rojo - excede autorizado
    if (percentage > 70) return "#faad14"; // Amarillo - cerca del límite
    return "#52c41a"; // Verde - dentro del límite
  };

  const getGoogleMapsUrl = (lat, lon) => {
    return `https://www.google.com/maps?q=${lat},${lon}`;
  };

  const handlePointClick = (point) => {
    setSelectedPoint(point);
  };

  const markerPulseStyle = `
    .geo-marker-pulse {
      background: rgb(31,52,97);
      border-radius: 50%;
      width: 24px;
      height: 24px;
      position: absolute;
      left: -12px;
      top: -12px;
      box-shadow: 0 0 0 0 rgba(31,52,97, 0.7);
      animation: geo-pulse 1.2s infinite;
      border: 3px solid white;
      z-index: 10;
    }
    @keyframes geo-pulse {
      0% { box-shadow: 0 0 0 0 rgba(31,52,97, 0.7); }
      70% { box-shadow: 0 0 0 12px rgba(31,52,97, 0); }
      100% { box-shadow: 0 0 0 0 rgba(31,52,97, 0); }
    }
    .geo-marker-label {
      position: absolute;
      left: 50%;
      top: -44px;
      transform: translateX(-50%);
      background: rgba(31,52,97,0.95);
      color: #fff;
      font-size: 13px;
      padding: 4px 14px;
      border-radius: 6px;
      white-space: nowrap;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(31,52,97,0.12);
      z-index: 20;
      margin-bottom: 8px;
    }
  `;

  const initializeMap = async () => {
    try {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
        iconUrl: require("leaflet/dist/images/marker-icon.png"),
        shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
      });
      if (mapRef.current && !mapInstanceRef.current) {
        const pointsWithGPS = geoData.filter((p) => p.hasGPS);
        if (pointsWithGPS.length === 0) {
          setMapLoaded(true);
          return;
        }
        // Calcular bounds para todos los puntos
        const bounds = L.latLngBounds(pointsWithGPS.map((p) => [p.lat, p.lon]));
        // Crear el mapa (usar el centro del bounds por defecto)
        const map = L.map(mapRef.current);
        map.fitBounds(bounds, { padding: [40, 40] });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);
        pointsWithGPS.forEach((point) => {
          // DivIcon animado + label
          const divIcon = L.divIcon({
            className: "",
            html: `
              <div style="position:relative;">
                <div class='geo-marker-label'>${point.title}</div>
                <div class='geo-marker-pulse'></div>
              </div>
            `,
            iconSize: [24, 40],
            iconAnchor: [12, 24],
            popupAnchor: [0, -28],
          });
          const marker = L.marker([point.lat, point.lon], {
            icon: divIcon,
          }).addTo(map);
          // Popup solo con nombre y código de obra
          const popupContent = `
            <div style="min-width: 180px;">
              <h5 style="margin-bottom: 8px; color: #1f3461;">${point.title}</h5>
              <p><strong>Código de Obra:</strong> ${point.codeDga}</p>
            </div>
          `;
          marker.bindPopup(popupContent);
          marker.on("click", () => {
            handlePointClick(point);
          });
        });
        mapInstanceRef.current = map;
        setMapLoaded(true);
      }
    } catch (error) {
      console.error("Error inicializando mapa:", error);
      setMapLoaded(true);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ height: "50vh" }}>
        <Spin size="large" />
      </Flex>
    );
  }

  const pointsWithGPS = geoData.filter((p) => p.hasGPS);
  const pointsWithoutGPS = geoData.filter((p) => !p.hasGPS);
  const hayGPS = pointsWithGPS.length > 0;

  // Define las columnas para el Table de Ant Design
  const columns = [
    { title: "Nombre", dataIndex: "title", key: "title", fixed: false },
    {
      title: "Fecha",
      dataIndex: "dateTimeMedition",
      key: "dateTimeMedition",
      render: (value) =>
        value
          ? new Date(value).toLocaleString("es-CL", {
              dateStyle: "short",
              timeStyle: "short",
            })
          : "-",
    },
    { title: "Código de Obra", dataIndex: "codeDga", key: "codeDga" },
    {
      title: "Caudal",
      dataIndex: "currentCaudal",
      key: "currentCaudal",
      align: "right",
      render: (value) => formatFlow(value) + " L/s",
    },
    {
      title: "Nivel Freático",
      dataIndex: "waterTable",
      key: "waterTable",
      align: "right",
      render: (value) =>
        value !== undefined && value !== null
          ? Number(value).toFixed(2) + " m"
          : "-",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      align: "right",
      render: (value) =>
        value !== undefined && value !== null ? formatInteger(value) : "-",
    },
    {
      title: "Consumido hoy",
      dataIndex: "totalToday",
      key: "totalToday",
      align: "right",
      render: (value) =>
        value !== undefined && value !== null ? formatInteger(value) : "-",
    },
    {
      title: "GPS",
      dataIndex: "hasGPS",
      key: "hasGPS",
      align: "center",
      render: (value) =>
        value ? (
          <span style={{ color: "#52c41a", fontWeight: 600 }}>Sí</span>
        ) : (
          <span style={{ color: "#faad14", fontWeight: 600 }}>No</span>
        ),
    },
  ];

  return (
    <div
      style={{
        padding: isMobile ? "12px 8px" : "16px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {/* Estadísticas Rápidas */}
      <div
        style={{
          marginBottom: 8,
          fontWeight: 500,
          color: "#1f3461",
          fontSize: 15,
        }}
      >
        Indicadores acumulados del día de hoy
      </div>
      <div
        style={{ display: "flex", gap: 32, marginBottom: 32, flexWrap: "wrap" }}
      >
        <Card
          size="small"
          style={{
            flex: 1,
            minWidth: 180,
            textAlign: "center",
            boxShadow: "0 1px 8px #f0f1f2",
            marginBottom: isMobile ? 12 : 0,
          }}
        >
          <Statistic
            title={<span style={{ fontSize: 16 }}>Total Puntos</span>}
            value={stats.totalPoints}
            prefix={<EnvironmentOutlined />}
            valueStyle={{ color: "#1f3461", fontSize: 28, fontWeight: 700 }}
          />
        </Card>
        <Card
          size="small"
          style={{
            flex: 1,
            minWidth: 180,
            textAlign: "center",
            boxShadow: "0 1px 8px #f0f1f2",
            marginBottom: isMobile ? 12 : 0,
          }}
        >
          <Statistic
            title={<span style={{ fontSize: 16 }}>Con GPS</span>}
            value={`${stats.pointsWithGPS} / ${stats.totalPoints}`}
            valueStyle={{ color: "#52c41a", fontSize: 28, fontWeight: 700 }}
          />
        </Card>
        <Card
          size="small"
          style={{
            flex: 1,
            minWidth: 180,
            textAlign: "center",
            boxShadow: "0 1px 8px #f0f1f2",
            marginBottom: isMobile ? 12 : 0,
          }}
        >
          <Statistic
            title={<span style={{ fontSize: 16 }}>Caudal Total (hoy)</span>}
            value={formatFlow(stats.totalCaudal)}
            valueStyle={{ color: "#1890ff", fontSize: 28, fontWeight: 700 }}
            suffix="L/s"
          />
        </Card>
        <Card
          size="small"
          style={{
            flex: 1,
            minWidth: 180,
            textAlign: "center",
            boxShadow: "0 1px 8px #f0f1f2",
            marginBottom: isMobile ? 12 : 0,
          }}
        >
          <Statistic
            title={<span style={{ fontSize: 16 }}>Consumo Total (hoy)</span>}
            value={formatInteger(stats.totalConsumption)}
            valueStyle={{ color: "#722ed1", fontSize: 28, fontWeight: 700 }}
            suffix="m³"
          />
        </Card>
      </div>

      {/* Si hay puntos con GPS, muestra mapa y panel de detalles, si no, solo la tabla */}
      {hayGPS ? (
        <>
          <div style={{ flex: 1, display: "flex", gap: "16px", minHeight: 0 }}>
            {/* Mapa */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <Card
                bodyStyle={{ padding: 0, height: "100%" }}
                style={{ height: "100%" }}
              >
                {pointsWithGPS.length > 0 ? (
                  <div
                    ref={mapRef}
                    style={{
                      height: "100%",
                      width: "100%",
                      background: "#f5f5f5",
                    }}
                  >
                    {!mapLoaded && (
                      <div
                        style={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Spin size="large" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#f5f5f5",
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <EnvironmentOutlined
                        style={{
                          fontSize: "48px",
                          color: "#d9d9d9",
                          marginBottom: "16px",
                        }}
                      />
                      <Title level={4} style={{ color: "#999" }}>
                        Sin Puntos con GPS
                      </Title>
                      <Text type="secondary">
                        No hay puntos de captación con coordenadas GPS
                        configuradas
                      </Text>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Panel de Detalles */}
            <div style={{ width: isMobile ? "100%" : "350px" }}>
              {selectedPoint ? (
                <Card
                  title={
                    <Flex align="center">
                      <EyeOutlined style={{ marginRight: 8 }} />
                      {selectedPoint.title}
                    </Flex>
                  }
                  style={{ height: "100%" }}
                  extra={
                    <Button
                      type="primary"
                      size="small"
                      icon={<LinkOutlined />}
                      onClick={() =>
                        window.open(
                          getGoogleMapsUrl(
                            selectedPoint.lat,
                            selectedPoint.lon
                          ),
                          "_blank"
                        )
                      }
                    >
                      Maps
                    </Button>
                  }
                >
                  <div
                    style={{
                      overflowY: "auto",
                      overflowX: "hidden",
                      maxHeight: "calc(100vh - 200px)",
                    }}
                  >
                    <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
                      <Col span={12}>
                        <Card size="small">
                          <Statistic
                            title="Caudal Actual"
                            value={formatFlow(selectedPoint.currentCaudal)}
                            prefix={<BarChartOutlined />}
                            valueStyle={{
                              color: getMarkerColor(
                                selectedPoint.currentCaudal,
                                selectedPoint.flowGranted
                              ),
                              fontSize: "14px",
                            }}
                            suffix="L/s"
                          />
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card size="small">
                          <Statistic
                            title="Consumo Hoy"
                            value={formatInteger(
                              selectedPoint.totalConsumption
                            )}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: "#722ed1", fontSize: "14px" }}
                            suffix="m³"
                          />
                        </Card>
                      </Col>
                    </Row>
                    <div
                      style={{
                        background: "#f5f5f5",
                        padding: "12px",
                        borderRadius: "8px",
                        marginBottom: 16,
                        overflowX: "hidden",
                        wordBreak: "break-word",
                      }}
                    >
                      <Text strong>Información del Punto:</Text>
                      <Divider style={{ margin: "8px 0" }} />
                      <div style={{ fontSize: "12px" }}>
                        <div>
                          <strong>Código de Obra:</strong>{" "}
                          {selectedPoint.codeDga}
                        </div>
                        <div>
                          <strong>Naturaleza:</strong> {selectedPoint.typeDga}
                        </div>
                        <div>
                          <strong>Frecuencia:</strong> {selectedPoint.frecuency}{" "}
                          min
                        </div>
                        <div>
                          <strong>Coordenadas:</strong>{" "}
                          {selectedPoint.lat.toFixed(6)},{" "}
                          {selectedPoint.lon.toFixed(6)}
                        </div>
                        {selectedPoint.flowGranted > 0 && (
                          <div>
                            <strong>Caudal Autorizado:</strong>{" "}
                            {formatFlow(selectedPoint.flowGranted)} L/s
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card title="Selecciona un Punto" style={{ height: "100%" }}>
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    <div>
                      <EyeOutlined
                        style={{
                          fontSize: "48px",
                          color: "#d9d9d9",
                          marginBottom: "16px",
                        }}
                      />
                      <Text type="secondary">
                        Haz clic en un punto del mapa para ver sus detalles
                      </Text>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
          {/* Tabla de resumen debajo */}
          <div style={{ marginTop: 32 }}>
            <Card
              size="small"
              title="Resumen de Puntos de Captación"
              style={{ marginBottom: isMobile ? 16 : 0 }}
            >
              <Table
                columns={columns}
                dataSource={geoData}
                pagination={false}
                scroll={{ x: "max-content" }}
                summary={() => (
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      colSpan={3}
                      style={{ fontWeight: 700 }}
                    >
                      Totales
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="right">
                      {formatFlow(stats.totalCaudal)} L/s
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} align="right">
                      -
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5} align="right">
                      -
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={6} align="right">
                      {formatInteger(stats.totalConsumption)} m³
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={7}></Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
                rowKey="id"
              />
            </Card>
          </div>
        </>
      ) : (
        // Si no hay GPS, solo la tabla arriba
        <div style={{ marginTop: 0 }}>
          <Card
            size="small"
            title="Resumen de Puntos de Captación"
            style={{ marginBottom: isMobile ? 16 : 0 }}
          >
            <Table
              columns={columns}
              dataSource={geoData}
              pagination={false}
              scroll={{ x: "max-content" }}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell
                    index={0}
                    colSpan={3}
                    style={{ fontWeight: 700 }}
                  >
                    Totales
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">
                    {formatFlow(stats.totalCaudal)} L/s
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="right">
                    -
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} align="right">
                    -
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} align="right">
                    {formatInteger(stats.totalConsumption)} m³
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={7}></Table.Summary.Cell>
                </Table.Summary.Row>
              )}
              rowKey="id"
            />
          </Card>
        </div>
      )}
      {/* Alertas */}
      {pointsWithoutGPS.length > 0 && (
        <Alert
          message={`${pointsWithoutGPS.length} puntos sin GPS`}
          description="Algunos puntos de captación no tienen coordenadas GPS configuradas."
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  );
};

export default GeoSmart;
