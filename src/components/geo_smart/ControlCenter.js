import React, { useCallback, useState, useMemo } from "react";
import { Line } from "@ant-design/plots";
import "./ControlCenter.css";
import { useData } from "../../contexts/DataContext";
import { useControlCenter } from "../../hooks/useControlCenter";
import sh from "../../api/sh/endpoints";
import { Row, Col, Card, Flex, Typography, Spin, Table, Tag, theme, Drawer, Modal, Button, Input, Space, Segmented, Form, message, DatePicker, Alert } from "antd";
import {
  FaMapMarkerAlt,
  FaBroadcastTower,
  FaClipboardCheck,
  FaExclamationTriangle,
  FaCopy,
  FaSun,
  FaMoon,
  FaChartLine,
  FaTable,
  FaHandPaper,
  FaPauseCircle,
} from "react-icons/fa";

import KPICard from "./KPICard";
import ControlCenterChat from "./ControlCenterChat";
import CCWeekConsumption from "./CCWeekConsumption";
import CCWarningsSection from "./CCWarningsSection";
import CCDataTabs from "./CCDataTabs";
import ModuleTour from "../common/ModuleTour";
import { centroControlTour } from "../../config/tours";
import { ikoluTokens, kpiGradients } from "../../theme";
import moment from "moment";
import { useAuth } from "../../contexts/AuthContext";

const { Text } = Typography;
const { useToken } = theme;

/* ── Helper: normalizar número que puede venir como objeto {source, parsedValue} ── */
const extractRecordNum = (val) => {
  if (val == null) return null;
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = Number(val);
    return isNaN(n) ? null : n;
  }
  if (typeof val === "object") {
    if (val.parsedValue != null) {
      const n = Number(val.parsedValue);
      return isNaN(n) ? null : n;
    }
    if (val.source != null) {
      const n = Number(val.source);
      return isNaN(n) ? null : n;
    }
  }
  return null;
};

/* ── Helper: extraer mediciones de respuesta del endpoint ── */
const extractMeasurements = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.records)) return raw.records;
  if (Array.isArray(raw.results)) return raw.results;
  if (Array.isArray(raw.measurements)) return raw.measurements;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw.calendar)) return raw.calendar;
  return [];
};

/* ── Helper: clasificar mediciones por franja horaria ── */
const classifyByTimeOfDay = (measurements) => {
  const dawn = [];     // 00:00 - 05:00
  const morning = [];  // 06:00 - 12:00
  const afternoon = []; // 13:00 - 18:00
  const night = [];    // 19:00 - 23:00

  measurements.forEach((m) => {
    const timeStr = m.date_time || m.date_time_medition || m.timestamp || m.time || m.created_at;
    if (!timeStr) return;
    const hour = moment(timeStr).hour();
    if (hour >= 0 && hour <= 5) dawn.push(m);
    else if (hour >= 6 && hour <= 12) morning.push(m);
    else if (hour >= 13 && hour <= 18) afternoon.push(m);
    else night.push(m);
  });

  const sortByTime = (a, b) => {
    const ta = moment(a.date_time || a.date_time_medition || a.timestamp || a.time || a.created_at).valueOf();
    const tb = moment(b.date_time || b.date_time_medition || b.timestamp || b.time || b.created_at).valueOf();
    return ta - tb;
  };

  return {
    dawn: dawn.sort(sortByTime),
    morning: morning.sort(sortByTime),
    afternoon: afternoon.sort(sortByTime),
    night: night.sort(sortByTime),
  };
};

