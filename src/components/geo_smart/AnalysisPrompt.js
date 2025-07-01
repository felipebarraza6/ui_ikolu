import React from "react";
import {
  Card,
  Typography,
  Flex,
  Tag,
  List,
  Statistic,
  Row,
  Col,
  Empty,
  theme,
  Alert,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReadOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { LuBrain } from "react-icons/lu";
import {
  FaWater,
  FaTint,
  FaBroadcastTower,
  FaStream,
  FaArrowDown,
} from "react-icons/fa";
import { formatInteger, formatFlow } from "../../utils/numberFormatter";
import moment from "moment";
import "moment/locale/es";
import { WiThermometer } from "react-icons/wi";
import { useDataStatistics } from "./hooks/useDataValidation";
import FlowStatusGauges from "./FlowStatusGauges";

moment.locale("es");
const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

// Componente para mostrar alertas de errores de datos
const DataErrorAlert = ({ errors, invalidProfiles, totalProfiles }) => {
  if (errors.length === 0 && invalidProfiles === 0) {
    return null;
  }

  const errorMessages = [];

  if (invalidProfiles > 0) {
    errorMessages.push(`${invalidProfiles} perfiles inválidos encontrados`);
  }

  if (errors.length > 0) {
    errorMessages.push(`${errors.length} errores de procesamiento`);
  }

  return (
    <Alert
      message="Advertencias de Datos"
      description={
        <div>
          <Text type="secondary">
            Se encontraron algunos problemas con los datos:
          </Text>
          <ul style={{ marginTop: 8, marginBottom: 0 }}>
            {errorMessages.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
          {errors.length > 0 && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ cursor: "pointer", color: "#1890ff" }}>
                Ver detalles de errores
              </summary>
              <ul style={{ marginTop: 4 }}>
                {errors.map((error, index) => (
                  <li key={index} style={{ fontSize: "12px" }}>
                    <Text code>{error.profile}</Text>: {error.error}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      }
      type="warning"
      showIcon
      icon={<InfoCircleOutlined />}
      style={{ marginBottom: 16 }}
    />
  );
};

// Componente para mostrar tags de cambio
const ChangeTag = ({ change }) => {
  if (change === Infinity) {
    return <Tag color="blue">Nuevo</Tag>;
  }

  if (change > 0) {
    return (
      <Tag color="red" icon={<ArrowUpOutlined />}>
        {change.toFixed(1)}%
      </Tag>
    );
  }

  if (change < 0) {
    return (
      <Tag color="warning" icon={<ArrowDownOutlined />}>
        {Math.abs(change).toFixed(1)}%
      </Tag>
    );
  }

  return <Tag>{change.toFixed(1)}%</Tag>;
};

// Componente para listas con manejo de datos vacíos
const DataList = ({ data, type, renderItem }) => {
  if (!data || data.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={<Text type="secondary">Sin {type}</Text>}
      />
    );
  }

  return (
    <List
      dataSource={data}
      renderItem={renderItem}
      size="small"
      style={{ maxHeight: "200px", overflowY: "auto", paddingRight: "8px" }}
    />
  );
};

// Componente principal
const AnalysisPrompt = ({ profiles }) => {
  const { token } = useToken();
  const analysis = useDataStatistics(profiles);

  // --- Mejoras: agregar hora real a highestFlows y usar m1 en loggerStatuses ---
  // Mapear highestFlows para agregar la hora real del máximo caudal
  const highestFlowsWithTime = React.useMemo(() => {
    return analysis.highestFlows.map((item) => {
      // Buscar el registro con el valor máximo
      const profile = profiles.find((p) => p.title === item.name);
      let maxTime = null;
      if (profile && Array.isArray(profile.modules?.today)) {
        const maxRecord = profile.modules.today.reduce((max, curr) => {
          return (Number(curr.flow) || 0) === item.value ? curr : max;
        }, null);
        maxTime = maxRecord?.date_time_medition || null;
      }
      return { ...item, time: maxTime };
    });
  }, [analysis.highestFlows, profiles]);

  // Mapear loggerStatuses para usar m1 si existe
  const loggerStatusesWithM1 = React.useMemo(() => {
    return analysis.loggerStatuses.map((item) => {
      const profile = profiles.find((p) => p.title === item.name);
      let lastUpdated = item.last_updated;
      if (
        profile &&
        profile.modules?.m1 &&
        profile.modules.m1.date_time_medition
      ) {
        lastUpdated = moment(profile.modules.m1.date_time_medition);
      }
      return { ...item, last_updated: lastUpdated };
    });
  }, [analysis.loggerStatuses, profiles]);

  const mainCardTitle = (
    <Flex align="center" gap="small">
      <LuBrain />
      <Title level={5} style={{ margin: 0 }}>
        Estado Actual del Servicio
      </Title>
    </Flex>
  );

  if (!analysis.hasData) {
    return (
      <Card title={mainCardTitle}>
        <Empty description="No se encontraron perfiles para analizar." />
      </Card>
    );
  }

  return (
    <>
      {/* Mostrar alertas de errores si existen */}
      <DataErrorAlert
        errors={analysis.errors || []}
        invalidProfiles={analysis.invalidProfiles || 0}
        totalProfiles={analysis.totalProfiles || 0}
      />

      <Row gutter={[16, 16]} style={{ height: "100%" }}>
        {/* Indicadores de Caudal - PRIMERO */}
        <Col span={24}>
          <Card
            type="inner"
            title={
              <Flex align="center" gap="small">
                <FaStream style={{ color: "#1976d2" }} />
                <Text>Estado de Caudales</Text>
              </Flex>
            }
            style={{ marginBottom: 32 }}
          >
            <Paragraph
              type="secondary"
              style={{
                fontSize: "0.8rem",
                marginBottom: "1rem",
              }}
            >
              Caudales actuales de todos los puntos de captación activos hoy.
            </Paragraph>
            <FlowStatusGauges profiles={profiles} />
          </Card>
        </Col>

        {/* Resumen General */}
        <Col span={24}>
          <div
            style={{
              background: token.colorFillAlter,
              padding: "16px",
              borderRadius: token.borderRadiusLG,
            }}
          >
            <Statistic
              title={
                <Flex align="center" gap="small">
                  <ReadOutlined />
                  <Text>Resumen General del Consumo</Text>
                </Flex>
              }
              value={analysis.totals.today}
              formatter={(val) => formatInteger(val) + " m³"}
            />
            <Paragraph
              type="secondary"
              style={{ marginTop: "8px", marginBottom: 0 }}
            >
              Hoy el consumo ha tenido una variación del{" "}
              <ChangeTag change={analysis.overallChange} /> respecto a los{" "}
              <Text strong>{formatInteger(analysis.totals.yesterday)} m³</Text>{" "}
              de ayer. Esto se basa en los{" "}
              <Text strong>
                {analysis.totals.activeToday} de {analysis.totalProfiles}
              </Text>{" "}
              puntos con consumo hoy, frente a los{" "}
              <Text strong>{analysis.totals.activeYesterday}</Text> que
              consumieron ayer.
              {analysis.stoppedConsuming.length > 0 && (
                <>
                  <br />
                  Puntos como{" "}
                  <Text strong>
                    {analysis.stoppedConsuming.join(", ")}
                  </Text>{" "}
                  consumieron ayer pero hoy no registran consumo.
                </>
              )}
            </Paragraph>
          </div>
        </Col>

        {/* Picos de Consumo */}
        <Col xs={24} lg={12}>
          <Card
            style={{ width: "100%", height: "100%" }}
            type="inner"
            title={
              <Title
                level={5}
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FaBroadcastTower style={{ color: "#1890ff" }} />
                Picos de Consumo
              </Title>
            }
          >
            <Paragraph
              type="secondary"
              style={{
                minHeight: "auto",
                fontSize: "0.8rem",
                marginBottom: "1rem",
              }}
            >
              Ranking de los puntos de captación ordenados por su consumo total
              durante el día de hoy.
            </Paragraph>
            <DataList
              data={analysis.todayConsumers}
              type="consumidores"
              renderItem={(item) => (
                <List.Item style={{ padding: "8px 0" }}>
                  <Text style={{ flex: 1 }}>{item.name}</Text>
                  <Text strong>{formatInteger(item.value)} m³</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Mayores Caudales */}
        <Col xs={24} lg={12}>
          <Card
            style={{ width: "100%", height: "100%" }}
            type="inner"
            title={
              <Title
                level={5}
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FaStream style={{ color: "#52c41a" }} />
                Mayores Caudales
              </Title>
            }
          >
            <Paragraph
              type="secondary"
              style={{
                minHeight: "auto",
                fontSize: "0.8rem",
                marginBottom: "1rem",
              }}
            >
              Ranking de los puntos de captación con el mayor caudal instantáneo
              registrado durante el día.
            </Paragraph>
            <DataList
              data={highestFlowsWithTime}
              type="caudales"
              renderItem={(item) => (
                <List.Item style={{ padding: "8px 0" }}>
                  <Text style={{ flex: 1 }}>{item.name}</Text>
                  <Text strong>
                    {formatFlow(item.value)} L/s
                    {item.time ? (
                      <span
                        style={{
                          color: "#888",
                          fontWeight: 400,
                          marginLeft: 8,
                        }}
                      >
                        a las {moment(item.time).format("HH:mm")}
                      </span>
                    ) : (
                      <span
                        style={{
                          color: "#888",
                          fontWeight: 400,
                          marginLeft: 8,
                        }}
                      >
                        N/A
                      </span>
                    )}
                  </Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Mayores Bajas */}
        <Col xs={24} lg={12}>
          <Card
            style={{ width: "100%", height: "100%" }}
            type="inner"
            title={
              <Title
                level={5}
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FaArrowDown style={{ color: "#fa8c16" }} />
                Mayores Bajas
              </Title>
            }
          >
            <Paragraph
              type="secondary"
              style={{
                minHeight: "auto",
                fontSize: "0.8rem",
                marginBottom: "1rem",
              }}
            >
              Puntos que han registrado una disminución en su consumo en
              comparación con el día de ayer.
            </Paragraph>
            <DataList
              data={analysis.biggestDecreases}
              type="bajas"
              renderItem={(item) => (
                <List.Item style={{ padding: "8px 0" }}>
                  <Text style={{ flex: 1 }}>{item.name}</Text>
                  <ChangeTag change={item.change} />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Estado de Conexión */}
        <Col xs={24} lg={12}>
          <Card
            style={{ width: "100%", height: "100%" }}
            type="inner"
            title={
              <Title
                level={5}
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <WiThermometer style={{ color: "#722ed1" }} />
                Estado de Conexión
              </Title>
            }
          >
            <Paragraph
              type="secondary"
              style={{
                minHeight: "auto",
                fontSize: "0.8rem",
                marginBottom: "1rem",
              }}
            >
              Estado de la última conexión registrada. Los puntos con retraso
              pueden requerir atención.
            </Paragraph>
            <DataList
              data={loggerStatusesWithM1}
              type="estados"
              renderItem={(item) => (
                <List.Item style={{ padding: "8px 0" }}>
                  <Text style={{ flex: 1 }}>{item.name}</Text>
                  <Flex align="center" gap="small">
                    <Text type="secondary" style={{ fontSize: "0.75rem" }}>
                      {item.last_updated?.format("YYYY-MM-DD HH:mm") || "N/A"}
                    </Text>
                    {item.is_today ? (
                      <CheckCircleOutlined
                        style={{ color: token.colorSuccess }}
                      />
                    ) : (
                      <WarningOutlined style={{ color: token.colorWarning }} />
                    )}
                    {item.is_telemetry && (
                      <div
                        className="telemetry-pulse"
                        style={{
                          "--pulse-color": token.colorPrimary,
                        }}
                      ></div>
                    )}
                  </Flex>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Análisis del Nivel Freático */}
        {analysis.waterLevelAnalysis.filter((pointAnalysis) => {
          // Buscar el perfil original para obtener type_dga
          const profile = profiles.find((p) => p.title === pointAnalysis.name);
          return (
            profile &&
            profile.dga?.type_dga === "SUBTERRANEO" &&
            ((pointAnalysis.deepestLevel &&
              Number(pointAnalysis.deepestLevel.level) > 0) ||
              (pointAnalysis.shallowestLevel &&
                Number(pointAnalysis.shallowestLevel.level) > 0))
          );
        }).length > 0 && (
          <Col span={24}>
            <Card
              type="inner"
              title={
                <Flex align="center" gap="small">
                  <FaWater style={{ color: "#1890ff" }} />
                  <Text>Análisis del Nivel Freático - Puntos Extremos</Text>
                </Flex>
              }
            >
              <Paragraph
                type="secondary"
                style={{
                  fontSize: "0.8rem",
                  marginBottom: "1rem",
                }}
              >
                Puntos de captación SUBTERRÁNEOS con los niveles freáticos más
                extremos registrados hoy.
              </Paragraph>
              <Row gutter={[16, 16]}>
                {analysis.waterLevelAnalysis
                  .filter((pointAnalysis) => {
                    const profile = profiles.find(
                      (p) => p.title === pointAnalysis.name
                    );
                    return (
                      profile &&
                      profile.dga?.type_dga === "SUBTERRANEO" &&
                      ((pointAnalysis.deepestLevel &&
                        Number(pointAnalysis.deepestLevel.level) > 0) ||
                        (pointAnalysis.shallowestLevel &&
                          Number(pointAnalysis.shallowestLevel.level) > 0))
                    );
                  })
                  .map((pointAnalysis, index) => (
                    <Col xs={24} sm={12} lg={8} key={index}>
                      <Card
                        size="small"
                        title={
                          <Flex align="center" gap="small">
                            <FaBroadcastTower style={{ color: "#1890ff" }} />
                            <Text strong style={{ fontSize: "14px" }}>
                              {pointAnalysis.name}
                            </Text>
                          </Flex>
                        }
                        style={{
                          background:
                            "linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)",
                          border: "1px solid #91d5ff",
                        }}
                      >
                        <Row gutter={[8, 8]}>
                          {/* Nivel más Profundo */}
                          <Col span={12}>
                            <div style={{ textAlign: "center" }}>
                              <VerticalAlignBottomOutlined
                                style={{ color: "#d32f2f", fontSize: "16px" }}
                              />
                              <Text
                                style={{
                                  color: "#d32f2f",
                                  fontSize: "12px",
                                  display: "block",
                                  fontWeight: 600,
                                }}
                              >
                                Más Profundo
                              </Text>
                              <Text
                                style={{
                                  color: "#d32f2f",
                                  fontSize: "16px",
                                  fontWeight: "bold",
                                }}
                              >
                                {formatFlow(pointAnalysis.deepestLevel.level)} m
                              </Text>
                              <Text
                                style={{
                                  color: "#666",
                                  fontSize: "10px",
                                  marginLeft: 6,
                                }}
                              >
                                {pointAnalysis.deepestLevel.time
                                  ? moment(
                                      pointAnalysis.deepestLevel.time
                                    ).format("HH:mm") + " hrs"
                                  : "N/A"}
                              </Text>
                            </div>
                          </Col>

                          {/* Nivel más Superficial */}
                          <Col span={12}>
                            <div style={{ textAlign: "center" }}>
                              <VerticalAlignTopOutlined
                                style={{ color: "#388e3c", fontSize: "16px" }}
                              />
                              <Text
                                style={{
                                  color: "#388e3c",
                                  fontSize: "12px",
                                  display: "block",
                                  fontWeight: 600,
                                }}
                              >
                                Más Superficial
                              </Text>
                              <Text
                                style={{
                                  color: "#388e3c",
                                  fontSize: "16px",
                                  fontWeight: "bold",
                                }}
                              >
                                {formatFlow(
                                  pointAnalysis.shallowestLevel.level
                                )}{" "}
                                m
                              </Text>
                              <Text
                                style={{
                                  color: "#666",
                                  fontSize: "10px",
                                  marginLeft: 6,
                                }}
                              >
                                {pointAnalysis.shallowestLevel.time
                                  ? moment(
                                      pointAnalysis.shallowestLevel.time
                                    ).format("HH:mm") + " hrs"
                                  : "N/A"}
                              </Text>
                            </div>
                          </Col>
                        </Row>

                        {/* Información adicional */}
                        <div
                          style={{
                            marginTop: "8px",
                            padding: "4px 8px",
                            background: "rgba(24, 144, 255, 0.1)",
                            borderRadius: "4px",
                            textAlign: "center",
                          }}
                        >
                          <Text style={{ fontSize: "10px", color: "#666" }}>
                            <FaTint style={{ marginRight: 4 }} />
                            {pointAnalysis.totalReadings} lecturas hoy
                          </Text>
                        </div>
                      </Card>
                    </Col>
                  ))}
              </Row>
            </Card>
          </Col>
        )}
      </Row>
    </>
  );
};

// Estilos para la animación de telemetría
const pulseStyle = `
.telemetry-pulse {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--pulse-color, #1890ff);
  cursor: pointer;
  box-shadow: 0 0 0 rgba(0, 0, 0, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}
`;

// Inyectar estilos en el head
if (typeof document !== "undefined") {
  const styleEl = document.createElement("style");
  if (!document.querySelector("#telemetry-pulse-style")) {
    styleEl.id = "telemetry-pulse-style";
    styleEl.innerHTML = pulseStyle;
    document.head.appendChild(styleEl);
  }
}

export default AnalysisPrompt;
