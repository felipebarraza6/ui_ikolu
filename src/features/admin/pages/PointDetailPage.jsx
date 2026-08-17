import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Flex,
  Typography,
  Tabs,
  Spin,
  Empty,
  Descriptions,
  Tag,
  Table,
  DatePicker,
  Button,
  message,
  Statistic,
  Row,
  Col,
  Card,
} from "antd";
import {
  EnvironmentOutlined,
  SettingOutlined,
  SyncOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
  DashboardOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { SmartCard } from "../../../shared/ui";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import orchestrator from "../../../api/orchestrator";
import { extractMeasurements, extractRecordNum } from "../../control-center/measurements/MeasurementUtils";

const { Title, Text } = Typography;

const DATE_FORMAT = "YYYY-MM-DD";
const DISPLAY_DATETIME = "dd/MM/yyyy HH:mm:ss";
const DISPLAY_DATETIME_SHORT = "dd/MM/yyyy HH:mm";
const RANGE_DATE_FORMAT = "DD/MM/YYYY";

const formatDateTime = (value) => {
  if (!value) return "—";
  try {
    return format(parseISO(value), DISPLAY_DATETIME, { locale: es });
  } catch {
    return String(value);
  }
};

const formatDateTimeShort = (value) => {
  if (!value) return "—";
  try {
    return format(parseISO(value), DISPLAY_DATETIME_SHORT, { locale: es });
  } catch {
    return String(value);
  }
};

const formatNumber = (value, decimals = 2) => {
  const num = extractRecordNum(value);
  if (num == null) return "—";
  return num.toLocaleString("es-CL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const usePointSummary = (pointId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!pointId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await orchestrator.ikPointSummary(pointId);
      setData(res);
    } catch (err) {
      setError(err);
      message.error(err.message || "Error al cargar el punto");
    } finally {
      setLoading(false);
    }
  }, [pointId]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
};

const usePointConfig = (pointId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!pointId) return;
    setLoading(true);
    try {
      const res = await orchestrator.ikPointConfig(pointId);
      setData(res);
    } catch (err) {
      message.error(err.message || "Error al cargar configuración");
    } finally {
      setLoading(false);
    }
  }, [pointId]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, refresh: load };
};

const usePointVariables = (pointId) => {
  const [data, setData] = useState({ variables: [], mapping: {} });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!pointId) return;
    setLoading(true);
    try {
      const res = await orchestrator.ikPointVariables(pointId);
      setData({
        variables: res?.variables || [],
        mapping: res?.mapping || {},
      });
    } catch (err) {
      message.error(err.message || "Error al cargar variables");
    } finally {
      setLoading(false);
    }
  }, [pointId]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, refresh: load };
};

const usePointRecords = (pointId, startDate, endDate) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!pointId || !startDate || !endDate) return;
    setLoading(true);
    try {
      const res = await orchestrator.ikPointRecords(pointId, {
        startDate,
        endDate,
        limit: 500,
      });
      setData(res);
    } catch (err) {
      message.error(err.message || "Error al cargar mediciones");
    } finally {
      setLoading(false);
    }
  }, [pointId, startDate, endDate]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, refresh: load };
};

const StatusTag = ({ active, isTelemetry }) => {
  if (!active) {
    return <Tag color="red">Inactivo</Tag>;
  }
  if (isTelemetry) {
    return <Tag color="success">Activo · Telemetría</Tag>;
  }
  return <Tag color="processing">Activo</Tag>;
};

