import React, { useCallback, useState, useMemo } from "react";
import moment from "moment";
import { Row, Col, Flex, Typography, Table, Tag, Button, message } from "antd";
import { FaDownload, FaSun, FaMoon } from "react-icons/fa";
import { extractRecordNum, extractMeasurements, classifyByTimeOfDay, getPeriod, formatKPI } from "./MeasurementUtils";
import { TrendArrow, StatPill, MetricCard } from "./MeasurementKPIs";
import { MeasurementsAreaChart, MeasurementsLineChart, MeasurementsDualColumnChart } from "./MeasurementCharts";

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
    }).join(",");
    
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
      }).join(",")
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
        <th {...props} style={{ ...props.style, fontSize: 10, padding: "10px 8px", fontWeight: 600, color: token.colorTextSecondary, textTransform: "uppercase", letterSpacing: 0.5, background: token.colorBgLayout }} />
      ),
    },
  }), [token.colorTextSecondary, token.colorBgLayout]);

  return (
    <Flex vertical gap={12}>
      <Flex align="center" justify="flex-end" gap={8}>
        <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>
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
        locale={{ emptyText: "Sin mediciones para este día" }}
        scroll={{ x: "max-content", y: 500 }}
        style={{ borderRadius: 12, overflow: "hidden" }}
        components={components}
      />
    </Flex>
  );
});