/* ── Componente: KPI pequeño para indicadores ── */
const TinyKPI = ({ icon, label, value, sub, color, token }) => (
  <Card
    size="small"
    bodyStyle={{ padding: "10px 12px" }}
    style={{
      borderRadius: 10,
      border: `1px solid ${color}25`,
      background: `${color}08`,
      transition: "transform 0.2s ease",
    }}
  >
    <Flex align="center" gap={8}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: `${color}15`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <Flex vertical gap={0}>
        <Text style={{ fontSize: 10, color: token.colorTextSecondary, lineHeight: 1.2, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</Text>
        <Text strong style={{ fontSize: 13, color: token.colorText, lineHeight: 1.3 }}>{value}</Text>
        {sub && <Text style={{ fontSize: 9, color: color, lineHeight: 1.2 }}>{sub}</Text>}
      </Flex>
    </Flex>
  </Card>
);

/* ── Componente: Gráfico de mediciones del día ── */
const MeasurementsChart = ({ data, metric, token, color, title }) => {
  const chartColor = color || token.colorPrimary;

  if (!data || data.length === 0) {
    return (
      <Flex justify="center" align="center" style={{ height: 220 }} vertical gap={8}>
        <Text type="secondary" style={{ fontSize: 12 }}>Sin datos de {title || metric}</Text>
      </Flex>
    );
  }

  const config = {
    data,
    xField: "time",
    yField: metric,
    smooth: true,
    animation: {
      appear: {
        animation: "fade-in",
        duration: 800,
      },
    },
    lineStyle: {
      lineWidth: 3,
      stroke: chartColor,
      shadowColor: `${chartColor}50`,
      shadowBlur: 10,
    },
    point: {
      size: 5,
      shape: "circle",
      style: {
        fill: chartColor,
        stroke: "#fff",
        lineWidth: 2,
        shadowColor: chartColor,
        shadowBlur: 8,
      },
    },
    areaStyle: {
      fill: `l(270) 0:#ffffff00 0.5:${chartColor}30 1:${chartColor}60`,
    },
    xAxis: {
      label: { style: { fontSize: 11, fill: token.colorTextSecondary } },
      grid: { line: { style: { stroke: `${token.colorBorderSecondary}40` } } },
      line: { style: { stroke: token.colorBorder } },
    },
    yAxis: {
      label: {
        style: { fontSize: 11, fill: token.colorTextSecondary },
        formatter: (v) => Number(v).toFixed(2),
      },
      grid: { line: { style: { stroke: `${token.colorBorderSecondary}40`, lineDash: [4, 4] } } },
      line: { style: { stroke: token.colorBorder } },
    },
    tooltip: {
      showMarkers: true,
      domStyles: {
        "g2-tooltip": {
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          padding: "12px 16px",
          fontSize: 12,
        },
        "g2-tooltip-title": { fontWeight: 700, marginBottom: 4, color: token.colorText },
        "g2-tooltip-list-item": { fontSize: 12 },
      },
      formatter: (datum) => {
        const names = {
          consumo: "Consumo (m³)",
          caudal: "Caudal (L/s)",
          nivel: "Nivel (m)",
          water_table: "Nivel freático (m)",
        };
        const v = datum[metric];
        const formatted = metric === "consumo"
          ? `${Number(v).toLocaleString("es-CL", { maximumFractionDigits: 0 })} m³`
          : `${Number(v).toFixed(2)}`;
        return { name: names[metric] || metric, value: formatted, title: `${datum.time} hrs` };
      },
    },
    height: 260,
    color: [chartColor],
  };

  return <Line {...config} />;
};

/* ── Componente: contenido del Drawer de mediciones ── */
const MeasurementsDrawerContent = ({ data, token, pointName, date }) => {
  const [viewMode, setViewMode] = useState("chart");

  const measurements = extractMeasurements(data);

  const sortedMeasurements = useMemo(() => {
    return [...measurements].sort((a, b) => {
      const ta = moment(a.date_time || a.date_time_medition || a.timestamp || a.time || a.created_at).valueOf();
      const tb = moment(b.date_time || b.date_time_medition || b.timestamp || b.time || b.created_at).valueOf();
      return ta - tb;
    });
  }, [measurements]);

  const groups = classifyByTimeOfDay(measurements);

  /* ── Helpers para KPIs ── */
  const findExtreme = useCallback((arr, key, fallbackKey, mode) => {
    if (!arr.length) return null;
    let target = mode === "max" ? -Infinity : Infinity;
    let targetItem = null;
    arr.forEach((m) => {
      const v = extractRecordNum(m[key]) ?? extractRecordNum(m[fallbackKey]);
      if (v == null) return;
      const better = mode === "max" ? v > target : v < target;
      if (better) { target = v; targetItem = m; }
    });
    if (!targetItem) return null;
    const t = moment(targetItem.date_time || targetItem.date_time_medition || targetItem.timestamp || targetItem.time || targetItem.created_at).format("HH:mm");
    return { value: target, time: t };
  }, []);

  const calcAvg = useCallback((arr, key, fallbackKey) => {
    const vals = arr.map((m) => extractRecordNum(m[key]) ?? extractRecordNum(m[fallbackKey])).filter((v) => v != null);
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, []);

  const kpis = useMemo(() => ({
    maxConsumo: findExtreme(sortedMeasurements, "total_diff", null, "max"),
    minConsumo: findExtreme(sortedMeasurements, "total_diff", null, "min"),
    avgConsumo: calcAvg(sortedMeasurements, "total_diff", null),
    maxCaudal: findExtreme(sortedMeasurements, "flow", "caudal", "max"),
    minCaudal: findExtreme(sortedMeasurements, "flow", "caudal", "min"),
    avgCaudal: calcAvg(sortedMeasurements, "flow", "caudal"),
    maxNivel: findExtreme(sortedMeasurements, "nivel", "level", "max"),
    minNivel: findExtreme(sortedMeasurements, "nivel", "level", "min"),
    maxWaterTable: findExtreme(sortedMeasurements, "water_table", null, "max"),
    minWaterTable: findExtreme(sortedMeasurements, "water_table", null, "min"),
  }), [sortedMeasurements, findExtreme, calcAvg]);

  const chartDataAll = useMemo(() => {
    return sortedMeasurements
      .map((m) => {
        const t = moment(m.date_time || m.date_time_medition || m.timestamp || m.time || m.created_at).format("HH:mm");
        return {
          time: t,
          consumo: extractRecordNum(m.total_diff),
          caudal: extractRecordNum(m.flow) ?? extractRecordNum(m.caudal),
          nivel: extractRecordNum(m.nivel) ?? extractRecordNum(m.level),
          water_table: extractRecordNum(m.water_table),
        };
      });
  }, [sortedMeasurements]);

  if (measurements.length === 0) {
    return (
      <Flex justify="center" align="center" style={{ height: 200 }} vertical gap={8}>
        <Text type="secondary" style={{ fontSize: 14 }}>Sin mediciones para este día</Text>
      </Flex>
    );
  }

  /* ── Columnas tabla (idénticas a antes) ── */
  const getPeriod = (hour) => {
    if (hour >= 0 && hour <= 5) return { label: "Madrugada", icon: FaMoon };
    if (hour >= 6 && hour <= 12) return { label: "Mañana", icon: FaSun };
    if (hour >= 13 && hour <= 18) return { label: "Tarde", icon: FaSun };
    return { label: "Noche", icon: FaMoon };
  };

  const TrendArrow = ({ current, previous }) => {
    if (previous == null || current == null) return null;
    const cur = extractRecordNum(current);
    const prev = extractRecordNum(previous);
    if (cur == null || prev == null || cur === prev) return null;
    const up = cur > prev;
    return (
      <span style={{ fontSize: 9, marginLeft: 4, color: up ? token.colorPrimary : token.colorSuccess }}>
        {up ? "▲" : "▼"}
      </span>
    );
  };

  const measurementColumns = [
    {
      title: "Período",
      key: "period",
      width: 85,
      align: "center",
      render: (_, m) => {
        const hour = moment(m.date_time || m.date_time_medition || m.timestamp || m.time || m.created_at).hour();
        const p = getPeriod(hour);
        const Icon = p.icon;
        return (
          <Flex align="center" justify="center" gap={4}>
            <Icon style={{ fontSize: 9, color: token.colorPrimary, opacity: 0.5 }} />
            <Text style={{ fontSize: 10, color: token.colorPrimary }}>{p.label}</Text>
          </Flex>
        );
      },
    },
    {
      title: "Fecha logger",
      key: "logger_time",
      width: 120,
      align: "center",
      render: (_, m) => {
        const t = moment(m.date_time || m.date_time_medition || m.timestamp || m.time || m.created_at).format("DD/MM HH:mm:ss");
        return <Text strong style={{ fontSize: 10, color: token.colorPrimary }}>{t}</Text>;
      },
    },
    {
      title: "Hora",
      key: "time",
      width: 50,
      align: "center",
      render: (_, m) => {
        const t = moment(m.date_time || m.date_time_medition || m.timestamp || m.time || m.created_at).format("HH:mm");
        return <Text style={{ fontSize: 11, color: token.colorText }}>{t}</Text>;
      },
    },
    {
      title: "Caudal (L/s)",
      key: "flow",
      width: 90,
      align: "right",
      render: (_, m) => {
        const flowVal = extractRecordNum(m.flow) ?? extractRecordNum(m.caudal);
        return flowVal != null ? (
          <Text style={{ fontSize: 11, color: token.colorText }}>
            {flowVal.toFixed(1)}
            <TrendArrow current={m.flow} previous={m._prev?.flow} />
          </Text>
        ) : <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>—</Text>;
      },
    },
    {
      title: "Nivel (m)",
      key: "nivel",
      width: 80,
      align: "right",
      render: (_, m) => {
        const levelVal = extractRecordNum(m.nivel) ?? extractRecordNum(m.level);
        return levelVal != null ? (
          <Text style={{ fontSize: 11, color: token.colorText }}>
            {levelVal.toFixed(2)}
            <TrendArrow current={m.nivel} previous={m._prev?.nivel} />
          </Text>
        ) : <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>—</Text>;
      },
    },
    {
      title: "Nivel freático (m)",
      key: "water_table",
      width: 115,
      align: "right",
      render: (_, m) => {
        const wtVal = extractRecordNum(m.water_table);
        return wtVal != null ? (
          <Text style={{ fontSize: 11, color: token.colorText }}>
            {wtVal.toFixed(2)}
            <TrendArrow current={m.water_table} previous={m._prev?.water_table} />
          </Text>
        ) : <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>—</Text>;
      },
    },
    {
      title: "Total (m³)",
      key: "total",
      width: 100,
      align: "right",
      render: (_, m) => {
        const totalVal = extractRecordNum(m.total);
        return totalVal != null ? (
          <Text style={{ fontSize: 11, color: token.colorText }}>
            {totalVal.toLocaleString("es-CL", { maximumFractionDigits: 0 })}
            <TrendArrow current={m.total} previous={m._prev?.total} />
          </Text>
        ) : <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>—</Text>;
      },
    },
    {
      title: "Consumo (m³)",
      key: "consumo",
      width: 100,
      align: "right",
      render: (_, m) => {
        const diffVal = extractRecordNum(m.total_diff);
        return diffVal != null ? (
          <Text strong style={{ fontSize: 11, color: token.colorPrimary }}>
            {diffVal.toLocaleString("es-CL", { maximumFractionDigits: 0 })}
            <TrendArrow current={m.total_diff} previous={m._prev?.total_diff} />
          </Text>
        ) : <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>—</Text>;
      },
    },
    {
      title: "Estado",
      key: "estado",
      width: 85,
      align: "center",
      render: (_, m) => {
        if (m.is_error) {
          return <Tag color="error" style={{ fontSize: 9, margin: 0, padding: "0 6px", lineHeight: "18px" }}>Error</Tag>;
        }
        return <Tag style={{ fontSize: 9, margin: 0, padding: "0 6px", lineHeight: "18px", background: `${token.colorSuccess}10`, border: `1px solid ${token.colorSuccess}30`, color: token.colorSuccess }}>Confirmado</Tag>;
      },
    },
  ];

  const allMeasurements = [...groups.dawn, ...groups.morning, ...groups.afternoon, ...groups.night];

  const formatKPI = (obj, decimals = 2, suffix = "") => {
    if (!obj) return "—";
    const val = Number(obj.value).toLocaleString("es-CL", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    return `${val}${suffix}`;
  };

  const chartMetrics = [
    { key: "consumo", label: "Consumo (m³)", color: token.colorPrimary, icon: "💧" },
    { key: "caudal", label: "Caudal (L/s)", color: token.colorSuccess, icon: "" },
    { key: "nivel", label: "Nivel (m)", color: "#fa8c16", icon: "" },
    { key: "water_table", label: "Nivel freático (m)", color: "#1890ff", icon: "" },
  ];

  const StatPill = ({ label, value, sub, color }) => (
    <div style={{
      textAlign: "center",
      padding: "10px 14px",
      borderRadius: 12,
      background: `${color}06`,
      border: `1px solid ${color}15`,
      minWidth: 100,
      flex: "1 1 auto",
      transition: "all 0.2s ease",
    }}>
      <Text style={{ fontSize: 9, color: token.colorTextSecondary, display: "block", lineHeight: 1.2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{label}</Text>
      <Text strong style={{ fontSize: 16, color: color, display: "block", lineHeight: 1.2 }}>{value}</Text>
      {sub && <Text style={{ fontSize: 10, color: token.colorTextSecondary, lineHeight: 1.2, marginTop: 2 }}>{sub}</Text>}
    </div>
  );

  return (
    <Flex vertical gap={20}>
      {/* ── Toggle arriba a la derecha ─ */}
      <Flex justify="flex-end" align="center">
        <Segmented
          value={viewMode}
          onChange={setViewMode}
          options={[
            { label: <Flex align="center" gap={4}><FaChartLine size={12} />Gráfico</Flex>, value: "chart" },
            { label: <Flex align="center" gap={4}><FaTable size={12} />Datos</Flex>, value: "table" },
          ]}
          size="small"
          style={{ background: token.colorBgLayout }}
        />
      </Flex>

      {viewMode === "chart" && (
        <Flex vertical gap={20}>
          {/* ── Stats horizontales compactas ── */}
          <Flex gap={10} wrap="wrap" justify="flex-start">
            <StatPill label="Máx. Consumo" value={formatKPI(kpis.maxConsumo, 0, " m³")} sub={kpis.maxConsumo ? `a las ${kpis.maxConsumo.time} hrs` : null} color="#1F3461" />
            <StatPill label="Mín. Consumo" value={formatKPI(kpis.minConsumo, 0, " m³")} sub={kpis.minConsumo ? `a las ${kpis.minConsumo.time} hrs` : null} color="#3B6CA8" />
            <StatPill label="Prom. Consumo" value={kpis.avgConsumo != null ? `${Number(kpis.avgConsumo).toLocaleString("es-CL", { maximumFractionDigits: 0 })} m³` : "—"} sub="promedio" color="#1976d2" />
            <StatPill label="Máx. Caudal" value={formatKPI(kpis.maxCaudal, 1, " L/s")} sub={kpis.maxCaudal ? `a las ${kpis.maxCaudal.time} hrs` : null} color="#FF6B35" />
            <StatPill label="Mín. Caudal" value={formatKPI(kpis.minCaudal, 1, " L/s")} sub={kpis.minCaudal ? `a las ${kpis.minCaudal.time} hrs` : null} color="#2A4A8A" />
            <StatPill label="Prom. Caudal" value={kpis.avgCaudal != null ? `${Number(kpis.avgCaudal).toFixed(1)} L/s` : "—"} sub="promedio" color="#3B6CA8" />
            <StatPill label="Máx. Nivel" value={formatKPI(kpis.maxNivel, 2, " m")} sub={kpis.maxNivel ? `a las ${kpis.maxNivel.time} hrs` : null} color="#1F3461" />
            <StatPill label="Mín. Nivel" value={formatKPI(kpis.minNivel, 2, " m")} sub={kpis.minNivel ? `a las ${kpis.minNivel.time} hrs` : null} color="#1976d2" />
            <StatPill label="Máx. Freático" value={formatKPI(kpis.maxWaterTable, 2, " m")} sub={kpis.maxWaterTable ? `a las ${kpis.maxWaterTable.time} hrs` : null} color="#2A4A8A" />
            <StatPill label="Mín. Freático" value={formatKPI(kpis.minWaterTable, 2, " m")} sub={kpis.minWaterTable ? `a las ${kpis.minWaterTable.time} hrs` : null} color="#3B6CA8" />
          </Flex>

          {/* ── Gráficos 2x2 ── */}
          <Row gutter={[16, 16]}>
            {chartMetrics.map((cm) => {
              const data = chartDataAll.filter((d) => d[cm.key] != null);
              return (
                <Col xs={24} md={12} key={cm.key}>
                  <Card
                    size="small"
                    title={
                      <Flex align="center" gap={8}>
                        <Text strong style={{ fontSize: 13 }}>{cm.label}</Text>
                      </Flex>
                    }
                    bodyStyle={{ padding: 16 }}
                    headStyle={{ padding: "12px 16px", minHeight: 48, borderBottom: `1px solid ${token.colorBorderSecondary}` }}
                    style={{ borderRadius: 12, border: `1px solid ${token.colorBorderSecondary}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                  >
                    <MeasurementsChart data={data} metric={cm.key} token={token} color={cm.color} title={cm.label} />
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Flex>
      )}

      {viewMode === "table" && (
        <Table
          dataSource={allMeasurements.map((m, i) => ({ ...m, key: i, _prev: allMeasurements[i - 1] || null }))}
          columns={measurementColumns}
          size="small"
          pagination={{ pageSize: 15, showSizeChanger: false }}
          bordered={false}
          showHeader={true}
          locale={{ emptyText: "Sin mediciones para este día" }}
          scroll={{ x: "max-content", y: 500 }}
          style={{ borderRadius: 12, overflow: "hidden" }}
          components={{
            header: {
              cell: (props) => (
                <th {...props} style={{ ...props.style, fontSize: 10, padding: "10px 8px", fontWeight: 600, color: token.colorTextSecondary, textTransform: "uppercase", letterSpacing: 0.5, background: token.colorBgLayout }} />
              ),
            },
          }}
        />
      )}
    </Flex>
  );
};

const ControlCenter = () => {
  const { dispatch } = useData();
  const { user } = useAuth();
  const { data, loading, error, refresh, isReady, chatQuota } = useControlCenter({
    autoRefresh: true,
    refreshInterval: 60000,
  });
  const { token } = useToken();
  const [selectedDate, setSelectedDate] = useState(null);
  const [warningsDrawerOpen, setWarningsDrawerOpen] = useState(false);
  const [selectedWarningPoint, setSelectedWarningPoint] = useState(null);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherCopied, setVoucherCopied] = useState(false);

  // ── Drawer de Mediciones ──
  const [measurementsDrawerOpen, setMeasurementsDrawerOpen] = useState(false);
  const [selectedMeasurementPoint, setSelectedMeasurementPoint] = useState(null);
  const [measurementsData, setMeasurementsData] = useState(null);
  const [measurementsLoading, setMeasurementsLoading] = useState(false);

  // ── Drawer Detener Telemetría ──
  const [stopTelemetryOpen, setStopTelemetryOpen] = useState(false);
  const [stopTelemetryLoading, setStopTelemetryLoading] = useState(false);
  const [stopTelemetryPoint, setStopTelemetryPoint] = useState(null);
  const [stopTelemetryForm] = Form.useForm();

  // ── Drawer Detener Cumplimiento ──
  const [stopComplianceOpen, setStopComplianceOpen] = useState(false);
  const [stopComplianceLoading, setStopComplianceLoading] = useState(false);
  const [stopCompliancePoint, setStopCompliancePoint] = useState(null);
  const [stopComplianceForm] = Form.useForm();

  // ── Watch fechas para alerta DGA (hooks siempre antes de returns condicionales) ──
  const compStart = Form.useWatch("start_date", stopComplianceForm);
  const compEnd = Form.useWatch("end_date", stopComplianceForm);
  const compDiffDays = compStart && compEnd ? compEnd.diff(compStart, "days") : 0;

  const handleViewVoucher = useCallback((record) => {
    setSelectedVoucher(record);
    setVoucherModalOpen(true);
  }, []);

  const handleViewMeasurements = useCallback(async (pointName, date) => {
    const point = data?.points?.find((p) => p.title === pointName);
    if (!point) return;
    setSelectedMeasurementPoint({ pointName, date, pointId: point.id });
    setMeasurementsDrawerOpen(true);
    setMeasurementsLoading(true);
    setMeasurementsData(null);
    try {
      const res = await sh.pointRecords(point.id, date, date, 100);
      setMeasurementsData(res);
    } catch (err) {
      console.error("[Measurements] Error:", err);
    } finally {
      setMeasurementsLoading(false);
    }
  }, [data?.points]);

  const handleSelectPoint = useCallback(
    (point) => {
      dispatch({
        type: "CHANGE_SELECTED_PROFILE",
        payload: { selected_profile: { ...point, key: point.id } },
      });
    },
    [dispatch]
  );

  /* ── Detener Telemetría ── */
  const handleOpenStopTelemetry = useCallback((pointName) => {
    const point = data?.points?.find((p) => p.title === pointName);
    if (!point) return;
    setStopTelemetryPoint({ id: point.id, name: pointName, client: point.client_name || point.client || "—" });
    stopTelemetryForm.resetFields();
    setStopTelemetryOpen(true);
  }, [data?.points, stopTelemetryForm]);

  const handleSubmitStopTelemetry = useCallback(async (values) => {
    if (!stopTelemetryPoint) return;
    setStopTelemetryLoading(true);
    try {
      const payload = {
        title: `Solicitud detener telemetría - ${stopTelemetryPoint.name}`,
        message: values.reason.trim(),
        point_catchment: stopTelemetryPoint.id,
        type_notification: "SUPPORT",
        type_alert: "SOPORTE",
        type_variable: "TODOS",
        priority: "medium",
        assigned_to: null,
        is_periodic: false,
        is_active: true,
        is_read: false,
        is_response: false,
        is_finish: false,
        is_wait: false,
        status_dga: "PENDING",
        status_sma: "PENDING",
        start_date: values.start_date ? values.start_date.format("YYYY-MM-DD") : null,
        end_date: values.end_date ? values.end_date.format("YYYY-MM-DD") : null,
        emails: user?.email ? [user.email] : [],
      };
      const res = await sh.notifications.create(payload);
      message.success(`Ticket #${res.id} creado exitosamente`);
      stopTelemetryForm.resetFields();
      setStopTelemetryOpen(false);
      setStopTelemetryPoint(null);
    } catch (err) {
      console.error("[StopTelemetry] Error:", err);
      message.error("Error al crear el ticket");
    } finally {
      setStopTelemetryLoading(false);
    }
  }, [stopTelemetryPoint, stopTelemetryForm, user?.email]);

  /* ── Detener Cumplimiento ── */
  const handleOpenStopCompliance = useCallback((record) => {
    setStopCompliancePoint({ id: record.id, name: record.title || record.name || "—", code: record.code || "—", client: record.client_name || record.client || "—" });
    stopComplianceForm.resetFields();
    setStopComplianceOpen(true);
  }, [stopComplianceForm]);

  const handleSubmitStopCompliance = useCallback(async (values) => {
    if (!stopCompliancePoint) return;
    setStopComplianceLoading(true);
    try {
      const payload = {
        title: `Solicitud detener cumplimiento - ${stopCompliancePoint.name}`,
        message: values.reason.trim(),
        point_catchment: stopCompliancePoint.id,
        type_notification: "SUPPORT",
        type_alert: "SOPORTE",
        type_variable: "TODOS",
        priority: "medium",
        assigned_to: null,
        is_periodic: false,
        is_active: true,
        is_read: false,
        is_response: false,
        is_finish: false,
        is_wait: false,
        status_dga: "PENDING",
        status_sma: "PENDING",
        start_date: values.start_date ? values.start_date.format("YYYY-MM-DD") : null,
        end_date: values.end_date ? values.end_date.format("YYYY-MM-DD") : null,
        emails: user?.email ? [user.email] : [],
      };
      const res = await sh.notifications.create(payload);
      message.success(`Ticket #${res.id} creado exitosamente`);
      stopComplianceForm.resetFields();
      setStopComplianceOpen(false);
      setStopCompliancePoint(null);
    } catch (err) {
      console.error("[StopCompliance] Error:", err);
      message.error("Error al crear el ticket");
    } finally {
      setStopComplianceLoading(false);
    }
  }, [stopCompliancePoint, stopComplianceForm, user?.email]);

  const overview = data?.overview || {};
  const points = data?.points || [];
  const warningsList = data?.recent_warnings_list || [];
  const warningsRaw = data?.recent_warnings || {};

  if (loading && !isReady) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "50vh" }}>
        <Spin size="large" tip="Cargando Centro de Control..." />
      </Flex>
    );
  }

  if (error && !isReady) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "50vh" }} vertical gap={16}>
        <Text type="danger" strong style={{ fontSize: token.fontSizeLG }}>
          Error cargando el Centro de Control
        </Text>
        <Text type="secondary">{error.message}</Text>
        <button onClick={refresh} style={{ padding: "8px 16px", cursor: "pointer" }}>
          Reintentar
        </button>
      </Flex>
    );
  }

  const showDgaAlert = stopCompliancePoint?.code && stopCompliancePoint?.code !== "—" && compDiffDays > 5;
  const showDgaCriticalAlert = stopCompliancePoint?.code && stopCompliancePoint?.code !== "—" && compDiffDays > 10;

  return (
    <div style={{ marginBottom: 24 }}>
      {/* ════════════════════════════════════════
          KPIs
      ════════════════════════════════════════ */}
      <Row id="cc-kpi-cards" gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6} md={6}>
          <KPICard
            icon={<FaMapMarkerAlt style={{ fontSize: 20, color: ikoluTokens.colorWhite }} />}
            label="Total Puntos"
            value={overview.total_points || 0}
            gradient={kpiGradients.primary}
          />
        </Col>
        <Col xs={12} sm={6} md={6}>
          <KPICard
            icon={<FaBroadcastTower style={{ fontSize: 20, color: ikoluTokens.colorWhite }} />}
            label="Telemetría Activa"
            value={`${overview.points_with_telemetry || 0}`}
            suffix={`/${overview.total_points || 0}`}
            gradient={kpiGradients.secondary}
          />
        </Col>
        <Col xs={12} sm={6} md={6}>
          <KPICard
            icon={<FaClipboardCheck style={{ fontSize: 20, color: ikoluTokens.colorWhite }} />}
            label="Cumplimiento Normativo"
            value={overview.points_with_compliance || 0}
            gradient={kpiGradients.secondary}
          />
        </Col>
        <Col xs={12} sm={6} md={6}>
          <KPICard
            icon={<FaExclamationTriangle style={{ fontSize: 20, color: ikoluTokens.colorWhite }} />}
            label="Warnings"
            value={warningsList.length}
            gradient={kpiGradients.secondary}
          />
        </Col>
      </Row>

      {/* ════════════════════════════════════════
          Warnings por punto — Grid 3 cols, Drawer por punto
      ════════════════════════════════════════ */}
      <CCWarningsSection
        warningsList={warningsList}
        warningsRaw={warningsRaw}
        onWarningPointClick={(pointName) => {
          setSelectedWarningPoint(pointName);
          setWarningsDrawerOpen(true);
        }}
      />

      {/* ════════════════════════════════════════
          Consumo Semanal
      ════════════════════════════════════════ */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={24}>
          <CCWeekConsumption
            last7={data?.last_7}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onViewMeasurements={handleViewMeasurements}
            onOpenStopTelemetry={handleOpenStopTelemetry}
            onSelectPoint={handleSelectPoint}
          />
        </Col>
      </Row>

      {/* ═══════════════════════════════════════
          Chat IA (componente aislado)
      ════════════════════════════════════════ */}
      <ControlCenterChat points={points} chatQuota={chatQuota} />

      {/* ════════════════════════════════════════
          Datos: Telemetría + Cumplimiento (Tabs)
      ════════════════════════════════════════ */}
      <CCDataTabs
        points={points}
        onViewVoucher={handleViewVoucher}
        onOpenStopCompliance={handleOpenStopCompliance}
        onSelectPoint={handleSelectPoint}
        onViewMeasurements={handleViewMeasurements}
        onOpenStopTelemetry={handleOpenStopTelemetry}
      />

      {/* ════════════════════════════════════════
          Drawer de Warnings por punto
      ════════════════════════════════════════ */}
      <Drawer
        title={
          <Flex align="center" gap={8}>
            <FaExclamationTriangle style={{ color: token.colorWarning, fontSize: 16 }} />
            <Text strong style={{ fontSize: 16 }}>{selectedWarningPoint}</Text>
            <Tag color="warning" style={{ margin: 0 }}>
              {(warningsRaw[selectedWarningPoint] || []).length} warnings
            </Tag>
          </Flex>
        }
        placement="right"
        onClose={() => {
          setWarningsDrawerOpen(false);
          setSelectedWarningPoint(null);
        }}
        open={warningsDrawerOpen}
        width={640}
        bodyStyle={{ padding: 16 }}
      >
        <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 12 }}>
          Warnings generados de forma nativa por nuestro servicio.
        </Text>
        <Table
          dataSource={(warningsRaw[selectedWarningPoint] || []).map((w, i) => ({ ...w, key: i }))}
          size="small"
          pagination={{ pageSize: 10, size: "small" }}
          locale={{ emptyText: "Sin warnings para este punto" }}
          columns={[
            {
              title: "Fecha",
              dataIndex: "time",
              key: "time",
              width: 110,
              render: (time) => (
                <Text style={{ fontSize: 11, color: token.colorTextSecondary, whiteSpace: "nowrap" }}>
                  {time ? moment(time).format("DD/MM HH:mm") : "—"}
                </Text>
              ),
            },
            {
              title: "Tipo",
              dataIndex: "type",
              key: "type",
              width: 80,
              render: (type) => <Tag style={{ fontSize: 10, margin: 0 }}>{type}</Tag>,
            },
            {
              title: "Severidad",
              dataIndex: "severity",
              key: "severity",
              width: 90,
              render: (sev) => {
                const color = sev === "ERROR" ? "red" : sev === "WARNING" ? "orange" : "blue";
                return <Tag color={color} style={{ fontSize: 10, margin: 0 }}>{sev}</Tag>;
              },
            },
            {
              title: "Mensaje",
              dataIndex: "message",
              key: "message",
              render: (msg) => (
                <Text style={{ fontSize: 12, whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.4 }}>
                  {msg}
                </Text>
              ),
            },
          ]}
        />
      </Drawer>

      {/* ════════════════════════════════════════
          Drawer de Mediciones por punto
      ════════════════════════════════════════ */}
      <Drawer
        title={
          <Flex align="center" gap={12} style={{ width: "100%" }}>
            <Flex align="center" gap={10}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${token.colorPrimary}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FaBroadcastTower style={{ color: token.colorPrimary, fontSize: 18 }} />
              </div>
              <div>
                <Text strong style={{ fontSize: 16, display: "block", lineHeight: 1.2 }}>{selectedMeasurementPoint?.pointName}</Text>
                <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
                  {selectedMeasurementPoint?.date ? moment(selectedMeasurementPoint.date).format("dddd D [de] MMMM, YYYY") : ""}
                </Text>
              </div>
            </Flex>
            <div style={{ flex: 1 }} />
            {measurementsData?.count != null && (
              <Tag style={{ fontSize: 12, margin: 0, padding: "4px 12px", background: `${token.colorPrimary}08`, border: `1px solid ${token.colorPrimary}20`, color: token.colorPrimary, fontWeight: 600, borderRadius: 20 }}>
                {measurementsData.count} mediciones
              </Tag>
            )}
          </Flex>
        }
        open={measurementsDrawerOpen}
        onClose={() => {
          setMeasurementsDrawerOpen(false);
          setSelectedMeasurementPoint(null);
          setMeasurementsData(null);
        }}
        width={1200}
        bodyStyle={{ padding: 24, overflow: "auto" }}
        styles={{
          header: {
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            paddingBottom: 16,
            marginBottom: 8,
          },
        }}
      >
        {measurementsLoading ? (
          <Flex justify="center" align="center" style={{ height: 300 }}>
            <Spin size="large" tip="Cargando mediciones..." />
          </Flex>
        ) : (
          <MeasurementsDrawerContent
            data={measurementsData}
            token={token}
            pointName={selectedMeasurementPoint?.pointName}
            date={selectedMeasurementPoint?.date}
          />
        )}
      </Drawer>

      {/* ════════════════════════════════════════
          Modal de Voucher DGA
      ════════════════════════════════════════ */}
      <Modal
        title={
          <Flex align="center" gap={8}>
            <FaClipboardCheck style={{ color: token.colorPrimary, fontSize: 16 }} />
            <Text strong style={{ fontSize: 16 }}>Voucher</Text>
          </Flex>
        }
        open={voucherModalOpen}
        onCancel={() => {
          setVoucherModalOpen(false);
          setSelectedVoucher(null);
        }}
        footer={null}
        width={420}
      >
        <Flex vertical gap={12} style={{ marginTop: 8 }}>
          <Text strong style={{ fontSize: 14 }}>
            {selectedVoucher?.title} — {selectedVoucher?.code || "Sin código DGA"}
          </Text>
          <Space.Compact style={{ width: "100%" }}>
            <Input
              value={selectedVoucher?.voucher || ""}
              readOnly
              style={{ fontSize: 13, fontFamily: "monospace" }}
            />
            <Button
              type={voucherCopied ? "default" : "primary"}
              icon={<FaCopy style={{ fontSize: 14 }} />}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(selectedVoucher?.voucher || "");
                  setVoucherCopied(true);
                  setTimeout(() => setVoucherCopied(false), 2000);
                } catch (err) {
                  console.error("Error copiando voucher:", err);
                }
              }}
            />
          </Space.Compact>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Este voucher es generado por la entidad de cumplimiento normativo.
          </Text>
        </Flex>
      </Modal>

      {/* ════════════════════════════════════════
          Drawer Detener Telemetría
      ════════════════════════════════════════ */}
      <Drawer
        title={
          <Flex align="center" gap={8}>
            <FaHandPaper style={{ color: token.colorPrimary, fontSize: 16 }} />
            <Text strong style={{ fontSize: 16 }}>Solicitud para detener telemetría</Text>
          </Flex>
        }
        open={stopTelemetryOpen}
        onClose={() => {
          setStopTelemetryOpen(false);
          setStopTelemetryPoint(null);
          stopTelemetryForm.resetFields();
        }}
        width={420}
        bodyStyle={{ padding: 20 }}
        footer={
          <Flex justify="flex-end" gap={8}>
            <Button onClick={() => { setStopTelemetryOpen(false); setStopTelemetryPoint(null); stopTelemetryForm.resetFields(); }}>
              Cancelar
            </Button>
            <Button type="primary" loading={stopTelemetryLoading} onClick={() => stopTelemetryForm.submit()}>
              Enviar solicitud
            </Button>
          </Flex>
        }
      >
        {stopTelemetryPoint && (
          <Flex vertical style={{ marginBottom: 16 }}>
            <Text strong style={{ fontSize: 14 }}>{stopTelemetryPoint.name}</Text>
          </Flex>
        )}
        <Form form={stopTelemetryForm} layout="vertical" onFinish={handleSubmitStopTelemetry}>
          {/* Quién crea */}
          <Form.Item label="Solicitado por">
            <Input
              value={user ? `${user.first_name || user.username} (${user.email})` : "—"}
              readOnly
              style={{ borderRadius: 8, fontSize: 13, background: token.colorBgContainerDisabled }}
            />
          </Form.Item>
          {/* Fechas */}
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="start_date"
                label="Fecha inicio"
                rules={[{ required: true, message: "Selecciona fecha" }]}
              >
                <DatePicker style={{ width: "100%", borderRadius: 8 }} format="DD/MM/YYYY" placeholder="Inicio" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="end_date"
                label="Fecha fin"
                rules={[{ required: true, message: "Selecciona fecha" }]}
              >
                <DatePicker style={{ width: "100%", borderRadius: 8 }} format="DD/MM/YYYY" placeholder="Fin" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="reason"
            label="Razón de la solicitud"
            rules={[{ required: true, message: "Ingresa la razón" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Ej: Mantenimiento programado del sensor..."
              maxLength={500}
              showCount
              style={{ borderRadius: 8, fontSize: 13 }}
            />
          </Form.Item>
          <Form.Item hidden name="pointId" initialValue={stopTelemetryPoint?.id}>
            <Input />
          </Form.Item>
        </Form>
      </Drawer>

      {/* ════════════════════════════════════════
          Drawer Detener Cumplimiento
      ════════════════════════════════════════ */}
      <Drawer
        title={
          <Flex align="center" gap={8}>
            <FaPauseCircle style={{ color: token.colorPrimary, fontSize: 16 }} />
            <Text strong style={{ fontSize: 16 }}>Solicitud para detener cumplimiento</Text>
          </Flex>
        }
        open={stopComplianceOpen}
        onClose={() => {
          setStopComplianceOpen(false);
          setStopCompliancePoint(null);
          stopComplianceForm.resetFields();
        }}
        width={420}
        bodyStyle={{ padding: 20 }}
        footer={
          <Flex justify="flex-end" gap={8}>
            <Button onClick={() => { setStopComplianceOpen(false); setStopCompliancePoint(null); stopComplianceForm.resetFields(); }}>
              Cancelar
            </Button>
            <Button type="primary" loading={stopComplianceLoading} onClick={() => stopComplianceForm.submit()}>
              Enviar solicitud
            </Button>
          </Flex>
        }
      >
        {stopCompliancePoint && (
          <Flex vertical gap={12} style={{ marginBottom: 16 }}>
            <Card size="small" bodyStyle={{ padding: 10 }} style={{ background: `${token.colorPrimary}06`, border: `1px solid ${token.colorPrimary}15` }}>
              <Text strong style={{ fontSize: 13, display: "block" }}>{stopCompliancePoint.name}</Text>
              <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>Código: {stopCompliancePoint.code}</Text>
            </Card>
          </Flex>
        )}
        <Form form={stopComplianceForm} layout="vertical" onFinish={handleSubmitStopCompliance}>
          {/* Quién crea */}
          <Form.Item label="Solicitado por">
            <Input
              value={user ? `${user.first_name || user.username} (${user.email})` : "—"}
              readOnly
              style={{ borderRadius: 8, fontSize: 13, background: token.colorBgContainerDisabled }}
            />
          </Form.Item>
          {/* Fechas */}
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="start_date"
                label="Fecha inicio"
                rules={[{ required: true, message: "Selecciona fecha" }]}
              >
                <DatePicker style={{ width: "100%", borderRadius: 8 }} format="DD/MM/YYYY" placeholder="Inicio" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="end_date"
                label="Fecha fin"
                rules={[{ required: true, message: "Selecciona fecha" }]}
              >
                <DatePicker style={{ width: "100%", borderRadius: 8 }} format="DD/MM/YYYY" placeholder="Fin" />
              </Form.Item>
            </Col>
          </Row>
          {showDgaAlert && !showDgaCriticalAlert && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 12, fontSize: 12 }}
              message="Informe Técnico requerido"
              description={
                <Text style={{ fontSize: 12 }}>
                  La detención supera los 5 días. Se debe enviar el <strong>Informe Técnico</strong> (formato libre) que cumpla con los fundamentos principales y cuyo objetivo sea evidenciar las actividades realizadas en terreno.
                </Text>
              }
            />
          )}
          {showDgaCriticalAlert && (
            <Alert
              type="error"
              showIcon
              style={{ marginBottom: 12, fontSize: 12 }}
              message="Informe Detallado Obligatorio"
              description={
                <Text style={{ fontSize: 12 }}>
                  La detención supera los 10 días. Se debe confeccionar un <strong>informe detallado de las actividades realizadas en terreno</strong>, evidenciando cada una de las labores ejecutadas.
                </Text>
              }
            />
          )}
          <Form.Item
            name="reason"
            label="Razón de la solicitud"
            rules={[{ required: true, message: "Ingresa la razón" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Ej: Pausa temporal por reconfiguración normativa..."
              maxLength={500}
              showCount
              style={{ borderRadius: 8, fontSize: 13 }}
            />
          </Form.Item>
          <Form.Item hidden name="pointId" initialValue={stopCompliancePoint?.id}>
            <Input />
          </Form.Item>
        </Form>
      </Drawer>

      <ModuleTour
        tourKey={centroControlTour.key}
        steps={centroControlTour.steps}
        requiresPoint={centroControlTour.requiresPoint}
        hasPoint={true}
        autoStart={true}
        delay={1000}
      />
    </div>
  );
};

export default React.memo(ControlCenter);