const SummaryTab = ({ pointId }) => {
  const token = useIkoluToken();
  const { data, loading, error } = usePointSummary(pointId);

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 300 }}>
        <Spin size="large" tip="Cargando resumen..." />
      </Flex>
    );
  }

  if (error || !data) {
    return (
      <Empty
        description={error ? "No se pudo cargar el punto" : "Punto no encontrado"}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  const latest = data.latest_telemetry || {};

  return (
    <Flex vertical gap={16}>
      <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
        <Flex align="center" gap={12}>
          <EnvironmentOutlined style={{ fontSize: 24, color: token.voidTextHeading }} />
          <div>
            <Title level={3} style={{ margin: 0, color: token.voidTextHeading }}>
              {data.title || `Punto ${data.id}`}
            </Title>
            <Text style={{ color: token.voidTextMuted }}>
              {data.client_name} · {data.project_name}
            </Text>
          </div>
        </Flex>
        <StatusTag active={data.active} isTelemetry={data.is_telemetry} />
      </Flex>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={8}>
          <Card style={{ background: token.voidSurface, borderColor: token.voidBorder }}>
            <Statistic
              title={<Text style={{ color: token.voidTextMuted }}>Último dato</Text>}
              value={formatDateTime(latest.date_time_medition)}
              valueStyle={{ fontSize: 16, color: token.voidTextHeading }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Card style={{ background: token.voidSurface, borderColor: token.voidBorder }}>
            <Statistic
              title={<Text style={{ color: token.voidTextMuted }}>Frecuencia</Text>}
              value={data.frecuency ? `${data.frecuency} min` : "—"}
              valueStyle={{ fontSize: 16, color: token.voidTextHeading }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Card style={{ background: token.voidSurface, borderColor: token.voidBorder }}>
            <Statistic
              title={<Text style={{ color: token.voidTextMuted }}>Alertas activas</Text>}
              value={data.alerts_count ?? 0}
              valueStyle={{ fontSize: 16, color: token.voidTextHeading }}
              prefix={data.alerts_count ? <ExclamationCircleOutlined style={{ color: token.colorError }} /> : <CheckCircleOutlined style={{ color: token.colorSuccess }} />}
            />
          </Card>
        </Col>
      </Row>

      <SmartCard variant="void" title="Información general">
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="ID">{data.id}</Descriptions.Item>
          <Descriptions.Item label="Nombre">{data.title || "—"}</Descriptions.Item>
          <Descriptions.Item label="Proveedor">{data.provider || "—"}</Descriptions.Item>
          <Descriptions.Item label="Cliente">{data.client_name || "—"}</Descriptions.Item>
          <Descriptions.Item label="Proyecto">{data.project_name || "—"}</Descriptions.Item>
          <Descriptions.Item label="Ubicación">
            {data.lat && data.lon ? `${data.lat}, ${data.lon}` : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Estado">
            <StatusTag active={data.active} isTelemetry={data.is_telemetry} />
          </Descriptions.Item>
          <Descriptions.Item label="DGA">
            {data.dga?.code_dga ? `${data.dga.code_dga} (${data.dga.type_dga})` : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Envía DGA">{data.dga?.send_dga ? "Sí" : "No"}</Descriptions.Item>
        </Descriptions>
      </SmartCard>

      {latest.date_time_medition && (
        <SmartCard variant="void" title="Última telemetría">
          <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="Fecha">{formatDateTime(latest.date_time_medition)}</Descriptions.Item>
            <Descriptions.Item label="Caudal">{formatNumber(latest.flow, 1)} L/s</Descriptions.Item>
            <Descriptions.Item label="Total">{formatNumber(latest.total, 0)} m³</Descriptions.Item>
            <Descriptions.Item label="Nivel">{formatNumber(latest.nivel, 2)} m</Descriptions.Item>
            <Descriptions.Item label="Nivel freático">{formatNumber(latest.water_table, 2)} m</Descriptions.Item>
            <Descriptions.Item label="Días sin conexión">{latest.days_not_connection ?? 0}</Descriptions.Item>
          </Descriptions>
        </SmartCard>
      )}
    </Flex>
  );
};

const ConfigTab = ({ pointId }) => {
  const { data, loading, refresh } = usePointConfig(pointId);

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 300 }}>
        <Spin size="large" tip="Cargando configuración..." />
      </Flex>
    );
  }

  if (!data) {
    return <Empty description="Sin configuración" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  const numericFields = [
    { key: "d1", label: "Profundidad total", unit: "m" },
    { key: "d2", label: "Posicionamiento bomba", unit: "m" },
    { key: "d3", label: "Nivel freático", unit: "m" },
    { key: "d4", label: "Diámetro bomba", unit: "pulg" },
    { key: "d5", label: "Diámetro flujómetro", unit: "pulg" },
    { key: "d6", label: "D6", unit: "" },
    { key: "addition", label: "Adición", unit: "m³" },
    { key: "nivel_offset", label: "Offset de nivel", unit: "m" },
    { key: "max_diff_m3_per_hour", label: "Máx. diferencia horaria", unit: "m³/h" },
    { key: "max_flow_ls", label: "Máx. caudal", unit: "L/s" },
    { key: "max_time_gap_hours", label: "Máx. gap de tiempo", unit: "h" },
    { key: "reconnection_threshold_hours", label: "Umbral de reconexión", unit: "h" },
  ];

  const booleanFields = [
    { key: "is_telemetry", label: "Telemetría activa" },
    { key: "replicate_on_missing", label: "Replicar datos faltantes" },
    { key: "use_transaction_atomic", label: "Transacción atómica" },
  ];

  return (
    <Flex vertical gap={16}>
      <Flex justify="flex-end">
        <Button icon={<SyncOutlined />} onClick={refresh}>
          Refrescar
        </Button>
      </Flex>
      <SmartCard variant="void" title="Parámetros técnicos">
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 3 }}>
          {numericFields.map((field) => (
            <Descriptions.Item key={field.key} label={field.label}>
              {data[field.key] != null ? `${data[field.key]} ${field.unit}`.trim() : "—"}
            </Descriptions.Item>
          ))}
          {booleanFields.map((field) => (
            <Descriptions.Item key={field.key} label={field.label}>
              {data[field.key] ? "Sí" : "No"}
            </Descriptions.Item>
          ))}
        </Descriptions>
      </SmartCard>
    </Flex>
  );
};

