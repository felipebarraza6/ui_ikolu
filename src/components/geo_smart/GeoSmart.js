import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Typography,
  Spin,
  Flex,
  Tag,
  Badge,
  Grid,
  Divider,
  Skeleton,
  Statistic,
  Button,
  theme,
} from "antd";
import { useData } from "../../contexts/DataContext";
import GeoMap from "./GeoMap";
import StatusTag from "./StatusTag";
import { formatInteger, formatFlow } from "../../utils/numberFormatter";
import {
  FaMapMarkerAlt,
  FaWater,
  FaChartBar,
  FaTint,
  FaDroplet,
  FaHandHoldingWater,
  FaBroadcastTower,
  FaStream,
  FaClock,
  FaRulerVertical,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCalendarAlt,
  FaBolt,
} from "react-icons/fa";
import {
  MdGpsFixed,
  MdGpsOff,
  MdAccessTime,
  MdWaterDrop,
  MdWaves,
  MdWater,
} from "react-icons/md";
import { WiHumidity, WiThermometer } from "react-icons/wi";
import moment from "moment";
import { parseSafeDate, formatSafeDate } from "../../utils/dateFormatter";
import { ReloadOutlined } from "@ant-design/icons";
import { useDataValidation } from "./hooks/useDataValidation";
import { ikoluTokens } from "../../theme";

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;
const { useToken } = theme;

