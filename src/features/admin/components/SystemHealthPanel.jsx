import React, { memo, useMemo } from "react";
import { Flex, Typography, Spin, Empty, Tag, Tooltip, Progress } from "antd";
import {
  DatabaseOutlined,
  CloudServerOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { SmartCard } from "../../../shared/ui";
import { useIkoluToken } from "../../../hooks/useIkoluToken";

const { Text } = Typography;

const statusConfig = {
  connected: { color: "success", icon: <CheckCircleOutlined />, label: "Conectado" },
  healthy: { color: "success", icon: <CheckCircleOutlined />, label: "OK" },
  up: { color: "success", icon: <CheckCircleOutlined />, label: "OK" },
  ok: { color: "success", icon: <CheckCircleOutlined />, label: "OK" },
  success: { color: "success", icon: <CheckCircleOutlined />, label: "Éxito" },
  running: { color: "success", icon: <CheckCircleOutlined />, label: "Ejecutando" },
  active: { color: "success", icon: <CheckCircleOutlined />, label: "Activo" },
  warning: { color: "warning", icon: <ExclamationCircleOutlined />, label: "Advertencia" },
  degraded: { color: "warning", icon: <ExclamationCircleOutlined />, label: "Degradado" },
  pending: { color: "warning", icon: <ClockCircleOutlined />, label: "Pendiente" },
  error: { color: "error", icon: <CloseCircleOutlined />, label: "Error" },
  failed: { color: "error", icon: <CloseCircleOutlined />, label: "Fallido" },
  down: { color: "error", icon: <CloseCircleOutlined />, label: "Caído" },
  unknown: { color: "default", icon: <MinusCircleOutlined />, label: "Desconocido" },
};

const getStatus = (value) => {
  if (typeof value === "boolean") return value ? statusConfig.healthy : statusConfig.error;
  if (typeof value === "string") {
    const key = value.toLowerCase();
    return statusConfig[key] || statusConfig.unknown;
  }
  if (typeof value === "object" && value !== null) {
    const status = value.status || value.healthy || value.state;
    return getStatus(status);
  }
  return statusConfig.unknown;
};

const ServiceRow = memo(({ icon, label, status, extra }) => {
  const token = useIkoluToken();
  return (
    <Tooltip title={extra}>
      <Flex
        align="center"
        justify="space-between"
        style={{
          padding: "10px 12px",
          borderRadius: token.voidRadius,
          background: token.voidSurface,
          border: `1px solid ${token.voidBorder}`,
        }}
      >
        <Flex align="center" gap={10}>
          <Text style={{ fontSize: 16, color: token.voidTextHeading }}>{icon}</Text>
          <Text strong style={{ textTransform: "capitalize", color: token.voidTextHeading }}>
            {label}
          </Text>
        </Flex>
        <Tag icon={status.icon} color={status.color}>
          {status.label}
        </Tag>
      </Flex>
    </Tooltip>
  );
});

ServiceRow.displayName = "ServiceRow";

const SystemHealthPanel = memo(({ data, loading }) => {
  const token = useIkoluToken();

  const server = data?.server;
  const database = data?.database;
  const redis = data?.redis;
  const external = data?.external_services;
  const cronjobs = data?.cronjobs;

  const cronjobStats = useMemo(() => {
    if (!cronjobs) return null;
    if (Array.isArray(cronjobs)) {
      const total = cronjobs.length;
      const healthyValues = [true, "healthy", "up", "ok", "success", "running", "active"];
      const healthy = cronjobs.filter((c) =>
        healthyValues.includes(c?.healthy || c?.status)
      ).length;
      return { total, healthy, items: cronjobs };
    }
    if (typeof cronjobs === "object") {
      return {
        total: cronjobs.total ?? 0,
        healthy: cronjobs.healthy ?? 0,
        items: cronjobs.items || cronjobs.cronjobs || [],
      };
    }
    return null;
  }, [cronjobs]);

  const services = React.useMemo(() => {
    const list = [];
    const s = server || {};
    const db = database || {};
    const r = redis || {};
    const ext = external || {};

    if (s.cpu_percent !== undefined || s.memory_percent !== undefined) {
      list.push({
        key: "server",
        icon: <CloudServerOutlined />,
        label: "Servidor",
        status: getStatus("healthy"),
        extra: `CPU ${s.cpu_percent}% · Mem ${s.memory_percent}% · Disco ${s.disk_percent}%`,
      });
    }

    if (db.status) {
      list.push({
        key: "database",
        icon: <DatabaseOutlined />,
        label: `PostgreSQL (${db.name || "DB"})`,
        status: getStatus(db),
        extra: db.size_mb ? `${db.size_mb} MB` : null,
      });
    }

    if (r.status) {
      list.push({
        key: "redis",
        icon: <ThunderboltOutlined />,
        label: `Redis ${r.version || ""}`,
        status: getStatus(r),
        extra: r.used_memory_human ? `Mem: ${r.used_memory_human}` : null,
      });
    }

    Object.entries(ext).forEach(([key, svc]) => {
      list.push({
        key: `ext-${key}`,
        icon: <CloudServerOutlined />,
        label: svc.name || key,
        status: getStatus(svc),
        extra: svc.note || (svc.http_status ? `HTTP ${svc.http_status}` : null),
      });
    });

    return list;
  }, [server, database, redis, external]);

  return (
    <SmartCard
      variant="void"
      title={
        <Flex align="center" gap={8}>
          <CloudServerOutlined style={{ color: token.voidTextHeading }} />
          <Text strong style={{ color: token.voidTextHeading }}>
            Estado de Servicios
          </Text>
        </Flex>
      }
      style={{ height: "100%" }}
    >
      {loading ? (
        <Flex justify="center" align="center" style={{ minHeight: 180 }}>
          <Spin />
        </Flex>
      ) : services.length === 0 ? (
        <Empty description="No hay información de servicios" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Flex vertical gap={12}>
          {server.cpu_percent !== undefined && (
            <Flex vertical gap={8}>
              <Flex justify="space-between">
                <Text style={{ color: token.voidTextMuted }}>CPU</Text>
                <Text style={{ color: token.voidText }}>{server.cpu_percent}%</Text>
              </Flex>
              <Progress percent={server.cpu_percent} size="small" status={server.cpu_percent > 90 ? "exception" : "normal"} showInfo={false} />

              <Flex justify="space-between">
                <Text style={{ color: token.voidTextMuted }}>Memoria</Text>
                <Text style={{ color: token.voidText }}>{server.memory_percent}%</Text>
              </Flex>
              <Progress percent={parseFloat(server.memory_percent)} size="small" status={server.memory_percent > 90 ? "exception" : "normal"} showInfo={false} />

              <Flex justify="space-between">
                <Text style={{ color: token.voidTextMuted }}>Disco</Text>
                <Text style={{ color: token.voidText }}>{server.disk_percent}%</Text>
              </Flex>
              <Progress percent={parseFloat(server.disk_percent)} size="small" status={server.disk_percent > 90 ? "exception" : "normal"} showInfo={false} />
            </Flex>
          )}

          <Flex vertical gap={8}>
            {services.map((svc) => (
              <ServiceRow key={svc.key} {...svc} />
            ))}
          </Flex>

          {cronjobStats && cronjobStats.total > 0 && (
            <Flex vertical gap={8} style={{ marginTop: 8 }}>
              <Flex justify="space-between">
                <Text style={{ color: token.voidTextMuted }}>Cronjobs</Text>
                <Text style={{ color: token.voidText }}>
                  {cronjobStats.healthy}/{cronjobStats.total} saludables
                </Text>
              </Flex>
              <Progress
                percent={Math.round((cronjobStats.healthy / cronjobStats.total) * 100)}
                size="small"
                status={cronjobStats.healthy < cronjobStats.total ? "exception" : "success"}
                showInfo={false}
              />
              {cronjobStats.items.length > 0 && (
                <Flex vertical gap={6} style={{ marginTop: 4 }}>
                  {cronjobStats.items.slice(0, 8).map((job, idx) => (
                    <ServiceRow
                      key={job.id || job.name || idx}
                      icon={<ClockCircleOutlined />}
                      label={job.name || job.id || `Cron ${idx + 1}`}
                      status={getStatus(job)}
                      extra={job.last_run || job.schedule || job.note}
                    />
                  ))}
                  {cronjobStats.items.length > 8 && (
                    <Text style={{ fontSize: 12, color: token.voidTextMuted }}>
                      +{cronjobStats.items.length - 8} cronjobs más
                    </Text>
                  )}
                </Flex>
              )}
            </Flex>
          )}
        </Flex>
      )}
    </SmartCard>
  );
});

SystemHealthPanel.displayName = "SystemHealthPanel";

export default SystemHealthPanel;
