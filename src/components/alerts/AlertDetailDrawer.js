import React from "react";
import {
  Drawer,
  Flex,
  Spin,
  Empty,
  Table,
  Statistic,
  Tooltip,
  Tag,
  Divider,
} from "antd";
import { Line } from "@ant-design/plots";
import {
  BarChartOutlined,
  ClockCircleOutlined,
  FireOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

const typeAlertLabel = { MAX: ">", MIN: "<", EQUALS: "=" };

const typeVariableLabel = {
  NIVEL: "Nivel",
  CAUDAL: "Caudal",
  "CAUDAL PROMEDIO": "Caudal Med.",
  TOTALIZADO: "Totalizado",
};

const AlertDetailDrawer = ({ visible, onClose, data, loading, isMobile }) => {
  const detailData = data;

  // ── Heatmap de horas (0-23) ──
  const heatmapData = React.useMemo(() => {
    if (!detailData?.stats?.trigger_history?.length) return [];
    const counts = Array(24).fill(0);
    detailData.stats.trigger_history.forEach((t) => {
      // Usar hora local para coincidir con el gráfico de línea
      const h = dayjs(t.triggered_at).hour();
      counts[h] += 1;
    });
    const maxCount = Math.max(...counts, 1);
    return counts.map((count, hour) => ({
      hour,
      count,
      pct: count / maxCount,
    }));
  }, [detailData]);

  const validatedPeakHour = React.useMemo(() => {
    if (!heatmapData.length) return null;
    const maxCount = Math.max(...heatmapData.map((d) => d.count));
    const peakHours = heatmapData
      .filter((d) => d.count === maxCount)
      .map((d) => d.hour)
      .sort((a, b) => a - b);

    return {
      hour: peakHours[0],
      count: maxCount,
    };
  }, [heatmapData, detailData]);

  // ── Chart config ──
  const variableChartLabel = React.useMemo(() => {
    if (!detailData) return "Valor medido";
    switch (detailData.type_variable) {
      case "NIVEL":
        return "Nivel (m)";
      case "CAUDAL":
        return "Caudal (lt/s)";
      case "CAUDAL PROMEDIO":
        return "Caudal Med. (lt)";
      case "TOTALIZADO":
        return "Totalizado (m³)";
      default:
        return "Valor medido";
    }
  }, [detailData]);

  const chartConfig = React.useMemo(() => {
    if (!detailData?.stats?.trigger_history?.length) return null;
    const sorted = [...detailData.stats.trigger_history].reverse();
    const chartData = sorted
      .filter(
        (t) => t.measured_value != null && !isNaN(parseFloat(t.measured_value))
      )
      .map((t) => ({
        triggered_at: dayjs(t.triggered_at).format("DD/MM HH:mm"),
        measured_value: parseFloat(t.measured_value),
      }));
    if (!chartData.length) return null;
    return {
      data: chartData,
      xField: "triggered_at",
      yField: "measured_value",
      smooth: true,
      point: { size: 4, shape: "circle", style: { fillOpacity: 1 } },
      color: "#ff6b35",
      xAxis: {
        title: {
          text: "Fecha / Hora",
          style: { fontSize: 12, fontWeight: "bold" },
        },
        label: { style: { fill: "rgba(255,255,255,0.6)" } },
        line: { style: { stroke: "rgba(255,255,255,0.2)" } },
      },
      yAxis: {
        title: {
          text: variableChartLabel,
          style: { fontSize: 12, fontWeight: "bold" },
        },
        label: { style: { fill: "rgba(255,255,255,0.6)" } },
        grid: { line: { style: { stroke: "rgba(255,255,255,0.1)" } } },
        line: { style: { stroke: "rgba(255,255,255,0.2)" } },
      },
      tooltip: {
        title: "triggered_at",
        formatter: (datum) => ({
          name: variableChartLabel,
          value: datum.measured_value,
        }),
      },
    };
  }, [detailData, variableChartLabel]);

  const getHighlightStyle = (columnType) => {
    if (!detailData) return {};
    const tv = detailData.type_variable;
    const isMatch =
      (columnType === "nivel" && tv === "NIVEL") ||
      (columnType === "caudal" &&
        (tv === "CAUDAL" || tv === "CAUDAL PROMEDIO")) ||
      (columnType === "total" && tv === "TOTALIZADO");
    return isMatch
      ? {
          style: {
            background: "rgba(255,107,53,0.15)",
            color: "#ff8c69",
            fontWeight: 700,
          },
        }
      : {};
  };

  const historyColumns = [
    {
      title: "Fecha / Hora",
      dataIndex: "triggered_at",
      key: "triggered_at",
      render: (v) => dayjs(v).format("DD/MM/YYYY HH:mm"),
      width: 128,
    },
    {
      title: <span>Nivel (m)</span>,
      dataIndex: ["matched_interaction", "nivel"],
      key: "nivel",
      render: (v) => (v !== undefined ? parseFloat(v).toFixed(2) : "—"),
      width: 85,
      onCell: () => getHighlightStyle("nivel"),
    },
    {
      title: <span>Caudal (lt/s)</span>,
      dataIndex: ["matched_interaction", "flow"],
      key: "flow",
      render: (v) => (v !== undefined ? parseFloat(v).toFixed(2) : "—"),
      width: 85,
      onCell: () => getHighlightStyle("caudal"),
    },
    {
      title: <span>Total (m<sup style={{fontSize:10}}>3</sup>)</span>,
      dataIndex: ["matched_interaction", "total"],
      key: "total",
      render: (v) => (v !== undefined ? v.toLocaleString("es-CL") : "—"),
      width: 100,
      onCell: () => getHighlightStyle("total"),
    },
    {
      title: <span>Consumo (m<sup style={{fontSize:10}}>3</sup>/h)</span>,
      dataIndex: ["matched_interaction", "total_diff"],
      key: "total_diff",
      render: (v) => (v !== undefined ? v.toLocaleString("es-CL") : "—"),
      width: 115,
    },
  ];

  const kpiItems = React.useMemo(() => {
    if (!detailData?.stats) return [];
    return [
      {
        label: "Total disparos",
        value: detailData.stats.total_triggers || 0,
        color: "#ffffff",
        icon: <BarChartOutlined />,
      },
      {
        label: "Últimas 24h",
        value: detailData.stats.triggers_last_24h || 0,
        color: "#ff6b35",
        icon: <ClockCircleOutlined />,
      },
      {
        label: "Últimos 7 días",
        value: detailData.stats.triggers_last_7d || 0,
        color: "#52c41a",
        icon: <FireOutlined />,
      },
      {
        label: "Últimos 30 días",
        value: detailData.stats.triggers_last_30d || 0,
        color: "#1890ff",
        icon: <BarChartOutlined />,
      },
      {
        label: "Promedio entre disparos",
        value: detailData.stats.avg_hours_between_triggers
          ? parseFloat(detailData.stats.avg_hours_between_triggers).toFixed(1) +
            " h"
          : "—",
        color: "#BDC00C",
        icon: <ClockCircleOutlined />,
      },
      {
        label: "Hora pico",
        value: validatedPeakHour ? validatedPeakHour.hour + ":00" : "—",
        color: "#faad14",
        icon: <FireOutlined />,
      },
    ];
  }, [detailData, validatedPeakHour]);

  return (
    <Drawer
      title={
        <span
          style={{
            color: "#BDC00C",
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: 0.5,
          }}
        >
          DETALLE DE ALERTA
        </span>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={isMobile ? "100%" : 800}
      styles={{
        body: { background: "#0a0e27", padding: "24px" },
        header: {
          background: "#0f152e",
          borderBottom: "1px solid rgba(255,107,53,0.25)",
        },
        mask: { background: "rgba(0,0,0,0.75)" },
      }}
      closeIcon={<span style={{ color: "#BDC00C", fontSize: 18 }}>✕</span>}
    >
      {loading && (
        <Flex justify="center" align="center" style={{ minHeight: 300 }}>
          <Spin size="large" />
        </Flex>
      )}

      {!loading && detailData && (
        <Flex vertical gap="24px">
          {/* Header info */}
          <div>
            <span
              style={{
                color: "white",
                fontWeight: 700,
                fontSize: 18,
                display: "block",
                marginBottom: 8,
              }}
            >
              {detailData.title}
            </span>
            <Flex gap="8px" wrap="wrap" align="center">
              <Tag
                style={{
                  margin: 0,
                  fontSize: 11,
                  fontWeight: 600,
                  background: "rgba(255,255,255,0.1)",
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "white",
                }}
              >
                {typeVariableLabel[detailData.type_variable] ||
                  detailData.type_variable}
              </Tag>
              <Tag
                style={{
                  margin: 0,
                  fontSize: 11,
                  fontWeight: 700,
                  background: "rgba(255,107,53,0.2)",
                  borderColor: "rgba(255,107,53,0.4)",
                  color: "#ff6b35",
                }}
              >
                {typeAlertLabel[detailData.type_alert] ||
                  detailData.type_alert}{" "}
                {detailData.value}
              </Tag>
              {detailData.is_active ? (
                <Tag
                  color="success"
                  style={{ margin: 0, fontSize: 11, fontWeight: 600 }}
                >
                  Activa
                </Tag>
              ) : (
                <Tag
                  color="default"
                  style={{ margin: 0, fontSize: 11, fontWeight: 600 }}
                >
                  Inactiva
                </Tag>
              )}
            </Flex>
          </div>

          {/* KPIs */}
          {kpiItems.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr 1fr"
                  : "1fr 1fr 1fr",
                gap: 12,
              }}
            >
              {kpiItems.map((kpi, idx) => (
                <div
                  key={idx}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    padding: "14px 12px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                  }}
                >
                  <Flex align="center" gap="8px" style={{ marginBottom: 6 }}>
                    <span style={{ color: kpi.color, fontSize: 14 }}>
                      {kpi.icon}
                    </span>
                    <span
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {kpi.label}
                    </span>
                  </Flex>
                  <span
                    style={{
                      color: kpi.color,
                      fontSize: 24,
                      fontWeight: 800,
                    }}
                  >
                    {kpi.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Heatmap horas */}
          {heatmapData.length > 0 && (
            <div
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: 18,
                boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              }}
            >
              <Flex
                justify="space-between"
                align="center"
                style={{ marginBottom: 12 }}
              >
                <span
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Frecuencia por hora
                </span>
                {validatedPeakHour && (
                  <span
                    style={{
                      color: "#faad14",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    Pico: {validatedPeakHour.hour}:00
                  </span>
                )}
              </Flex>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(12, 1fr)",
                  gap: 4,
                }}
              >
                {heatmapData.map((h) => {
                  const opacity = 0.1 + h.pct * 0.85;
                  return (
                    <Tooltip
                      key={h.hour}
                      title={`${String(h.hour).padStart(2, "0")}:00 — ${h.count} disparo${h.count !== 1 ? "s" : ""}`}
                    >
                      <div
                        style={{
                          height: 32,
                          borderRadius: 4,
                          background: `rgba(255, 107, 53, ${opacity})`,
                          border:
                            h.count > 0
                              ? "1px solid rgba(255,107,53,0.35)"
                              : "1px solid rgba(255,255,255,0.06)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "transform 0.15s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = "scale(1.08)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
                      >
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color:
                              h.pct > 0.5
                                ? "#fff"
                                : "rgba(255,255,255,0.5)",
                          }}
                        >
                          {h.hour}
                        </span>
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 6,
                }}
              >
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
                  00
                </span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
                  12
                </span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
                  23
                </span>
              </div>
            </div>
          )}

          {/* Chart */}
          {chartConfig && (
            <div
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: 18,
                boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              }}
            >
              <span
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 11,
                  fontWeight: 700,
                  display: "block",
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Historial de valores medidos
              </span>
              <Line {...chartConfig} />
            </div>
          )}

          {/* History Table */}
          {detailData.stats?.trigger_history?.length > 0 && (
            <div
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: 18,
                boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              }}
            >
              <Flex
                justify="space-between"
                align="center"
                style={{ marginBottom: 12 }}
              >
                <span
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 11,
                    fontWeight: 700,
                    display: "block",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Historial de disparos
                </span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                  {detailData.stats.trigger_history.length} registros
                </span>
              </Flex>
              <Table
                size="small"
                columns={historyColumns}
                dataSource={[...detailData.stats.trigger_history].reverse()}
                rowKey={(r, idx) => idx}
                pagination={false}
                scroll={{ x: "max-content" }}
                style={{ background: "transparent" }}
              />
            </div>
          )}

          {!loading &&
            detailData &&
            (!detailData.stats?.trigger_history ||
              detailData.stats.trigger_history.length === 0) && (
              <Empty
                description={
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>
                    Sin disparos registrados
                  </span>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
        </Flex>
      )}
    </Drawer>
  );
};

export default AlertDetailDrawer;
