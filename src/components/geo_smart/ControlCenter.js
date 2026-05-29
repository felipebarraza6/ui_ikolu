import React, { useCallback, useState, useMemo, useRef } from "react";
import "./ControlCenter.css";
import ApexChartWrapper from "./ApexChartWrapper";
import ReactApexChart from "react-apexcharts";
import { useData } from "../../contexts/DataContext";
import { useControlCenter } from "../../hooks/useControlCenter";
import sh from "../../api/sh/endpoints";
import { Row, Col, Card, Flex, Typography, Spin, Table, Tag, theme, Drawer, Modal, Button, Input, Space, Segmented, Form, message, DatePicker, Alert, Tabs } from "antd";
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
  FaExternalLinkAlt,
} from "react-icons/fa";


import KPICard from "./KPICard";
import ControlCenterChat from "./ControlCenterChat";
import CCDataTabs from "./CCDataTabs";
import CCSupportDrawer from "./CCSupportDrawer";
import PointConfigDrawer from "./PointConfigDrawer";
import SkeletonControlCenter from "./SkeletonControlCenter";
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

/*  Helper: generar annotation de promedio condicional ─ */
const getAvgAnnotation = (avgVal, minVal, maxVal, token, unit = "") => {
  return [{
    type: "line",
    start: ["min", avgVal],
    end: ["max", avgVal],
    style: { stroke: token.colorTextSecondary, lineWidth: 1.5, lineDash: [4, 4], opacity: 0.5 }
  }];
};

/*  ChartToolbar: botón descarga + toggle indicadores ─ */
/*  Area Chart (Consumo) ─ */
const MeasurementsAreaChart = ({ data, metric, token, color, title, minInfo, maxInfo }) => {
  return (
    <ApexChartWrapper
      type="area"
      data={data}
      metric={metric}
      token={token}
      color={color || token.colorPrimary}
      title={title || "Consumo"}
      minInfo={minInfo}
      maxInfo={maxInfo}
      unit="m³"
    />
  );
};

/*  Line Chart (Caudal)  */
const MeasurementsLineChart = ({ data, metric, token, color, title, minInfo, maxInfo }) => {
  return (
    <ApexChartWrapper
      type="line"
      data={data}
      metric={metric}
      token={token}
      color={color || token.colorPrimary}
      title={title || "Caudal"}
      minInfo={minInfo}
      maxInfo={maxInfo}
      unit="L/s"
    />
  );
};

/*  Column Chart (Nivel)  */
const MeasurementsColumnChart = ({ data, metric, token, color, title, minInfo, maxInfo }) => {
  return (
    <ApexChartWrapper
      type="bar"
      data={data}
      metric={metric}
      token={token}
      color={color || token.colorPrimary}
      title={title || "Nivel"}
      minInfo={minInfo}
      maxInfo={maxInfo}
      unit="m"
    />
  );
};

/*  Inverted Column Chart (Nivel Freático)  */
const MeasurementsColumnInvertedChart = ({ data, metric, token, color, title, minInfo, maxInfo }) => {
  return (
    <ApexChartWrapper
      type="bar"
      data={data}
      metric={metric}
      token={token}
      color={color || token.colorPrimary}
      title={title || "Nivel Freático"}
      minInfo={minInfo}
      maxInfo={maxInfo}
      unit="m"
    />
  );
};

