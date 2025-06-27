import React from "react";
import {
  Card,
  Typography,
  Flex,
  Tag,
  List,
  Statistic,
  Divider,
  Row,
  Col,
  Empty,
  theme,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  LineChartOutlined,
  EnvironmentOutlined,
  ReadOutlined,
  RiseOutlined,
  FallOutlined,
  ThunderboltOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InteractionOutlined,
} from "@ant-design/icons";
import { LuBrain } from "react-icons/lu";
import { FaHouseFloodWater } from "react-icons/fa6";
import { formatInteger, formatFlow } from "../../utils/numberFormatter";
import moment from "moment";
import "moment/locale/es";

moment.locale("es");
const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

const AnalysisPrompt = ({ profiles }) => {
  const { token } = useToken();

  const analysis = React.useMemo(() => {
    if (!profiles || profiles.length === 0) {
      return { hasData: false };
    }

    const todayConsumers = [];
    const waterLevels = [];
    const loggerStatuses = [];
    const highestFlows = [];
    let consumptionChanges = [];
    let totalToday = 0;
    let totalYesterday = 0;
    let activeTodayCount = 0;
    let activeYesterdayCount = 0;
    let stoppedConsuming = [];

    profiles.forEach((p) => {
      // Consumption Analysis
      const todayConsumption = p.modules?.total_consumed_today ?? 0;
      const yesterdayConsumption = p.modules?.total_consumed_yesterday ?? 0;
      totalToday += todayConsumption;
      totalYesterday += yesterdayConsumption;
      if (todayConsumption > 0) {
        activeTodayCount++;
        todayConsumers.push({ name: p.title, value: todayConsumption });
      }
      if (yesterdayConsumption > 0) {
        activeYesterdayCount++;
        if (todayConsumption === 0) {
          stoppedConsuming.push(p.title);
        }
      }
      if (yesterdayConsumption > 0) {
        const change =
          ((todayConsumption - yesterdayConsumption) / yesterdayConsumption) *
          100;
        consumptionChanges.push({ name: p.title, change: change });
      } else if (todayConsumption > 0) {
        consumptionChanges.push({ name: p.title, change: Infinity });
      }

      // Flow Analysis
      if (p.modules?.m1?.flow !== undefined) {
        highestFlows.push({ name: p.title, value: Number(p.modules.m1.flow) });
      }

      // Water Level Analysis
      if (p.water_level !== undefined && p.water_level !== null) {
        waterLevels.push({ name: p.title, level: p.water_level });
      }

      // Logger Status Analysis
      if (p.modules?.m1?.created) {
        const lastUpdated = moment(p.modules.m1.created);
        loggerStatuses.push({
          name: p.title,
          last_updated: lastUpdated,
          is_today: lastUpdated.isSame(moment(), "day"),
          is_telemetry: p.config_data?.is_telemetry === true,
        });
      }
    });

    // Sorting
    todayConsumers.sort((a, b) => b.value - a.value);
    consumptionChanges.sort((a, b) => b.change - a.change);
    waterLevels.sort((a, b) => b.level - a.level);
    loggerStatuses.sort(
      (a, b) => b.last_updated.valueOf() - a.last_updated.valueOf()
    ); // Most recent first
    highestFlows.sort((a, b) => b.value - a.value);

    const overallChange =
      totalYesterday > 0
        ? ((totalToday - totalYesterday) / totalYesterday) * 100
        : totalToday > 0
        ? Infinity
        : 0;

    return {
      topConsumers: todayConsumers,
      biggestDecreases: consumptionChanges
        .filter((c) => c.change < 0)
        .sort((a, b) => a.change - b.change),
      highestFlows: highestFlows,
      deepestLevel: waterLevels.length > 0 ? waterLevels[0] : null,
      shallowestLevel:
        waterLevels.length > 0 ? waterLevels[waterLevels.length - 1] : null,
      loggerStatuses,
      stoppedConsuming,
      overallChange,
      totalToday,
      totalYesterday,
      activeTodayCount,
      activeYesterdayCount,
      totalProfiles: profiles.length,
      hasData: totalToday > 0 || totalYesterday > 0,
    };
  }, [profiles]);

  const renderChangeTag = (change) => {
    if (change === Infinity) return <Tag color="blue">Nuevo</Tag>;
    if (change > 0)
      return (
        <Tag color="red" icon={<ArrowUpOutlined />}>
          {change.toFixed(1)}%
        </Tag>
      );
    if (change < 0)
      return (
        <Tag color="warning" icon={<ArrowDownOutlined />}>
          {Math.abs(change).toFixed(1)}%
        </Tag>
      );
    return <Tag>{change.toFixed(1)}%</Tag>;
  };

  const renderList = (data, type, listType, renderFn) => {
    if (data.length === 0)
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<Text type="secondary">Sin {type}</Text>}
        />
      );
    return (
      <List
        dataSource={data}
        renderItem={renderFn}
        size="small"
        style={{ maxHeight: "200px", overflowY: "auto", paddingRight: "8px" }}
      />
    );
  };

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
    <Card
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
      bodyStyle={{ flex: 1 }}
      title={mainCardTitle}
    >
      <Row gutter={[16, 16]} style={{ height: "100%" }}>
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
              value={analysis.totalToday}
              formatter={(val) => formatInteger(val) + " m³"}
            />
            <Paragraph
              type="secondary"
              style={{ marginTop: "8px", marginBottom: 0 }}
            >
              Hoy el consumo ha tenido una variación del{" "}
              {renderChangeTag(analysis.overallChange)} respecto a los{" "}
              <Text strong>{formatInteger(analysis.totalYesterday)} m³</Text> de
              ayer. Esto se basa en los{" "}
              <Text strong>
                {analysis.activeTodayCount} de {analysis.totalProfiles}
              </Text>{" "}
              puntos con consumo hoy, frente a los{" "}
              <Text strong>{analysis.activeYesterdayCount}</Text> que
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
                <FaHouseFloodWater />
                Peak Consumos
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
            {renderList(
              analysis.topConsumers,
              "consumidores",
              "value",
              (item) => (
                <List.Item style={{ padding: "8px 0" }}>
                  <Text style={{ flex: 1 }}>{item.name}</Text>
                  <Text strong>{formatInteger(item.value)} m³</Text>
                </List.Item>
              )
            )}
          </Card>
        </Col>
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
                <InteractionOutlined />
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
            {renderList(analysis.highestFlows, "caudales", "value", (item) => (
              <List.Item style={{ padding: "8px 0" }}>
                <Text style={{ flex: 1 }}>{item.name}</Text>
                <Text strong>{formatFlow(item.value)} l/s</Text>
              </List.Item>
            ))}
          </Card>
        </Col>
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
                <FallOutlined />
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
            {renderList(
              analysis.biggestDecreases,
              "bajas",
              "change",
              (item) => (
                <List.Item style={{ padding: "8px 0" }}>
                  <Text style={{ flex: 1 }}>{item.name}</Text>
                  {renderChangeTag(item.change)}
                </List.Item>
              )
            )}
          </Card>
        </Col>
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
                <ClockCircleOutlined />
                Estado Conexión
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
            {renderList(
              analysis.loggerStatuses,
              "estados",
              "status",
              (item) => (
                <List.Item style={{ padding: "8px 0" }}>
                  <Text style={{ flex: 1 }}>{item.name}</Text>
                  <Flex align="center" gap="small">
                    <Text type="secondary" style={{ fontSize: "0.75rem" }}>
                      {item.last_updated.format("YYYY-MM-DD HH:mm")}
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
              )
            )}
          </Card>
        </Col>

        {analysis.deepestLevel ||
          (analysis.shallowestLevel && (
            <Col span={24}>
              <Card type="inner" title="Análisis Freático">
                <Row>
                  {analysis.deepestLevel && (
                    <Col xs={24} sm={12}>
                      <Statistic
                        title={
                          <Flex align="center" gap="small">
                            <VerticalAlignBottomOutlined />
                            <Text>Nivel más Profundo</Text>
                          </Flex>
                        }
                        value={formatFlow(analysis.deepestLevel.level)}
                        suffix="m"
                      />
                      <Paragraph type="secondary">
                        Registrado en{" "}
                        <Text strong>{analysis.deepestLevel.name}</Text>.
                      </Paragraph>
                    </Col>
                  )}
                  {analysis.shallowestLevel && (
                    <Col xs={24} sm={12}>
                      <Statistic
                        title={
                          <Flex align="center" gap="small">
                            <VerticalAlignTopOutlined />
                            <Text>Nivel más Superficial</Text>
                          </Flex>
                        }
                        value={formatFlow(analysis.shallowestLevel.level)}
                        suffix="m"
                      />
                      <Paragraph type="secondary">
                        Registrado en{" "}
                        <Text strong>{analysis.shallowestLevel.name}</Text>.
                      </Paragraph>
                    </Col>
                  )}
                </Row>
              </Card>
            </Col>
          ))}
      </Row>
    </Card>
  );
};

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

// Inject style into head
const styleEl = document.createElement("style");
if (!document.querySelector("#telemetry-pulse-style")) {
  styleEl.id = "telemetry-pulse-style";
  styleEl.innerHTML = pulseStyle;
  document.head.appendChild(styleEl);
}

export default AnalysisPrompt;
