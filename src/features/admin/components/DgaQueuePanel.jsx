import React, { memo, useCallback, useMemo } from "react";
import { Flex, Typography, Spin, Empty, Button, Tag, Tooltip, message } from "antd";
import {
  SyncOutlined,
  ClearOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import ReactApexChart from "react-apexcharts";
import { SmartCard } from "../../../shared/ui";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import sh from "../../../api/sh/endpoints";

const { Text, Paragraph } = Typography;

const DgaQueuePanel = memo(({ data, loading, onChange }) => {
  const token = useIkoluToken();

  const handleRequeue = useCallback(async () => {
    try {
      await sh.management.requeueDga({ only_errors: true });
      message.success("DGA fallidos reencolados correctamente");
      onChange?.();
    } catch (err) {
      console.error("[DgaQueuePanel] requeueDga error:", err);
      message.error(err?.response?.data?.detail || "Error al reencolar DGA");
    }
  }, [onChange]);

  const handleClear = useCallback(async () => {
    try {
      await sh.management.clearDgaQueue({ only_errors: true });
      message.success("Errores de cola DGA limpiados");
      onChange?.();
    } catch (err) {
      console.error("[DgaQueuePanel] clearDgaQueue error:", err);
      message.error(err?.response?.data?.detail || "Error al limpiar cola DGA");
    }
  }, [onChange]);

  const items = React.useMemo(() => {
    if (!data) return [];
    const queue = data.queue_status || data;
    return [
      {
        key: "pending",
        label: "Pendientes",
        value: queue.pending ?? queue.total ?? 0,
        icon: <InboxOutlined />,
        color: token.colorInfo,
      },
      {
        key: "errors",
        label: "Errores",
        value: queue.errors ?? queue.error_count ?? queue.failed ?? 0,
        icon: <ExclamationCircleOutlined />,
        color: token.colorError,
      },
      {
        key: "old_records",
        label: "Registros antiguos",
        value: queue.old_records ?? "—",
        icon: <ClockCircleOutlined />,
        color: token.colorTextSecondary,
      },
      {
        key: "by_point",
        label: "Puntos con cola",
        value: (data.by_point || []).length,
        icon: <CheckCircleOutlined />,
        color: token.colorSuccess,
      },
    ];
  }, [data, token]);

  const byPoint = data?.by_point || [];
  const chartData = useMemo(() => {
    const categories = byPoint.map((p) =>
      p.point_name || p.name || p.title || `Punto ${p.point_id || p.id}`
    );
    const pending = byPoint.map((p) => p.pending ?? p.pending_count ?? 0);
    const errors = byPoint.map((p) => p.errors ?? p.error_count ?? p.failed ?? 0);
    return { categories, pending, errors };
  }, [byPoint]);

  const chartOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        stacked: true,
        toolbar: { show: false },
        animations: { enabled: true },
        background: "transparent",
        fontFamily: token.fontFamily,
      },
      theme: { mode: token.isDark ? "dark" : "light" },
      colors: [token.colorInfo, token.colorError],
      plotOptions: {
        bar: { borderRadius: 4, columnWidth: "45%" },
      },
      xaxis: {
        categories: chartData.categories,
        labels: {
          style: { colors: token.colorTextSecondary, fontSize: "11px" },
          rotate: -45,
          trim: true,
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: { style: { colors: token.colorTextSecondary } },
        title: { text: "registros", style: { color: token.colorTextSecondary } },
      },
      grid: { borderColor: token.colorBorderSecondary, strokeDashArray: 4 },
      legend: { position: "top", labels: { colors: token.colorText } },
      tooltip: { theme: token.isDark ? "dark" : "light" },
      dataLabels: { enabled: false },
    }),
    [chartData.categories, token]
  );

  const chartSeries = useMemo(
    () => [
      { name: "Pendientes", data: chartData.pending },
      { name: "Errores", data: chartData.errors },
    ],
    [chartData]
  );

  const hasChartData =
    chartData.pending.some((v) => v > 0) || chartData.errors.some((v) => v > 0);

  return (
    <SmartCard
      title={
        <Flex align="center" justify="space-between" style={{ width: "100%" }}>
          <Flex align="center" gap={8}>
            <SyncOutlined style={{ color: token.colorPrimary }} />
            <Text strong>Cola DGA</Text>
          </Flex>
          <Flex gap={8}>
            <Tooltip title="Reencolar fallidos">
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={handleRequeue}
                loading={loading}
              >
                Reencolar
              </Button>
            </Tooltip>
            <Tooltip title="Limpiar errores">
              <Button
                size="small"
                danger
                icon={<ClearOutlined />}
                onClick={handleClear}
                loading={loading}
              >
                Limpiar
              </Button>
            </Tooltip>
          </Flex>
        </Flex>
      }
      style={{ height: "100%" }}
    >
      {loading && !data ? (
        <Flex justify="center" align="center" style={{ minHeight: 180 }}>
          <Spin />
        </Flex>
      ) : !data ? (
        <Empty description="Sin datos de cola DGA" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Flex vertical gap={12}>
          <Flex wrap="wrap" gap={12}>
            {items.map((item) => (
              <Flex
                key={item.key}
                vertical
                align="center"
                justify="center"
                style={{
                  flex: "1 1 100px",
                  minWidth: 90,
                  padding: "12px 8px",
                  borderRadius: token.borderRadius,
                  background: token.colorFillTertiary,
                  border: `1px solid ${token.colorBorderSecondary}`,
                }}
              >
                <Text style={{ fontSize: 20, color: item.color }}>{item.icon}</Text>
                <Text strong style={{ fontSize: 18, color: item.color }}>
                  {item.value}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {item.label}
                </Text>
              </Flex>
            ))}
          </Flex>
          {hasChartData && (
            <div style={{ minHeight: 220 }}>
              <ReactApexChart
                options={chartOptions}
                series={chartSeries}
                type="bar"
                height={240}
              />
            </div>
          )}
          {data.last_error && (
            <Paragraph type="danger" ellipsis={{ rows: 2 }} style={{ margin: 0, fontSize: 12 }}>
              Último error: {data.last_error}
            </Paragraph>
          )}
          {data.next_retry && (
            <Tag color="processing" style={{ alignSelf: "flex-start" }}>
              Próximo reintento: {data.next_retry}
            </Tag>
          )}
        </Flex>
      )}
    </SmartCard>
  );
});

DgaQueuePanel.displayName = "DgaQueuePanel";

export default DgaQueuePanel;
