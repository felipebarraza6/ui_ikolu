import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Drawer,
  Flex,
  Typography,
  Tag,
  Input,
  Select,
  DatePicker,
  Pagination,
  Spin,
  Empty,
  Button,
  theme,
} from "antd";
import {
  FaExclamationTriangle,
  FaUnlink,
  FaLink,
  FaRedo,
  FaChartLine,
  FaKey,
  FaServer,
  FaFilter,
  FaBolt,
} from "react-icons/fa";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale/es";
import orchestrator from "../../../api/orchestrator";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;
const { useToken } = theme;

const PAGE_SIZE = 20;

const EVENT_TYPES = [
  { value: "DISCONNECTION", label: "Desconexión" },
  { value: "RECONNECTION", label: "Reconexión" },
  { value: "COUNTER_RESET", label: "Reinicio contador" },
  { value: "MEASUREMENT_ERROR", label: "Error medición" },
  { value: "MASSIVE_JUMP_BLOCKED", label: "Salto bloqueado" },
  { value: "TOKEN_REFRESH", label: "Refresh token" },
  { value: "API_ERROR", label: "Error API" },
];

const SEVERITIES = [
  { value: "INFO", label: "Info", color: "blue" },
  { value: "WARNING", label: "Warning", color: "orange" },
  { value: "CRITICAL", label: "Critical", color: "red" },
];

const EVENT_ICONS = {
  DISCONNECTION: FaUnlink,
  RECONNECTION: FaLink,
  COUNTER_RESET: FaRedo,
  MEASUREMENT_ERROR: FaExclamationTriangle,
  MASSIVE_JUMP_BLOCKED: FaChartLine,
  TOKEN_REFRESH: FaKey,
  API_ERROR: FaServer,
};

const EVENT_COLORS = {
  DISCONNECTION: "#fa8c16",
  RECONNECTION: "#52c41a",
  COUNTER_RESET: "#722ed1",
  MEASUREMENT_ERROR: "#ff4d4f",
  MASSIVE_JUMP_BLOCKED: "#eb2f96",
  TOKEN_REFRESH: "#1890ff",
  API_ERROR: "#595959",
};

const SEVERITY_COLORS = {
  INFO: "#1890ff",
  WARNING: "#fa8c16",
  CRITICAL: "#ff4d4f",
};

const formatDateTime = (iso) => {
  if (!iso) return "—";
  const date = parseISO(iso);
  return isValid(date) ? format(date, "dd/MM/yyyy HH:mm", { locale: es }) : iso;
};

