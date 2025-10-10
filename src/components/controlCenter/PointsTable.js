import { Space, Table, Tag, Tooltip, Typography } from "antd";
import {
  AlertOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  WarningOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import React from "react";

const { Text } = Typography;

const PointsTable = ({ profiles, getPointData }) => {
  // Función para determinar si es DGA o SMA
  const getComplianceType = (code) => {
    if (!code) return null;
    return code.startsWith("OB") ? "DGA" : "SMA";
  };

  // Función para obtener color del estado de conexión
  const getConnectionStatus = (point) => {
    const pointData = getPointData(point);
    const m1 = pointData.modules?.m1;

    if (!m1)
      return {
        color: "default",
        text: "Sin datos",
        icon: <PauseCircleOutlined />,
      };

    const daysNotConnected = m1.days_not_conection || 0;

    if (daysNotConnected === 0) {
      return {
        color: "success",
        text: "Conectado",
        icon: <CheckCircleOutlined />,
      };
    } else if (daysNotConnected <= 1) {
      return {
        color: "warning",
        text: `${daysNotConnected} día sin conexión`,
        icon: <WarningOutlined />,
      };
    } else {
      return {
        color: "error",
        text: `${daysNotConnected} días sin conexión`,
        icon: <AlertOutlined />,
      };
    }
  };

  // Función para formatear fecha
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Columnas para la tabla
  const columns = [
    {
      title: "Punto de Captación",
      dataIndex: "title",
      key: "title",
      align: "left",
      fixed: "left",
      width: 220,
      render: (text, record) => {
        const pointData = getPointData(record);
        return (
          <div style={{ margin: 0, padding: 0, textAlign: "left" }}>
            <div
              style={{
                fontWeight: "600",
                color: "#1F3461",
                margin: 0,
                padding: 0,
              }}
            >
              {pointData.title || text || "Sin nombre"}
            </div>
            <div
              style={{ fontSize: "11px", color: "#666", margin: 0, padding: 0 }}
            >
              ID: {pointData.id || record.id}
            </div>
          </div>
        );
      },
    },
    {
      title: "Conexión",
      key: "connection",
      width: 150,
      render: (_, record) => {
        const status = getConnectionStatus(record);
        return (
          <Tag color={status.color} icon={status.icon}>
            {status.text}
          </Tag>
        );
      },
    },
    {
      title: "Tipo de Ingreso",
      key: "entry_type",
      width: 140,
      render: (_, record) => {
        const pointData = getPointData(record);
        const isTelemetry = pointData.config_data?.is_telemetry === true;

        // Buscar profile_ikolu en múltiples ubicaciones
        const profileIkolu =
          pointData.profile_ikolu ||
          record.profile_ikolu ||
          record.catchment_points?.[0]?.profile_ikolu;

        const isManualEntry = profileIkolu?.entry_by_form === true;

        if (isTelemetry) {
          return (
            <Tag color="blue" icon={<WifiOutlined />}>
              Telemetría
            </Tag>
          );
        } else if (isManualEntry) {
          return (
            <Tag color="cyan" icon={<PlayCircleOutlined />}>
              Manual
            </Tag>
          );
        } else {
          return (
            <Tag color="default" icon={<PauseCircleOutlined />}>
              Sin Configurar
            </Tag>
          );
        }
      },
    },
    {
      title: "Caudal",
      key: "flow",
      width: 130,
      render: (_, record) => {
        const pointData = getPointData(record);
        const m1 = pointData.modules?.m1;

        // Caudal es total_diff, caudal medio es flow
        const instantFlow = m1?.total_diff;
        const avgFlow = m1?.flow;

        const displayFlow =
          instantFlow !== undefined && instantFlow !== null
            ? instantFlow
            : avgFlow;

        return displayFlow !== undefined && displayFlow !== null ? (
          <Tooltip
            title={`Caudal medio: ${
              avgFlow ? parseFloat(avgFlow).toFixed(2) : "-"
            } l/s`}
          >
            <div style={{ textAlign: "center" }}>
              <Text
                strong
                style={{
                  color: parseFloat(displayFlow) > 0 ? "#1890ff" : "#666",
                }}
              >
                {parseFloat(displayFlow).toFixed(2)}
              </Text>
              <div style={{ fontSize: "10px", color: "#666" }}>l/s</div>
            </div>
          </Tooltip>
        ) : (
          <Text type="secondary">-</Text>
        );
      },
    },
    {
      title: "N. Freático",
      key: "water_table",
      width: 120,
      render: (_, record) => {
        const pointData = getPointData(record);
        const m1 = pointData.modules?.m1;
        const waterTable = m1?.water_table;
        const nivel = m1?.nivel;

        return waterTable !== undefined && waterTable !== null ? (
          <Tooltip
            title={`Nivel: ${nivel ? parseFloat(nivel).toFixed(2) : "-"} m`}
          >
            <div style={{ textAlign: "center" }}>
              <Text strong style={{ color: "#13c2c2" }}>
                {parseFloat(waterTable).toFixed(2)}
              </Text>
              <div style={{ fontSize: "10px", color: "#666" }}>m</div>
            </div>
          </Tooltip>
        ) : (
          <Text type="secondary">-</Text>
        );
      },
    },
    {
      title: "Código de Obra",
      key: "code",
      width: 180,
      render: (_, record) => {
        const pointData = getPointData(record);
        const dga = pointData.dga || record.dga;
        const code = dga?.code_dga;
        const sendDga = dga?.send_dga;
        const complianceType = getComplianceType(code);

        return code ? (
          <Space direction="vertical" size={2}>
            <Space size={4}>
              <Tag
                color={complianceType === "DGA" ? "blue" : "purple"}
                style={{ fontFamily: "monospace", margin: 0, fontSize: "11px" }}
              >
                {code}
              </Tag>
              <Tag
                color={complianceType === "DGA" ? "geekblue" : "magenta"}
                style={{ margin: 0, fontSize: "10px" }}
              >
                {complianceType}
              </Tag>
            </Space>
            {sendDga && complianceType === "DGA" && (
              <Tag
                color="green"
                icon={<CheckCircleOutlined />}
                style={{ fontSize: "10px", margin: 0 }}
              >
                Enviando
              </Tag>
            )}
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        );
      },
    },
    {
      title: "Total Acumulado",
      key: "total",
      width: 140,
      render: (_, record) => {
        const pointData = getPointData(record);
        const m1 = pointData.modules?.m1;
        const total = m1?.total;
        const totalToday = m1?.total_today_diff;

        return total !== undefined && total !== null ? (
          <Tooltip
            title={`Hoy: ${
              totalToday ? parseFloat(totalToday).toFixed(0) : "0"
            } m³`}
          >
            <div style={{ textAlign: "center" }}>
              <Text strong style={{ color: "#52c41a" }}>
                {parseFloat(total).toLocaleString("es-ES")}
              </Text>
              <div style={{ fontSize: "10px", color: "#666" }}>m³</div>
            </div>
          </Tooltip>
        ) : (
          <Text type="secondary">-</Text>
        );
      },
    },
    {
      title: "Última Medición",
      key: "last_measure",
      width: 160,
      render: (_, record) => {
        const pointData = getPointData(record);
        const lastMeasure = pointData.modules?.m1?.date_time_medition;
        return (
          <Tooltip
            title={lastMeasure ? formatDateTime(lastMeasure) : "Sin datos"}
          >
            <Text type="secondary" style={{ fontSize: "11px" }}>
              {lastMeasure ? formatDateTime(lastMeasure) : "-"}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: "Frecuencia",
      key: "frecuency",
      width: 100,
      render: (_, record) => {
        const pointData = getPointData(record);
        const freq = pointData.frecuency || record.frecuency;
        return (
          <div style={{ textAlign: "center" }}>
            <Text strong>{freq || 60}</Text>
            <div style={{ fontSize: "10px", color: "#666" }}>min</div>
          </div>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={profiles}
      bordered
      rowKey={(record) => {
        const pointData = getPointData(record);
        return pointData.id || record.id || Math.random();
      }}
      pagination={{
        pageSize: 10,
        showTotal: (total, range) => `${total} puntos`,
        size: "small",
      }}
      size="small"
      scroll={{ x: 1400 }}
    />
  );
};

export default PointsTable;
