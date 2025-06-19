/**
 * 🎨 EJEMPLO: MÓDULO B CON LAYOUT MODERNO Y DISTRIBUCIÓN MEJORADA
 *
 * Layout fluido con:
 * - Navegación superior con logo y selector de puntos
 * - Indicadores arriba (en tiempo real)
 * - Información del punto de captación abajo (organizada)
 * - Todo responsivo y armonioso
 */

import React from "react";
import { Row, Col, Card, Typography, Space, Tag, Progress } from "antd";
import ModernAppLayout from "../components/layout/ModernAppLayout";
import {
  formatVolume,
  formatFlow,
  formatLevel,
} from "../utils/numberFormatter";
import { useResponsive } from "../hooks/useResponsive";

const { Title, Text } = Typography;

const ModuloMejorado = () => {
  const { isMobile } = useResponsive();

  // 📊 Indicadores en tiempo real (arriba)
  const indicadores = [
    {
      icon: "🕐",
      label: "Última Medición",
      value: "13:00",
      unit: "hrs",
    },
    {
      icon: "📊",
      label: "Estado",
      value: "Activo",
      unit: "",
    },
    {
      icon: "🔋",
      label: "Batería",
      value: "85",
      unit: "%",
    },
    {
      icon: "📡",
      label: "Señal",
      value: "Buena",
      unit: "",
    },
  ];

  // 🏗️ Datos del punto de captación organizados (abajo)
  const renderPuntoData = () => (
    <Space
      direction="vertical"
      size={isMobile ? 16 : 20}
      style={{ width: "100%" }}
    >
      {/* Datos Principales */}
      <Row gutter={[16, 16]}>
        {/* Volumen */}
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              textAlign: "center",
              height: "100%",
              background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
            }}
            bodyStyle={{ padding: isMobile ? 16 : 20 }}
          >
            <div style={{ fontSize: isMobile ? 36 : 48, marginBottom: 8 }}>
              🕐
            </div>
            <Title level={4} style={{ margin: "0 0 4px 0", color: "#1f3461" }}>
              {formatVolume(86)}
            </Title>
            <Text style={{ color: "#1976d2", fontSize: isMobile ? 12 : 14 }}>
              (m³) • 13:00 hrs
            </Text>
          </Card>
        </Col>

        {/* Caudal */}
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              textAlign: "center",
              height: "100%",
              background: "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)",
            }}
            bodyStyle={{ padding: isMobile ? 16 : 20 }}
          >
            <div style={{ fontSize: isMobile ? 36 : 48, marginBottom: 8 }}>
              ⚡
            </div>
            <Title level={4} style={{ margin: "0 0 4px 0", color: "#1f3461" }}>
              {formatFlow(0.0)}
            </Title>
            <Text style={{ color: "#388e3c", fontSize: isMobile ? 12 : 14 }}>
              (L/s) • Caudal
            </Text>
          </Card>
        </Col>

        {/* Nivel Freático */}
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              textAlign: "center",
              height: "100%",
              background: "linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)",
            }}
            bodyStyle={{ padding: isMobile ? 16 : 20 }}
          >
            <div style={{ fontSize: isMobile ? 36 : 48, marginBottom: 8 }}>
              🌊
            </div>
            <Title level={4} style={{ margin: "0 0 4px 0", color: "#1f3461" }}>
              {formatLevel(20.9)}
            </Title>
            <Text style={{ color: "#f57c00", fontSize: isMobile ? 12 : 14 }}>
              (m) • Nivel Freático
            </Text>
          </Card>
        </Col>

        {/* Acumulado */}
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              textAlign: "center",
              height: "100%",
              background: "linear-gradient(135deg, #f3e5f5 0%, #ce93d8 100%)",
            }}
            bodyStyle={{ padding: isMobile ? 16 : 20 }}
          >
            <div style={{ fontSize: isMobile ? 36 : 48, marginBottom: 8 }}>
              💧
            </div>
            <Title level={4} style={{ margin: "0 0 4px 0", color: "#1f3461" }}>
              {formatVolume(351566)}
            </Title>
            <Text style={{ color: "#7b1fa2", fontSize: isMobile ? 12 : 14 }}>
              (m³) • Acumulado
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Información Técnica */}
      <Card
        title="📋 Detalles Técnicos"
        style={{ marginTop: 16 }}
        headStyle={{
          background: "#f8f9fa",
          fontSize: isMobile ? 14 : 16,
          fontWeight: 600,
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Space direction="vertical" size={8}>
              <div>
                <Text strong>Código del Módulo:</Text>
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  UB-030277
                </Tag>
              </div>
              <div>
                <Text strong>Tipo de Punto de Captación:</Text>
                <Text style={{ marginLeft: 8 }}>Subterráneo</Text>
              </div>
              <div>
                <Text strong>Profundidad:</Text>
                <Text style={{ marginLeft: 8 }}>45.5 m</Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} sm={12}>
            <Space direction="vertical" size={8}>
              <div>
                <Text strong>Ubicación:</Text>
                <Text style={{ marginLeft: 8 }}>Sector Norte</Text>
              </div>
              <div>
                <Text strong>Último Mantenimiento:</Text>
                <Text style={{ marginLeft: 8 }}>15/06/2024</Text>
              </div>
              <div>
                <Text strong>Estado Operacional:</Text>
                <Tag color="green" style={{ marginLeft: 8 }}>
                  Activo
                </Tag>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Progreso/Alertas */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="🔋 Estado del Sistema" size="small">
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Text>Batería</Text>
                <Progress
                  percent={85}
                  status="active"
                  strokeColor="#52c41a"
                  size="small"
                />
              </div>
              <div>
                <Text>Conexión</Text>
                <Progress
                  percent={92}
                  status="active"
                  strokeColor="#1890ff"
                  size="small"
                />
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="📅 Fecha Actual" size="small">
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <Title level={4} style={{ margin: 0, color: "#1f3461" }}>
                19 de junio
              </Title>
              <Text type="secondary">Última actualización</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </Space>
  );

  return (
    <ModernAppLayout
      moduleTitle="MÓDULO B"
      moduleCode="UB-030277"
      currentPoint="Punto Central"
      points={["Punto Central", "Punto Norte", "Punto Sur", "Punto Este"]}
      indicators={indicadores}
      onPointChange={(point) => {
        console.log("Cambio de punto:", point);
        // Aquí iría la lógica para cambiar los datos
      }}
    >
      {renderPuntoData()}
    </ModernAppLayout>
  );
};

/**
 * 🚀 CÓMO USAR EN TU APP
 *
 * En AppRouter.js o donde tengas las rutas:
 *
 * ANTES:
 * <Route path="/" element={<ComponenteOriginal />} />
 *
 * DESPUÉS:
 * <Route path="/" element={<ModuloMejorado />} />
 */

export default ModuloMejorado;
