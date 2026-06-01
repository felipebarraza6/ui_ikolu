import React, { useMemo } from "react";
import { Drawer, Flex, Typography, Table, Tag, Statistic, Button, Empty } from "antd";
import { FaArrowLeft, FaArrowRight, FaExclamationTriangle, FaChartLine } from "react-icons/fa";
import moment from "moment";
import ApexChartWrapper from "./ApexChartWrapper";
import { extractRecordNum } from "./measurements/MeasurementUtils";

const { Text, Title } = Typography;

const CCFlowAnalysisDrawer = ({ 
  open, 
  onClose, 
  pointName, 
  date, 
  authorizedFlow, 
  data, 
  loading,
  onNavigateDate 
}) => {
  const { analysis, chartData, incidents } = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return { analysis: null, chartData: [], incidents: [] };
    }

    const measurements = data;
    const totalMeasurements = measurements.length;
    
    let exceededCount = 0;
    let nearLimitCount = 0;
    let maxFlow = 0;
    let maxFlowTime = null;
    const exceededRecords = [];
    const nearLimitRecords = [];
    const chartPoints = [];

    measurements.forEach((m) => {
      const flow = extractRecordNum(m.flow) ?? extractRecordNum(m.caudal) ?? 0;
      const time = moment(m.date_time || m.date_time_medition || m.timestamp || m.time || m.created_at);
      const timeStr = time.format("HH:mm");
      
      // Track max flow
      if (flow > maxFlow) {
        maxFlow = flow;
        maxFlowTime = timeStr;
      }

      // Calculate percentages and status
      const pctOfLimit = authorizedFlow > 0 ? (flow / authorizedFlow) * 100 : 0;
      const exceeded = authorizedFlow > 0 && flow > authorizedFlow;
      const nearLimit = authorizedFlow > 0 && flow >= authorizedFlow * 0.8 && flow <= authorizedFlow;

      // Chart data
      chartPoints.push({
        time: timeStr,
        flow: flow,
        limit: authorizedFlow,
        exceeded,
        nearLimit,
      });

      // Incidents
      if (exceeded) {
        exceededCount++;
        exceededRecords.push({
          time: timeStr,
          flow: Number(flow).toFixed(1),
          pct: `${Math.round(pctOfLimit)}%`,
          status: "Superó",
          key: `exceeded-${timeStr}`,
        });
      } else if (nearLimit) {
        nearLimitCount++;
        nearLimitRecords.push({
          time: timeStr,
          flow: Number(flow).toFixed(1),
          pct: `${Math.round(pctOfLimit)}%`,
          status: "Cercano",
          key: `near-${timeStr}`,
        });
      }
    });

    const allIncidents = [...exceededRecords, ...nearLimitRecords].sort((a, b) => 
      a.time.localeCompare(b.time)
    );

    return {
      analysis: {
        totalMeasurements,
        exceededCount,
        nearLimitCount,
        withinLimitCount: totalMeasurements - exceededCount - nearLimitCount,
        maxFlow: Number(maxFlow).toFixed(1),
        maxFlowTime,
      },
      chartData: chartPoints,
      incidents: allIncidents,
    };
  }, [data, authorizedFlow]);

  if (!analysis) {
    return (
      <Drawer
        title={
          <Flex justify="space-between" align="center">
            <div>
              <Title level={5} style={{ margin: 0 }}>{pointName}</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {moment(date).format("DD/MM/YYYY")} • Límite: {authorizedFlow} L/s
              </Text>
            </div>
          </Flex>
        }
        open={open}
        onClose={onClose}
        width={700}
      >
        <Empty description="Sin datos de caudal para este día" />
      </Drawer>
    );
  }

  return (
    <Drawer
      title={
        <Flex justify="space-between" align="center">
          <div>
            <Title level={5} style={{ margin: 0 }}>{pointName}</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {moment(date).format("DD/MM/YYYY")} • Límite: {authorizedFlow} L/s
            </Text>
          </div>
          <Flex gap={8}>
            <Button size="small" icon={<FaArrowLeft />} onClick={() => onNavigateDate(-1)} />
            <Button size="small" icon={<FaArrowRight />} onClick={() => onNavigateDate(1)} />
          </Flex>
        </Flex>
      }
      open={open}
      onClose={onClose}
      width={700}
      styles={{ body: { padding: 16 } }}
    >
      {/* KPIs */}
      <Flex gap={12} style={{ marginBottom: 20 }}>
        {analysis.exceededCount > 0 && (
          <div style={{ flex: 1, padding: 16, background: "#fff2f0", borderRadius: 8, border: "1px solid #ffccc7" }}>
            <Statistic 
              title={
                <Flex align="center" gap={4}>
                  <FaExclamationTriangle style={{ color: "#ff4d4f" }} />
                  <Text style={{ color: "#ff4d4f", fontSize: 12 }}>Superaciones</Text>
                </Flex>
              }
              value={analysis.exceededCount} 
              suffix="veces"
              valueStyle={{ color: "#ff4d4f", fontSize: 28, fontWeight: 700 }}
            />
          </div>
        )}
        {analysis.nearLimitCount > 0 && (
          <div style={{ flex: 1, padding: 16, background: "#fff7e6", borderRadius: 8, border: "1px solid #ffd591" }}>
            <Statistic 
              title={
                <Flex align="center" gap={4}>
                  <FaChartLine style={{ color: "#fa8c16" }} />
                  <Text style={{ color: "#fa8c16", fontSize: 12 }}>Cercano al límite</Text>
                </Flex>
              }
              value={analysis.nearLimitCount} 
              suffix="veces"
              valueStyle={{ color: "#fa8c16", fontSize: 28, fontWeight: 700 }}
            />
          </div>
        )}
        {analysis.exceededCount === 0 && analysis.nearLimitCount === 0 && (
          <div style={{ flex: 1, padding: 16, background: "#f6ffed", borderRadius: 8, border: "1px solid #b7eb8f" }}>
            <Statistic 
              title={
                <Flex align="center" gap={4}>
                  <Text style={{ color: "#52c41a", fontSize: 12 }}>Dentro del límite</Text>
                </Flex>
              }
              value={analysis.withinLimitCount} 
              suffix="mediciones"
              valueStyle={{ color: "#52c41a", fontSize: 28, fontWeight: 700 }}
            />
          </div>
        )}
      </Flex>

      {/* Caudal máximo */}
      <Flex align="center" gap={8} style={{ marginBottom: 16, padding: 12, background: "#f5f5f5", borderRadius: 6 }}>
        <Text strong>Caudal máximo del día:</Text>
        <Text style={{ fontSize: 18, color: analysis.maxFlow > authorizedFlow ? "#ff4d4f" : "#1890ff" }}>
          {analysis.maxFlow} L/s
        </Text>
        {analysis.maxFlowTime && (
          <Text type="secondary">a las {analysis.maxFlowTime}</Text>
        )}
        {authorizedFlow > 0 && (
          <Tag color={analysis.maxFlow > authorizedFlow ? "error" : "success"}>
            {Math.round((analysis.maxFlow / authorizedFlow) * 100)}% del límite
          </Tag>
        )}
      </Flex>

      {/* Gráfico */}
      {chartData.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Text strong style={{ fontSize: 14, marginBottom: 8, display: "block" }}>
            Caudal vs Límite Autorizado
          </Text>
          <ApexChartWrapper
            data={chartData}
            metric="flow"
            title="Caudal"
            token={{ colorPrimary: "#1890ff", colorText: "#333" }}
          />
          {/* Leyenda */}
          <Flex gap={16} justify="center" style={{ marginTop: 8 }}>
            <Flex align="center" gap={4}>
              <div style={{ width: 12, height: 12, background: "#ff4d4f", borderRadius: 2 }} />
              <Text style={{ fontSize: 11 }}>Superó límite</Text>
            </Flex>
            <Flex align="center" gap={4}>
              <div style={{ width: 12, height: 12, background: "#fa8c16", borderRadius: 2 }} />
              <Text style={{ fontSize: 11 }}>Cercano (≥80%)</Text>
            </Flex>
            <Flex align="center" gap={4}>
              <div style={{ width: 12, height: 12, background: "#52c41a", borderRadius: 2 }} />
              <Text style={{ fontSize: 11 }}>Dentro límite</Text>
            </Flex>
          </Flex>
        </div>
      )}

      {/* Tabla de incidencias */}
      {incidents.length > 0 && (
        <div>
          <Text strong style={{ fontSize: 14, marginBottom: 8, display: "block" }}>
            Registros de alerta ({incidents.length})
          </Text>
          <Table
            size="small"
            dataSource={incidents}
            columns={[
              { 
                title: "Hora", 
                dataIndex: "time", 
                width: 80,
                render: (v) => <Text strong>{v}</Text>
              },
              { 
                title: "Caudal", 
                dataIndex: "flow", 
                width: 100,
                render: (v) => <Text>{v} L/s</Text>
              },
              { 
                title: "% del límite", 
                dataIndex: "pct", 
                width: 100,
                render: (v) => <Tag color="error">{v}</Tag>
              },
              { 
                title: "Estado", 
                dataIndex: "status", 
                width: 100,
                render: (v) => (
                  <Tag color={v === "Superó" ? "error" : "warning"} style={{ fontWeight: 600 }}>
                    {v}
                  </Tag>
                )
              },
            ]}
            pagination={{ pageSize: 10, size: "small" }}
            locale={{ emptyText: "Sin registros de alerta" }}
          />
        </div>
      )}
    </Drawer>
  );
};

export default React.memo(CCFlowAnalysisDrawer);
