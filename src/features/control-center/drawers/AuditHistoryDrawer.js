import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Drawer, Flex, Typography, Table, Tag, theme, Skeleton } from "antd";
import { FaTimes, FaExclamationTriangle, FaChartLine } from "react-icons/fa";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale/es";
import orchestrator from "../../../api/orchestrator";

const { Text, Title } = Typography;
const { useToken } = theme;

const PAGE_SIZE = 20;

const configByType = {
  exceeded: {
    icon: FaExclamationTriangle,
    title: "Excedencias de caudal",
    subtitle: "eventos donde el caudal superó el límite autorizado",
    color: "#ff4d4f",
    bg: "rgba(255, 77, 79, 0.08)",
    border: "rgba(255, 77, 79, 0.25)",
    fetcher: (pointId, params) => orchestrator.flowHistory(pointId, params),
  },
  near_limit: {
    icon: FaChartLine,
    title: "Cercanías al límite",
    subtitle: "eventos entre el 90% y 100% del caudal autorizado",
    color: "#fa8c16",
    bg: "rgba(250, 140, 22, 0.08)",
    border: "rgba(250, 140, 22, 0.25)",
    fetcher: (pointId, params) => orchestrator.nearLimitHistory(pointId, params),
  },
};

const AuditHistoryDrawer = ({ open, onClose, point, type = "exceeded" }) => {
  const { token } = useToken();
  const cfg = configByType[type] || configByType.exceeded;
  const Icon = cfg.icon;

  const pointName = point?.title || point?.point_name || point?.name || "—";
  const pointId = point?.id ?? point?.point_id;
  const authorizedFlow = point?.authorized_flow ?? 0;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  const loadData = useCallback(async (currentPage) => {
    if (!pointId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await cfg.fetcher(pointId, { page: currentPage, page_size: PAGE_SIZE, days: 90 });
      setData(result);
    } catch (err) {
      console.error(`[AuditHistoryDrawer] Error cargando ${type}:`, err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [pointId, type, cfg]);

  useEffect(() => {
    if (open && pointId) {
      setPage(1);
      loadData(1);
    }
    if (!open) {
      setData(null);
      setError(null);
    }
  }, [open, pointId, loadData]);

  const measurements = useMemo(() => data?.results || [], [data]);
  const total = data?.count || 0;
  const threshold = data?.threshold ?? authorizedFlow;

  const columns = useMemo(
    () => [
      {
        title: "Fecha/Hora",
        dataIndex: "date_time",
        width: 170,
        render: (date) => (
          <Text style={{ fontSize: 12 }}>
            {format(parseISO(date), "dd/MM/yyyy HH:mm", { locale: es })}
          </Text>
        ),
      },
      {
        title: "% del límite",
        align: "right",
        width: 110,
        render: (_, record) => {
          const flow = record.flow ?? record.flow_lps ?? 0;
          const pct = threshold > 0 ? (flow / threshold) * 100 : 0;
          return (
            <Text strong style={{ fontSize: 13, color: cfg.color }}>
              {Math.round(pct)}%
            </Text>
          );
        },
      },
      {
        title: "Autorizado",
        align: "right",
        width: 110,
        render: () => (
          <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
            {Number(threshold).toFixed(1)} L/s
          </Text>
        ),
      },
      {
        title: "Caudal",
        dataIndex: "flow",
        align: "right",
        width: 110,
        render: (flow) => (
          <Text strong style={{ fontSize: 13, color: cfg.color }}>
            {Number(flow ?? 0).toFixed(1)} L/s
          </Text>
        ),
      },
    ],
    [threshold, cfg, token]
  );

  return (
    <Drawer
      title={
        <Flex justify="space-between" align="center">
          <Flex vertical gap={2}>
            <Title level={5} style={{ margin: 0 }}>{pointName}</Title>
            <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>{cfg.title}</Text>
          </Flex>
          <FaTimes style={{ cursor: "pointer", fontSize: 16, color: "#999" }} onClick={onClose} />
        </Flex>
      }
      open={open}
      onClose={onClose}
      width={{ xs: "100%", md: 900 }}
      styles={{ body: { padding: "16px 24px" } }}
    >
      <Flex vertical gap={16} style={{ width: "100%" }}>
        <Flex align="center" gap={10}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon style={{ fontSize: 16, color: cfg.color }} />
          </div>
          <Flex vertical gap={2}>
            <Text strong style={{ fontSize: 15 }}>{cfg.title}</Text>
            <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>{cfg.subtitle}</Text>
          </Flex>
          {total > 0 && (
            <Tag color={type === "exceeded" ? "red" : "orange"} style={{ margin: 0 }}>
              {total} eventos
            </Tag>
          )}
        </Flex>

        {error ? (
          <div style={{ padding: 24, textAlign: "center", background: "rgba(255, 77, 79, 0.08)", borderRadius: token.borderRadius, border: "1px solid rgba(255, 77, 79, 0.2)" }}>
            <Text strong style={{ color: token.colorError }}>Error cargando historial</Text>
            <Text style={{ fontSize: 12, color: token.colorTextSecondary, display: "block" }}>{error.message}</Text>
          </div>
        ) : loading && !data ? (
          <Skeleton active paragraph={{ rows: 6 }} style={{ width: "100%" }} />
        ) : measurements.length === 0 ? (
          <div style={{ padding: "32px 24px", textAlign: "center", background: cfg.bg, borderRadius: token.borderRadius, border: `1px solid ${cfg.border}` }}>
            <Icon style={{ fontSize: 32, color: cfg.color, marginBottom: 12 }} />
            <Text strong style={{ fontSize: 14, color: cfg.color, display: "block" }}>Sin {cfg.title.toLowerCase()}</Text>
            <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>No se registraron eventos en los últimos 90 días</Text>
          </div>
        ) : (
          <>
            <Table
              size="small"
              bordered
              loading={loading}
              dataSource={measurements.map((m, i) => ({ ...m, key: i }))}
              columns={columns}
              pagination={{
                current: page,
                pageSize: PAGE_SIZE,
                total,
                showSizeChanger: false,
                size: "small",
                onChange: (p) => {
                  setPage(p);
                  loadData(p);
                },
              }}
            />
          </>
        )}
      </Flex>
    </Drawer>
  );
};

export default React.memo(AuditHistoryDrawer);