const formatDateGroup = (iso) => {
  if (!iso) return "Sin fecha";
  const date = parseISO(iso);
  if (!isValid(date)) return "Sin fecha";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) return "Hoy";
  if (format(date, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")) return "Ayer";
  return format(date, "EEEE d 'de' MMMM", { locale: es });
};

const SystemEventsDrawer = ({ open, onClose, point }) => {
  const { token } = useToken();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const [eventTypes, setEventTypes] = useState([]);
  const [severities, setSeverities] = useState([]);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState(null);

  const pointId = point?.id ?? null;
  const pointName = point?.title || point?.point_name || point?.name || null;

  const loadData = useCallback(async (currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: currentPage, page_size: PAGE_SIZE };
      if (eventTypes.length) params.event_type = eventTypes.join(",");
      if (severities.length) params.severity = severities.join(",");
      if (search.trim()) params.search = search.trim();
      if (dateRange?.[0] && dateRange?.[1]) {
        params.start = dateRange[0].format("YYYY-MM-DDTHH:mm:ss");
        params.end = dateRange[1].format("YYYY-MM-DDTHH:mm:ss");
      }
      const result = pointId
        ? await orchestrator.getSystemEventsByPoint(pointId, params)
        : await orchestrator.getSystemEvents(params);
      setData(result);
    } catch (err) {
      console.error("[SystemEventsDrawer] Error cargando eventos:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [pointId, eventTypes, severities, search, dateRange]);

  useEffect(() => {
    if (open) {
      setPage(1);
      loadData(1);
    } else {
      setData(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pointId]);

  useEffect(() => {
    if (!open) return;
    loadData(page);
  }, [open, page, eventTypes, severities, search, dateRange, loadData]);

  const count = data?.count || 0;

  const grouped = useMemo(() => {
    const groups = {};
    (data?.results || []).forEach((event) => {
      const key = formatDateGroup(event.created);
      if (!groups[key]) groups[key] = [];
      groups[key].push(event);
    });
    return Object.entries(groups);
  }, [data?.results]);

  const hasFilters = eventTypes.length > 0 || severities.length > 0 || search.trim() || dateRange;

  const clearFilters = () => {
    setEventTypes([]);
    setSeverities([]);
    setSearch("");
    setDateRange(null);
    setPage(1);
  };

  return (
    <Drawer
      title={
        <Flex align="center" gap={12}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #fa8c16 0%, #ff4d4f 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaBolt style={{ color: "#fff", fontSize: 18 }} />
          </div>
          <Flex vertical gap={0}>
            <Title level={5} style={{ margin: 0 }}>
              {pointName ? `Eventos: ${pointName}` : "Eventos del sistema"}
            </Title>
            <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
              {count} evento{count !== 1 ? "s" : ""} encontrado{count !== 1 ? "s" : ""}
            </Text>
          </Flex>
        </Flex>
      }
      open={open}
      onClose={onClose}
      width={{ xs: "100%", md: 720 }}
      styles={{ body: { padding: "16px 20px" } }}
    >
      <Flex vertical gap={14}>
        <Flex wrap="wrap" gap={8} align="center">
          <Select
            mode="multiple"
            size="small"
            placeholder="Tipo de evento"
            value={eventTypes}
            onChange={setEventTypes}
            options={EVENT_TYPES}
            style={{ minWidth: 160, flex: 1 }}
            maxTagCount="responsive"
          />
          <Select
            mode="multiple"
            size="small"
            placeholder="Severidad"
            value={severities}
            onChange={setSeverities}
            options={SEVERITIES}
            style={{ minWidth: 140, flex: 1 }}
            maxTagCount="responsive"
          />
          <RangePicker
            size="small"
            value={dateRange}
            onChange={setDateRange}
            style={{ minWidth: 220, flex: 1 }}
            showTime={{ format: "HH:mm" }}
            format="DD/MM/YYYY HH:mm"
          />
          <Input.Search
            size="small"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={() => setPage(1)}
            style={{ minWidth: 160, flex: 1 }}
            allowClear
          />
          {hasFilters && (
            <Button size="small" icon={<FaFilter />} onClick={clearFilters}>
              Limpiar
            </Button>
          )}
        </Flex>

        {loading && !data ? (
          <Flex justify="center" style={{ padding: 40 }}>
            <Spin size="large" tip="Cargando eventos..." />
          </Flex>
        ) : error ? (
          <Flex vertical align="center" gap={8} style={{ padding: 32, textAlign: "center" }}>
            <FaExclamationTriangle style={{ fontSize: 32, color: token.colorError }} />
            <Text strong style={{ color: token.colorError }}>Error cargando eventos</Text>
            <Text style={{ color: token.colorTextSecondary, fontSize: 12 }}>{error.message}</Text>
          </Flex>
        ) : (data?.results || []).length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text style={{ color: token.colorTextSecondary }}>
                {hasFilters ? "No hay eventos con los filtros seleccionados" : "No hay eventos registrados"}
              </Text>
            }
            style={{ padding: 32 }}
          />
        ) : (
          <>
            <Flex vertical gap={16}>
              {grouped.map(([dateLabel, events]) => (
                <Flex vertical gap={10} key={dateLabel}>
                  <Text
                    strong
                    style={{
                      fontSize: 12,
                      color: token.colorTextSecondary,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      borderBottom: `1px solid ${token.colorBorder}`,
                      paddingBottom: 6,
                    }}
                  >
                    {dateLabel}
                  </Text>
                  <Flex vertical gap={8}>
                    {events.map((event) => {
                      const Icon = EVENT_ICONS[event.event_type] || FaExclamationTriangle;
                      const eventColor = EVENT_COLORS[event.event_type] || token.colorTextSecondary;
                      const severityColor = SEVERITY_COLORS[event.severity] || token.colorTextSecondary;
                      return (
                        <Flex
                          key={event.id}
                          gap={12}
                          style={{
                            padding: "12px 14px",
                            borderRadius: token.borderRadius,
                            background: token.colorBgContainer,
                            border: `1px solid ${token.colorBorderSecondary}`,
                            transition: "all 0.2s ease",
                          }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              background: `${eventColor}15`,
                              border: `1px solid ${eventColor}30`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Icon style={{ fontSize: 15, color: eventColor }} />
                          </div>
                          <Flex vertical gap={4} style={{ flex: 1, minWidth: 0 }}>
                            <Flex wrap="wrap" gap={8} align="center">
                              <Text strong style={{ fontSize: 13, color: token.colorText }}>
                                {event.title}
                              </Text>
                              <Tag
                                color={severityColor}
                                style={{ margin: 0, fontSize: 10, fontWeight: 600, lineHeight: "18px" }}
                              >
                                {event.severity}
                              </Tag>
                              <Tag style={{ margin: 0, fontSize: 10, lineHeight: "18px" }}>
                                {EVENT_TYPES.find((t) => t.value === event.event_type)?.label || event.event_type}
                              </Tag>
                            </Flex>
                            <Text style={{ fontSize: 12, color: token.colorTextSecondary, lineHeight: 1.4 }}>
                              {event.message}
                            </Text>
                            <Text style={{ fontSize: 11, color: token.colorTextTertiary }}>
                              {formatDateTime(event.created)}
                              {event.point?.title && ` · ${event.point.title}`}
                            </Text>
                          </Flex>
                        </Flex>
                      );
                    })}
                  </Flex>
                </Flex>
              ))}
            </Flex>

            <Flex justify="flex-end" style={{ marginTop: 8 }}>
              <Pagination
                current={page}
                pageSize={PAGE_SIZE}
                total={count}
                showSizeChanger={false}
                size="small"
                onChange={(p) => setPage(p)}
              />
            </Flex>
          </>
        )}
      </Flex>
    </Drawer>
  );
};

export default React.memo(SystemEventsDrawer);
