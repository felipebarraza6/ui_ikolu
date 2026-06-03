import React, { useCallback, useState, useMemo, useRef } from "react";
import moment from "moment";
import html2canvas from "html2canvas";
import { Row, Col, Flex, Typography, Table, Tag, Button, message } from "antd";
import { FaDownload, FaSun, FaMoon, FaImage } from "react-icons/fa";
import { extractRecordNum, extractMeasurements, classifyByTimeOfDay, getPeriod, formatKPI } from "./MeasurementUtils";
import { TrendArrow, StatPill, MetricCard } from "./MeasurementKPIs";
import { MeasurementsAreaChart, MeasurementsLineChart, MeasurementsDualColumnChart, MeasurementsCombinedLevelChart } from "./MeasurementCharts";

const { Text } = Typography;

const MemoizedMeasurementsTable = React.memo(({ allMeasurements, measurementColumns, token, kpis, selectedMeasurementPoint }) => {
  const handleExportCSV = () => {
    const fieldMap = {
      period: 'period',
      logger_time: 'date_time',
      time: 'date_time',
      flow: 'flow',
      nivel: 'nivel',
      water_table: 'water_table',
      total: 'total',
      consumo: 'total_diff',
      estado: 'is_error',
    };

    const csvHeaders = measurementColumns.map(c => {
      if (c.key === 'period') return 'Período';
      if (c.key === 'logger_time') return 'Fecha';
      if (c.key === 'time') return 'Hora';
      return c.title;
    }).join(";");
    
    const rows = allMeasurements.map(m =>
      measurementColumns.map(c => {
        const field = fieldMap[c.key] || c.key;
        let val = m[field];
        if (c.key === 'period') {
          const hour = moment(m.date_time || m.date_time_medition || m.timestamp || m.time || m.created_at).hour();
          const p = getPeriod(hour);
          val = p.label;
        }
        if (c.key === 'logger_time') {
          val = moment(m.date_time || m.date_time_medition || m.timestamp || m.time || m.created_at).format('DD/MM/YYYY HH:mm:ss');
        }
        if (c.key === 'time') {
          val = moment(m.date_time || m.date_time_medition || m.timestamp || m.time || m.created_at).format('HH:mm');
        }
        if (c.key === 'estado') {
          val = val ? 'Error' : 'Confirmado';
        }
        if (typeof val === 'number') {
          val = val.toFixed(c.key === 'flow' ? 1 : c.key === 'nivel' || c.key === 'water_table' ? 2 : 0);
        }
        return val != null ? `"${String(val).replace(/"/g, '""')}"` : "";
      }).join(";")
    );
    const csv = [csvHeaders, ...rows].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const pointName = selectedMeasurementPoint?.pointName || 'mediciones';
    const date = selectedMeasurementPoint?.date || '';
    link.download = `${pointName}_${date}.csv`;
    link.click();
    message.success("Tabla exportada");
  };

  const dataSource = useMemo(() =>
    allMeasurements.map((m, i) => ({ ...m, key: i, _prev: allMeasurements[i - 1] || null })),
    [allMeasurements]
  );

  const components = useMemo(() => ({
    header: {
      cell: (props) => (
        <th {...props} style={{ ...props.style, fontSize: 10, padding: "10px 8px", fontWeight: 600, color: 'rgba(255, 255, 255, 0.5)', textTransform: "uppercase", letterSpacing: 0.5, background: 'rgba(0, 180, 216, 0.05)' }} />
      ),
    },
  }), [token.colorTextSecondary, token.colorBgLayout]);

  return (
    <Flex vertical gap={12}>
      <Flex align="center" justify="flex-end" gap={8}>
        <Text style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>
          {allMeasurements.length} registros
        </Text>
        <Button size="small" icon={<FaDownload size={11} />} onClick={handleExportCSV}>
          Exportar CSV
        </Button>
      </Flex>

      <Table
        dataSource={dataSource}
        columns={measurementColumns}
        size="small"
        pagination={{ pageSize: 15, showSizeChanger: false, showQuickJumper: true }}
        bordered={false}
        showHeader={true}
        locale={{ emptyText: <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Sin mediciones para este día</span> }}
        scroll={{ x: "max-content", y: 500 }}
        style={{ borderRadius: 12, overflow: "hidden" }}
        components={components}
      />
    </Flex>
  );
});

