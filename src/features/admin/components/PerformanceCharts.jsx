import React, { memo, useMemo } from "react";
import { Row, Col, Flex, Typography, Spin, Empty } from "antd";
import "chart.js/auto";
import { Doughnut } from "react-chartjs-2";
import ReactApexChart from "react-apexcharts";
import { SmartCard } from "../../../shared/ui";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import { smarthydroColors as c } from "../../../theme/smarthydro.tokens";
import { inferPointStatus, STATUS } from "../utils/pointStatus";

const { Text } = Typography;

const PerformanceCharts = memo(({ telemetryMetrics, pointsStatus, loading }) => {
  const token = useIkoluToken();

  const statusCounts = useMemo(() => {
    const list = pointsStatus?.results || [];
    return list.reduce(
      (acc, p) => {
        const st = inferPointStatus(p);
        if (st === STATUS.ACTIVE) acc.active += 1;
        else if (st === STATUS.DISCONNECTED) acc.disconnected += 1;
        else if (st === STATUS.NO_DATA) acc.noData += 1;
        else if (st === STATUS.DISABLED) acc.disabled += 1;
        else acc.other += 1;
        return acc;
      },
      { active: 0, disconnected: 0, noData: 0, disabled: 0, other: 0 }
    );
  }, [pointsStatus]);

  const doughnutData = useMemo(
    () => ({
      labels: ["Activos", "Desconectados", "Sin datos", "Desactivados", "Otros"],
      datasets: [
        {
          data: [
            statusCounts.active,
            statusCounts.disconnected,
            statusCounts.noData,
            statusCounts.disabled,
            statusCounts.other,
          ],
          backgroundColor: [
            c.semantic.success,
            c.semantic.error,
            c.semantic.warning,
            c.neutral[500],
            c.neutral[300],
          ],
          borderColor: token.colorBgContainer,
          borderWidth: 2,
        },
      ],
    }),
    [statusCounts, token.colorBgContainer]
  );

  const lineSeries = useMemo(() => {
    if (!telemetryMetrics) return { categories: [], series: [] };

    const hourly = telemetryMetrics.hourly_records || [];
    const daily = telemetryMetrics.daily_records || [];

    // Preferir datos horarios si hay suficientes; si no, diarios
    const source = hourly.length >= 2 ? hourly : daily;
    const isHourly = hourly.length >= 2;

    const categories = source.map((item) =>
      isHourly
        ? item.hour?.slice(11, 16) || item.hour
        : item.date?.slice(5, 10) || item.date
    );
    const records = source.map((item) => item.count ?? item.records ?? 0);
    const errors = source.map((item) => item.errors ?? item.error_count ?? 0);

    const series = [];
    if (records.some((v) => v > 0)) {
      series.push({ name: "Registros", data: records });
    }
    if (errors.some((v) => v > 0)) {
      series.push({ name: "Errores", data: errors });
    }

    return { categories, series };
  }, [telemetryMetrics]);

  const lineOptions = useMemo(
    () => ({
      chart: {
        type: "line",
        toolbar: { show: false },
        animations: { enabled: true },
        background: "transparent",
        fontFamily: token.fontFamily,
      },
      theme: { mode: token.isDark ? "dark" : "light" },
      stroke: { curve: "smooth", width: 3 },
      colors: [token.colorPrimary, token.colorError],
      xaxis: {
        categories: lineSeries.categories,
        labels: { style: { colors: token.colorTextSecondary } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: { style: { colors: token.colorTextSecondary } },
      },
      grid: { borderColor: token.colorBorderSecondary, strokeDashArray: 4 },
      legend: { position: "top", labels: { colors: token.colorText } },
      tooltip: { theme: token.isDark ? "dark" : "light" },
      dataLabels: { enabled: false },
    }),
    [lineSeries.categories, token]
  );

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={14}>
        <SmartCard
          title={
            <Flex align="center" gap={8}>
              <Text strong>Telemetría Procesada</Text>
            </Flex>
          }
          style={{ height: "100%" }}
        >
          {loading && !telemetryMetrics ? (
            <Flex justify="center" align="center" style={{ minHeight: 300 }}>
              <Spin />
            </Flex>
          ) : lineSeries.series.length === 0 ? (
            <Empty description="Sin datos de telemetría" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <ReactApexChart
              options={lineOptions}
              series={lineSeries.series}
              type="line"
              height={320}
            />
          )}
        </SmartCard>
      </Col>
      <Col xs={24} lg={10}>
        <SmartCard
          title={
            <Flex align="center" gap={8}>
              <Text strong>Distribución de Estado de Puntos</Text>
            </Flex>
          }
          style={{ height: "100%" }}
        >
          {loading && !pointsStatus?.results?.length ? (
            <Flex justify="center" align="center" style={{ minHeight: 300 }}>
              <Spin />
            </Flex>
          ) : (
            <Flex justify="center" align="center" style={{ minHeight: 300 }}>
              <div style={{ width: 260, height: 260 }}>
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: { color: token.colorText, font: { family: token.fontFamily } },
                      },
                    },
                    cutout: "60%",
                  }}
                />
              </div>
            </Flex>
          )}
        </SmartCard>
      </Col>
    </Row>
  );
});

PerformanceCharts.displayName = "PerformanceCharts";

export default PerformanceCharts;