/*  Stacked Column Chart (Nivel + Nivel Freático combinados)  */
const MeasurementsStackedColumnChart = ({ data, token }) => {
  if (!data || data.length === 0) return <Flex justify="center" align="center" style={{ height: 220 }} vertical><Text type="secondary" style={{ fontSize: 12 }}>Sin datos</Text></Flex>;

  const stackedData = [];
  data.forEach((d) => {
    if (d.nivel != null) {
      stackedData.push({ time: d.time, value: Number(d.nivel), type: "Nivel del sensor" });
    }
    if (d.water_table != null) {
      stackedData.push({ time: d.time, value: Number(d.water_table), type: "Nivel freático" });
    }
  });

  const nivelVals = data.map(d => d.nivel).filter(v => v != null);
  const wtVals = data.map(d => d.water_table).filter(v => v != null);
  const allVals = [...nivelVals, ...wtVals];
  const maxVal = allVals.length ? Math.max(...allVals) : 0;
  const minVal = allVals.length ? Math.min(...allVals) : 0;
  const yMax = maxVal + (maxVal - minVal) * 0.1;

  const nivelMax = nivelVals.length ? Math.max(...nivelVals) : null;
  const nivelMin = nivelVals.length ? Math.min(...nivelVals) : null;
  const wtMax = wtVals.length ? Math.max(...wtVals) : null;
  const wtMin = wtVals.length ? Math.min(...wtVals) : null;

  const allTimes = [...new Set(stackedData.map(d => d.time))].sort();
  
  if (allTimes.length === 0) return <Flex justify="center" align="center" style={{ height: 220 }} vertical><Text type="secondary" style={{ fontSize: 12 }}>Sin datos válidos</Text></Flex>;

  const series = [
    {
      name: 'Nivel del sensor',
      data: allTimes.map(time => {
        const item = stackedData.find(d => d.time === time && d.type === "Nivel del sensor");
        const val = item ? Number(item.value) : null;
        return { 
          x: time, 
          y: val,
          fillColor: val === nivelMax ? '#ff4d4f' : val === nivelMin ? '#52c41a' : undefined
        };
      })
    },
    {
      name: 'Nivel freático',
      data: allTimes.map(time => {
        const item = stackedData.find(d => d.time === time && d.type === "Nivel freático");
        const val = item ? Number(item.value) : null;
        return { 
          x: time, 
          y: val,
          fillColor: val === wtMax ? '#ff4d4f' : val === wtMin ? '#52c41a' : undefined
        };
      })
    }
  ];

  const options = {
    chart: {
      type: 'bar',
      height: 350,
      stacked: true,
      toolbar: { show: false },
      animations: { enabled: false },
      fontFamily: 'inherit',
    },
    colors: ['#1890ff', '#595959'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%',
      }
    },
    states: {
      hover: {
        filter: {
          type: 'darken',
          value: 0.8,
        }
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: allTimes,
      labels: {
        style: { colors: token.colorTextSecondary, fontSize: '11px' },
        rotate: -45,
        rotateAlways: true,
      },
      axisBorder: { color: token.colorBorder },
      axisTicks: { color: token.colorBorder }
    },
    yaxis: {
      labels: {
        style: { colors: token.colorTextSecondary, fontSize: '11px' },
        formatter: (value) => Number(value).toFixed(2)
      },
      title: {
        text: 'Nivel (m)',
        style: { color: token.colorTextSecondary, fontSize: '12px', fontWeight: 'bold' }
      }
    },
    grid: {
      borderColor: token.colorBorderSecondary + '50',
      strokeDashArray: 4,
    },
    tooltip: {
      theme: 'light',
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const datum = stackedData.find(d => d.time === w.config.xaxis.categories[dataPointIndex] && d.type === w.config.series[seriesIndex].name);
        if (!datum) return '';
        const isMaxNivel = datum.type === "Nivel del sensor" && datum.value === nivelMax;
        const isMaxWt = datum.type === "Nivel freático" && datum.value === wtMax;
        const isMinNivel = datum.type === "Nivel del sensor" && datum.value === nivelMin;
        const isMinWt = datum.type === "Nivel freático" && datum.value === wtMin;
        let suffix = '';
        if (isMaxNivel || isMaxWt) suffix = ' (MÁXIMO)';
        if (isMinNivel || isMinWt) suffix = ' (MÍNIMO)';
        
        return `
          <div style="padding: 8px 12px; background: ${token.colorBgElevated}; border-radius: 8px; box-shadow: ${token.boxShadowSecondary};">
            <div style="font-size: 12px; color: ${token.colorTextSecondary}; margin-bottom: 4px;">${datum.time} hrs</div>
            <div style="font-size: 13px; color: ${token.colorText}; font-weight: 500;">
              ${datum.type}${suffix}: <strong>${Number(datum.value).toFixed(2)} m</strong>
            </div>
          </div>
        `;
      }
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'center',
      fontSize: '12px',
      labels: { colors: token.colorText }
    },
    annotations: { points: [] },
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="bar"
      height={350}
    />
  );
};

/* ─ Sub-componentes extraídos para evitar recreación en cada render ─ */
const TrendArrow = ({ current, previous }) => {
  if (previous == null || current == null) return null;
  const cur = extractRecordNum(current);
  const prev = extractRecordNum(previous);
  if (cur == null || prev == null || cur === prev) return null;
  const up = cur > prev;
  return (
    <span style={{ fontSize: 9, marginLeft: 4, color: up ? "#1890ff" : "#52c41a" }}>
      {up ? "▲" : "▼"}
    </span>
  );
};

const StatPill = ({ label, value, sub, color, valueColor }) => (
  <Card
    size="small"
    bordered={false}
    style={{
      textAlign: "center",
      minWidth: 110,
      flex: "0 0 auto",
      background: `${color}08`,
      borderRadius: 12,
      border: `1.5px solid ${color}20`,
    }}
    bodyStyle={{ padding: "12px 16px" }}
  >
    <Text style={{ fontSize: 10, color: "#8c8c8c", display: "block", lineHeight: 1.2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4, fontWeight: 500 }}>{label}</Text>
    <Text strong style={{ fontSize: 18, color: valueColor || color, display: "block", lineHeight: 1.2 }}>{value}</Text>
    {sub && <Text style={{ fontSize: 11, color: "#8c8c8c", lineHeight: 1.2, marginTop: 4 }}>{sub}</Text>}
  </Card>
);

