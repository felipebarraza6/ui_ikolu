import React, { useState, useEffect, useCallback, useContext } from "react";
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
  theme,
} from "antd";
import {
  EnvironmentOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  LinkOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  FaHouseFloodWater,
  FaGlassWaterDroplet,
  FaHandHoldingDroplet,
} from "react-icons/fa6";
import { MdWater } from "react-icons/md";
import { formatInteger, formatFlow } from "../../utils/numberFormatter";
import { useResponsive } from "../../hooks/useResponsive";
import { AppContext } from "../../App";
import ConsumptionChart from "./ConsumptionChart";
import AnalysisPrompt from "./AnalysisPrompt";
import moment from "moment";
import { Link } from "react-router-dom";
import FlowStatusGauges from "./FlowStatusGauges";
import GeoMap from "./GeoMap";
import StatusTag from "./StatusTag";

const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

const MetricCard = ({ title, value, unit, icon, loading }) => {
  const { token } = useToken();
  return (
    <Card
      hoverable
      style={{
        flex: 1,
        minWidth: 160,
        borderRadius: "12px",
        background: `linear-gradient(135deg, ${token.colorPrimary} 0%, #1d3a70 100%)`,
        color: "white",
      }}
    >
      <Statistic
        title={
          <Flex align="center" gap="small">
            {React.cloneElement(icon, {
              style: { color: "white", fontSize: 18 },
            })}
            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>
              {title}
            </Text>
          </Flex>
        }
        value={loading ? "-" : value}
        suffix={
          loading ? null : (
            <Text
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 16,
                marginLeft: 4,
              }}
            >
              {unit}
            </Text>
          )
        }
        valueStyle={{
          color: "white",
          fontWeight: 600,
          fontSize: 24,
        }}
      />
    </Card>
  );
};

