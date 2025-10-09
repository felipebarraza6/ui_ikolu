import {
  Flex,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Button,
  Table,
  Progress,
  Alert,
  Space,
  Tooltip,
  Badge,
} from "antd";
import React from "react";
import { useUserProfilesContext } from "../../contexts/UserProfilesContext";
import {
  ReloadOutlined,
  EnvironmentOutlined,
  WifiOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  SettingOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ControlOutlined,
  InfoCircleOutlined,
  DashboardOutlined,
  WarningOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const CentroControl = () => {
  const { profiles, loading, error, refreshProfiles } =
    useUserProfilesContext();

  // Función auxiliar para obtener datos del punto
  const getPointData = (profile) => {
    // Según el JSON proporcionado, la estructura es:
    // profile tiene catchment_points como array con objetos que contienen profile_ikolu
    if (Array.isArray(profile.catchment_points)) {
      return profile.catchment_points[0] || {};
    }
    // Si catchment_points es un objeto, usarlo directamente
    if (
      profile.catchment_points &&
      typeof profile.catchment_points === "object"
    ) {
      return profile.catchment_points;
    }
    // Si no hay catchment_points, el profile mismo es el punto
    return profile;
  };

  // Función para determinar si es DGA o SMA
  const getComplianceType = (code) => {
    if (!code) return null;
    return code.startsWith("OB") ? "DGA" : "SMA";
  };

  // Función para verificar si el punto está activo (telemetría o ingreso manual)
  const isPointActive = (point) => {
    const pointData = getPointData(point);
    const isTelemetry = pointData.config_data?.is_telemetry === true;

    // Buscar profile_ikolu en múltiples ubicaciones posibles
    const profileIkolu =
      pointData.profile_ikolu ||
      point.profile_ikolu ||
      point.catchment_points?.[0]?.profile_ikolu;

    const isManualEntry = profileIkolu?.entry_by_form === true;

    console.log("🔍 isPointActive check:", {
      title: pointData.title || point.title,
      isTelemetry,
      profileIkolu,
      isManualEntry,
      result: isTelemetry || isManualEntry,
    });

    return isTelemetry || isManualEntry;
  };

  // Calcular estadísticas generales
  const stats = {
    totalPoints: profiles.length,
    activePoints: profiles.filter((p) => isPointActive(p)).length,
    telemetryPoints: profiles.filter((p) => {
      const point = getPointData(p);
      return point.config_data?.is_telemetry === true;
    }).length,
    manualEntryPoints: profiles.filter((p) => {
      const point = getPointData(p);
      const profileIkolu =
        point.profile_ikolu ||
        p.profile_ikolu ||
        p.catchment_points?.[0]?.profile_ikolu;

      const isManual = profileIkolu?.entry_by_form === true;

      if (isManual) {
        console.log("✅ Punto con ingreso manual encontrado:", {
          title: point.title || p.title,
          profileIkolu,
        });
      }

      return isManual;
    }).length,
    dgaPoints: profiles.filter((p) => {
      const point = getPointData(p);
      const dga = point.dga || p.dga;
      const code = dga?.code_dga;
      // Solo los que tienen código y empieza con OB
      return code && code.startsWith("OB");
    }).length,
    smaPoints: profiles.filter((p) => {
      const point = getPointData(p);
      const dga = point.dga || p.dga;
      const code = dga?.code_dga;
      // Solo los que tienen código pero NO empiezan con OB
      return code && !code.startsWith("OB");
    }).length,
    dgaSending: profiles.filter((p) => {
      const point = getPointData(p);
      const dga = point.dga || p.dga;
      const code = dga?.code_dga;
      const sendDga = dga?.send_dga === true;
      // Solo DGA (OB) que están enviando
      return code && code.startsWith("OB") && sendDga;
    }).length,
    totalWithCode: profiles.filter((p) => {
      const point = getPointData(p);
      const dga = point.dga || p.dga;
      return !!dga?.code_dga;
    }).length,
    connectedPoints: profiles.filter((p) => {
      const point = getPointData(p);
      const m1 = point.modules?.m1;
      return m1 && m1.days_not_conection === 0;
    }).length,
    withErrors: profiles.filter((p) => {
      const point = getPointData(p);
      const m1 = point.modules?.m1;
      return m1?.is_error === true;
    }).length,
  };

  // Calcular por estándar
  const standardStats = {
    MEDIO: profiles.filter((p) => {
      const point = getPointData(p);
      const dga = point.dga || p.dga;
      return dga?.standard === "MEDIO";
    }).length,
    GENERAL: profiles.filter((p) => {
      const point = getPointData(p);
      const dga = point.dga || p.dga;
      return dga?.standard === "GENERAL";
    }).length,
    PEQUENO: profiles.filter((p) => {
      const point = getPointData(p);
      const dga = point.dga || p.dga;
      return dga?.standard === "PEQUENO" || dga?.standard === "CAUDALES_MUY_PEQUENOS";
    }).length,
  };

  // Debug: Log de estadísticas para verificar
  console.log("🔍 CentroControl Stats:", {
    totalPoints: stats.totalPoints,
    activePoints: stats.activePoints,
    telemetryPoints: stats.telemetryPoints,
    manualEntryPoints: stats.manualEntryPoints,
    dgaPoints: stats.dgaPoints,
    smaPoints: stats.smaPoints,
    totalWithCode: stats.totalWithCode,
    dgaSending: stats.dgaSending,
    connectedPoints: stats.connectedPoints,
    standardStats,
  });

  // Debug: Verificar profile_ikolu en todos los registros
  console.log("🔍 Análisis completo de profiles:");
  profiles.forEach((profile, index) => {
    const pointData = getPointData(profile);
    console.log(`Perfil ${index}:`, {
      title: pointData.title || profile.title,
      tiene_profile_ikolu_root: !!profile.profile_ikolu,
      tiene_profile_ikolu_catchment: !!pointData.profile_ikolu,
      profile_ikolu_root: profile.profile_ikolu,
      profile_ikolu_catchment: pointData.profile_ikolu,
      catchment_points_es_array: Array.isArray(profile.catchment_points),
      keys_del_profile: Object.keys(profile),
      keys_del_pointData: Object.keys(pointData),
    });
  });

  // Calcular porcentajes
  const percentages = {
    active:
      profiles.length > 0
        ? Math.round((stats.activePoints / stats.totalPoints) * 100)
        : 0,
    telemetry:
      profiles.length > 0
        ? Math.round((stats.telemetryPoints / stats.totalPoints) * 100)
        : 0,
    connected:
      profiles.length > 0
        ? Math.round((stats.connectedPoints / stats.totalPoints) * 100)
        : 0,
    dgaSending:
      profiles.length > 0
        ? Math.round((stats.dgaSending / stats.totalPoints) * 100)
        : 0,
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
        const instantFlow = m1?.total_diff; // Caudal instantáneo
        const avgFlow = m1?.flow; // Caudal medio

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

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <ReloadOutlined
          style={{ fontSize: "24px", marginBottom: "16px", color: "#1890ff" }}
        />
        <Text>Cargando datos del sistema...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error al cargar datos"
        description={error}
        type="error"
        showIcon
        style={{ margin: "20px" }}
      />
    );
  }

  return (
    <Flex vertical style={{ padding: "16px" }}>
      {/* Header con título y botón de actualizar */}
      <Flex
        align="center"
        justify="space-between"
        style={{ marginBottom: "16px" }}
      >
        <div>
          <Title level={2} style={{ margin: 0, color: "#1F3461" }}>
            <ControlOutlined style={{ marginRight: "8px" }} />
            Centro de Control
          </Title>
          <Text type="secondary" style={{ fontSize: "14px" }}>
            Panel de control y monitoreo del sistema
          </Text>
        </div>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={refreshProfiles}
          size="large"
        >
          Actualizar Sistema
        </Button>
      </Flex>

      {/* Alertas del sistema */}
      {stats.withErrors > 0 && (
        <Alert
          message={`${stats.withErrors} punto(s) con errores detectados`}
          description="Estos puntos tienen errores en las mediciones. Revisa el estado de los dispositivos."
          type="error"
          showIcon
          icon={<AlertOutlined />}
          style={{ marginBottom: "16px" }}
          closable
        />
      )}
      {stats.connectedPoints < stats.totalPoints && (
        <Alert
          message={`${
            stats.totalPoints - stats.connectedPoints
          } punto(s) sin conexión`}
          description="Algunos puntos no están reportando datos. Verifica la conectividad."
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: "16px" }}
          closable
        />
      )}

      {/* Estadísticas principales con barras de progreso */}
      <Row gutter={[12, 12]} style={{ marginBottom: "16px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ textAlign: "center" }} size="small">
            <Statistic
              title="Total de Puntos"
              value={stats.totalPoints}
              prefix={<EnvironmentOutlined style={{ color: "#1F3461" }} />}
              valueStyle={{ color: "#1F3461", fontSize: "24px" }}
            />
            <Progress
              percent={100}
              showInfo={false}
              strokeColor="#1F3461"
              size="small"
              style={{ marginTop: "4px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ textAlign: "center" }} size="small">
            <Statistic
              title="Conectados"
              value={stats.connectedPoints}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a", fontSize: "24px" }}
            />
            <Progress
              percent={percentages.connected}
              showInfo={false}
              strokeColor="#52c41a"
              size="small"
              style={{ marginTop: "4px" }}
            />
            <Text type="secondary" style={{ fontSize: "11px" }}>
              {percentages.connected}% del total
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ textAlign: "center" }} size="small">
            <Statistic
              title="Telemetría"
              value={stats.telemetryPoints}
              prefix={<WifiOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff", fontSize: "24px" }}
            />
            <Progress
              percent={percentages.telemetry}
              showInfo={false}
              strokeColor="#1890ff"
              size="small"
              style={{ marginTop: "4px" }}
            />
            <Text type="secondary" style={{ fontSize: "11px" }}>
              {stats.manualEntryPoints} ingreso manual
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ textAlign: "center" }} size="small">
            <Statistic
              title="Con Código de Obra"
              value={stats.totalWithCode}
              prefix={<ThunderboltOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1", fontSize: "24px" }}
            />
            <Progress
              percent={stats.totalWithCode > 0 ? Math.round((stats.dgaSending / stats.totalWithCode) * 100) : 0}
              showInfo={false}
              strokeColor="#722ed1"
              size="small"
              style={{ marginTop: "4px" }}
            />
            <Text type="secondary" style={{ fontSize: "11px" }}>
              {stats.dgaPoints} DGA{stats.smaPoints > 0 ? ` · ${stats.smaPoints} SMA` : ''}
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Resumen detallado */}
      <Row gutter={[12, 12]} style={{ marginBottom: "16px" }}>
        <Col xs={24} md={8}>
          <Card
            title={
              <>
                <DashboardOutlined style={{ marginRight: "8px" }} />
                Estado de Conexión
              </>
            }
            size="small"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <Space>
                <CheckCircleOutlined style={{ color: "#52c41a" }} />
                <Text>Conectados</Text>
              </Space>
              <Tag color="green" style={{ margin: 0 }}>
                {stats.connectedPoints}
              </Tag>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <Space>
                <WarningOutlined style={{ color: "#faad14" }} />
                <Text>Sin conexión</Text>
              </Space>
              <Tag color="warning" style={{ margin: 0 }}>
                {stats.totalPoints - stats.connectedPoints}
              </Tag>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Space>
                <AlertOutlined style={{ color: "#ff4d4f" }} />
                <Text>Con errores</Text>
              </Space>
              <Tag color="error" style={{ margin: 0 }}>
                {stats.withErrors}
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            title={
              <>
                <WifiOutlined style={{ marginRight: "8px" }} />
                Tipo de Ingreso
              </>
            }
            size="small"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <Space>
                <WifiOutlined style={{ color: "#1890ff" }} />
                <Text>Telemetría</Text>
              </Space>
              <Tag color="blue" style={{ margin: 0 }}>
                {stats.telemetryPoints}
              </Tag>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <Space>
                <PlayCircleOutlined style={{ color: "#13c2c2" }} />
                <Text>Ingreso Manual</Text>
              </Space>
              <Tag color="cyan" style={{ margin: 0 }}>
                {stats.manualEntryPoints}
              </Tag>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text>Puntos activos</Text>
              <Tag color="green" style={{ margin: 0 }}>
                {stats.activePoints}
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            title={
              <>
                <ThunderboltOutlined style={{ marginRight: "8px" }} />
                Cumplimiento y Estándar
              </>
            }
            size="small"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <Space>
                <ThunderboltOutlined style={{ color: "#1890ff" }} />
                <Text>DGA (OB)</Text>
              </Space>
              <Tag color="blue" style={{ margin: 0 }}>
                {stats.dgaPoints}
              </Tag>
            </div>
            {stats.smaPoints > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "6px",
                }}
              >
                <Space>
                  <ThunderboltOutlined style={{ color: "#722ed1" }} />
                  <Text>SMA</Text>
                </Space>
                <Tag color="purple" style={{ margin: 0 }}>
                  {stats.smaPoints}
                </Tag>
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <Text>Enviando a DGA</Text>
              <Tag color="green" style={{ margin: 0 }}>
                {stats.dgaSending}
              </Tag>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "6px",
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <Text strong style={{ fontSize: "11px" }}>Estándares:</Text>
              <Space size={4}>
                {standardStats.MEDIO > 0 && (
                  <Tag color="orange" style={{ margin: 0, fontSize: "10px" }}>
                    Medio: {standardStats.MEDIO}
                  </Tag>
                )}
                {standardStats.GENERAL > 0 && (
                  <Tag color="cyan" style={{ margin: 0, fontSize: "10px" }}>
                    General: {standardStats.GENERAL}
                  </Tag>
                )}
                {standardStats.PEQUENO > 0 && (
                  <Tag color="green" style={{ margin: 0, fontSize: "10px" }}>
                    Pequeño: {standardStats.PEQUENO}
                  </Tag>
                )}
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tabla detallada de todos los puntos */}
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

      {/* Información adicional del sistema */}
      <Card
        title={
          <>
            <InfoCircleOutlined style={{ marginRight: "8px" }} />
            Información del Sistema
          </>
        }
        style={{ marginTop: "12px" }}
        size="small"
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: "center" }}>
              <ClockCircleOutlined
                style={{
                  fontSize: "20px",
                  color: "#1890ff",
                  marginBottom: "6px",
                }}
              />
              <div style={{ fontWeight: "600", fontSize: "13px" }}>
                Última Actualización
              </div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {new Date().toLocaleString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: "center" }}>
              <EnvironmentOutlined
                style={{
                  fontSize: "20px",
                  color: "#52c41a",
                  marginBottom: "6px",
                }}
              />
              <div style={{ fontWeight: "600", fontSize: "13px" }}>
                Puntos Totales
              </div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {profiles.length} registrados
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: "center" }}>
              <CheckCircleOutlined
                style={{
                  fontSize: "20px",
                  color: "#52c41a",
                  marginBottom: "6px",
                }}
              />
              <div style={{ fontWeight: "600", fontSize: "13px" }}>
                Tasa de Conexión
              </div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {percentages.connected}% conectados
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: "center" }}>
              <DashboardOutlined
                style={{
                  fontSize: "20px",
                  color: "#722ed1",
                  marginBottom: "6px",
                }}
              />
              <div style={{ fontWeight: "600", fontSize: "13px" }}>
                Estado General
              </div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {stats.withErrors === 0
                  ? "Sistema OK"
                  : `${stats.withErrors} errores`}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>
    </Flex>
  );
};

export default CentroControl;
