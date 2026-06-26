import React, { useState, useEffect } from "react";
import { Drawer, Flex, Typography, Button, Card, Spin, Input, Switch, message } from "antd";
import {
  FaInfoCircle,
  FaRulerVertical,
  FaCog,
  FaWater,
  FaCircle,
  FaTachometerAlt,
  FaArrowRight,
  FaEdit,
  FaSave,
  FaTimes,
  FaPlus,
  FaWaveSquare,
  FaClock,
  FaExchangeAlt,
  FaBolt,
  FaCopy,
  FaDatabase,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import orchestrator from "../../../api/orchestrator";

const { Text } = Typography;

const CONFIG_FIELDS = [
  { key: "d1", label: "Profundidad", unit: "m", icon: FaRulerVertical, description: "Profundidad total de extracción", type: "number" },
  { key: "d2", label: "Posicionamiento bomba", unit: "m", icon: FaCog, description: "Profundidad a la que se encuentra instalada la bomba", type: "number" },
  { key: "d3", label: "Nivel freático", unit: "m", icon: FaWater, description: "Posicionamiento o nivel freático actual", type: "number" },
  { key: "d4", label: "Diámetro bomba", unit: "pulg", icon: FaCircle, description: "Diámetro nominal de la bomba instalada", type: "number" },
  { key: "d5", label: "Diámetro flujómetro", unit: "pulg", icon: FaTachometerAlt, description: "Diámetro del flujómetro / caudalímetro", type: "number" },
  { key: "addition", label: "Adición", unit: "m³", icon: FaPlus, description: "Volumen adicional a sumar al consumo", type: "number" },
  { key: "is_telemetry", label: "Telemetría activa", unit: "", icon: FaBolt, description: "El punto está recibiendo telemetría", type: "boolean" },
  { key: "nivel_offset", label: "Offset de nivel", unit: "m", icon: FaWaveSquare, description: "Corrección aplicada al nivel freático", type: "number" },
  { key: "max_diff_m3_per_hour", label: "Máx. diferencia horaria", unit: "m³/h", icon: FaExchangeAlt, description: "Diferencia máxima de consumo entre horas", type: "number" },
  { key: "max_flow_ls", label: "Máx. caudal", unit: "L/s", icon: FaTachometerAlt, description: "Caudal máximo permitido", type: "number" },
  { key: "max_time_gap_hours", label: "Máx. gap de tiempo", unit: "h", icon: FaClock, description: "Tiempo máximo permitido sin datos", type: "number" },
  { key: "reconnection_threshold_hours", label: "Umbral de reconexión", unit: "h", icon: FaClock, description: "Horas para considerar reconexión del punto", type: "number" },
  { key: "replicate_on_missing", label: "Replicar datos faltantes", unit: "", icon: FaCopy, description: "Replicar último valor cuando faltan datos", type: "boolean" },
  { key: "use_transaction_atomic", label: "Transacción atómica", unit: "", icon: FaDatabase, description: "Usar transacciones atómicas al guardar datos", type: "boolean" },
];

const formatValue = (field, value) => {
  if (field.type === "boolean") {
    return value ? "Sí" : "No";
  }
  if (value == null || value === "") return null;
  return `${value} ${field.unit}`.trim();
};

const PointConfigDrawer = ({ open, onClose, pointName, pointId, configData, loading, onSave }) => {
  const navigate = useNavigate();
  const { isSuperUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    if (!open) {
      setIsEditing(false);
      setEditValues({});
    }
  }, [open]);

  const handleNavigateToTelemetry = () => {
    onClose();
    navigate("/telemetry");
  };

  const startEditing = () => {
    const initial = {};
    CONFIG_FIELDS.forEach((field) => {
      initial[field.key] = configData?.[field.key] ?? "";
    });
    setEditValues(initial);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!pointId) {
      message.error("No se encontró el identificador del punto");
      return;
    }
    setSaving(true);
    try {
      const configToSave = {};
      CONFIG_FIELDS.forEach((field) => {
        const raw = editValues[field.key];
        if (field.type === "boolean") {
          configToSave[field.key] = Boolean(raw);
        } else {
          const parsed = raw === "" || raw == null ? null : Number(raw);
          configToSave[field.key] = Number.isNaN(parsed) ? raw : parsed;
        }
      });
      await orchestrator.pointsConfigUpdate(pointId, configToSave);
      message.success("Configuración guardada");
      setIsEditing(false);
      await onSave?.();
    } catch (err) {
      console.error("[PointConfigDrawer] Error guardando config:", err);
      message.error(err?.response?.data?.detail || "Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  };

  const renderFieldControl = (field) => {
    const value = editValues[field.key];
    if (field.type === "boolean") {
      return (
        <Switch
          size="small"
          checked={Boolean(value)}
          onChange={(checked) => setEditValues((prev) => ({ ...prev, [field.key]: checked }))}
        />
      );
    }
    return (
      <Input
        size="small"
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => setEditValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
        style={{ width: 110, textAlign: "right" }}
        suffix={<Text type="secondary" style={{ fontSize: 11 }}>{field.unit}</Text>}
      />
    );
  };

  const renderFooter = () => {
    if (isEditing) {
      return (
        <Flex justify="space-between" align="center">
          <Button icon={<FaTimes />} onClick={() => setIsEditing(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button type="primary" icon={<FaSave />} loading={saving} onClick={handleSave}>
            Guardar cambios
          </Button>
        </Flex>
      );
    }
    return (
      <Flex justify="space-between" align="center">
        <Text className="ocean-text-md ocean-text-secondary">Ficha técnica rápida</Text>
        <Flex gap={8}>
          {isSuperUser && (
            <Button icon={<FaEdit />} onClick={startEditing}>
              Editar
            </Button>
          )}
          <Button type="primary" icon={<FaArrowRight className="ocean-text-sm" />} onClick={handleNavigateToTelemetry}>
            Ver más en Telemetría
          </Button>
        </Flex>
      </Flex>
    );
  };

  return (
    <Drawer
      title={
        <Flex align="center" gap={8}>
          <FaInfoCircle className="ocean-icon-cyan" />
          <Text strong className="ocean-text-xl ocean-text-primary">
            {pointName || "Configuración del punto"}
          </Text>
        </Flex>
      }
      open={open}
      onClose={onClose}
      width={520}
      styles={{ body: { padding: 20 } }}
      footer={renderFooter()}
    >
      {loading ? (
        <Flex justify="center" align="center" className="ocean-empty-state">
          <Spin size="large" tip="Cargando configuración..." />
        </Flex>
      ) : (
        <Flex vertical gap={10}>
          <Text className="ocean-text-base ocean-text-secondary ocean-mb-sm">
            {isEditing
              ? "Edita los parámetros técnicos del punto de captación."
              : "Parámetros técnicos configurados para este punto de captación."}
          </Text>

          {CONFIG_FIELDS.map((field) => {
            const Icon = field.icon;
            const value = configData?.[field.key];
            const displayValue = formatValue(field, value);
            const hasValue = displayValue != null;

            return (
              <Card
                key={field.key}
                size="small"
                bodyStyle={{ padding: "10px 14px" }}
                style={{
                  border: `1px solid ${hasValue || isEditing ? 'rgba(58, 104, 170, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                  background: hasValue || isEditing ? 'rgba(58, 104, 170, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                }}
                className="ocean-panel"
              >
                <Flex align="center" gap={12}>
                  <div
                    className={hasValue || isEditing ? "ocean-icon-badge" : "ocean-icon-badge-muted"}
                    style={{
                      border: `1px solid ${hasValue || isEditing ? 'rgba(58, 104, 170, 0.2)' : 'rgba(255, 255, 255, 0.05)'}`,
                    }}
                  >
                    <Icon style={{ fontSize: 14, color: hasValue || isEditing ? '#CCCF07' : 'rgba(255, 255, 255, 0.3)' }} />
                  </div>
                  <Flex vertical gap={1} style={{ flex: 1 }}>
                    <Text strong className={hasValue || isEditing ? "ocean-text-base ocean-text-primary" : "ocean-text-base ocean-text-disabled"}>
                      {field.label}
                    </Text>
                    <Text className="ocean-text-sm ocean-text-muted">{field.description}</Text>
                  </Flex>
                  {isEditing ? (
                    renderFieldControl(field)
                  ) : (
                    <Text
                      strong
                      className={hasValue ? "ocean-text-lg ocean-text-cyan-light" : "ocean-text-lg ocean-text-disabled"}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {hasValue ? displayValue : "No configurado"}
                    </Text>
                  )}
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
