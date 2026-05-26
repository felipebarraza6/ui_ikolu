import React, { useState, useCallback, useMemo } from "react";
import { Card, Tabs, Select, DatePicker, Flex, Typography, Table, Tag, Spin, theme, Row, Col } from "antd";
import { Line } from "@ant-design/plots";
import { FaChartLine, FaClipboardCheck, FaBroadcastTower } from "react-icons/fa";
import moment from "moment";
import sh from "../../api/sh/endpoints";
import { CHART_COLORS } from "../../theme";
import CCComplianceTable from "./CCComplianceTable";
import CCWeekConsumption from "./CCWeekConsumption";

const { Text } = Typography;
const { useToken } = theme;

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

const CCTelemetryTab = ({ points, onViewMeasurements, onOpenStopTelemetry, last7, selectedDate, onDateSelect, onSelectPoint }) => {
  const { token } = useToken();
  const [selectedPoint, setSelectedPoint] = useState(points[0]?.id || null);
  const [localSelectedDate, setLocalSelectedDate] = useState(moment());
  const [telemetryData, setTelemetryData] = useState(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);

  const activeDate = selectedDate || localSelectedDate;
  const setActiveDate = onDateSelect || setLocalSelectedDate;

  const loadTelemetryData = useCallback(async () => {
    if (!selectedPoint) return;
    setTelemetryLoading(true);
    try {
      const dateStr = activeDate.format("YYYY-MM-DD");
      const res = await sh.pointRecords(selectedPoint, dateStr, dateStr, 100);
      setTelemetryData(res);
    } catch (err) {
      console.error("[Telemetry] Error:", err);
    } finally {
      setTelemetryLoading(false);
    }
  }, [selectedPoint, activeDate]);

  const chartData = useMemo(() => {
    if (!telemetryData) return [];
    const measurements = Array.isArray(telemetryData)
      ? telemetryData
      : telemetryData.records || telemetryData.results || telemetryData.measurements || telemetryData.data || [];

    return measurements
      .map((m) => {
        const t = moment(m.date_time || m.date_time_medition || m.timestamp || m.time || m.created_at).format("HH:mm");
        return {
          time: t,
          caudal: extractRecordNum(m.flow) ?? extractRecordNum(m.caudal),
          consumo: extractRecordNum(m.total_diff),
          nivel: extractRecordNum(m.nivel) ?? extractRecordNum(m.level),
        };
      })
      .filter((d) => d.time)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [telemetryData]);

  const tableData = useMemo(() => {
    if (!telemetryData) return [];
    const measurements = Array.isArray(telemetryData)
      ? telemetryData
      : telemetryData.records || telemetryData.results || telemetryData.measurements || telemetryData.data || [];

    return measurements.map((m, i) => ({
      key: i,
      time: moment(m.date_time || m.date_time_medition || m.timestamp || m.time || m.created_at).format("HH:mm"),
      fecha: moment(m.date_time || m.date_time_medition || m.timestamp || m.time || m.created_at).format("DD/MM"),
      caudal: extractRecordNum(m.flow) ?? extractRecordNum(m.caudal),
      consumo: extractRecordNum(m.total_diff),
      total: extractRecordNum(m.total),
      nivel: extractRecordNum(m.nivel) ?? extractRecordNum(m.level),
      estado: m.is_error ? "Error" : "Confirmado",
    }));
  }, [telemetryData]);

  const telemetryColumns = [
    {
      title: "Hora",
      dataIndex: "time",
      key: "time",
      width: 70,
      align: "center",
      render: (v) => <Text style={{ fontSize: 11 }}>{v}</Text>,
    },
    {
      title: "Caudal (L/s)",
      dataIndex: "caudal",
      key: "caudal",
      width: 90,
      align: "right",
      render: (v) => (
        <Text style={{ fontSize: 11, color: v > 0 ? token.colorSuccess : token.colorTextSecondary }}>
          {v != null ? v.toFixed(1) : "—"}
        </Text>
      ),
    },
    {
      title: "Consumo (m³)",
      dataIndex: "consumo",
      key: "consumo",
      width: 90,
      align: "right",
      render: (v) => (
        <Text strong style={{ fontSize: 11, color: token.colorPrimary }}>
          {v != null ? v.toLocaleString("es-CL", { maximumFractionDigits: 0 }) : "—"}
        </Text>
      ),
    },
    {
      title: "Total (m³)",
      dataIndex: "total",
      key: "total",
      width: 90,
      align: "right",
      render: (v) => (
        <Text style={{ fontSize: 11 }}>
          {v != null ? v.toLocaleString("es-CL", { maximumFractionDigits: 0 }) : "—"}
        </Text>
      ),
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 85,
      align: "center",
      render: (v) =>
        v === "Error" ? (
          <Tag color="error" style={{ fontSize: 9, margin: 0, padding: "0 6px" }}>Error</Tag>
        ) : (
          <Tag style={{ fontSize: 9, margin: 0, padding: "0 6px", background: `${token.colorSuccess}10`, border: `1px solid ${token.colorSuccess}30`, color: token.colorSuccess }}>Confirmado</Tag>
        ),
    },
  ];

  const multiChartData = useMemo(() => {
    const metrics = [];
    if (chartData.some((d) => d.caudal != null)) {
      metrics.push({ key: "caudal", label: "Caudal (L/s)", color: CHART_COLORS.primary });
    }
    if (chartData.some((d) => d.consumo != null)) {
      metrics.push({ key: "consumo", label: "Consumo (m³)", color: CHART_COLORS.warning });
    }
    if (chartData.some((d) => d.nivel != null)) {
      metrics.push({ key: "nivel", label: "Nivel (m)", color: CHART_COLORS.info });
    }

    return metrics.flatMap((m) =>
      chartData
        .filter((d) => d[m.key] != null)
        .map((d) => ({
          time: d.time,
          value: d[m.key],
          type: m.label,
          color: m.color,
        }))
    );
  }, [chartData]);

  return (
    <Flex vertical gap={16}>
      {/* Consumo Semanal */}
      {last7 && (
        <CCWeekConsumption
          last7={last7}
          selectedDate={activeDate}
          onDateSelect={setActiveDate}
          onViewMeasurements={onViewMeasurements}
          onOpenStopTelemetry={onOpenStopTelemetry}
          onSelectPoint={onSelectPoint}
        />
      )}

      {/* Selectores */}
      <Flex gap={12} wrap="wrap" align="center">
        <Select
          value={selectedPoint}
          onChange={setSelectedPoint}
          style={{ minWidth: 200 }}
          placeholder="Seleccionar punto"
          options={points.map((p) => ({ value: p.id, label: p.title }))}
        />
        <DatePicker
          value={activeDate}
          onChange={setActiveDate}
          format="DD/MM/YYYY"
          style={{ borderRadius: 8 }}
        />
        <Flex gap={8}>
          <Tag color="processing" style={{ cursor: "pointer" }} onClick={loadTelemetryData}>
            <FaChartLine style={{ marginRight: 4 }} /> Cargar datos
          </Tag>
        </Flex>
      </Flex>

      {telemetryLoading ? (
        <Flex justify="center" align="center" style={{ height: 200 }}>
          <Spin size="small" />
        </Flex>
      ) : chartData.length > 0 ? (
        <>
          {/* Gráfico */}
          <Card size="small" style={{ background: "#fafafa" }}>
            <Line
              data={multiChartData}
              xField="time"
              yField="value"
              seriesField="type"
              height={300}
              smooth
              color={({ type }) => {
                const item = multiChartData.find((d) => d.type === type);
                return item?.color || CHART_COLORS.primary;
              }}
              lineStyle={{ lineWidth: 2 }}
              point={{ size: 2, state: { active: { size: 5 } } }}
              legend={{ position: "top-right" }}
              xAxis={{
                grid: { line: { style: { stroke: "rgba(0, 0, 0, 0.06)", lineDash: [4, 4] } } },
              }}
              yAxis={{
                grid: { line: { style: { stroke: "rgba(0, 0, 0, 0.06)", lineDash: [4, 4] } } },
              }}
              tooltip={{
                shared: true,
                showCrosshairs: true,
                domStyles: {
                  "g2-tooltip": {
                    borderRadius: "10px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    padding: "12px",
                    background: "rgba(255, 255, 255, 0.98)",
                  },
                },
              }}
              animation={{ appear: { animation: "fade-in", duration: 400 } }}
            />
          </Card>

          {/* Tabla */}
          <Table
            dataSource={tableData}
            columns={telemetryColumns}
            size="small"
            pagination={{ pageSize: 10, showTotal: (total) => `${total} registros` }}
            scroll={{ x: "max-content", y: 300 }}
            sticky
          />
        </>
      ) : (
        <Flex justify="center" align="center" style={{ height: 200 }} vertical gap={8}>
          <Text type="secondary">Selecciona un punto y fecha, luego haz clic en "Cargar datos"</Text>
        </Flex>
      )}
    </Flex>
  );
};

const CCDataTabs = ({ points, onViewVoucher, onOpenStopCompliance, onSelectPoint, onViewMeasurements, onOpenStopTelemetry, last7, selectedDate, onDateSelect }) => {
  const { token } = useToken();

  const tabItems = [
    {
      key: "telemetria",
      label: (
        <Flex align="center" gap={6}>
          <FaBroadcastTower style={{ color: token.colorPrimary }} />
          <Text strong>Telemetría</Text>
        </Flex>
      ),
      children: (
        <CCTelemetryTab
          points={points}
          onViewMeasurements={onViewMeasurements}
          onOpenStopTelemetry={onOpenStopTelemetry}
          last7={last7}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          onSelectPoint={onSelectPoint}
        />
      ),
    },
    {
      key: "cumplimiento",
      label: (
        <Flex align="center" gap={6}>
          <FaClipboardCheck style={{ color: token.colorSuccess }} />
          <Text strong>Cumplimiento Normativo</Text>
        </Flex>
      ),
      children: (
        <CCComplianceTable
          points={points}
          onViewVoucher={onViewVoucher}
          onOpenStopCompliance={onOpenStopCompliance}
          onSelectPoint={onSelectPoint}
        />
      ),
    },
  ];

  return (
    <Card
      size="small"
      style={{ borderRadius: token.borderRadiusLG, overflow: "hidden" }}
      bodyStyle={{ padding: 0 }}
    >
      <Tabs
        defaultActiveKey="telemetria"
        type="card"
        items={tabItems}
        style={{ padding: "0 16px" }}
      />
    </Card>
  );
};

export default React.memo(CCDataTabs);
