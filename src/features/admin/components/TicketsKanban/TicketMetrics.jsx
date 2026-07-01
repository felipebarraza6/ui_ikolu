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
  WarningOutlined,
} from "@ant-design/icons";
import { differenceInHours, parseISO } from "date-fns";
import { SmartKPICard } from "../../../../shared/ui";
import { useIkoluToken } from "../../../../hooks/useIkoluToken";
import { isTicketClosed } from "../../constants/tickets";

/**
 * KPIs compactos de gestión de tickets.
 *
 * Los conteos agregados se leen desde `stats` (endpoint /api/ik/tickets/stats/)
 * para reflejar el universo completo, no solo la página actual.
 */
const TicketMetrics = ({ tickets, stats, loading }) => {
  const token = useIkoluToken();

  const byStatus = stats?.by_status || {};
  const byPriority = stats?.by_priority || {};

  const metrics = useMemo(() => {
    const total = stats?.total ?? tickets.length ?? 0;

    const open = byStatus.ABIERTO || 0;
    const inProgress =
      (byStatus.EN_ANALISIS || 0) +
      (byStatus.EN_ORDEN_TRABAJO || 0) +
      (byStatus.ESPERA_CLIENTE || 0) +
      (byStatus.ESPERA_PROVEEDOR || 0);
    const closed =
      (byStatus.RESUELTO || 0) +
      (byStatus.CERRADO || 0) +
      (byStatus.CANCELADO || 0);
    const critical = (byPriority.CRITICA || 0) + (byPriority.ALTA || 0);

    const unassigned = tickets.filter((t) => !t.assigned_to).length;

    const resolvedTickets = tickets.filter((t) => isTicketClosed(t.status));
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
      critical,
      unassigned,
      avgResolutionHours: Math.round(avgResolutionHours),
      resolutionRate,
      slaOverdue: (stats?.sla_overdue_response || 0) + (stats?.sla_overdue_resolution || 0),
    };
  }, [tickets, stats, byStatus, byPriority]);

  const kpis = [
    { icon: <FileTextOutlined />, label: "Total", value: metrics.total },
    { icon: <ExclamationCircleOutlined />, label: "Abiertos", value: metrics.open },
    { icon: <ClockCircleOutlined />, label: "En Progreso", value: metrics.inProgress },
    { icon: <CheckCircleOutlined />, label: "Resueltos", value: metrics.closed },
    { icon: <PercentageOutlined />, label: "Tasa", value: `${metrics.resolutionRate}%` },
    { icon: <UserOutlined />, label: "Sin Asignar", value: metrics.unassigned },
    { icon: <ThunderboltOutlined />, label: "Críticos", value: metrics.critical },
    { icon: <WarningOutlined />, label: "SLA Vencidos", value: metrics.slaOverdue },
  ];

  return (
    <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
      {kpis.map((kpi, idx) => (
        <Col key={idx} xs={12} sm={8} md={6} lg={4} xl={3}>
          <SmartKPICard
            icon={kpi.icon}
            label={kpi.label}
            value={kpi.value}
            loading={loading}
            style={{ minHeight: 88 }}
            valueStyle={{ fontSize: 22 }}
            labelStyle={{ fontSize: 10, height: 28, lineHeight: "14px" }}
          />
        </Col>
      ))}
    </Row>
  );
};

export default TicketMetrics;