export const MeasurementsDrawerContent = ({ data, token, viewMode, variables, activeTab, onTabChange, totalDayConsumo, selectedMeasurementPoint, wellConfig }) => {
  const measurements = extractMeasurements(data);

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
    sorter: (a, b) => (extractRecordNum(a.flow) ?? extractRecordNum(a.caudal) ?? 0) - (extractRecordNum(b.flow) ?? extractRecordNum(b.caudal) ?? 0),
    render: (_, m) => {
      const flowVal = extractRecordNum(m.flow) ?? extractRecordNum(m.caudal);
      const isMax = kpis.maxCaudal && flowVal === kpis.maxCaudal.value;
      const isMin = kpis.minCaudal && flowVal === kpis.minCaudal.value;
      return flowVal != null ? (
        <Text style={{ fontSize: 11, color: isMax ? "#ff4d4f" : isMin ? "#52c41a" : token.colorText, fontWeight: isMax || isMin ? 600 : 400 }}>
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
    sorter: (a, b) => (extractRecordNum(a.nivel) ?? extractRecordNum(a.level) ?? 0) - (extractRecordNum(b.nivel) ?? extractRecordNum(b.level) ?? 0),
    render: (_, m) => {
      const levelVal = extractRecordNum(m.nivel) ?? extractRecordNum(m.level);
      const isMax = kpis.maxNivel && levelVal === kpis.maxNivel.value;
      const isMin = kpis.minNivel && levelVal === kpis.minNivel.value;
      return levelVal != null ? (
        <Text style={{ fontSize: 11, color: isMax ? "#ff4d4f" : isMin ? "#52c41a" : token.colorText, fontWeight: isMax || isMin ? 600 : 400 }}>
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
        <Text style={{ fontSize: 11, color: isMax ? "#ff4d4f" : isMin ? "#52c41a" : token.colorText, fontWeight: isMax || isMin ? 600 : 400 }}>
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
    sorter: (a, b) => (extractRecordNum(a.total) ?? 0) - (extractRecordNum(b.total) ?? 0),
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
    sorter: (a, b) => (extractRecordNum(a.total_diff) ?? 0) - (extractRecordNum(b.total_diff) ?? 0),
    render: (_, m) => {
      const diffVal = extractRecordNum(m.total_diff);
      const isMax = kpis.maxConsumo && diffVal === kpis.maxConsumo.value;
      const isMin = kpis.minConsumo && diffVal === kpis.minConsumo.value;
      return diffVal != null ? (
        <Text strong style={{ fontSize: 11, color: isMax ? "#ff4d4f" : isMin ? "#52c41a" : token.colorPrimary, fontWeight: isMax || isMin ? 700 : 600 }}>
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
    filters: [
      { text: "Confirmado", value: "ok" },
      { text: "Error", value: "error" },
    ],
    onFilter: (value, record) => value === "error" ? record.is_error : !record.is_error,
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
          {activeTab === "1" && (activeVars.hasTotalizado || activeVars.hasCaudal) && (
            <Row gutter={[8, 8]}>
              {activeVars.hasTotalizado && (
                <Col xs={24} md={12}>
                  <MetricCard
                    title="Consumo"
                    icon={<div style={{ width: 8, height: 8, borderRadius: 4, background: "#096dd9" }} />}
                    kpis={
                      <>
                        {totalDayConsumo > 0 && (
                          <StatPill label="Total día" value={`${totalDayConsumo.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} m³`} sub="acumulado" color="#096dd9" />
                        )}
                        <StatPill label="Máx" value={formatKPI(kpis.maxConsumo, 0, " m³")} sub={kpis.maxConsumo ? `${kpis.maxConsumo.time} hrs` : null} color="#096dd9" valueColor="#ff4d4f" />
                        <StatPill label="Mín" value={formatKPI(kpis.minConsumo, 0, " m³")} sub={kpis.minConsumo ? `${kpis.minConsumo.time} hrs` : null} color="#096dd9" valueColor="#52c41a" />
                        <StatPill label="Prom" value={kpis.avgConsumo != null ? `${kpis.avgConsumo.toFixed(0)} m³` : "—"} sub="promedio" color="#000000" />
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
                    icon={<div style={{ width: 8, height: 8, borderRadius: 4, background: "#13c2c2" }} />}
                    kpis={
                      <>
                        <StatPill label="Máx" value={formatKPI(kpis.maxCaudal, 1, " L/s")} sub={kpis.maxCaudal ? `${kpis.maxCaudal.time} hrs` : null} color="#13c2c2" valueColor="#ff4d4f" />
                        <StatPill label="Mín" value={formatKPI(kpis.minCaudal, 1, " L/s")} sub={kpis.minCaudal ? `${kpis.minCaudal.time} hrs` : null} color="#13c2c2" valueColor="#52c41a" />
                        <StatPill label="Prom" value={kpis.avgCaudal != null ? `${kpis.avgCaudal.toFixed(1)} L/s` : "—"} sub="promedio" color="#000000" />
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
               {activeVars.hasNivel && (
                 <Col xs={24} md={12}>
                   <MetricCard
                     title="Nivel"
                     icon={<div style={{ width: 8, height: 8, borderRadius: 4, background: '#1890ff' }} />}
                     kpis={
                       <>
                          <StatPill label="Profundidad" value={wellConfig?.d1 != null ? `${wellConfig.d1} m` : "—"} sub="TOTAL" color={token.colorPrimary} />
                         <StatPill label="Máx" value={formatKPI(kpis.maxNivel, 2, " m")} sub={kpis.maxNivel ? `${kpis.maxNivel.time} hrs` : null} color={token.colorPrimary} valueColor="#ff4d4f" />
                         <StatPill label="Mín" value={formatKPI(kpis.minNivel, 2, " m")} sub={kpis.minNivel ? `${kpis.minNivel.time} hrs` : null} color={token.colorPrimary} valueColor="#52c41a" />
                          <StatPill label="Prom" value={kpis.avgNivel != null ? `${kpis.avgNivel.toFixed(2)} m` : "—"} sub="promedio" color="#000000" />
                       </>
                     }
                   >
                    <MeasurementsDualColumnChart 
                      data={chartDataAll} 
                      token={token} 
                      showOnly="nivel"
                      wellConfig={wellConfig}
                      pointName={selectedMeasurementPoint?.pointName}
                      date={selectedMeasurementPoint?.date}
                      metric="nivel"
                      avgInfo={kpis.avgNivel}
                    />
                  </MetricCard>
                </Col>
              )}
               {activeVars.hasWaterTable && (
                 <Col xs={24} md={12}>
                   <MetricCard
                     title="Nivel freático"
                     icon={<div style={{ width: 8, height: 8, borderRadius: 4, background: '#8c8c8c' }} />}
                     kpis={
                       <>
                          <StatPill label="Posicionamiento" value={wellConfig?.d3 != null ? `${wellConfig.d3} m` : "—"} sub="Sensor de nivel" color={token.colorPrimary} />
                         <StatPill label="Máx" value={formatKPI(kpis.maxWaterTable, 2, " m")} sub={kpis.maxWaterTable ? `${kpis.maxWaterTable.time} hrs` : null} color="#8c8c8c" valueColor="#ff4d4f" />
                         <StatPill label="Mín" value={formatKPI(kpis.minWaterTable, 2, " m")} sub={kpis.minWaterTable ? `${kpis.minWaterTable.time} hrs` : null} color="#8c8c8c" valueColor="#52c41a" />
                          <StatPill label="Prom" value={kpis.avgWaterTable != null ? `${kpis.avgWaterTable.toFixed(2)} m` : "—"} sub="promedio" color="#000000" />
                       </>
                     }
                   >
                    <MeasurementsDualColumnChart 
                      data={chartDataAll} 
                      token={token} 
                      showOnly="water_table"
                      wellConfig={wellConfig}
                      pointName={selectedMeasurementPoint?.pointName}
                      date={selectedMeasurementPoint?.date}
                      metric="water_table"
                      avgInfo={kpis.avgWaterTable}
                    />
                  </MetricCard>
                </Col>
              )}
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
