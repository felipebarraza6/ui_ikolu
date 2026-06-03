import React from "react";
import { Drawer, Flex, Typography, Button, Card, Spin, theme } from "antd";
import {
  FaInfoCircle,
  FaRulerVertical,
  FaCog,
  FaWater,
  FaCircle,
  FaTachometerAlt,
  FaArrowRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;
const { useToken } = theme;

const CONFIG_FIELDS = [
  {
    key: "d1",
    label: "Profundidad de pozo",
    unit: "m",
    icon: FaRulerVertical,
    description: "Profundidad total del pozo de extracción",
  },
  {
    key: "d2",
    label: "Posicionamiento bomba",
    unit: "m",
    icon: FaCog,
    description: "Profundidad a la que se encuentra instalada la bomba",
  },
  {
    key: "d3",
    label: "Nivel freático",
    unit: "m",
    icon: FaWater,
    description: "Posicionamiento o nivel freático actual",
  },
  {
    key: "d4",
    label: "Diámetro bomba",
    unit: "pulg",
    icon: FaCircle,
    description: "Diámetro nominal de la bomba instalada",
  },
  {
    key: "d5",
    label: "Diámetro flujómetro",
    unit: "pulg",
    icon: FaTachometerAlt,
    description: "Diámetro del flujómetro / caudalímetro",
  },
];

const PointConfigDrawer = ({ open, onClose, pointName, configData, loading }) => {
  const { token } = useToken();
  const navigate = useNavigate();

  const handleNavigateToTelemetry = () => {
    onClose();
    navigate("/telemetry");
  };

  return (
    <Drawer
      title={
        <Flex align="center" gap={8}>
          <FaInfoCircle style={{ color: token.colorPrimary, fontSize: 16 }} />
          <Text strong style={{ fontSize: 16 }}>
            {pointName || "Configuración del punto"}
          </Text>
        </Flex>
      }
      open={open}
      onClose={onClose}
      width={480}
      styles={{ body: { padding: 20 } }}
      footer={
        <Flex justify="space-between" align="center">
          <Text type="secondary" style={{ fontSize: 12 }}>
            Ficha técnica rápida
          </Text>
          <Button
            type="primary"
            icon={<FaArrowRight style={{ fontSize: 12 }} />}
            onClick={handleNavigateToTelemetry}
          >
            Ver más en Telemetría
          </Button>
        </Flex>
      }
    >
      {loading ? (
        <Flex justify="center" align="center" className="ocean-empty-state">
          <Spin size="large" tip="Cargando configuración..." />
        </Flex>
      ) : (
        <Flex vertical gap={12}>
          <Text type="secondary" style={{ fontSize: 13, marginBottom: 8 }}>
            Parámetros técnicos configurados para este punto de captación.
          </Text>

          {CONFIG_FIELDS.map((field) => {
            const Icon = field.icon;
            const value = configData?.[field.key];
            const hasValue = value != null && value !== "" && value !== "0.00" && value !== 0;

            return (
              <Card
                key={field.key}
                size="small"
                bodyStyle={{ padding: "12px 16px" }}
                style={{
                  border: `1px solid ${hasValue ? 'rgba(0, 180, 216, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                  background: hasValue ? 'rgba(0, 180, 216, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                }}
                className="ocean-panel"
              >
                <Flex align="center" gap={12}>
                    <div
                    className={hasValue ? "ocean-icon-badge" : "ocean-icon-badge-muted"}
                    style={{
                      border: `1px solid ${hasValue ? 'rgba(0, 180, 216, 0.2)' : 'rgba(255, 255, 255, 0.05)'}`,
                    }}
                  >
                    <Icon
                      style={{
                        fontSize: 14,
                        color: hasValue ? '#00B4D8' : 'rgba(255, 255, 255, 0.3)',
                      }}
                    />
                  </div>
                  <Flex vertical gap={2} style={{ flex: 1 }}>
                    <Text
                      strong
                      style={{
                        fontSize: 13,
                        color: hasValue ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      {field.label}
                    </Text>
                    <Text className="ocean-text-sm ocean-text-muted">
                      {field.description}
                    </Text>
                  </Flex>
                  <Text
                    strong
                    style={{
                      fontSize: 16,
                      color: hasValue ? '#90E0EF' : 'rgba(255, 255, 255, 0.3)',
                      whiteSpace: "nowrap",
                    }}
                  >
                    {hasValue ? `${value} ${field.unit}` : "No configurado"}
                  </Text>
                </Flex>
              </Card>
            );
          })}
        </Flex>
      )}
    </Drawer>
  );
};

export default React.memo(PointConfigDrawer);
