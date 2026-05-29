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
        <Flex justify="center" align="center" style={{ height: 300 }}>
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
                  borderRadius: 8,
                  border: `1px solid ${hasValue ? token.colorPrimary + "20" : token.colorBorderSecondary}`,
                  background: hasValue ? token.colorPrimary + "06" : token.colorBgContainer,
                }}
              >
                <Flex align="center" gap={12}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: hasValue ? token.colorPrimary + "15" : token.colorBgLayout,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon
                      style={{
                        fontSize: 14,
                        color: hasValue ? token.colorPrimary : token.colorTextDisabled,
                      }}
                    />
                  </div>
                  <Flex vertical gap={2} style={{ flex: 1 }}>
                    <Text
                      strong
                      style={{
                        fontSize: 13,
                        color: hasValue ? token.colorText : token.colorTextDisabled,
                      }}
                    >
                      {field.label}
                    </Text>
                    <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>
                      {field.description}
                    </Text>
                  </Flex>
                  <Text
                    strong
                    style={{
                      fontSize: 16,
                      color: hasValue ? token.colorPrimary : token.colorTextDisabled,
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