const handleExportLevelsPNG = async (chartRef, pointName, date) => {
  if (!chartRef.current) return;
  
  try {
    const canvas = await html2canvas(chartRef.current, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
      onclone: (clonedDoc) => {
        const customIcons = clonedDoc.querySelectorAll('.apexcharts-toolbar-custom-icon');
        customIcons.forEach(icon => icon.style.display = 'none');
      }
    });
    
    const link = document.createElement('a');
    link.download = pointName && date 
      ? `${pointName}_niveles_${date}.png` 
      : 'niveles.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    message.success("Imagen descargada");
  } catch (err) {
    console.error('Error exporting PNG:', err);
    message.error("Error al descargar imagen");
  }
};

const handleExportLevelsCSV = (chartData, wellConfig, pointName, date) => {
  const wellDepth = wellConfig?.d1;
  const sensorPos = wellConfig?.d3;
  
  const headers = ["Fecha", "Hora", "Nivel freático (m)"];
  if (sensorPos != null) headers.push("Nivel (m)");
  if (sensorPos != null) headers.push("Posicionamiento Sensor (m)");
  if (wellDepth != null) headers.push("Profundidad Total (m)");
  
  const rows = chartData
    .filter(d => d.water_table != null)
    .map(d => {
      const dt = moment(d.datetime, "DD/MM HH:mm");
      const fecha = dt.format("DD/MM/YYYY");
      const hora = dt.format("HH:mm");
      const wt = Number(d.water_table);
      const nivel = sensorPos != null ? (sensorPos - wt).toFixed(2) : null;
      
      const row = [fecha, hora, wt.toFixed(2)];
      if (sensorPos != null) row.push(nivel);
      if (sensorPos != null) row.push(sensorPos);
      if (wellDepth != null) row.push(wellDepth);
      return row.join(";");
    });
  
  const csv = [headers.join(";"), ...rows].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  const fileName = pointName && date ? `${pointName}_niveles_${date}.csv` : 'niveles.csv';
  link.download = fileName;
  link.click();
  message.success("Datos de niveles exportados");
};

