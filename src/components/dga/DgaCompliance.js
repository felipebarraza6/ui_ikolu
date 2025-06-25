import React, { useContext, useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Typography,
  Divider,
  Space,
  Tag,
  Tooltip,
  Tabs,
  Alert,
} from "antd";
import {
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import { formatInteger, formatFlow } from "../../utils/numberFormatter";
import { Area, DualAxes } from "@ant-design/plots";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const DgaCompliance = ({ dataDga = [] }) => {
  const { state } = useContext(AppContext);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    pending: 0,
    errors: 0,
    withVoucher: 0,
    withoutVoucher: 0,
    complianceRate: 0,
    avgCaudal: 0,
    avgTotal: 0,
    avgWaterTable: 0,
  });

  useEffect(() => {
    if (dataDga && dataDga.length > 0) {
      calculateStats();
    }
  }, [dataDga]);

  const calculateStats = () => {
    const total = dataDga.length;

    // Completados: tienen n_voucher válido
    const completed = dataDga.filter(
      (item) =>
        item.n_voucher && item.n_voucher !== "..." && item.n_voucher !== ""
    ).length;

    // Pendientes: send_dga = true Y no tienen n_voucher
    const pending = dataDga.filter(
      (item) =>
        item.send_dga === true &&
        (!item.n_voucher || item.n_voucher === "..." || item.n_voucher === "")
    ).length;

    // Errores: cuando is_error = true
    const errors = dataDga.filter((item) => item.is_error === true).length;

    // Con comprobante válido
    const withVoucher = dataDga.filter(
      (item) =>
        item.n_voucher && item.n_voucher !== "..." && item.n_voucher !== ""
    ).length;

    // Sin comprobante
    const withoutVoucher = total - withVoucher;

    // Calcular promedios de valores
    const validCaudal = dataDga.filter(
      (item) => item.caudal !== null && item.caudal !== undefined
    );
    const validTotal = dataDga.filter(
      (item) => item.total !== null && item.total !== undefined
    );
    const validWaterTable = dataDga.filter(
      (item) => item.water_table !== null && item.water_table !== undefined
    );

    const avgCaudal =
      validCaudal.length > 0
        ? validCaudal.reduce((sum, item) => sum + Number(item.caudal), 0) /
          validCaudal.length
        : 0;
    const avgTotal =
      validTotal.length > 0
        ? validTotal.reduce((sum, item) => sum + Number(item.total), 0) /
          validTotal.length
        : 0;
    const avgWaterTable =
      validWaterTable.length > 0
        ? validWaterTable.reduce(
            (sum, item) => sum + Number(item.water_table),
            0
          ) / validWaterTable.length
        : 0;

    const complianceRate = total > 0 ? (completed / total) * 100 : 0;

    setStats({
      total,
      sent: completed,
      pending,
      errors,
      withVoucher,
      withoutVoucher,
      complianceRate,
      avgCaudal,
      avgTotal,
      avgWaterTable,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "green";
      case "warning":
        return "orange";
      case "error":
        return "red";
      default:
        return "blue";
    }
  };

  const getComplianceStatus = () => {
    if (stats.complianceRate >= 90)
      return { status: "success", text: "Excelente" };
    if (stats.complianceRate >= 70) return { status: "warning", text: "Bueno" };
    return { status: "error", text: "Requiere Atención" };
  };

  const complianceStatus = getComplianceStatus();

  // Obtener el caudal autorizado del perfil
  const flowGranted = state.selected_profile?.dga?.flow_granted_dga || 0;

  const hasFlowLimit = flowGranted && parseFloat(flowGranted) > 0;

  // Preparar datos para el gráfico de caudal
  const prepareCaudalData = () => {
    if (!dataDga || dataDga.length === 0) return [];

    return dataDga.map((item) => ({
      date_time_medition: item.date_time_medition,
      flow: parseFloat(item.flow) || 0,
      water_table: parseFloat(item.water_table) || 0,
      limit: parseFloat(flowGranted) || 0,
      exceeded: parseFloat(item.flow) > parseFloat(flowGranted),
    }));
  };

  const caudalData = prepareCaudalData();

  // Configuración del gráfico de caudal
  const caudalChartConfig = {
    data: caudalData,
    xField: "date_time_medition",
    yField: "flow",
    seriesField: "flow",
    smooth: true,
    meta: {
      flow: { alias: "Caudal (lt/s)" },
      date_time_medition: { alias: "Fecha/hora medición" },
    },
    xAxis: {
      label: {
        formatter: (text) => `${text.slice(11, 16)}`,
      },
      title: { text: "Hora" },
    },
    tooltip: {
      formatter: (datum) => ({
        name: "Caudal",
        value: `${datum.flow} lt/s`,
        title: `${datum.date_time_medition.slice(11, 16)} hrs`,
      }),
    },
    yAxis: {
      min: Math.min(
        ...caudalData.map((d) => d.flow),
        parseFloat(flowGranted) * 0.8
      ),
      max: Math.max(
        ...caudalData.map((d) => d.flow),
        parseFloat(flowGranted) * 1.2
      ),
      title: {
        text: "Caudal (lt/s)",
      },
    },
    annotations: hasFlowLimit
      ? [
          {
            type: "line",
            start: ["min", flowGranted],
            end: ["max", flowGranted],
            style: {
              stroke: "red",
              lineWidth: 2,
              lineDash: [4, 4],
            },
            text: {
              content: `Límite: ${flowGranted} lt/s`,
              position: "end",
              style: {
                fill: "red",
                fontSize: 12,
                fontWeight: 500,
                textAlign: "right",
              },
            },
          },
        ]
      : [],
    color: "rgb(31, 52, 97)",
  };

  const caudalNivelChartConfig = {
    data: [caudalData, caudalData],
    xField: "date_time_medition",
    yField: ["flow", "water_table"],
    yAxis: {
      flow: {
        title: { text: "Caudal (lt/s)", style: { fill: "#1890ff" } },
        min: Math.min(...caudalData.map((d) => d.flow)) * 0.9,
        max: Math.max(...caudalData.map((d) => d.flow)) * 1.1,
      },
      water_table: {
        title: { text: "Nivel Freático (m)", style: { fill: "#2ca02c" } },
        min: Math.min(...caudalData.map((d) => d.water_table)) * 0.9,
        max: Math.max(...caudalData.map((d) => d.water_table)) * 1.1,
        inverse: true,
      },
    },
    xAxis: {
      label: {
        formatter: (text) => `${text.slice(11, 16)}`,
      },
      title: { text: "Hora" },
    },
    geometryOptions: [
      {
        geometry: "line",
        color: "#1890ff",
        smooth: true,
      },
      {
        geometry: "line",
        color: "#2ca02c",
        smooth: true,
      },
    ],
    tooltip: {
      showTitle: false,
      showMarkers: true,
      customContent: (title, items) => {
        if (!items || items.length === 0 || !items[0]?.data) {
          return null;
        }

        const data = items[0].data;
        const time = data.date_time_medition.slice(11, 16) + " hrs";

        const listItems = items
          .map((item) => {
            if (item.value === undefined || item.value === null) return "";

            let name = "";
            let unit = "";

            if (item.name === "flow") {
              name = "Caudal";
              unit = "lt/s";
            } else if (item.name === "water_table") {
              name = "Nivel Freático";
              unit = "m";
            }

            const value = parseFloat(item.value).toFixed(2);

            return `<li style="list-style: none; margin: 6px 0; font-size: 12px;">
                    <span style="background-color:${item.color}; width:8px; height:8px; border-radius:50%; display:inline-block; margin-right:8px;"></span>
                    <span>${name}</span>
                    <span style="float: right; font-weight: 600; margin-left: 12px;">${value} ${unit}</span>
                  </li>`;
          })
          .join("");

        if (listItems.trim() === "") return null;

        return `<div style="padding: 8px 12px; background: white; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                  <div style="font-weight: 600; margin-bottom: 8px; font-size: 13px;">${time}</div>
                  <ul style="padding: 0; margin: 0;">${listItems}</ul>
                </div>`;
      },
    },
    legend: {
      itemName: {
        formatter: (text, item) => {
          if (item.id === "flow") return "Caudal (lt/s)";
          if (item.id === "water_table") return "Nivel Freático (m)";
          return text;
        },
      },
    },
  };

  return (
    <div style={{ padding: "16px", background: "#f5f5f5" }}>
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={12} sm={12} md={6}>
          <Card size="small" style={{ borderRadius: 8, textAlign: "center" }}>
            <Statistic
              title="Total Registros"
              value={stats.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: "22px" }}
              titleStyle={{ fontSize: "12px", color: "#8c8c8c" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card size="small" style={{ borderRadius: 8, textAlign: "center" }}>
            <Statistic
              title="Completados"
              value={stats.sent}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a", fontSize: "22px" }}
              titleStyle={{ fontSize: "12px", color: "#8c8c8c" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card size="small" style={{ borderRadius: 8, textAlign: "center" }}>
            <Statistic
              title="Pendientes"
              value={stats.pending}
              prefix={<SyncOutlined />}
              valueStyle={{ color: "#faad14", fontSize: "22px" }}
              titleStyle={{ fontSize: "12px", color: "#8c8c8c" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card size="small" style={{ borderRadius: 8, textAlign: "center" }}>
            <Statistic
              title="Con Errores"
              value={stats.errors}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f", fontSize: "22px" }}
              titleStyle={{ fontSize: "12px", color: "#8c8c8c" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Resumen de Cumplimiento */}
      <Card style={{ marginBottom: "24px", borderRadius: 12 }}>
        <Row gutter={[32, 16]}>
          <Col xs={24} md={12}>
            <Title level={5}>Tasa de Completado</Title>
            <Row gutter={16} align="middle">
              <Col flex="auto">
                <Progress
                  percent={Math.round(stats.complianceRate)}
                  status={complianceStatus.status}
                  strokeColor={getStatusColor(complianceStatus.status)}
                />
              </Col>
              <Col>
                <Tag
                  color={getStatusColor(complianceStatus.status)}
                  size="large"
                >
                  {complianceStatus.text}
                </Tag>
              </Col>
            </Row>
            <Text
              type="secondary"
              style={{ fontSize: "12px", marginTop: 8, display: "block" }}
            >
              {stats.sent} de {stats.total} registros completados (con
              comprobante válido)
            </Text>
          </Col>
          <Col xs={24} md={12}>
            <Title level={5}>Desglose de Registros</Title>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Row justify="space-between" align="middle">
                <Text>Con Comprobante:</Text>
                <Tag color="green">{stats.withVoucher}</Tag>
              </Row>
              <Row justify="space-between" align="middle">
                <Text>Sin Comprobante:</Text>
                <Tag color="orange">{stats.withoutVoucher}</Tag>
              </Row>
              <Row justify="space-between" align="middle">
                <Text>Con Errores:</Text>
                <Tag color="red">{stats.errors}</Tag>
              </Row>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Gráficos */}
      <Card style={{ borderRadius: 12 }}>
        <Title level={5}>
          <LineChartOutlined style={{ marginRight: "8px" }} />
          Análisis Gráfico
        </Title>
        <Tabs defaultActiveKey="1" type="card">
          <TabPane
            tab={
              <span>
                <BarChartOutlined /> Caudal vs Límite
              </span>
            }
            key="1"
          >
            <div style={{ height: "300px" }}>
              {caudalData.length > 0 ? (
                <Area {...caudalChartConfig} />
              ) : (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                  }}
                >
                  No hay datos de caudal disponibles
                </div>
              )}
            </div>
            <Alert
              style={{ marginTop: 16, background: "#f0f2f5", border: "none" }}
              message={
                <Space direction="vertical" size={0}>
                  {hasFlowLimit ? (
                    <Text style={{ fontSize: 12 }}>
                      <span style={{ color: "red", fontWeight: "bold" }}>
                        ●
                      </span>{" "}
                      Límite autorizado: <strong>{flowGranted} lt/s</strong>
                    </Text>
                  ) : (
                    <Text style={{ fontSize: 12 }}>
                      <span style={{ color: "orange", fontWeight: "bold" }}>
                        ●
                      </span>{" "}
                      Límite no disponible
                    </Text>
                  )}
                  <Text style={{ fontSize: 12 }}>
                    <span
                      style={{ color: "rgb(31, 52, 97)", fontWeight: "bold" }}
                    >
                      ●
                    </span>{" "}
                    Mediciones de caudal
                  </Text>
                </Space>
              }
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                <LineChartOutlined /> Caudal vs Nivel
              </span>
            }
            key="2"
          >
            <div style={{ height: "300px" }}>
              {caudalData.length > 0 ? (
                <DualAxes {...caudalNivelChartConfig} />
              ) : (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                  }}
                >
                  No hay datos disponibles
                </div>
              )}
            </div>
            <Alert
              style={{ marginTop: 16, background: "#f0f2f5", border: "none" }}
              message={
                <Space direction="vertical" size={0}>
                  <Text style={{ fontSize: 12 }}>
                    <span style={{ color: "#1890ff", fontWeight: "bold" }}>
                      ●
                    </span>{" "}
                    Caudal (lt/s)
                  </Text>
                  <Text style={{ fontSize: 12 }}>
                    <span style={{ color: "#2ca02c", fontWeight: "bold" }}>
                      ●
                    </span>{" "}
                    Nivel Freático (m)
                  </Text>
                </Space>
              }
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default DgaCompliance;