const MemoizedMeasurementsTable = React.memo(({ allMeasurements, measurementColumns, token }) => {
  const dataSource = useMemo(() =>
    allMeasurements.map((m, i) => ({ ...m, key: i, _prev: allMeasurements[i - 1] || null })),
    [allMeasurements]
  );

  const components = useMemo(() => ({
    header: {
      cell: (props) => (
        <th {...props} style={{ ...props.style, fontSize: 10, padding: "10px 8px", fontWeight: 600, color: token.colorTextSecondary, textTransform: "uppercase", letterSpacing: 0.5, background: token.colorBgLayout }} />
      ),
    },
  }), [token.colorTextSecondary, token.colorBgLayout]);

  return (
    <Table
      dataSource={dataSource}
      columns={measurementColumns}
      size="small"
      pagination={{ pageSize: 15, showSizeChanger: false }}
      bordered={false}
      showHeader={true}
      locale={{ emptyText: "Sin mediciones para este día" }}
      scroll={{ x: "max-content", y: 500 }}
      style={{ borderRadius: 12, overflow: "hidden" }}
      components={components}
    />
  );
});

/* ── Componente: contenido del Drawer de mediciones ── */
const MeasurementsDrawerContent = ({ data, token, viewMode, variables }) => {

  const measurements = extractMeasurements(data);

  // Determinar variables activas según configuración del punto (viene desde last_7)
  // O según los datos reales si el backend no envía la variable separada
  const activeVars = useMemo(() => {
    const vars = variables || [];
    const hasNivelVar = vars.some(v => v === "NIVEL");
    const hasWaterTableVar = vars.some(v => v === "NIVEL_FREATICO");
    // Si el backend no envía NIVEL_FREATICO como variable separada,
    // pero los datos sí tienen water_table, mostramos el gráfico
    const hasWaterTableData = measurements.some(m => extractRecordNum(m.water_table) != null);
    return {
      hasCaudal: vars.some(v => v.includes("CAUDAL")),
      hasNivel: hasNivelVar,
      hasWaterTable: hasWaterTableVar || (hasNivelVar && hasWaterTableData),
      hasTotalizado: vars.some(v => v === "TOTALIZADO"),
    };
  }, [variables, measurements]);

  const sortedMeasurements = useMemo(() => {
    // Mantener orden original de la API
    return [...measurements];
  }, [measurements]);

  const groups = useMemo(() => classifyByTimeOfDay(measurements), [measurements]);

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
    avgNivel: calcAvg(sortedMeasurements, "nivel", "level"),
    maxWaterTable: findExtreme(sortedMeasurements, "water_table", null, "max"),
    minWaterTable: findExtreme(sortedMeasurements, "water_table", null, "min"),
    avgWaterTable: calcAvg(sortedMeasurements, "water_table", null),
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
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [sortedMeasurements]);

  /* ── Columnas tabla (idénticas a antes) ── */
  const getPeriod = (hour) => {
    if (hour >= 0 && hour <= 5) return { label: "Madrugada", icon: FaMoon };
    if (hour >= 6 && hour <= 12) return { label: "Mañana", icon: FaSun };
    if (hour >= 13 && hour <= 18) return { label: "Tarde", icon: FaSun };
    return { label: "Noche", icon: FaMoon };
  };



  const baseColumns = [
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
  ];

  const caudalColumn = {
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
  };

  const nivelColumn = {
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
  };

  const waterTableColumn = {
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
  };

  const totalColumn = {
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
  };

  const consumoColumn = {
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
  };

  const estadoColumn = {
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
  };

  const measurementColumns = useMemo(() => {
    const cols = [...baseColumns];
    if (activeVars.hasCaudal) cols.push(caudalColumn);
    if (activeVars.hasNivel) cols.push(nivelColumn);
    if (activeVars.hasWaterTable) cols.push(waterTableColumn);
    if (activeVars.hasTotalizado) {
      cols.push(totalColumn);
      cols.push(consumoColumn);
    }
    cols.push(estadoColumn);
    return cols;
  }, [activeVars]);

  const allMeasurements = useMemo(() => sortedMeasurements, [sortedMeasurements]);

  const formatKPI = useCallback((obj, decimals = 2, suffix = "") => {
    if (!obj) return "—";
    const val = Number(obj.value).toFixed(decimals);
    return `${val}${suffix}`;
  }, []);





  if (measurements.length === 0) {
    return (
      <Flex justify="center" align="center" style={{ height: 200 }} vertical gap={8}>
        <Text type="secondary" style={{ fontSize: 14 }}>Sin mediciones para este día</Text>
      </Flex>
    );
  }

  return (
    <Flex vertical gap={20}>
      {viewMode === "chart" && (
        <Flex vertical gap={12}>
          {/* ── Gráficos con Tabs ── */}
          {(() => {
            const tabItems = [];
            
            if (activeVars.hasTotalizado || activeVars.hasCaudal) {
              tabItems.push({
                key: "1",
                label: "Hidrometría",
                children: (
                  <Row gutter={[16, 16]} justify="center">
                    {activeVars.hasTotalizado && (
                      <Col xs={24} md={12}>
                        <Flex vertical gap={8}>
                          <Flex gap={8} wrap="nowrap" justify="center" style={{ minWidth: "max-content" }}>
                            <StatPill label="Máx. Consumo" value={formatKPI(kpis.maxConsumo, 0, " m³")} sub={kpis.maxConsumo ? `a las ${kpis.maxConsumo.time} hrs` : null} color={token.colorPrimary} valueColor="#ff4d4f" />
                            <StatPill label="Mín. Consumo" value={formatKPI(kpis.minConsumo, 0, " m³")} sub={kpis.minConsumo ? `a las ${kpis.minConsumo.time} hrs` : null} color={token.colorPrimary} valueColor="#52c41a" />
                            <StatPill label="Prom. Consumo" value={kpis.avgConsumo != null ? `${kpis.avgConsumo.toFixed(0)} m³` : "—"} sub="promedio" color={token.colorPrimary} />
                          </Flex>
                          <Text strong style={{ fontSize: 12, color: token.colorTextSecondary }}>Consumo acumulado (m³)</Text>
                          <MeasurementsAreaChart 
                            data={chartDataAll.filter(d => d.consumo != null)} 
                            metric="consumo" 
                            token={token} 
                            color={token.colorPrimary} 
                            title="Consumo" 
                            minInfo={kpis.minConsumo} 
                            maxInfo={kpis.maxConsumo} 
                          />
                        </Flex>
                      </Col>
                    )}
                    {activeVars.hasCaudal && (
                      <Col xs={24} md={12}>
                        <Flex vertical gap={8}>
                          <Flex gap={8} wrap="nowrap" justify="center" style={{ minWidth: "max-content" }}>
                            <StatPill label="Máx. Caudal" value={formatKPI(kpis.maxCaudal, 1, " L/s")} sub={kpis.maxCaudal ? `a las ${kpis.maxCaudal.time} hrs` : null} color={token.colorPrimary} valueColor="#ff4d4f" />
                            <StatPill label="Mín. Caudal" value={formatKPI(kpis.minCaudal, 1, " L/s")} sub={kpis.minCaudal ? `a las ${kpis.minCaudal.time} hrs` : null} color={token.colorPrimary} valueColor="#52c41a" />
                            <StatPill label="Prom. Caudal" value={kpis.avgCaudal != null ? `${kpis.avgCaudal.toFixed(1)} L/s` : "—"} sub="promedio" color={token.colorPrimary} />
                          </Flex>
                          <Text strong style={{ fontSize: 12, color: token.colorTextSecondary }}>Caudal instantáneo (L/s)</Text>
                          <MeasurementsLineChart 
                            data={chartDataAll.filter(d => d.caudal != null)} 
                            metric="caudal" 
                            token={token} 
                            color={token.colorPrimary} 
                            title="Caudal" 
                            minInfo={kpis.minCaudal} 
                            maxInfo={kpis.maxCaudal} 
                          />
                        </Flex>
                      </Col>
                    )}
                  </Row>
                ),
              });
            }
            
            if (activeVars.hasNivel || activeVars.hasWaterTable) {
              tabItems.push({
                key: "2",
                label: "Niveles",
                children: (
                  <Row gutter={[16, 16]} justify="center">
                    <Col xs={24}>
                      <Flex vertical gap={8}>
                        <Flex gap={8} wrap="nowrap" justify="center" style={{ minWidth: "max-content" }}>
                          {activeVars.hasNivel && (
                            <>
                              <StatPill label="Máx. Nivel" value={formatKPI(kpis.maxNivel, 2, " m")} sub={kpis.maxNivel ? `a las ${kpis.maxNivel.time} hrs` : null} color={token.colorPrimary} valueColor="#ff4d4f" />
                              <StatPill label="Mín. Nivel" value={formatKPI(kpis.minNivel, 2, " m")} sub={kpis.minNivel ? `a las ${kpis.minNivel.time} hrs` : null} color={token.colorPrimary} valueColor="#52c41a" />
                              <StatPill label="Prom. Nivel" value={kpis.avgNivel != null ? `${kpis.avgNivel.toFixed(2)} m` : "—"} sub="promedio" color={token.colorPrimary} />
                            </>
                          )}
                          {activeVars.hasWaterTable && (
                            <>
                              <StatPill label="Máx. Freático" value={formatKPI(kpis.maxWaterTable, 2, " m")} sub={kpis.maxWaterTable ? `a las ${kpis.maxWaterTable.time} hrs` : null} color={token.colorPrimary} valueColor="#ff4d4f" />
                              <StatPill label="Mín. Freático" value={formatKPI(kpis.minWaterTable, 2, " m")} sub={kpis.minWaterTable ? `a las ${kpis.minWaterTable.time} hrs` : null} color={token.colorPrimary} valueColor="#52c41a" />
                              <StatPill label="Prom. Freático" value={kpis.avgWaterTable != null ? `${kpis.avgWaterTable.toFixed(2)} m` : "—"} sub="promedio" color={token.colorPrimary} />
                            </>
                          )}
                        </Flex>
                        <Text strong style={{ fontSize: 12, color: token.colorTextSecondary }}>Niveles combinados</Text>
                        <MeasurementsStackedColumnChart 
                          data={chartDataAll} 
                          token={token} 
                        />
                      </Flex>
                    </Col>
                  </Row>
                ),
              });
            }
            
            return tabItems.length > 0 ? (
              <Tabs
                defaultActiveKey={tabItems[0].key}
                items={tabItems}
                style={{ marginTop: -8 }}
                tabBarStyle={{ marginBottom: 8, display: 'flex', justifyContent: 'flex-end' }}
              />
            ) : null;
          })()}
        </Flex>
      )}

      {viewMode === "table" && (
        <MemoizedMeasurementsTable
          allMeasurements={allMeasurements}
          measurementColumns={measurementColumns}
          token={token}
        />
      )}
    </Flex>
  );
};

