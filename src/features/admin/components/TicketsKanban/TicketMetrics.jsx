import React, { useMemo } from "react";
import { Row, Col } from "antd";
import {
  FileTextOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ThunderboltOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import { differenceInHours, parseISO } from "date-fns";
import { SmartKPICard } from "../../../../shared/ui";
import { useIkoluToken } from "../../../../hooks/useIkoluToken";

/**
 * KPIs de gestión de tickets calculados desde la lista y las stats.
 */
const TicketMetrics = ({ tickets, stats, loading }) => {
  const token = useIkoluToken();

  const metrics = useMemo(() => {
    const total = tickets.length || stats?.total_tickets || 0;
    const open = tickets.filter((t) => t.status?.toLowerCase?.() === "open").length;
    const inProgress = tickets.filter((t) => t.status?.toLowerCase?.() === "in_progress").length;
    const closed = tickets.filter((t) => ["closed", "resolved"].includes(t.status?.toLowerCase?.())).length;
    const unassigned = tickets.filter((t) => !t.assigned_to).length;
    const critical = tickets.filter((t) =>
      ["critical", "urgent"].includes(t.priority?.toLowerCase?.())
    ).length;

    const resolvedTickets = tickets.filter((t) =>
      ["closed", "resolved"].includes(t.status?.toLowerCase?.())
    );
    const avgResolutionHours = resolvedTickets.length
      ? resolvedTickets.reduce((sum, t) => {
          try {
            const created = parseISO(t.created_at);
            const closedAt = parseISO(t.updated_at || t.resolved_at || t.created_at);
            return sum + differenceInHours(closedAt, created);
          } catch {
            return sum;
          }
        }, 0) / resolvedTickets.length
      : 0;

    const resolutionRate = total ? Math.round((closed / total) * 100) : 0;

    return {
      total,
      open,
      inProgress,
      closed,
      unassigned,
      critical,
      avgResolutionHours: Math.round(avgResolutionHours),
      resolutionRate,
    };
  }, [tickets, stats]);

  const kpis = [
    {
      icon: <FileTextOutlined />,
      label: "Total Tickets",
      value: metrics.total,
      gradient: token.gradientPrimary,
    },
    {
      icon: <ExclamationCircleOutlined />,
      label: "Abiertos",
      value: metrics.open,
      gradient: `linear-gradient(135deg, ${token.colorWarning} 0%, ${token.colorError} 100%)`,
    },
    {
      icon: <ClockCircleOutlined />,
      label: "En Progreso",
      value: metrics.inProgress,
      gradient: `linear-gradient(135deg, ${token.colorInfo} 0%, ${token.colorCorporateBlueLight} 100%)`,
    },
    {
      icon: <CheckCircleOutlined />,
      label: "Resueltos",
      value: metrics.closed,
      gradient: `linear-gradient(135deg, ${token.colorSuccess} 0%, #3DB8A8 100%)`,
    },
    {
      icon: <PercentageOutlined />,
      label: "Tasa Resolución",
      value: `${metrics.resolutionRate}%`,
      gradient: `linear-gradient(135deg, ${token.colorCorporateBlueMid} 0%, ${token.colorCorporateBlueLight} 100%)`,
    },
    {
      icon: <UserOutlined />,
      label: "Sin Asignar",
      value: metrics.unassigned,
      gradient: `linear-gradient(135deg, #F4A261 0%, #E76F51 100%)`,
    },
    {
      icon: <ThunderboltOutlined />,
      label: "Críticos/Urgentes",
      value: metrics.critical,
      gradient: `linear-gradient(135deg, #E76F51 0%, #c0392b 100%)`,
    },
    {
      icon: <ClockCircleOutlined />,
      label: "Tiempo Prom. Resolución",
      value: `${metrics.avgResolutionHours}h`,
      gradient: token.gradientAccent,
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {kpis.map((kpi, idx) => (
        <Col key={idx} xs={12} sm={12} md={8} lg={6} xl={3}>
          <SmartKPICard
            icon={kpi.icon}
            label={kpi.label}
            value={kpi.value}
            gradient={kpi.gradient}
            loading={loading}
            style={{ minHeight: 72 }}
          />
        </Col>
      ))}
    </Row>
  );
};

export default TicketMetrics;
