import React, { useState, useRef } from "react";
import { Row, Col, Card, Typography, Button, Drawer, Table, Flex } from "antd";
import {
  LoadingOutlined,
  TableOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Statistic } from "antd";
import moment from "moment";
import QueueAnim from "rc-queue-anim";
import { useResponsive } from "../../hooks/useResponsive";
import { useTelemetryData } from "../../hooks/useTelemetryData";
import { useUserProfilesContext } from "../../contexts/UserProfilesContext";
import Well from "./Well";
import WellTechnicalSheet from "./WellTechnicalSheet";
import MyLastRegisters from "./MyLastRegisters";

// Importar imágenes
import caudal_img from "../../assets/images/caudal.png";
import nivel_img from "../../assets/images/nivel.png";
import acumulado_img from "../../assets/images/acumulado.png";

const { Text } = Typography;

// Formateador de números con puntos como separador de miles
const numberForMiles = new Intl.NumberFormat("de-DE");

/**
 * 🚰 COMPONENTE METRIC CARD
 * Tarjeta reutilizable para mostrar métricas con icono y estado de carga
 */
const MetricCard = ({ title, value, unit, icon, loading }) => (
  <Card
    size="small"
    style={{
      marginBottom: "16px",
      borderRadius: "12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    }}
  >
    <Flex align="center" gap="middle">
      <div style={{ fontSize: "24px" }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
          {title}
        </div>
        {loading ? (
          <div
            style={{
              width: "60px",
              height: "20px",
              background:
                "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
              backgroundSize: "200% 100%",
              animation: "loading 1.5s infinite",
              borderRadius: "4px",
            }}
          />
        ) : (
          <div
            style={{ fontSize: "20px", fontWeight: "600", color: "#1F3461" }}
          >
            {value} {unit}
          </div>
        )}
      </div>
    </Flex>
  </Card>
);

/**
 * 🏗️ COMPONENTE MYWELL REFACTORIZADO
 *
 * Ahora usa hooks personalizados para obtener datos desde la API
 * en lugar de depender del contexto del login.
 *
 * Características principales:
 * - Recarga automática basada en frecuencia real del punto de captación
 * - Datos siempre actualizados desde la API
 * - Título dinámico del punto de captación
 * - Sistema de polling inteligente
 */
const MyWell = () => {
  const { isMobile } = useResponsive();
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Usar el contexto compartido en lugar del hook individual
  const { selectedProfile, changeSelectedProfile } = useUserProfilesContext();
  const {
    data: telemetryData,
    loading,
    error,
    nextMeasurement,
    frecuency,
    refreshData,
  } = useTelemetryData(selectedProfile?.id);

  // Extraer datos del hook de telemetría
  const profile = telemetryData?.profile;
  const telemetry = telemetryData?.telemetry;
  const currentData = telemetry?.currentData;

  // Estados locales para datos procesados
  const [lastRegisters, setLastRegisters] = useState([]);

  // Procesar registros de hoy cuando cambien los datos
  React.useEffect(() => {
    if (telemetry?.todayRegisters) {
      const today = new Date().toISOString().slice(0, 10);
      const todayRegisters = telemetry.todayRegisters.filter(
        (reg) => reg.date_time_medition?.slice(0, 10) === today
      );

      const processedData = todayRegisters.map((result, i, arr) => ({
        ...result,
        total_hora: (result.total || 0) - (arr[i + 1]?.total || 0),
      }));

      setLastRegisters(processedData);
    }
  }, [telemetry?.todayRegisters]);

  // Función para formatear fechas
  const formatDate = (date) => {
    if (!date) return { date: "N/A", time: "" };
    const d = new Date(date);
    const datePart = d.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timePart = `${String(d.getHours()).padStart(2, "0")}:00 hrs`;
    return { date: datePart, time: timePart };
  };

  // Configuración de columnas para la tabla de registros
  const columns = [
    {
      title: "Hora",
      dataIndex: "date_time_medition",
      render: (time) => time.slice(11, 16) + " hrs",
      width: 90,
    },
    {
      title: "Caudal (Lt/s)",
      dataIndex: "flow",
      render: (flow) => (parseFloat(flow) || 0).toFixed(2),
      width: 100,
    },
    {
      title: "Nivel F. (m)",
      dataIndex: "water_table",
      render: (nivel) => (parseFloat(nivel) || 0).toFixed(2),
      width: 100,
    },
    {
      title: "m³/hora",
      dataIndex: "total_diff",
      render: (a) => numberForMiles.format(a || 0),
      width: 110,
    },
    {
      title: "m³/día",
      dataIndex: "total_today_diff",
      render: (a) => numberForMiles.format(a || 0),
      width: 110,
    },
    {
      title: "Totalizador (m³)",
      dataIndex: "total",
      render: (total) => numberForMiles.format(total || 0),
      width: 120,
    },
  ];

  // Mostrar error si hay problema con los datos
  if (error) {
    return (
      <Card style={{ margin: "20px", textAlign: "center" }}>
        <Text type="danger">Error cargando datos: {error}</Text>
        <br />
        <Button onClick={refreshData} style={{ marginTop: "16px" }}>
          Reintentar
        </Button>
      </Card>
    );
  }

  // Mostrar loading si no hay datos
  if (!profile || !telemetry) {
    return (
      <Card style={{ margin: "20px", textAlign: "center" }}>
        <LoadingOutlined spin style={{ fontSize: "24px" }} />
        <br />
        <Text>Cargando datos del punto de captación...</Text>
      </Card>
    );
  }

  // --- VISTA MÓVIL ---
  if (isMobile) {
    return (
      <div>
        {/* Header con título del punto de captación */}
        <Card
          style={{
            marginBottom: "16px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #1F3461 0%, #2E5B8A 100%)",
            color: "white",
          }}
        >
          <Flex align="center" justify="space-between">
            <div>
              <Text
                style={{ color: "white", fontSize: "18px", fontWeight: "600" }}
              >
                {profile.title}
              </Text>
              <br />
              <Text
                style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}
              >
                Frecuencia: {frecuency} min | Próxima:{" "}
                {nextMeasurement
                  ? moment(nextMeasurement).format("HH:mm")
                  : "N/A"}
              </Text>
            </div>
            <Button
              type="primary"
              icon={<LoadingOutlined spin={loading} />}
              onClick={refreshData}
              disabled={loading}
            >
              Actualizar
            </Button>
          </Flex>
        </Card>

        <Row gutter={[8, 8]}>
          <Col span={24}>
            <MetricCard
              title="Caudal"
              value={(parseFloat(currentData?.caudal) || 0).toFixed(2)}
              unit="L/s"
              icon={<img src={caudal_img} alt="caudal" style={{ width: 24 }} />}
              loading={loading}
            />
          </Col>
          <Col span={24}>
            <MetricCard
              title="Nivel Freático"
              value={(parseFloat(currentData?.nivel) || 0).toFixed(2)}
              unit="m"
              icon={<img src={nivel_img} alt="nivel" style={{ width: 24 }} />}
              loading={loading}
            />
          </Col>
          <Col span={24}>
            <MetricCard
              title="Acumulado Total"
              value={new Intl.NumberFormat("de-DE").format(
                currentData?.acumulado || 0
              )}
              unit="m³"
              icon={
                <img
                  src={acumulado_img}
                  alt="acumulado"
                  style={{ width: 24 }}
                />
              }
              loading={loading}
            />
          </Col>
          <Col span={24}>
            <MetricCard
              title="Último Registro"
              value={
                telemetry?.lastMeasurement
                  ? formatDate(telemetry.lastMeasurement).date
                  : "N/A"
              }
              unit={
                telemetry?.lastMeasurement
                  ? formatDate(telemetry.lastMeasurement).time
                  : ""
              }
              icon={<ClockCircleOutlined style={{ color: "#1F3461" }} />}
              loading={loading}
            />
          </Col>
        </Row>

        <Flex justify="center" style={{ margin: "16px 0" }}>
          <div
            style={{
              width: "100%",
              maxWidth: "280px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Well
              total={currentData?.acumulado || 0}
              nivel={currentData?.nivel || 0}
              caudal={currentData?.caudal || 0}
              profW={profile?.config_data?.d1 || 0}
              loading={loading}
            />
          </div>
        </Flex>

        <Flex vertical={true} gap="middle">
          {/* Ficha Técnica */}
          <WellTechnicalSheet profile={profile} loading={loading} />

          {/* Consumos Combinados */}
          <Card
            title={
              <Flex align="center" gap="small">
                <RiseOutlined /> Consumos
              </Flex>
            }
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <Row gutter={[8, 8]}>
              <Col span={24}>
                <Card
                  size="small"
                  style={{
                    textAlign: "center",
                    background: "#fafafa",
                    border: "1px solid #f0f0f0",
                    padding: "4px",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "11",
                        color: "#666",
                        marginBottom: "4px",
                      }}
                    >
                      Hoy ({moment().format("DD MMM")})
                    </div>
                    {loading ? (
                      <LoadingOutlined
                        spin
                        style={{ fontSize: 16, color: "#27AE60" }}
                      />
                    ) : (
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#27AE60",
                        }}
                      >
                        {currentData?.acumDia || 0} m³
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
              <Col span={24}>
                <Card
                  size="small"
                  style={{
                    textAlign: "center",
                    background: "#fafafa",
                    border: "1px solid #f0f0f0",
                    padding: "4px",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "11",
                        color: "#666",
                        marginBottom: "4px",
                      }}
                    >
                      Ayer ({moment().subtract(1, "days").format("DD MMM")})
                    </div>
                    {loading ? (
                      <LoadingOutlined
                        spin
                        style={{ fontSize: 16, color: "#F2994A" }}
                      />
                    ) : (
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#F2994A",
                        }}
                      >
                        {currentData?.acumAyer || 0} m³
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
            <div style={{ marginTop: "16px" }}>
              <MyLastRegisters />
            </div>
          </Card>
        </Flex>
      </div>
    );
  }

  // --- VISTA ESCRITORIO ---
  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
      }}
    >
      {/* Header con título del punto de captación */}
      <Card
        style={{
          marginBottom: "16px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #1F3461 0%, #2E5B8A 100%)",
          color: "white",
        }}
      >
        <Flex align="center" justify="space-between">
          <div>
            <Text
              style={{ color: "white", fontSize: "24px", fontWeight: "600" }}
            >
              {profile.title}
            </Text>
            <br />
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px" }}>
              Frecuencia de medición: {frecuency} minutos | Próxima medición:{" "}
              {nextMeasurement
                ? moment(nextMeasurement).format("HH:mm:ss")
                : "N/A"}
            </Text>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<LoadingOutlined spin={loading} />}
            onClick={refreshData}
            disabled={loading}
          >
            Actualizar Datos
          </Button>
        </Flex>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Columna Izquierda: Indicadores */}
        <Col xs={24} sm={24} md={7} lg={7} xl={7}>
          <QueueAnim delay={200} type="left">
            <div key="metrics">
              <div>
                <MetricCard
                  title="Caudal"
                  value={(parseFloat(currentData?.caudal) || 0).toFixed(2)}
                  unit="(Lt/s)"
                  icon={
                    <img src={caudal_img} alt="caudal" style={{ width: 24 }} />
                  }
                  loading={loading}
                />
                <MetricCard
                  title="Nivel Freático"
                  value={(parseFloat(currentData?.nivel) || 0).toFixed(2)}
                  unit="(m)"
                  icon={
                    <img src={nivel_img} alt="nivel" style={{ width: 24 }} />
                  }
                  loading={loading}
                />
                <MetricCard
                  title="Acumulado Total"
                  value={numberForMiles.format(currentData?.acumulado || 0)}
                  unit="(m³)"
                  icon={
                    <img
                      src={acumulado_img}
                      alt="acumulado"
                      style={{ width: 24 }}
                    />
                  }
                  loading={loading}
                />
                <MetricCard
                  title="Último Registro"
                  value={
                    telemetry?.lastMeasurement
                      ? formatDate(telemetry.lastMeasurement).date
                      : "N/A"
                  }
                  unit={
                    telemetry?.lastMeasurement
                      ? formatDate(telemetry.lastMeasurement).time
                      : ""
                  }
                  icon={<ClockCircleOutlined style={{ color: "#1F3461" }} />}
                  loading={loading}
                />
              </div>
            </div>
            <div key="b">
              <Card
                title={
                  <Flex align="center" gap="small">
                    <RiseOutlined /> Consumos
                  </Flex>
                }
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <Card
                      size="small"
                      style={{
                        textAlign: "center",
                        background: "#fafafa",
                        border: "1px solid #f0f0f0",
                        padding: "4px",
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: "11",
                            color: "#666",
                            marginBottom: "4px",
                          }}
                        >
                          Hoy ({moment().format("DD MMM")})
                        </div>
                        {loading ? (
                          <LoadingOutlined
                            spin
                            style={{ fontSize: 16, color: "#27AE60" }}
                          />
                        ) : (
                          <div
                            style={{
                              fontSize: "16",
                              fontWeight: "600",
                              color: "#27AE60",
                            }}
                          >
                            {currentData?.acumDia || 0} m³
                          </div>
                        )}
                      </div>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      size="small"
                      style={{
                        textAlign: "center",
                        background: "#fafafa",
                        border: "1px solid #f0f0f0",
                        padding: "4px",
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: "11",
                            color: "#666",
                            marginBottom: "4px",
                          }}
                        >
                          Ayer ({moment().subtract(1, "days").format("DD MMM")})
                        </div>
                        {loading ? (
                          <LoadingOutlined
                            spin
                            style={{ fontSize: 16, color: "#F2994A" }}
                          />
                        ) : (
                          <div
                            style={{
                              fontSize: "16",
                              fontWeight: "600",
                              color: "#F2994A",
                            }}
                          >
                            {currentData?.acumAyer || 0} m³
                          </div>
                        )}
                      </div>
                    </Card>
                  </Col>
                </Row>
              </Card>
            </div>
          </QueueAnim>
        </Col>

        {/* Columna Central: Pozo y Mediciones */}
        <Col xs={24} sm={24} md={10} lg={10} xl={10}>
          <QueueAnim delay={400} type="bottom">
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                padding: "24px 16px",
                height: "100%",
                position: "relative",
              }}
            >
              <Flex
                justify="flex-end"
                style={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}
              >
                <Button
                  type="primary"
                  icon={loading ? <LoadingOutlined spin /> : <TableOutlined />}
                  onClick={() => setDrawerVisible(true)}
                  disabled={loading}
                  loading={loading}
                >
                  Mediciones ({loading ? "..." : lastRegisters.length})
                </Button>
              </Flex>
              <Flex
                vertical
                align="center"
                justify="center"
                style={{ height: "100%", width: "100%" }}
              >
                <Flex justify="center" align="center" style={{ width: "100%" }}>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "320px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Well
                      total={currentData?.acumulado || 0}
                      nivel={currentData?.nivel || 0}
                      caudal={currentData?.caudal || 0}
                      profW={profile?.config_data?.d1 || 0}
                      loading={loading}
                    />
                  </div>
                </Flex>
                {loading ? (
                  <Flex align="center" gap="middle">
                    <ClockCircleOutlined
                      style={{ fontSize: 20, color: "#5D6983" }}
                    />
                    <div>
                      <div
                        style={{
                          color: "#5D6983",
                          fontSize: "12",
                          marginBottom: "4px",
                        }}
                      >
                        Próxima medición en:
                      </div>
                      <div
                        style={{
                          width: "80px",
                          height: "22px",
                          background:
                            "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                          backgroundSize: "200% 100%",
                          animation: "loading 1.5s infinite",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                  </Flex>
                ) : nextMeasurement ? (
                  <Flex align="center" gap="middle">
                    <Statistic.Countdown
                      title={
                        <Text style={{ color: "#5D6983" }}>
                          Próxima medición en:
                        </Text>
                      }
                      value={nextMeasurement}
                      format="HH:mm:ss"
                      valueStyle={{ color: "#1F3461", fontSize: 22 }}
                    />
                  </Flex>
                ) : null}
              </Flex>
            </Card>
          </QueueAnim>
        </Col>

        {/* Columna Derecha: Ficha Técnica */}
        <Col xs={24} sm={24} md={7} lg={7} xl={7}>
          <QueueAnim type="right" delay={200}>
            <div key="d">
              <WellTechnicalSheet profile={profile} loading={loading} />
            </div>
          </QueueAnim>
        </Col>
      </Row>

      {/* Drawer para mostrar registros */}
      <Drawer
        title={<Text style={{ color: "white" }}>Registros de Hoy</Text>}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={700}
        closable={true}
        closeIcon={<CloseOutlined style={{ color: "white" }} />}
        headerStyle={{ backgroundColor: "#1F3461" }}
        bodyStyle={{ padding: "8px" }}
      >
        <Table
          dataSource={lastRegisters}
          columns={columns}
          bordered={true}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          rowKey="id"
        />
      </Drawer>

      {/* Estilos CSS para la animación del skeleton */}
      <style>
        {`
          @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>
    </div>
  );
};

export default MyWell;
