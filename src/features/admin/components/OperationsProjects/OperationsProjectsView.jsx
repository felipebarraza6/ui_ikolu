import React, { useMemo } from "react";
import {
  Row,
  Col,
  Flex,
  Typography,
  Empty,
  Skeleton,
  Statistic,
  Tag,
  Card,
} from "antd";
import {
  ProjectOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import ProjectCard from "./ProjectCard";
import { useIkoluToken } from "../../../../hooks/useIkoluToken";
import { useResponsive } from "../../../../hooks/useResponsive";
import { getProjectPhase } from "../../constants/projectPhases";
import { getSlaStatus } from "../../constants/tickets";

const { Title, Text } = Typography;

const RUNNING_PHASES = new Set(["diseno", "ejecucion", "espera"]);
const DELIVERED_PHASES = new Set(["puesta_marcha", "entregado"]);

const OperationsProjectsView = ({
  projects = [],
  loading = false,
  onOpenProject,
  vocab,
}) => {
  const token = useIkoluToken();
  const { isMobile } = useResponsive();

  const kpis = useMemo(() => {
    const list = Array.isArray(projects) ? projects : [];

    const running = list.filter((p) => {
      const phase = getProjectPhase(p?.status);
      return phase && RUNNING_PHASES.has(phase.key);
    }).length;

    const delivered = list.filter((p) => {
      const phase = getProjectPhase(p?.status);
      return phase && DELIVERED_PHASES.has(phase.key);
    }).length;

    const overdue = list.filter(
      (p) =>
        getSlaStatus(
          p?.sla_deadline_resolution,
          p?.sla_resolved_at,
          p?.status
        )?.overdue
    ).length;

    return [
      {
        key: "total",
        title: "Total instalaciones",
        value: list.length,
        icon: ProjectOutlined,
        color: token.voidTextHeading,
      },
      {
        key: "running",
        title: "En ejecución",
        value: running,
        icon: ThunderboltOutlined,
        color: token.colorWarning,
      },
      {
        key: "delivered",
        title: "Entregadas",
        value: delivered,
        icon: CheckCircleOutlined,
        color: token.colorSuccess,
      },
      {
        key: "overdue",
        title: "Atrasadas (SLA)",
        value: overdue,
        icon: WarningOutlined,
        color: token.colorError,
      },
    ];
  }, [projects, token]);

  const hasProjects = (projects?.length ?? 0) > 0;
  const overdueCount =
    kpis.find((k) => k.key === "overdue")?.value ?? 0;

  const glassCardStyle = {
    background: token.glassBg,
    border: `1px solid ${token.glassBorder}`,
    borderRadius: token.voidRadius,
    backdropFilter: "blur(10px)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Flex justify="space-between" align="center" wrap gap={12}>
        <Flex vertical>
          <Title level={4} style={{ margin: 0, color: token.voidTextHeading }}>
            Instalaciones <Text type="secondary">({projects?.length ?? 0})</Text>
          </Title>
          <Text type="secondary">
            Instalaciones nuevas planificadas y en ejecución
          </Text>
        </Flex>
        {hasProjects &&
          (overdueCount > 0 ? (
            <Tag
              icon={<WarningOutlined />}
              style={{
                color: token.colorError,
                background: `${token.colorError}12`,
                border: `1px solid ${token.colorError}35`,
                borderRadius: 6,
                fontWeight: 600,
                margin: 0,
                lineHeight: "20px",
              }}
            >
              {overdueCount} atrasadas por SLA
            </Tag>
          ) : (
            <Tag
              icon={<CheckCircleOutlined />}
              style={{
                color: token.colorSuccess,
                background: `${token.colorSuccess}12`,
                border: `1px solid ${token.colorSuccess}35`,
                borderRadius: 6,
                fontWeight: 600,
                margin: 0,
                lineHeight: "20px",
              }}
            >
              SLA al día
            </Tag>
          ))}
      </Flex>

      <Row gutter={[16, 16]}>
        {kpis.map((kpi) => {
          const KpiIcon = kpi.icon;
          return (
            <Col xs={24} sm={12} lg={6} key={kpi.key}>
              <Card style={glassCardStyle}>
                <Flex align="center" gap={isMobile ? 10 : 14}>
                  <div
                    style={{
                      width: isMobile ? 38 : 44,
                      height: isMobile ? 38 : 44,
                      borderRadius: 10,
                      flexShrink: 0,
                      background: `${kpi.color}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <KpiIcon style={{ fontSize: isMobile ? 16 : 20, color: kpi.color }} />
                  </div>
                  <Statistic
                    title={kpi.title}
                    value={kpi.value}
                    valueStyle={{ color: kpi.color, fontWeight: 700 }}
                  />
                </Flex>
              </Card>
            </Col>
          );
        })}
      </Row>

      {loading && !hasProjects ? (
        <Row gutter={[16, 16]}>
          {[0, 1, 2].map((i) => (
            <Col xs={24} sm={12} xl={8} key={i}>
              <Card style={glassCardStyle}>
                <Skeleton active title paragraph={{ rows: 4 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : !hasProjects ? (
        <Empty description="No hay instalaciones para los filtros seleccionados" />
      ) : (
        <Row gutter={[16, 16]}>
          {projects.map((p) => (
            <Col xs={24} sm={12} xl={8} key={p?.id}>
              <ProjectCard project={p} onOpen={onOpenProject} vocab={vocab} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default OperationsProjectsView;