const GeoSmart = () => {
  const { state } = useContext(AppContext);
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [geoData, setGeoData] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [stats, setStats] = useState({
    totalPoints: 0,
    pointsWithGPS: 0,
    pointsWithoutGPS: 0,
    totalCaudal: 0,
    totalConsumption: 0,
    avgCaudal: 0,
  });

  const processGeoData = useCallback(() => {
    setLoading(true);
    const profiles = state.profile_client || [];

    const processedData = profiles.map((profile) => {
      const hasGPS =
        profile.lat &&
        profile.lon &&
        profile.lat !== "0" &&
        profile.lon !== "0";
      const lat = hasGPS ? parseFloat(profile.lat.replace(",", ".")) : null;
      const lon = hasGPS ? parseFloat(profile.lon.replace(",", ".")) : null;
      const lastM1Data = profile.modules?.m1 || {};
      return {
        id: profile.id,
        title: profile.title,
        lat,
        lon,
        hasGPS,
        currentCaudal: Number(lastM1Data.flow) || 0,
        totalConsumption:
          Number(lastM1Data.total_today_diff) ||
          Number(lastM1Data.total_consumed_today) ||
          0,
        flowGranted: profile.dga?.flow_granted_dga || 0,
        lastMeasurement: lastM1Data.date_time_medition,
        lastLogger: lastM1Data.date_time_last_logger,
        daysNotConnection: lastM1Data.days_not_conection,
        isTelemetry: profile.config_data?.is_telemetry === true,
        codeDga: profile.dga?.code_dga,
        typeDga: profile.dga?.type_dga,
        waterTable: lastM1Data.water_table,
        total: lastM1Data.total,
      };
    });

    setGeoData(processedData);

    const totalPoints = processedData.length;
    const pointsWithGPS = processedData.filter((p) => p.hasGPS).length;
    const totalCaudal = processedData.reduce(
      (sum, p) => sum + p.currentCaudal,
      0
    );
    const totalConsumption = processedData.reduce(
      (sum, p) => sum + p.totalConsumption,
      0
    );

    setStats({
      totalPoints,
      pointsWithGPS,
      pointsWithoutGPS: totalPoints - pointsWithGPS,
      totalCaudal,
      totalConsumption,
      avgCaudal: totalPoints > 0 ? totalCaudal / totalPoints : 0,
    });

    if (processedData.length > 0 && !selectedPoint) {
      const firstPointWithGPS = processedData.find((p) => p.hasGPS);
      if (firstPointWithGPS) {
        setSelectedPoint(firstPointWithGPS);
      }
    }

    setLoading(false);
  }, [state.profile_client]);

  useEffect(() => {
    processGeoData();
  }, [processGeoData]);

  const handlePointClick = useCallback((point) => {
    setSelectedPoint(point);
  }, []);

  const handleMapLoaded = useCallback((map) => {
    setMapInstance(map);
  }, []);

  const getGoogleMapsUrl = (lat, lon) => {
    return `https://www.google.com/maps?q=${lat},${lon}`;
  };

  const renderStats = () => (
    <Card
      title={`Indicadores Correspondientes a Hoy (${moment().format(
        "DD/MM/YYYY"
      )})`}
    >
      <Flex gap="large" wrap="wrap">
        <MetricCard
          title="Total Captaciones"
          value={stats.totalPoints}
          icon={<EnvironmentOutlined />}
          loading={loading}
        />
        <MetricCard
          title="Caudal Total"
          value={formatFlow(stats.totalCaudal)}
          unit="l/s"
          icon={<FaGlassWaterDroplet />}
          loading={loading}
        />
        <MetricCard
          title="Consumo Total"
          value={formatInteger(stats.totalConsumption)}
          unit="m³"
          icon={<FaHouseFloodWater />}
          loading={loading}
        />
        <MetricCard
          title="Con GPS"
          value={stats.pointsWithGPS}
          unit={`de ${stats.totalPoints}`}
          icon={<EyeOutlined />}
          loading={loading}
        />
      </Flex>
    </Card>
  );

  const renderSelectedPoint = () => {
    if (loading) return <Spin />;
    if (!selectedPoint) {
      return (
        <Card style={{ height: "100%", overflowY: "auto" }}>
          <Flex
            vertical
            align="center"
            justify="center"
            style={{ height: "100%", textAlign: "center" }}
          >
            <EnvironmentOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
            <Title level={5} style={{ marginTop: 16, color: "#8c8c8c" }}>
              Selecciona un punto
            </Title>
            <Text type="secondary">
              Haz clic en un marcador del mapa para ver sus detalles.
            </Text>
          </Flex>
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
    } = selectedPoint;

    return (
      <Card
        style={{ height: "100%", overflowY: "auto" }}
        hoverable
        title={
          <Flex align="center" gap="small">
            <EnvironmentOutlined />
            <Title level={5} style={{ margin: 0 }}>
              {title}
            </Title>
          </Flex>
        }
        extra={<StatusTag point={selectedPoint} />}
      >
        <div style={{ padding: "16px", flexGrow: 1, overflowY: "auto" }}>
          <Row gutter={[16, 24]}>
            <Col span={12}>
              <Statistic
                title="Caudal"
                value={formatFlow(currentCaudal)}
                prefix={<FaHandHoldingDroplet />}
                valueStyle={{ fontSize: "20px" }}
                suffix="l/s"
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Nivel Freático"
                value={formatFlow(selectedPoint.waterTable)}
                prefix={<MdWater />}
                valueStyle={{ fontSize: "20px" }}
              />
            </Col>
          </Row>

          <Divider style={{ margin: "16px 0" }} />

          <Title level={5}>Información Adicional</Title>
          <Paragraph>
            <Text strong>Código DGA:</Text> {codeDga || "No disponible"}
          </Paragraph>
          <Paragraph>
            <Text strong>Última Medición:</Text>{" "}
            {lastMeasurement
              ? moment(lastMeasurement).format("YYYY-MM-DD")
              : "No disponible"}
          </Paragraph>
          <Paragraph>
            <Text strong>Último Logger:</Text>{" "}
            {lastLogger
              ? moment(lastLogger).format("YYYY-MM-DD")
              : "No disponible"}
          </Paragraph>
        </div>
        <div>
          <Flex vertical gap="small">
            <Button
              type="primary"
              icon={<LinkOutlined />}
              href={getGoogleMapsUrl(lat, lon)}
              target="_blank"
              rel="noopener noreferrer"
              block
            >
              Ver en Google Maps
            </Button>
          </Flex>
        </div>
      </Card>
    );
  };

  const columns = [
    { title: "Nombre", dataIndex: "title", key: "title", fixed: false },
    {
      title: "Fecha",
      dataIndex: "lastMeasurement",
      key: "lastMeasurement",
      render: (value) =>
        value ? moment(value).format("YYYY-MM-DD HH:mm") : "-",
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
      title: "Total Acumulado",
      dataIndex: "total",
      key: "total",
      align: "right",
      render: (value) =>
        value !== undefined && value !== null ? formatInteger(value) : "-",
    },
    {
      title: "Consumo Hoy",
      dataIndex: "totalConsumption",
      key: "totalConsumption",
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
        value ? <Tag color="success">Sí</Tag> : <Tag color="warning">No</Tag>,
    },
  ];

  return (
    <div
      style={{
        height: "100%",
        padding: isMobile ? "8px" : "16px",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4e3ff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      }}
    >
      <Flex vertical style={{ height: "100%" }} gap="large">
        {renderStats()}

        <AnalysisPrompt profiles={state.profile_client} />

        <Row gutter={[16, 16]}>
          <Card style={{ width: "100%" }}>
            <Flex vertical gap="middle">
              <ConsumptionChart />
              <FlowStatusGauges profiles={state.profile_client} />
            </Flex>
          </Card>
        </Row>

        <Row gutter={[16, 16]} style={{ flex: 1, minHeight: "500px" }}>
          <Col xs={24} lg={16} style={{ height: "100%" }}>
            <Card
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
              bodyStyle={{ padding: 0, flex: 1, position: "relative" }}
            >
              <GeoMap
                geoData={geoData}
                onPointClick={handlePointClick}
                onMapLoaded={handleMapLoaded}
              />
            </Card>
          </Col>
          <Col xs={24} lg={8} style={{ height: "100%" }}>
            {renderSelectedPoint()}
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={geoData}
          bordered
          size="small"
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
          summary={() =>
            geoData.length > 0 ? (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <Text strong>Totales</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  <Text strong>{formatFlow(stats.totalCaudal)} L/s</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} />
                <Table.Summary.Cell index={5} />
                <Table.Summary.Cell index={6} align="right">
                  <Text strong>{formatInteger(stats.totalConsumption)} m³</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7} />
              </Table.Summary.Row>
            ) : null
          }
          rowKey="id"
        />
      </Flex>
    </div>
  );
};

export default GeoSmart;