const MeasurementsDrawerContentMemo = React.memo(MeasurementsDrawerContent);

const ControlCenter = () => {
  const { dispatch } = useData();
  const { user } = useAuth();
  const { data, loading, error, refresh, isReady, chatQuota } = useControlCenter({
    autoRefresh: true,
    refreshInterval: 60000,
  });
  const { token } = useToken();

  // Ref para estabilizar callbacks sin depender de data?.points
  const pointsRef = useRef(data?.points || []);
  pointsRef.current = data?.points || [];
  const [selectedDate, setSelectedDate] = useState(null);
  const [warningsDrawerOpen, setWarningsDrawerOpen] = useState(false);
  const [selectedWarningPoint, setSelectedWarningPoint] = useState(null);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherCopied, setVoucherCopied] = useState(false);

  // ── Verificación DGA ──
  const [dgaVerifying, setDgaVerifying] = useState(false);
  const [dgaResult, setDgaResult] = useState(null);
  const [dgaConsole, setDgaConsole] = useState([]);

  // ── Drawer de Mediciones ──
  const [measurementsDrawerOpen, setMeasurementsDrawerOpen] = useState(false);
  const [selectedMeasurementPoint, setSelectedMeasurementPoint] = useState(null);
  const [measurementsData, setMeasurementsData] = useState(null);
  const [measurementsLoading, setMeasurementsLoading] = useState(false);
  const [measurementsViewMode, setMeasurementsViewMode] = useState("chart");
  // ── Consumo total del día (para mostrar en header del drawer) ──
  const totalDayConsumo = useMemo(() => {
    const records = Array.isArray(measurementsData?.results) ? measurementsData.results 
      : Array.isArray(measurementsData?.records) ? measurementsData.records
      : Array.isArray(measurementsData?.measurements) ? measurementsData.measurements
      : Array.isArray(measurementsData?.data) ? measurementsData.data
      : [];
    return records.reduce((sum, m) => sum + (extractRecordNum(m.total_diff) || 0), 0);
  }, [measurementsData]);

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

  // ── Drawer Solicitar Soporte ──
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportPoint, setSupportPoint] = useState(null);
  const [supportContextType, setSupportContextType] = useState("SOPORTE");
  const [supportForm] = Form.useForm();

  // ── Drawer Configuración del Punto ──
  const [pointConfigOpen, setPointConfigOpen] = useState(false);
  const [pointConfigLoading, setPointConfigLoading] = useState(false);
  const [pointConfigData, setPointConfigData] = useState(null);
  const [pointConfigName, setPointConfigName] = useState("");

  // ── Watch fechas para alerta DGA (hooks siempre antes de returns condicionales) ──
  const compStart = Form.useWatch("start_date", stopComplianceForm);
  const compEnd = Form.useWatch("end_date", stopComplianceForm);
  const compDiffDays = compStart && compEnd ? compEnd.diff(compStart, "days") : 0;

  const handleViewVoucher = useCallback((record) => {
    setSelectedVoucher(record);
    setDgaResult(null);
    setDgaConsole([]);
    setVoucherModalOpen(true);
  }, []);

  const handleVerifyDGA = useCallback(async () => {
    if (!selectedVoucher?.code || !selectedVoucher?.voucher) return;
    setDgaVerifying(true);
    setDgaConsole([]);
    
    // Debug: ver token
    const rawToken = localStorage.getItem("token");
    const token = JSON.parse(rawToken || "null");
    setDgaConsole(prev => [...prev, `> Token existe: ${!!token}`]);
    setDgaConsole(prev => [...prev, `> Token (primeros 20 chars): ${token ? token.substring(0, 20) + '...' : 'NO HAY'}`]);
    setDgaConsole(prev => [...prev, `> Código obra: ${selectedVoucher.code}`]);
    setDgaConsole(prev => [...prev, `> Comprobante: ${selectedVoucher.voucher}`]);
    setDgaConsole(prev => [...prev, `> Tipo DGA: ${selectedVoucher.type_dga || 'SUPERFICIAL'}`]);
    setDgaConsole(prev => [...prev, `> Consultando DGA...`]);
    setDgaConsole(prev => [...prev, `> Código obra: ${selectedVoucher.code}`]);
    setDgaConsole(prev => [...prev, `> Comprobante: ${selectedVoucher.voucher}`]);
    try {
      const data = await sh.verifyDgaVoucher(
        selectedVoucher.code,
        selectedVoucher.voucher,
        selectedVoucher.type_dga || 'SUPERFICIAL'
      );
      setDgaResult(data);
      setDgaConsole(prev => [...prev, `> Status: ${data.status || 'unknown'}`]);
      setDgaConsole(prev => [...prev, `> Respuesta:`]);
      setDgaConsole(prev => [...prev, JSON.stringify(data, null, 2)]);
    } catch (err) {
      console.error("[DGA Verify] Error:", err);
      if (err.response) {
        setDgaConsole(prev => [...prev, `> Status: ${err.response.status}`]);
        setDgaConsole(prev => [...prev, `> Respuesta error:`]);
        setDgaConsole(prev => [...prev, JSON.stringify(err.response.data, null, 2)]);
      } else {
        setDgaConsole(prev => [...prev, `> ERROR: ${err.message}`]);
      }
    } finally {
      setDgaVerifying(false);
    }
  }, [selectedVoucher]);

  const handleViewMeasurements = useCallback(async (pointName, date, variables = []) => {
    const point = pointsRef.current?.find((p) => p.title === pointName);
    if (!point) return;
    setSelectedMeasurementPoint({ pointName, date, pointId: point.id, variables });
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
  }, []); // Sin dependencias gracias a pointsRef

  const handleViewPointConfig = useCallback(async (pointName) => {
    const point = pointsRef.current?.find((p) => p.title === pointName);
    if (!point) return;
    setPointConfigName(pointName);
    setPointConfigOpen(true);
    setPointConfigLoading(true);
    setPointConfigData(null);
    try {
      const res = await sh.pointConfig(point.id);
      setPointConfigData(res);
    } catch (err) {
      console.error("[PointConfig] Error:", err);
    } finally {
      setPointConfigLoading(false);
    }
  }, []);

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
    const point = pointsRef.current?.find((p) => p.title === pointName);
    if (!point) return;
    setStopTelemetryPoint({ id: point.id, name: pointName, client: point.client_name || point.client || "—" });
    stopTelemetryForm.resetFields();
    setStopTelemetryOpen(true);
  }, [stopTelemetryForm]);

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

  /* ── Solicitar Soporte ── */
  const handleOpenSupport = useCallback((pointNameOrRecord, contextType = "SOPORTE") => {
    let point;
    if (typeof pointNameOrRecord === "string") {
      point = pointsRef.current?.find((p) => p.title === pointNameOrRecord);
      // Si no se encuentra (punto desactivado), crear objeto mínimo
      if (!point) {
        point = { id: null, title: pointNameOrRecord, name: pointNameOrRecord, code: null, client_name: null, client: null };
      }
    } else {
      point = pointNameOrRecord;
    }
    if (!point) return;
    setSupportPoint({ id: point.id, name: point.title || point.name || "—", code: point.code || null, client: point.client_name || point.client || "—" });
    setSupportContextType(contextType);
    supportForm.resetFields();
    setSupportOpen(true);
  }, [supportForm]);

  const overview = data?.overview || {};
  const points = data?.points || [];
  const warningsList = data?.recent_warnings_list || [];
  const warningsRaw = data?.recent_warnings || {};

  if (loading && !isReady) {
    return (
      <div style={{ padding: "0 16px" }}>
        <SkeletonControlCenter />
      </div>
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
      <Row id="cc-kpi-cards" gutter={[12, 12]} style={{ marginBottom: 8 }}>
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
            onClick={warningsList.length > 0 ? () => {
              const firstPoint = Object.keys(warningsRaw)[0];
              if (firstPoint) {
                setSelectedWarningPoint(firstPoint);
                setWarningsDrawerOpen(true);
              }
            } : undefined}
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
      <div style={{ marginTop: 10 }}>
        <CCDataTabs
          points={points}
          onViewVoucher={handleViewVoucher}
          onOpenStopCompliance={handleOpenStopCompliance}
          onOpenSupport={handleOpenSupport}
          onWarningPointClick={(pointName) => {
            setSelectedWarningPoint(pointName);
            setWarningsDrawerOpen(true);
          }}
          warningsRaw={warningsRaw}
          onSelectPoint={handleSelectPoint}
          onViewMeasurements={handleViewMeasurements}
          onOpenStopTelemetry={handleOpenStopTelemetry}
          onViewPointConfig={handleViewPointConfig}
          last7={data?.last_7}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          loading={loading}
        />
      </div>

      {/* ════════════════════════════════════════
          Drawer de Warnings
      ════════════════════════════════════════ */}
      <Drawer
        title={
          <Flex align="center" gap={8}>
            <FaExclamationTriangle style={{ color: token.colorWarning, fontSize: 16 }} />
            <Text strong style={{ fontSize: 16 }}>Warnings</Text>
            <Tag color="warning" style={{ margin: 0 }}>
              {warningsList.length} total
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
        styles={{ body: { padding: 16 } }}
      >
        <Flex wrap="wrap" gap={8} style={{ marginBottom: 16 }}>
          {Object.entries(warningsRaw).map(([pointName, warnings]) => {
            const arr = Array.isArray(warnings) ? warnings : [];
            if (arr.length === 0) return null;
            const isActive = selectedWarningPoint === pointName;
            return (
              <Tag
                key={pointName}
                color={isActive ? "warning" : "default"}
                style={{ cursor: "pointer", fontSize: 12, padding: "4px 10px", margin: 0 }}
                onClick={() => setSelectedWarningPoint(pointName)}
              >
                {pointName} ({arr.length})
              </Tag>
            );
          })}
        </Flex>
        {selectedWarningPoint && (
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
        )}
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
            <Segmented
              value={measurementsViewMode}
              onChange={setMeasurementsViewMode}
              options={[
                { label: <Flex align="center" gap={4}><FaChartLine size={12} />Gráfico</Flex>, value: "chart" },
                { label: <Flex align="center" gap={4}><FaTable size={12} />Datos</Flex>, value: "table" },
              ]}
              size="small"
            />
            {totalDayConsumo > 0 && (
              <Tag style={{ fontSize: 12, margin: 0, padding: "4px 12px", background: `${token.colorPrimary}08`, border: `1px solid ${token.colorPrimary}20`, color: token.colorPrimary, fontWeight: 600, borderRadius: 20 }}>
                {totalDayConsumo.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} m³ totales
              </Tag>
            )}
          </Flex>
        }
        open={measurementsDrawerOpen}
        onClose={() => {
          setMeasurementsDrawerOpen(false);
          setSelectedMeasurementPoint(null);
          setMeasurementsData(null);
          setMeasurementsViewMode("chart");
        }}
        width={1360}
        bodyStyle={{ padding: 24, overflow: "auto" }}
        styles={{
          header: {
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            paddingBottom: 12,
            marginBottom: 0,
          },
        }}
        style={{ zIndex: 900 }}
      >
        {measurementsLoading ? (
          <Flex vertical gap={20} style={{ padding: "20px 0" }}>
            <Flex gap={10} wrap="wrap">
              {[1,2,3,4,5].map(i => <div key={i} style={{ flex: 1, minWidth: 100, height: 60, borderRadius: 8, background: "#f5f5f5" }} />)}
            </Flex>
            <Row gutter={[16, 16]}>
              {[1,2,3,4].map(i => (
                <Col xs={24} md={12} key={i}>
                  <div style={{ height: 280, borderRadius: 12, background: "#f5f5f5" }} />
                </Col>
              ))}
            </Row>
          </Flex>
        ) : (
          <MeasurementsDrawerContentMemo
            data={measurementsData}
            token={token}
            viewMode={measurementsViewMode}
            variables={selectedMeasurementPoint?.variables || []}
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
            <Text strong style={{ fontSize: 16 }}>Voucher DGA</Text>
          </Flex>
        }
        open={voucherModalOpen}
        onCancel={() => {
          setVoucherModalOpen(false);
          setSelectedVoucher(null);
          setDgaResult(null);
          setDgaConsole([]);
        }}
        footer={null}
        width={980}
        style={{ top: 0, maxWidth: "95vw" }}
      >
        <Flex vertical gap={12} style={{ marginTop: 0 }}>
          {/* ── Info del punto ── */}
          <Flex vertical gap={4}>
            <Text strong style={{ fontSize: 14 }}>
              {selectedVoucher?.title}
            </Text>
            <Flex align="center" gap={6}>
              <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>Código DGA:</Text>
              <Text strong style={{ fontSize: 12, color: token.colorPrimary, fontFamily: "monospace" }}>
                {selectedVoucher?.code || "—"}
              </Text>
              <Tag style={{ fontSize: 10, margin: 0, padding: "0 4px", lineHeight: "16px" }}>
                {selectedVoucher?.type_dga || "SUPERFICIAL"}
              </Tag>
            </Flex>
          </Flex>

          {/* ── Voucher + Validar en dos columnas ── */}
          {selectedVoucher?.code && selectedVoucher?.voucher && (
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} md={16}>
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
              </Col>
              <Col xs={24} md={8}>
                <Button
                  type="primary"
                  loading={dgaVerifying}
                  onClick={handleVerifyDGA}
                  icon={<FaExternalLinkAlt style={{ fontSize: 12 }} />}
                  style={{ width: "100%" }}
                >
                  {dgaVerifying ? "Validando..." : "Validar en DGA"}
                </Button>
              </Col>
            </Row>
          )}

          {/* ── Resultados DGA ── */}
          {dgaConsole.length > 0 && (
            <>
              {/* Layout dos columnas: Consola + Resultado */}
              <Row gutter={[16, 16]}>
                  {/* ── Consola (izquierda) ── */}
                  <Col xs={24} md={dgaResult && dgaResult.status === "00" ? 10 : 24}>
                    <div
                      style={{
                        background: "#1e1e1e",
                        borderRadius: 8,
                        padding: "12px 16px",
                        fontFamily: "monospace",
                        fontSize: 11,
                        color: "#d4d4d4",
                        height: dgaResult && dgaResult.status === "00" ? 480 : 300,
                        overflowY: "auto",
                        lineHeight: 1.6,
                      }}
                    >
                      {dgaConsole.map((line, i) => (
                        <div key={i} style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                          {line.startsWith("> ERROR") ? (
                            <span style={{ color: "#f87171" }}>{line}</span>
                          ) : line.startsWith("> Status: 2") ? (
                            <span style={{ color: "#4ade80" }}>{line}</span>
                          ) : line.startsWith("> Status:") ? (
                            <span style={{ color: "#fbbf24" }}>{line}</span>
                          ) : (
                            line
                          )}
                        </div>
                      ))}
                      {dgaVerifying && (
                        <div style={{ color: "#60a5fa" }}>
                          {"▋"}
                        </div>
                      )}
                    </div>
                  </Col>

                  {/* ── Resultado bonito (derecha) ── */}
                  {dgaResult && dgaResult.status === "00" && dgaResult.data && (
                    <Col xs={24} md={14}>
                      <Flex vertical gap={12} style={{ maxHeight: 480, overflowY: "auto" }}>
                  <Alert
                    message="Comprobante encontrado"
                    description={dgaResult.message}
                    type="success"
                    showIcon
                  />
                  
                  {/* Datos de la medición */}
                  <Card size="small" title="Datos enviados a DGA" bordered={false} style={{ background: token.colorBgLayout }}>
                    <Row gutter={[8, 8]}>
                      <Col span={12}>
                        <Text type="secondary" style={{ fontSize: 11 }}>Caudal</Text>
                        <div><Text strong style={{ fontSize: 16, color: token.colorPrimary }}>{dgaResult.data.caudal} L/s</Text></div>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary" style={{ fontSize: 11 }}>Totalizador</Text>
                        <div><Text strong style={{ fontSize: 16, color: token.colorPrimary }}>{dgaResult.data.totalizador} m³</Text></div>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary" style={{ fontSize: 11 }}>Fecha</Text>
                        <div><Text strong style={{ fontSize: 14 }}>{dgaResult.data.fechaMedicion}</Text></div>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary" style={{ fontSize: 11 }}>Hora</Text>
                        <div><Text strong style={{ fontSize: 14 }}>{dgaResult.data.horaMedicion}</Text></div>
                      </Col>
                    </Row>
                  </Card>

                  {/* Meta información */}
                  {dgaResult.meta && (
                    <Card size="small" title="Información del punto" bordered={false} style={{ background: token.colorBgLayout }}>
                      <Flex vertical gap={4}>
                        <Flex justify="space-between">
                          <Text type="secondary" style={{ fontSize: 11 }}>Punto:</Text>
                          <Text style={{ fontSize: 12 }}>{dgaResult.meta.punto}</Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text type="secondary" style={{ fontSize: 11 }}>Código obra:</Text>
                          <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>{dgaResult.meta.codigo_obra}</Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text type="secondary" style={{ fontSize: 11 }}>Tipo:</Text>
                          <Tag size="small">{dgaResult.meta.tipo_dga}</Tag>
                        </Flex>
                        <Flex justify="space-between">
                          <Text type="secondary" style={{ fontSize: 11 }}>Enviado DGA:</Text>
                          <Tag color={dgaResult.meta.enviado_dga ? "success" : "error"} style={{ fontSize: 10, margin: 0 }}>
                            {dgaResult.meta.enviado_dga ? "Sí" : "No"}
                          </Tag>
                        </Flex>
                        {dgaResult.meta.return_dga && (
                          <div style={{ marginTop: 4, padding: "6px 8px", background: token.colorSuccessBg, borderRadius: 6 }}>
                            <Text style={{ fontSize: 11, color: token.colorSuccess }}>{dgaResult.meta.return_dga}</Text>
                          </div>
                        )}
                      </Flex>
                    </Card>
                  )}

                  {/* Botón copiar respuesta */}
                  <Button
                    size="small"
                    icon={<FaCopy style={{ fontSize: 12 }} />}
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(dgaResult, null, 2));
                      message.success("Respuesta copiada al portapapeles");
                    }}
                  >
                    Copiar respuesta JSON
                  </Button>
                </Flex>
              </Col>
            )}
            </Row>
            </>
          )}

          {/* Alerta cuando no se encuentra */}
          {dgaResult && dgaResult.status === "01" && (
            <Alert
              message="Comprobante no encontrado"
              description={dgaResult.message || "No se encontró el comprobante en los registros enviados a la DGA."}
              type="warning"
              showIcon
              style={{ marginTop: 8 }}
            />
          )}
        </Flex>
      </Modal>

      {/* ════════════════════════════════════════
          Drawer Configuración del Punto
      ════════════════════════════════════════ */}
      <PointConfigDrawer
        open={pointConfigOpen}
        onClose={() => {
          setPointConfigOpen(false);
          setPointConfigData(null);
        }}
        pointName={pointConfigName}
        configData={pointConfigData}
        loading={pointConfigLoading}
      />

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

      {/* ════════════════════════════════════════
          Drawer Solicitar Soporte
      ════════════════════════════════════════ */}
      <CCSupportDrawer
        open={supportOpen}
        onClose={() => {
          setSupportOpen(false);
          setSupportPoint(null);
          setSupportContextType("SOPORTE");
        }}
        point={supportPoint}
        form={supportForm}
        loading={supportLoading}
        setLoading={setSupportLoading}
        contextType={supportContextType}
      />

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