const GeoSmart = () => {
  const { points_list } = useData();
  const validators = useDataValidation();
  const screens = useBreakpoint();
  const { token } = useToken();
  const [geoData, setGeoData] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [stats, setStats] = useState({
    totalPoints: 0,
    pointsWithGPS: 0,
    pointsWithoutGPS: 0,
    totalCaudal: 0,
    totalConsumption: 0,
    avgCaudal: 0,
  });

  useEffect(() => {
    const profiles = points_list || [];
    const processedData = profiles.map((profile) => {
      const hasGPS =
        profile.lat &&
        profile.lon &&
        profile.lat !== "0" &&
        profile.lon !== "0" &&
        profile.lat !== "" &&
        profile.lon !== "";
      const lat = hasGPS ? parseFloat(profile.lat.replace(",", ".")) : null;
      const lon = hasGPS ? parseFloat(profile.lon.replace(",", ".")) : null;

      // Obtener el registro más reciente de forma robusta
      const latest = validators.getLatestRecord(profile);
      const lastData = latest || profile.modules?.m1 || {};

      return {
        id: profile.id,
        title: profile.title,
        lat,
        lon,
        hasGPS,
        currentCaudal: Number(lastData.flow) || 0,
        totalConsumption:
          Number(lastData.total_today_diff) ||
          Number(lastData.total_consumed_today) ||
          0,
        flowGranted: profile.dga?.flow_granted_dga || 0,
        lastMeasurement: lastData.date_time_medition,
        lastLogger: lastData.date_time_last_logger,
        daysNotConnection: lastData.days_not_conection,
        isTelemetry: profile.config_data?.is_telemetry === true,
        codeDga: profile.dga?.code_dga,
        typeDga: profile.dga?.type_dga,
        waterTable: lastData.water_table,
        total: lastData.total,
        total_today_diff: lastData.total_today_diff,
      };
    });
    setGeoData(processedData);
    setStats({
      totalPoints: processedData.length,
      pointsWithGPS: processedData.filter((p) => p.hasGPS).length,
      pointsWithoutGPS: processedData.filter((p) => !p.hasGPS).length,
      totalCaudal: processedData.reduce((sum, p) => sum + p.currentCaudal, 0),
      totalConsumption: processedData.reduce(
        (sum, p) => sum + p.totalConsumption,
        0
      ),
      avgCaudal:
        processedData.length > 0
          ? processedData.reduce((sum, p) => sum + p.currentCaudal, 0) /
            processedData.length
          : 0,
    });
  }, [points_list]);

  const handlePointClick = useCallback((point) => {
    setSelectedPoint(point);
  }, []);

  const columns = [
    { title: "Nombre", dataIndex: "title", key: "title" },
    { title: "Código de obra", dataIndex: "codeDga", key: "codeDga" },
    {
      title: "Latitud",
      dataIndex: "lat",
      key: "lat",
      align: "right",
      render: (value) =>
        value ? (
          <span>{value}</span>
        ) : (
          <span style={{ color: ikoluTokens.colorGreyTextDisabled }}>-</span>
        ),
    },
    {
      title: "Longitud",
      dataIndex: "lon",
      key: "lon",
      align: "right",
      render: (value) =>
        value ? (
          <span>{value}</span>
        ) : (
          <span style={{ color: ikoluTokens.colorGreyTextDisabled }}>-</span>
        ),
    },
    {
      title: "GPS",
      dataIndex: "hasGPS",
      key: "hasGPS",
      align: "center",
      render: (value, record) => {
        if (value && record.isTelemetry) {
          return (
            <Badge
              status="processing"
              color={ikoluTokens.colorGreenText}
              text={
                <span style={{ color: ikoluTokens.colorGreenText, fontWeight: 600 }}>
                  Activo
                </span>
              }
              className="gps-pulse"
            />
          );
        } else if (value && !record.isTelemetry) {
          return <Tag color="orange">Sin Telemetría</Tag>;
        } else {
          return <Tag color="warning">Sin GPS</Tag>;
        }
      },
    },
    {
      title: "Última Medición",
      dataIndex: "lastMeasurement",
      key: "lastMeasurement",
      render: (value) =>
        value ? (
          <span>
            {formatSafeDate(value, "YYYY-MM-DD")} <b>{formatSafeDate(value, "HH:mm")} hrs</b>
          </span>
        ) : (
          <span style={{ color: ikoluTokens.colorGreyTextDisabled }}>-</span>
        ),
    },
  ];

  const renderSelectedPoint = () => {
    if (!selectedPoint) {
      return (
        <Card
          style={{
            position: "relative",
            overflow: "hidden",
            height: screens.xs ? "auto" : 400,
          }}
        >
          <Flex vertical style={{ width: "100%" }}>
            <Flex align="center" gap={16} style={{ marginBottom: 8 }}>
              <Skeleton.Avatar size={48} shape="circle" style={{ marginBottom: 16 }} />
              <Skeleton active paragraph={{ rows: 5 }} title={false} style={{ width: "100%" }} />
            </Flex>
            <div style={{ textAlign: "center", width: "100%", marginTop: 16 }}>
              <Text type="secondary">Selecciona un punto en el mapa para ver detalles</Text>
            </div>
          </Flex>
          {/* Onda plana, sin animación */}
          <svg
            viewBox="0 0 800 50"
            width="200%"
            height="50"
            style={{
              position: "absolute",
              left: 0,
              bottom: 0,
              zIndex: 1,
            }}
            preserveAspectRatio="none"
          >
            <path
              d="M0,40 Q100,40 200,40 T400,40 T600,40 T800,40 V50 H0 Z"
              fill={ikoluTokens.colorBlueTint}
              opacity="0.7"
            />
          </svg>
        </Card>
      );
    }
    const {
      title,
      lat,
      lon,
      currentCaudal,
      codeDga,
      lastMeasurement,
      lastLogger,
      totalConsumption,
      waterTable,
      total,
      total_today_diff,
      isTelemetry,
    } = selectedPoint;
    const hasGPS = lat && lon && lat !== 0 && lon !== 0;

    // Estado de fechas
    const today = moment().format("YYYY-MM-DD");
    const lastMedDate = lastMeasurement ? formatSafeDate(lastMeasurement, "YYYY-MM-DD") : null;
    const lastLoggerDate = lastLogger ? formatSafeDate(lastLogger, "YYYY-MM-DD") : null;
    let estado = "";
    let estadoColor = "success";
    let estadoIcon = <FaCheckCircle style={{ color: ikoluTokens.colorGreenText, marginRight: 6 }} />;
    if (!lastMedDate || lastMedDate < today) {
      if (lastMedDate === moment().subtract(1, "days").format("YYYY-MM-DD")) {
        estado = "Medición de ayer";
        estadoColor = "warning";
        estadoIcon = (
          <FaExclamationTriangle style={{ color: token.colorWarning, marginRight: 6 }} />
        );
      } else {
        estado = "Sin datos recientes";
        estadoColor = "error";
        estadoIcon = (
          <FaExclamationTriangle style={{ color: token.colorError, marginRight: 6 }} />
        );
      }
    } else {
      estado = "Actualizado hoy";
    }

    // Diferencia entre medición y logger
    let diffTag = null;
    if (lastMeasurement && lastLogger) {
      const diffMin = Math.abs(
        parseSafeDate(lastMeasurement).diff(parseSafeDate(lastLogger), "minutes")
      );
      if (diffMin >= 60) {
        diffTag = (
          <Tag
            color="error"
            style={{ textAlign: "center" }}
            icon={<FaExclamationTriangle style={{ color: token.colorError, marginRight: 4 }} />}
          >
            Desincronizado: {Math.floor(diffMin / 60)}h {diffMin % 60}m
          </Tag>
        );
      } else if (diffMin > 10) {
        diffTag = (
          <Tag style={{ textAlign: "center" }} color="warning">
            Diferencia: {diffMin} min
          </Tag>
        );
      } else {
        diffTag = (
          <Tag
            icon={<FaCheckCircle style={{ color: ikoluTokens.colorGreenText, marginRight: 4 }} />}
            style={{ textAlign: "center" }}
            color="success"
          >
            Sincronizado
          </Tag>
        );
      }
    }

    // Alertas de valores
    const alertas = [];
    if (currentCaudal === 0) {
      alertas.push({
        msg: "Caudal en 0 L/s",
        color: "error",
        icon: <FaBolt style={{ color: token.colorError, marginRight: 4 }} />,
      });
    }
    if (total_today_diff === 0) {
      alertas.push({
        msg: "Sin consumo hoy",
        color: "warning",
        icon: <FaExclamationTriangle style={{ color: token.colorWarning, marginRight: 4 }} />,
      });
    }

    // Prompt animado para caudal 0
    const CaudalPrompt = () => (
      <div style={{ marginTop: 8, minHeight: 24 }}>
        {currentCaudal === 0 && (
          <Typography.Text
            type="danger"
            style={{ fontWeight: 600, fontSize: ikoluTokens.fontSizeLarge, animation: "fadeIn 1s" }}
          >
            <FaExclamationTriangle style={{ marginRight: 6 }} /> Caudal en 0 L/s
          </Typography.Text>
        )}
      </div>
    );

    return (
      <Card
        style={{
          position: "relative",
          overflow: "hidden",
          height: screens.xs ? "auto" : 400,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Button
          type="text"
          size="small"
          icon={<ReloadOutlined />}
          style={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}
          onClick={() => setSelectedPoint(null)}
        >
          Limpiar
        </Button>
        <Flex vertical style={{ width: "100%" }} align="stretch" justify="space-between">
          <Flex align="center" gap={16} style={{ marginBottom: 8 }}>
            <FaMapMarkerAlt style={{ fontSize: 22, color: ikoluTokens.colorCorporateBlue }} />
            <div style={{ flex: 1 }}>
              <Title level={5} style={{ margin: 0, color: ikoluTokens.colorCorporateBlue, fontWeight: 700 }}>
                {title}
              </Title>
              <Text type="secondary" style={{ fontSize: 15 }}>
                {codeDga || "Sin datos"}
              </Text>
            </div>
          </Flex>
          <Flex gap="small" justify="space-between" style={{ width: "100%" }} wrap>
            <Statistic
              style={{ fontWeight: 700, color: ikoluTokens.colorCorporateBlue }}
              title="Caudal"
              valueStyle={{ fontSize: ikoluTokens.fontSizeLarge }}
              value={formatFlow(currentCaudal || 0)}
              suffix="lt/s"
            />
            <Statistic
              style={{ fontWeight: 700, color: ikoluTokens.colorCorporateBlue }}
              title="Total"
              value={total}
              valueStyle={{ fontSize: ikoluTokens.fontSizeLarge }}
              suffix="m³"
            />
            <Statistic
              style={{ fontWeight: 700, color: ikoluTokens.colorCorporateBlue }}
              title="N.Freático"
              valueStyle={{ fontSize: ikoluTokens.fontSizeLarge }}
              value={
                waterTable !== undefined && waterTable !== null
                  ? Number(waterTable).toFixed(2)
                  : "Sin datos"
              }
              suffix="m"
            />
          </Flex>
          <Divider style={{ margin: "16px 0 12px 0" }} />
          <Flex vertical gap={8}>
            <Text>
              <FaClock style={{ color: ikoluTokens.colorCorporateBlue, marginRight: 5 }} />{" "}
              {formatSafeDate(lastMeasurement, "YYYY-MM-DD HH:mm") + " hrs"}
            </Text>
            <Text>
              <FaCalendarAlt style={{ color: ikoluTokens.colorCorporateBlue, marginRight: 5 }} />{" "}
              {formatSafeDate(lastLogger, "YYYY-MM-DD HH:mm") + " hrs"}
            </Text>
            {diffTag}
          </Flex>
          <Divider style={{ margin: "16px 0 12px 0" }} />
          {hasGPS && (
            <>
              <Text style={{ color: ikoluTokens.colorGreenDarkText, fontSize: 13 }}>
                <FaMapMarkerAlt style={{ marginRight: 6, color: ikoluTokens.colorGreenText }} />
                Lat: <b>{lat}</b>
              </Text>
              <Text style={{ color: ikoluTokens.colorGreenDarkText, fontSize: 13 }}>
                <FaMapMarkerAlt style={{ marginRight: 6, color: ikoluTokens.colorGreenText }} />
                Lon: <b>{lon}</b>
              </Text>
            </>
          )}
        </Flex>
        {selectedPoint && selectedPoint.isTelemetry ? (
          <>
            <svg
              viewBox="0 0 800 50"
              width="200%"
              height="50"
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                zIndex: 1,
                animation: "waveMove 8s linear infinite",
              }}
              preserveAspectRatio="none"
            >
              <path
                d="M0,30 Q100,50 200,30 T400,30 T600,30 T800,30 V50 H0 Z"
                fill={ikoluTokens.colorBlueTint}
                opacity="0.7"
              />
            </svg>
          </>
        ) : (
          <svg
            viewBox="0 0 800 50"
            width="200%"
            height="50"
            style={{
              position: "absolute",
              left: 0,
              bottom: 0,
              zIndex: 1,
            }}
            preserveAspectRatio="none"
          >
            <path
              d="M0,40 Q100,40 200,40 T400,40 T600,40 T800,40 V50 H0 Z"
              fill={ikoluTokens.colorBlueTint}
              opacity="0.7"
            />
          </svg>
        )}
      </Card>
    );
  };

  const hasGeoPoints = geoData.some((p) => p.hasGPS === true);

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <Card
            style={{
              height: 400,
              background: "#f8fafc",
              border: `1.5px solid ${ikoluTokens.colorBlueTint}`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
            bodyStyle={{ padding: 0, flex: 1, position: "relative" }}
          >
            {hasGeoPoints ? (
              <GeoMap geoData={geoData} onPointClick={handlePointClick} />
            ) : (
              <Flex align="center" justify="center" style={{ height: "100%" }} vertical gap="small">
                <Typography.Title level={4} style={{ color: ikoluTokens.colorCorporateBlue, margin: 0 }}>
                  GEO Smart
                </Typography.Title>
                <Typography.Text type="secondary">No hay puntos con GPS configurados</Typography.Text>
              </Flex>
            )}
          </Card>
        </Col>
        <Col xs={24} md={8}>
          {renderSelectedPoint()}
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            columns={columns}
            dataSource={geoData}
            bordered
            size="small"
            pagination={{ pageSize: 10 }}
            style={{ width: "100%", marginTop: 16 }}
            scroll={{ x: "max-content" }}
            rowKey="id"
          />
        </Col>
      </Row>
    </>
  );
};

export default React.memo(GeoSmart);