const VariablesTab = ({ pointId }) => {
  const token = useIkoluToken();
  const { data, loading, refresh } = usePointVariables(pointId);
  const { variables, mapping } = data;

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 300 }}>
        <Spin size="large" tip="Cargando variables..." />
      </Flex>
    );
  }

  if (variables.length === 0) {
    return <Empty description="Sin variables configuradas" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  const typeColors = {
    TOTALIZADO: "warning",
    CAUDAL: "processing",
    CAUDAL_PROMEDIO: "processing",
    NIVEL: "success",
  };

  const formatDecimal = (value) => {
    if (value == null || value === "") return "—";
    const num = Number(value);
    if (Number.isNaN(num)) return String(value);
    return num.toLocaleString("es-CL");
  };

  return (
    <Flex vertical gap={16}>
      <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
        <Text style={{ color: token.voidTextMuted }}>
          {variables.length} variable{variables.length === 1 ? "" : "s"} configurada{variables.length === 1 ? "" : "s"}
        </Text>
        <Button icon={<SyncOutlined />} onClick={refresh} loading={loading}>
          Refrescar
        </Button>
      </Flex>

      <Row gutter={[16, 16]}>
        {variables.map((v) => {
          const displayKey = mapping?.[String(v.id)] || v.display_key || v.str_variable;
          const isTotal = v.type_variable === "TOTALIZADO";
          const isLevel = v.type_variable === "NIVEL";
          const isFlow = v.type_variable === "CAUDAL" || v.type_variable === "CAUDAL_PROMEDIO";

          return (
            <Col key={v.id} xs={24} md={12} xl={8}>
              <Card
                title={
                  <Flex align="center" gap={8}>
                    <Tag color={typeColors[v.type_variable] || "default"}>{v.type_variable}</Tag>
                    <Text strong style={{ color: token.voidTextHeading }}>
                      {v.label || v.str_variable}
                    </Text>
                  </Flex>
                }
                style={{ background: token.voidSurface, borderColor: token.voidBorder }}
                headStyle={{ borderBottom: `1px solid ${token.voidBorder}` }}
                bodyStyle={{ padding: 0 }}
              >
                <Descriptions bordered size="small" column={1} labelStyle={{ width: 140, color: token.voidTextMuted }}>
                  <Descriptions.Item label="Clave cruda">{v.str_variable || "—"}</Descriptions.Item>
                  <Descriptions.Item label="Display key">{displayKey || "—"}</Descriptions.Item>
                  <Descriptions.Item label="Mínimo">{formatDecimal(v.min_value)}</Descriptions.Item>
                  <Descriptions.Item label="Máximo">{formatDecimal(v.max_value)}</Descriptions.Item>
                  {isTotal && (
                    <Descriptions.Item label="Factor de pulsos">
                      <Tag color="warning">{v.pulses_factor ?? "—"}</Tag>
                    </Descriptions.Item>
                  )}
                  {isLevel && (
                    <Descriptions.Item label="Base cálculo nivel">
                      {v.calculate_nivel ?? "—"}
                    </Descriptions.Item>
                  )}
                  {isFlow && (
                    <Descriptions.Item label="Convertir a litros">
                      {v.convert_to_lt ? "Sí" : "No"}
                    </Descriptions.Item>
                  )}
                  {isFlow && (
                    <Descriptions.Item label="Guardar promedio">
                      {v.store_average_flow ? "Sí" : "No"}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </Col>
          );
        })}
      </Row>

      {Object.keys(mapping).length > 0 && (
        <Card
          title="Mapping telemetría"
          size="small"
          style={{ background: token.voidSurface, borderColor: token.voidBorder }}
          headStyle={{ borderBottom: `1px solid ${token.voidBorder}` }}
        >
          <Flex wrap gap={8}>
            {Object.entries(mapping).map(([varId, key]) => {
              const v = variables.find((x) => String(x.id) === varId);
              return (
                <Tag key={varId} color="default" style={{ fontSize: 13 }}>
                  {v?.label || varId} → {key}
                </Tag>
              );
            })}
          </Flex>
        </Card>
      )}
    </Flex>
  );
};

const MeasurementsTab = ({ pointId, summary }) => {
  const token = useIkoluToken();
  const [dateRange, setDateRange] = useState(() => {
    const end = dayjs();
    const start = end.subtract(7, "day");
    return [start, end];
  });

  const lastLogger = summary?.latest_telemetry?.date_time_medition;
  const disconnectDays = useMemo(() => {
    if (!lastLogger) return null;
    return dayjs().diff(dayjs(lastLogger), "day");
  }, [lastLogger]);

  const startDate = dateRange[0]?.format(DATE_FORMAT);
  const endDate = dateRange[1]?.format(DATE_FORMAT);
  const { data, loading, refresh } = usePointRecords(pointId, startDate, endDate);
  const measurements = useMemo(() => extractMeasurements(data), [data]);

  const columns = useMemo(() => {
    const hasFlow = measurements.some((m) => extractRecordNum(m.flow) != null || extractRecordNum(m.caudal) != null);
    const hasTotal = measurements.some((m) => extractRecordNum(m.total) != null);
    const hasDiff = measurements.some((m) => extractRecordNum(m.total_diff) != null);
    const hasNivel = measurements.some((m) => extractRecordNum(m.nivel) != null || extractRecordNum(m.level) != null);
    const hasWaterTable = measurements.some((m) => extractRecordNum(m.water_table) != null);
    const hasPulses = measurements.some((m) => extractRecordNum(m.pulses) != null);

    const cols = [
      {
        title: "Fecha/Hora",
        key: "date_time",
        width: 200,
        render: (_, m) => {
          const date = formatDateTimeShort(m.date_time || m.date_time_medition || m.timestamp || m.time);
          return (
            <Flex vertical gap={0}>
              <Text style={{ color: token.voidTextHeading }}>{date}</Text>
              <Text style={{ fontSize: 11, color: token.voidTextMuted }}>
                Últ. logger: {formatDateTimeShort(lastLogger)}
              </Text>
              <Text style={{ fontSize: 11, color: token.voidTextMuted }}>
                Desconexión: {disconnectDays != null ? `${disconnectDays} días` : "—"}
              </Text>
            </Flex>
          );
        },
        sorter: (a, b) => new Date(a.date_time || a.date_time_medition) - new Date(b.date_time || b.date_time_medition),
      },
    ];
    if (hasPulses) {
      cols.push({
        title: "Pulsos",
        key: "pulses",
        align: "right",
        render: (_, m) => formatNumber(m.pulses, 0),
      });
    }
    if (hasTotal) {
      cols.push({
        title: "Total (m³)",
        key: "total",
        align: "right",
        render: (_, m) => formatNumber(m.total, 0),
      });
    }
    if (hasFlow) {
      cols.push({
        title: "Caudal (L/s)",
        key: "flow",
        align: "right",
        render: (_, m) => formatNumber(m.flow ?? m.caudal, 1),
      });
    }
    if (hasDiff) {
      cols.push({
        title: "Consumo (m³)",
        key: "total_diff",
        align: "right",
        render: (_, m) => formatNumber(m.total_diff, 2),
      });
    }
    if (hasNivel) {
      cols.push({
        title: "Nivel (m)",
        key: "nivel",
        align: "right",
        render: (_, m) => formatNumber(m.nivel ?? m.level, 2),
      });
    }
    if (hasWaterTable) {
      cols.push({
        title: "Nivel freático (m)",
        key: "water_table",
        align: "right",
        render: (_, m) => formatNumber(m.water_table, 2),
      });
    }
    return cols;
  }, [
    measurements,
    lastLogger,
    disconnectDays,
    token.voidTextHeading,
    token.voidTextMuted,
  ]);

  return (
    <Flex vertical gap={16}>
      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap={12}
        style={{
          padding: 12,
          background: token.voidSurface,
          border: `1px solid ${token.voidBorder}`,
          borderRadius: token.borderRadiusLG,
        }}
      >
        <Flex align="center" gap={12} wrap="wrap">
          <Text style={{ color: token.voidTextMuted }}>Rango de fechas:</Text>
          <DatePicker.RangePicker
            value={dateRange}
            onChange={(values) => {
              if (values && values[0] && values[1]) {
                setDateRange(values);
              }
            }}
            format={RANGE_DATE_FORMAT}
            allowClear={false}
            disabledDate={(current) => current && current > dayjs().endOf("day")}
          />
          <Text style={{ color: token.voidTextMuted, fontSize: 12 }}>
            {dateRange[0]?.format(RANGE_DATE_FORMAT)} – {dateRange[1]?.format(RANGE_DATE_FORMAT)}
          </Text>
        </Flex>
        <Button icon={<SyncOutlined />} onClick={refresh} loading={loading}>
          Refrescar
        </Button>
      </Flex>

      <Table
        dataSource={measurements.map((m, i) => ({ ...m, key: i }))}
        columns={columns}
        loading={loading}
        size="small"
        bordered={false}
        pagination={{
          pageSize: 10,
          simple: true,
          showSizeChanger: false,
        }}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: <Empty description="Sin mediciones para el rango" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
      />
    </Flex>
  );
};

const PointDetailPage = () => {
  const { pointId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = useIkoluToken();
  const { data: summary } = usePointSummary(pointId);

  const summaryVariables = useMemo(() => {
    const vars = summary?.config_data?.variables || [];
    return vars.map((v) => String(v).toUpperCase());
  }, [summary]);

  const basePath = `/admin/points/${pointId}`;
  const activeTab = useMemo(() => {
    if (location.pathname.endsWith("/config")) return "config";
    if (location.pathname.endsWith("/variables")) return "variables";
    if (location.pathname.endsWith("/measurements")) return "measurements";
    return "summary";
  }, [location.pathname]);

  const handleTabChange = (key) => {
    navigate(`${basePath}/${key === "summary" ? "" : key}`, { replace: true, state: location.state });
  };

  const tabs = [
    {
      key: "summary",
      label: (
        <Flex align="center" gap={6}>
          <InfoCircleOutlined /> Resumen
        </Flex>
      ),
      children: <SummaryTab pointId={pointId} />,
    },
    {
      key: "config",
      label: (
        <Flex align="center" gap={6}>
          <SettingOutlined /> Configuración
        </Flex>
      ),
      children: <ConfigTab pointId={pointId} />,
    },
    {
      key: "variables",
      label: (
        <Flex align="center" gap={6}>
          <DashboardOutlined /> Variables
        </Flex>
      ),
      children: <VariablesTab pointId={pointId} summaryVariables={summaryVariables} />,
    },
    {
      key: "measurements",
      label: (
        <Flex align="center" gap={6}>
          <BarChartOutlined /> Mediciones
        </Flex>
      ),
      children: <MeasurementsTab pointId={pointId} summary={summary} />,
    },
  ];

  return (
    <div style={{ padding: token.paddingLG, minHeight: "100vh", background: token.voidBg }}>
      <Flex vertical gap={24}>
        <Flex align="center" gap={16} wrap="wrap">
          <div>
            <Title level={2} style={{ margin: 0, color: token.voidTextHeading }}>
              Detalle del punto
            </Title>
            <Text style={{ color: token.voidTextMuted }}>
              {summary?.title ? summary.title : `Punto ${pointId}`}
            </Text>
          </div>
        </Flex>

        <SmartCard variant="void">
          <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabs} />
        </SmartCard>
      </Flex>
    </div>
  );
};

export default PointDetailPage;