export const MeasurementsDrawerContent = ({ data, token, viewMode, variables, activeTab, onTabChange, totalDayConsumo, selectedMeasurementPoint, wellConfig }) => {
  const measurements = extractMeasurements(data);
  const levelsChartRef = useRef(null);

  const activeVars = useMemo(() => {
    const vars = variables || [];
    const hasNivelVar = vars.some(v => v === "NIVEL");
    const hasWaterTableVar = vars.some(v => v === "NIVEL_FREATICO");
    const hasWaterTableData = measurements.some(m => extractRecordNum(m.water_table) != null);
    return {
      hasCaudal: vars.some(v => v.includes("CAUDAL")),
      hasNivel: hasNivelVar,
      hasWaterTable: hasWaterTableVar || (hasNivelVar && hasWaterTableData),
      hasTotalizado: vars.some(v => v === "TOTALIZADO"),
    };
  }, [variables, measurements]);

  const sortedMeasurements = useMemo(() => [...measurements], [measurements]);
  const groups = useMemo(() => classifyByTimeOfDay(measurements), [measurements]);

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
        const dt = moment(m.date_time || m.date_time_medition || m.timestamp || m.time || m.created_at);
        return {
          time: dt.format("HH:mm"),
          datetime: dt.format("DD/MM HH:mm"),
          consumo: extractRecordNum(m.total_diff),
          caudal: extractRecordNum(m.flow) ?? extractRecordNum(m.caudal),
          nivel: extractRecordNum(m.nivel) ?? extractRecordNum(m.level),
          water_table: extractRecordNum(m.water_table),
        };
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [sortedMeasurements]);

  const getPeriodIcon = (hour) => {
    if (hour >= 0 && hour <= 5) return FaMoon;
    if (hour >= 6 && hour <= 12) return FaSun;
    if (hour >= 13 && hour <= 18) return FaSun;
    return FaMoon;
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
        const Icon = getPeriodIcon(hour);
        return (
          <Flex align="center" justify="center" gap={4}>
            <Icon style={{ fontSize: 9, color: '#00B4D8', opacity: 0.5 }} />
            <Text style={{ fontSize: 10, color: '#00B4D8' }}>{p.label}</Text>
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
        return <Text strong style={{ fontSize: 10, color: '#00B4D8' }}>{t}</Text>;
      },
    },
    {
      title: "Hora",
      key: "time",
      width: 50,
      align: "center",
      render: (_, m) => {
        const t = moment(m.date_time || m.date_time_medition || m.timestamp || m.time || m.created_at).format("HH:mm");
        return <Text style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.9)' }}>{t}</Text>;
      },
    },
  ];

  const caudalColumn = {
    title: "Caudal (L/s)",
    key: "flow",
    width: 90,
    align: "right",
    sorter: (a, b) => (extractRecordNum(a.flow) ?? extractRecordNum(a.caudal) ?? 0) - (extractRecordNum(b.flow) ?? extractRecordNum(b.caudal) ?? 0),
    render: (_, m) => {
      const flowVal = extractRecordNum(m.flow) ?? extractRecordNum(m.caudal);
      const isMax = kpis.maxCaudal && flowVal === kpis.maxCaudal.value;
      const isMin = kpis.minCaudal && flowVal === kpis.minCaudal.value;
      return flowVal != null ? (
        <Text style={{ fontSize: 11, color: isMax ? "#E76F51" : isMin ? "#2A9D8F" : 'rgba(255, 255, 255, 0.9)', fontWeight: isMax || isMin ? 600 : 400 }}>
          {flowVal.toFixed(1)}
          <TrendArrow current={m.flow} previous={m._prev?.flow} />
        </Text>
      )       : <Text style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>—</Text>;
    },
  };

  const nivelColumn = {
    title: "Nivel (m)",
    key: "nivel",
    width: 80,
    align: "right",
    sorter: (a, b) => (extractRecordNum(a.nivel) ?? extractRecordNum(a.level) ?? 0) - (extractRecordNum(b.nivel) ?? extractRecordNum(b.level) ?? 0),
    render: (_, m) => {
      const levelVal = extractRecordNum(m.nivel) ?? extractRecordNum(m.level);
      const isMax = kpis.maxNivel && levelVal === kpis.maxNivel.value;
      const isMin = kpis.minNivel && levelVal === kpis.minNivel.value;
      return levelVal != null ? (
        <Text style={{ fontSize: 11, color: isMax ? "#E76F51" : isMin ? "#2A9D8F" : 'rgba(255, 255, 255, 0.9)', fontWeight: isMax || isMin ? 600 : 400 }}>
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
    sorter: (a, b) => (extractRecordNum(a.water_table) ?? 0) - (extractRecordNum(b.water_table) ?? 0),
    render: (_, m) => {
      const wtVal = extractRecordNum(m.water_table);
      const isMax = kpis.maxWaterTable && wtVal === kpis.maxWaterTable.value;
      const isMin = kpis.minWaterTable && wtVal === kpis.minWaterTable.value;
      return wtVal != null ? (
        <Text style={{ fontSize: 11, color: isMax ? "#E76F51" : isMin ? "#2A9D8F" : 'rgba(255, 255, 255, 0.9)', fontWeight: isMax || isMin ? 600 : 400 }}>
          {wtVal.toFixed(2)}
          <TrendArrow current={m.water_table} previous={m._prev?.water_table} />
        </Text>
      ) : <Text style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>—</Text>;
    },
  };

  const totalColumn = {
    title: "Total (m³)",
    key: "total",
    width: 100,
    align: "right",
    sorter: (a, b) => (extractRecordNum(a.total) ?? 0) - (extractRecordNum(b.total) ?? 0),
    render: (_, m) => {
      const totalVal = extractRecordNum(m.total);
      return totalVal != null ? (
        <Text style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.9)' }}>
          {totalVal.toLocaleString("es-CL", { maximumFractionDigits: 0 })}
          <TrendArrow current={m.total} previous={m._prev?.total} />
        </Text>
      ) : <Text style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>—</Text>;
    },
  };

  const consumoColumn = {
    title: "Consumo (m³)",
    key: "consumo",
    width: 100,
    align: "right",
    sorter: (a, b) => (extractRecordNum(a.total_diff) ?? 0) - (extractRecordNum(b.total_diff) ?? 0),
    render: (_, m) => {
      const diffVal = extractRecordNum(m.total_diff);
      const isMax = kpis.maxConsumo && diffVal === kpis.maxConsumo.value;
      const isMin = kpis.minConsumo && diffVal === kpis.minConsumo.value;
      return diffVal != null ? (
        <Text strong style={{ fontSize: 11, color: isMax ? "#E76F51" : isMin ? "#2A9D8F" : '#00B4D8', fontWeight: isMax || isMin ? 700 : 600 }}>
          {diffVal.toLocaleString("es-CL", { maximumFractionDigits: 0 })}
          <TrendArrow current={m.total_diff} previous={m._prev?.total_diff} />
        </Text>
      ) : <Text style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>—</Text>;
    },
  };

  const estadoColumn = {
    title: "Estado",
    key: "estado",
    width: 85,
    align: "center",
    filters: [
      { text: "Confirmado", value: "ok" },
      { text: "Error", value: "error" },
    ],
    onFilter: (value, record) => value === "error" ? record.is_error : !record.is_error,
    render: (_, m) => {
      if (m.is_error) {
        return <Tag style={{ fontSize: 9, margin: 0, padding: "0 6px", lineHeight: "18px", background: 'rgba(231, 111, 81, 0.15)', border: '1px solid rgba(231, 111, 81, 0.3)', color: '#E76F51' }}>Error</Tag>;
      }
      return <Tag style={{ fontSize: 9, margin: 0, padding: "0 6px", lineHeight: "18px", background: 'rgba(42, 157, 143, 0.15)', border: '1px solid rgba(42, 157, 143, 0.3)', color: '#2A9D8F' }}>Confirmado</Tag>;
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

  if (measurements.length === 0) {
    return (
      <Flex justify="center" align="center" style={{ height: 200 }} vertical gap={12}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(0, 180, 216, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaDownload style={{ fontSize: 20, color: 'rgba(0, 180, 216, 0.4)' }} />
        </div>
        <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.5)' }}>Sin mediciones para este día</Text>
      </Flex>
    );
  }

  return (
    <Flex vertical gap={20}>
      {viewMode === "chart" && (
        <Flex vertical gap={12}>
          {activeTab === "1" && (activeVars.hasTotalizado || activeVars.hasCaudal) && (
            <Row gutter={[8, 8]}>
              {activeVars.hasTotalizado && (
                <Col xs={24} md={12}>
                  <MetricCard
                    title="Consumo"
                    icon={<div style={{ width: 8, height: 8, borderRadius: 4, background: "#00B4D8" }} />}
                    kpis={
                      <>
                        {totalDayConsumo > 0 && (
                          <StatPill label="Total día" value={`${totalDayConsumo.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} m³`} sub="acumulado" color="#00B4D8" />
                        )}
                        <StatPill label="Máx" value={formatKPI(kpis.maxConsumo, 0, " m³")} sub={kpis.maxConsumo ? `${kpis.maxConsumo.time} hrs` : null} color="#00B4D8" valueColor="#E76F51" />
                        <StatPill label="Mín" value={formatKPI(kpis.minConsumo, 0, " m³")} sub={kpis.minConsumo ? `${kpis.minConsumo.time} hrs` : null} color="#00B4D8" valueColor="#2A9D8F" />
                        <StatPill label="Prom" value={kpis.avgConsumo != null ? `${kpis.avgConsumo.toFixed(0)} m³` : "—"} sub="promedio" color="rgba(255, 255, 255, 0.5)" />
                      </>
                    }
                  >
                    <MeasurementsAreaChart 
                      data={chartDataAll.filter(d => d.consumo != null)} 
                      metric="consumo" 
                      token={token} 
                      title="Consumo" 
                      minInfo={kpis.minConsumo} 
                      maxInfo={kpis.maxConsumo}
                      avgInfo={kpis.avgConsumo}
                      pointName={selectedMeasurementPoint?.pointName}
                      date={selectedMeasurementPoint?.date}
                    />
                  </MetricCard>
                </Col>
              )}
              {activeVars.hasCaudal && (
                <Col xs={24} md={12}>
                  <MetricCard
                    title="Caudal"
                    icon={<div style={{ width: 8, height: 8, borderRadius: 4, background: "#00B4D8" }} />}
                    kpis={
                      <>
                        <StatPill label="Máx" value={formatKPI(kpis.maxCaudal, 1, " L/s")} sub={kpis.maxCaudal ? `${kpis.maxCaudal.time} hrs` : null} color="#00B4D8" valueColor="#E76F51" />
                        <StatPill label="Mín" value={formatKPI(kpis.minCaudal, 1, " L/s")} sub={kpis.minCaudal ? `${kpis.minCaudal.time} hrs` : null} color="#00B4D8" valueColor="#2A9D8F" />
                        <StatPill label="Prom" value={kpis.avgCaudal != null ? `${kpis.avgCaudal.toFixed(1)} L/s` : "—"} sub="promedio" color="rgba(255, 255, 255, 0.5)" />
                      </>
                    }
                  >
                    <MeasurementsLineChart 
                      data={chartDataAll.filter(d => d.caudal != null)} 
                      metric="caudal" 
                      token={token} 
                      title="Caudal" 
                      minInfo={kpis.minCaudal} 
                      maxInfo={kpis.maxCaudal}
                      avgInfo={kpis.avgCaudal}
                      pointName={selectedMeasurementPoint?.pointName}
                      date={selectedMeasurementPoint?.date}
                    />
                  </MetricCard>
                </Col>
              )}
            </Row>
          )}

          {activeTab === "2" && (activeVars.hasNivel || activeVars.hasWaterTable) && (
            <Row gutter={[8, 8]}>
              <Col xs={24}>
                <MetricCard
                  title="Niveles"
                  icon={
                    <Flex gap={4}>
                      <div style={{ width: 8, height: 8, borderRadius: 4, background: '#0077B6' }} />
                      <div style={{ width: 8, height: 8, borderRadius: 4, background: 'rgba(255, 255, 255, 0.5)' }} />
                    </Flex>
                  }
                  kpis={
                    <>
                      <StatPill label="Profundidad total" value={wellConfig?.d1 != null ? `${wellConfig.d1} m` : "—"} sub="POZO" color="#0077B6" />
                      <StatPill label="Posicionamiento Sensor" value={wellConfig?.d3 != null ? `${wellConfig.d3} m` : "—"} sub="SENSOR" color="#0077B6" />
                      {activeVars.hasNivel && (
                        <>
                          <StatPill label="Nivel máx" value={formatKPI(kpis.maxNivel, 2, " m")} sub={kpis.maxNivel ? `${kpis.maxNivel.time} hrs` : null} color="#0077B6" valueColor="#E76F51" />
                          <StatPill label="Nivel mín" value={formatKPI(kpis.minNivel, 2, " m")} sub={kpis.minNivel ? `${kpis.minNivel.time} hrs` : null} color="#0077B6" valueColor="#2A9D8F" />
                          <StatPill label="Nivel prom" value={kpis.avgNivel != null ? `${kpis.avgNivel.toFixed(2)} m` : "—"} sub="PROMEDIO" color="rgba(255, 255, 255, 0.5)" />
                        </>
                      )}
                      {activeVars.hasWaterTable && (
                        <>
                          <StatPill label="Freático máx" value={formatKPI(kpis.maxWaterTable, 2, " m")} sub={kpis.maxWaterTable ? `${kpis.maxWaterTable.time} hrs` : null} color="rgba(255, 255, 255, 0.5)" valueColor="#E76F51" />
                          <StatPill label="Freático mín" value={formatKPI(kpis.minWaterTable, 2, " m")} sub={kpis.minWaterTable ? `${kpis.minWaterTable.time} hrs` : null} color="rgba(255, 255, 255, 0.5)" valueColor="#2A9D8F" />
                          <StatPill label="Freático prom" value={kpis.avgWaterTable != null ? `${kpis.avgWaterTable.toFixed(2)} m` : "—"} sub="PROMEDIO" color="rgba(255, 255, 255, 0.5)" />
                        </>
                      )}
                    </>
                  }
                >
                  <div ref={levelsChartRef}>
                    <MeasurementsCombinedLevelChart
                      data={chartDataAll}
                      token={token}
                      wellConfig={wellConfig}
                      pointName={selectedMeasurementPoint?.pointName}
                      date={selectedMeasurementPoint?.date}
                      onExportCSV={() => handleExportLevelsCSV(
                        chartDataAll,
                        wellConfig,
                        selectedMeasurementPoint?.pointName,
                        selectedMeasurementPoint?.date
                      )}
                      onExportPNG={() => handleExportLevelsPNG(
                        levelsChartRef,
                        selectedMeasurementPoint?.pointName,
                        selectedMeasurementPoint?.date
                      )}
                    />
                  </div>
                </MetricCard>
              </Col>
            </Row>
          )}

          {activeTab === "1" && !activeVars.hasTotalizado && !activeVars.hasCaudal && (
            <Flex justify="center" align="center" style={{ height: 200 }}>
              <Text type="secondary">Sin datos de hidrometría para este punto</Text>
            </Flex>
          )}
          {activeTab === "2" && !activeVars.hasNivel && !activeVars.hasWaterTable && (
            <Flex justify="center" align="center" style={{ height: 200 }}>
              <Text type="secondary">Sin datos de niveles para este punto</Text>
            </Flex>
          )}
        </Flex>
      )}

      {viewMode === "table" && (
        <MemoizedMeasurementsTable
          allMeasurements={allMeasurements}
          measurementColumns={measurementColumns}
          token={token}
          kpis={kpis}
          selectedMeasurementPoint={selectedMeasurementPoint}
        />
      )}
    </Flex>
  );
};

export const MeasurementsDrawerContentMemo = React.memo(MeasurementsDrawerContent);
