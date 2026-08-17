import React, { useEffect, useState, useCallback } from "react";
import { Drawer, Flex, Typography, Spin, Card, Input, Switch, Button, Select, DatePicker, Tag, message, Empty } from "antd";
import { FaFileAlt, FaEdit, FaSave, FaTimes, FaTrash } from "react-icons/fa";
import dayjs from "dayjs";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import { useAuth } from "../../../contexts/AuthContext";
import orchestrator from "../../../api/orchestrator";

const { Text } = Typography;

const STANDARD_OPTIONS = [
  { value: "SIN_ESTANDAR", label: "Sin estándar" },
  { value: "MAYOR", label: "Mayor" },
  { value: "MEDIO", label: "Medio" },
  { value: "MENOR", label: "Menor" },
  { value: "CAUDALES_MUY_PEQUENOS", label: "Caudales muy pequeños" },
];

const TYPE_DGA_OPTIONS = [
  { value: "SUBTERRANEO", label: "Subterráneo" },
  { value: "SUPERFICIAL", label: "Superficial" },
];

/** Determines point type based on code_dga prefix */
const getCodeType = (codeDga) => {
  if (!codeDga || codeDga.trim() === "") return "unknown";
  return codeDga.trim().toUpperCase().startsWith("OB") ? "dga" : "sma";
};

// DGA fields - shown only when code starts with OB
const DGA_EDITABLE_FIELDS = [
  { key: "send_dga", label: "Activar cumplimiento DGA", type: "boolean" },
  { key: "standard", label: "Estándar", type: "select", options: STANDARD_OPTIONS },
  { key: "type_dga", label: "Tipo DGA", type: "select", options: TYPE_DGA_OPTIONS, nullable: true },
  { key: "code_dga", label: "Código de obra DGA", type: "text" },
  { key: "flow_granted_dga", label: "Caudal otorgado (L/s)", type: "text", placeholder: "Ej: 18.00" },
  { key: "total_granted_dga", label: "Totalizado otorgado (m³)", type: "number" },
  { key: "shac", label: "Sector hidrológico SHAC", type: "text" },
  { key: "region_dga", label: "DGA Región", type: "text" },
  { key: "date_start_compliance", label: "Fecha inicio envío DGA", type: "date" },
  { key: "date_created_code", label: "Fecha código creación DGA", type: "date" },
  { key: "name_informant", label: "Nombre informante", type: "text" },
  { key: "rut_report_dga", label: "RUT", type: "text" },
  { key: "password_dga_software", label: "Clave DGA", type: "password", placeholder: "Dejar vacío para usar default" },
];

// SMA fields - shown only when code does NOT start with OB
const SMA_EDITABLE_FIELDS = [
  { key: "send_sma", label: "Activar envío SMA", type: "boolean" },
  { key: "sma_device_id", label: "ID dispositivo SMA", type: "text" },
];

// All fields combined (for save)
const ALL_EDITABLE_FIELDS = [...DGA_EDITABLE_FIELDS, ...SMA_EDITABLE_FIELDS];

const DGA_VIEW_FIELDS = [
  { key: "send_dga", label: "Activar cumplimiento DGA", type: "boolean" },
  { key: "standard", label: "Estándar", type: "enum" },
  { key: "type_dga", label: "Tipo DGA", type: "enum" },
  { key: "code_dga", label: "Código de obra DGA", type: "text" },
  { key: "flow_granted_dga", label: "Caudal otorgado (L/s)", type: "decimal" },
  { key: "total_granted_dga", label: "Totalizado otorgado (m³)", type: "number" },
  { key: "shac", label: "Sector hidrológico SHAC", type: "text" },
  { key: "region_dga", label: "DGA Región", type: "text" },
  { key: "date_start_compliance", label: "Fecha inicio envío DGA", type: "date" },
  { key: "date_created_code", label: "Fecha código creación DGA", type: "date" },
  { key: "name_informant", label: "Nombre informante", type: "text" },
  { key: "rut_report_dga", label: "RUT", type: "text" },
  { key: "password_dga_software", label: "Clave DGA", type: "password" },
];

const SMA_VIEW_FIELDS = [
  { key: "send_sma", label: "Activar envío SMA", type: "boolean" },
  { key: "sma_device_id", label: "ID dispositivo SMA", type: "text" },
];

const META_VIEW_FIELDS = [
  { key: "created", label: "Creado", type: "datetime" },
  { key: "modified", label: "Modificado", type: "datetime" },
];

const formatViewValue = (key, value, token) => {
  if (value == null || value === "") return <Text style={{ color: token.voidTextMuted }}>—</Text>;
  if (typeof value === "boolean") {
    return <Tag color={value ? "green" : "default"} style={{ margin: 0 }}>{value ? "Sí" : "No"}</Tag>;
  }
  if (key === "standard") {
    const opt = STANDARD_OPTIONS.find((o) => o.value === value);
    return <Text strong style={{ fontSize: 13, color: token.voidTextHeading }}>{opt?.label || value}</Text>;
  }
  if (key === "type_dga") {
    const opt = TYPE_DGA_OPTIONS.find((o) => o.value === value);
    return <Text style={{ fontSize: 13, color: token.voidTextHeading }}>{opt?.label || value}</Text>;
  }
  if (key === "flow_granted_dga") {
    return <Text strong style={{ fontSize: 14, color: token.colorPrimary }}>{Number(value).toFixed(2)} L/s</Text>;
  }
  if (key === "total_granted_dga") {
    return <Text strong style={{ fontSize: 14, color: token.voidTextHeading }}>{Number(value).toLocaleString()} m³</Text>;
  }
  if (key === "password_dga_software") {
    return <Text style={{ fontSize: 13, color: token.voidTextMuted }}>••••••••</Text>;
  }
  if (key === "created" || key === "modified") {
    return <Text style={{ fontSize: 12, color: token.voidTextMuted }}>{dayjs(value).format("DD/MM/YYYY HH:mm")}</Text>;
  }
  return <Text style={{ fontSize: 13, color: token.voidTextHeading }}>{String(value)}</Text>;
};

const DgaConfigDrawer = ({ open, onClose, pointId, pointName }) => {
  const token = useIkoluToken();
  const { isSuperUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [configId, setConfigId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [rawData, setRawData] = useState(null);

  // Determine which fields to show based on code_dga prefix
  const codeType = getCodeType(
    isEditing ? formValues.code_dga : rawData?.code_dga
  );

  const visibleEditFields = [
    ...DGA_EDITABLE_FIELDS,
    ...SMA_EDITABLE_FIELDS,
  ].filter((field) => {
    const isDgaField = DGA_EDITABLE_FIELDS.some((d) => d.key === field.key);
    const isSmaField = SMA_EDITABLE_FIELDS.some((s) => s.key === field.key);
    if (codeType === "unknown") return true;
    if (codeType === "dga") return isDgaField;
    if (codeType === "sma") return isSmaField;
    return true;
  });

  const visibleViewFields = [
    ...DGA_VIEW_FIELDS,
    ...SMA_VIEW_FIELDS,
    ...META_VIEW_FIELDS,
  ].filter((field) => {
    const isDgaField = DGA_VIEW_FIELDS.some((d) => d.key === field.key);
    const isSmaField = SMA_VIEW_FIELDS.some((s) => s.key === field.key);
    if (codeType === "unknown") return true;
    if (codeType === "dga") return isDgaField;
    if (codeType === "sma") return isSmaField;
    return true;
  });

  const resetState = useCallback(() => {
    setConfigId(null);
    setIsEditing(false);
    setIsNew(false);
    setFormValues({});
    setRawData(null);
  }, []);

  useEffect(() => {
    if (!open || !pointId) return;
    resetState();

    let cancelled = false;

    const fetchDgaConfig = async () => {
      setLoading(true);
      try {
        const res = await orchestrator.dgaConfigs.list({ point_catchment: pointId });
        const results = res?.results || [];
        const config = Array.isArray(results) ? results[0] : results;

        if (!cancelled) {
          if (config && config.id) {
            setConfigId(config.id);
            setRawData(config);
            setFormValues({ ...config });
          } else {
            setIsNew(true);
            setFormValues({ point_catchment: pointId });
          }
        }
      } catch (err) {
        console.error("[DgaConfigDrawer] Error fetching:", err);
        if (!cancelled) {
          setIsNew(true);
          setFormValues({ point_catchment: pointId });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDgaConfig();
    return () => { cancelled = true; };
  }, [open, pointId, resetState]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {};
      ALL_EDITABLE_FIELDS.forEach(({ key, type }) => {
        let val = formValues[key];
        if (type === "date" && val) {
          val = typeof val === "string" ? val : val.format?.("YYYY-MM-DD") || val;
        }
        if (type === "number" && val !== null && val !== "" && val !== undefined) {
          val = Number(val);
        }
        payload[key] = val === undefined ? null : val;
      });
      payload.point_catchment = pointId;

      if (isNew || !configId) {
        const created = await orchestrator.dgaConfigs.create(payload);
        setConfigId(created.id);
        setRawData(created);
        setFormValues({ ...created });
        setIsNew(false);
        message.success("Configuración DGA creada");
      } else {
        const updated = await orchestrator.dgaConfigs.update(configId, payload);
        const merged = { ...rawData, ...updated };
        setRawData(merged);
        setFormValues({ ...merged });
        message.success("Configuración DGA actualizada");
      }
      setIsEditing(false);
    } catch (err) {
      console.error("[DgaConfigDrawer] Error saving:", err);
      message.error(err?.response?.data?.detail || "Error al guardar la configuración DGA");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!configId) return;
    try {
      await orchestrator.dgaConfigs.delete(configId);
      message.success("Configuración DGA eliminada");
      resetState();
      setIsNew(true);
      setFormValues({ point_catchment: pointId });
    } catch (err) {
      message.error("Error al eliminar la configuración DGA");
    }
  };

  const handleFieldChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const renderEditField = (field, currentValue) => {
    const { key, type, options, nullable, placeholder } = field;

    if (type === "boolean") {
      return (
        <Switch
          size="small"
          checked={Boolean(currentValue)}
          onChange={(checked) => handleFieldChange(key, checked)}
        />
      );
    }

    if (type === "select") {
      return (
        <Select
          size="small"
          value={currentValue || undefined}
          onChange={(val) => handleFieldChange(key, val)}
          options={options}
          allowClear={nullable}
          placeholder={placeholder || "Seleccionar..."}
          style={{ width: 220 }}
        />
      );
    }

    if (type === "date") {
      return (
        <DatePicker
          size="small"
          value={currentValue ? dayjs(currentValue) : null}
          onChange={(date) => handleFieldChange(key, date ? date.format("YYYY-MM-DD") : null)}
          format="DD/MM/YYYY"
          style={{ width: 180 }}
        />
      );
    }

    if (type === "password") {
      return (
        <Input.Password
          size="small"
          value={currentValue ?? ""}
          onChange={(e) => handleFieldChange(key, e.target.value)}
          placeholder={placeholder || ""}
          style={{ width: 220 }}
        />
      );
    }

    if (type === "number") {
      return (
        <Input
          size="small"
          type="number"
          value={currentValue ?? ""}
          onChange={(e) => handleFieldChange(key, e.target.value)}
          style={{ width: 220, textAlign: "right" }}
        />
      );
    }

    return (
      <Input
        size="small"
        value={currentValue ?? ""}
        onChange={(e) => handleFieldChange(key, e.target.value)}
        placeholder={placeholder || ""}
        style={{ width: 220 }}
      />
    );
  };

  return (
    <Drawer
      title={
        <Flex align="center" justify="space-between" style={{ width: "100%" }}>
          <Flex align="center" gap={8}>
            <FaFileAlt style={{ color: token.colorPrimary, fontSize: 16 }} />
            <Flex vertical gap={0}>
              <Text strong style={{ fontSize: 15, color: token.voidTextHeading, margin: 0 }}>
                Configuración DGA
              </Text>
              <Text style={{ fontSize: 11, color: token.voidTextMuted, margin: 0 }}>
                {pointName || `Punto #${pointId}`}
              </Text>
            </Flex>
          </Flex>
          <Flex gap={8}>
            {!isNew && !isEditing && isSuperUser && (
              <>
                <Button size="small" icon={<FaEdit />} onClick={() => setIsEditing(true)}>
                  Editar
                </Button>
                <Button size="small" danger icon={<FaTrash />} onClick={handleDelete}>
                  Eliminar
                </Button>
              </>
            )}
            {(isEditing || isNew) && (
              <>
                <Button
                  size="small"
                  icon={<FaTimes />}
                  onClick={() => {
                    if (isNew) {
                      onClose();
                    } else {
                      setIsEditing(false);
                      setFormValues({ ...rawData });
                    }
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  size="small"
                  type="primary"
                  icon={<FaSave />}
                  loading={saving}
                  onClick={handleSave}
                >
                  {isNew ? "Crear" : "Guardar"}
                </Button>
              </>
            )}
          </Flex>
        </Flex>
      }
      open={open}
      onClose={onClose}
      width={520}
      styles={{ body: { padding: 16, background: "transparent" } }}
    >
      {loading ? (
        <Flex justify="center" align="center" style={{ padding: "60px 0" }}>
          <Spin size="large" tip="Cargando configuración DGA..." />
        </Flex>
      ) : (
        <Flex vertical gap={8}>
          <Text style={{ fontSize: 12, color: token.voidTextMuted, marginBottom: 4 }}>
            {isNew
              ? "No existe configuración para este punto. Crea una nueva:"
              : isEditing
              ? codeType === "dga"
                ? "Edita los campos de configuración DGA del derecho de agua."
                : codeType === "sma"
                ? "Edita los campos de configuración SMA."
                : "Edita los campos de configuración."
              : codeType === "dga"
              ? "Configuración DGA registrada para este punto de captación."
              : codeType === "sma"
              ? "Configuración SMA registrada para este punto de captación."
              : "Configuración registrada para este punto de captación."}
          </Text>

          {(isEditing || isNew) ? (
            visibleEditFields.map((field, idx) => {
              const isDgaField = DGA_EDITABLE_FIELDS.some((d) => d.key === field.key);
              const isSmaField = SMA_EDITABLE_FIELDS.some((s) => s.key === field.key);
              const prevField = visibleEditFields[idx - 1];
              const prevIsDga = prevField && DGA_EDITABLE_FIELDS.some((d) => d.key === prevField.key);

              const showSeparator = isSmaField && prevIsDga;

              return (
                <React.Fragment key={field.key}>
                  {showSeparator && (
                    <Flex align="center" gap={8} style={{ margin: "8px 0 4px" }}>
                      <div style={{ flex: 1, height: 1, background: token.voidBorder }} />
                      <Text style={{ fontSize: 11, color: token.voidTextMuted, textTransform: "uppercase", letterSpacing: 1 }}>
                        SMA
                      </Text>
                      <div style={{ flex: 1, height: 1, background: token.voidBorder }} />
                    </Flex>
                  )}
                  <Card
                    size="small"
                    bodyStyle={{ padding: "10px 14px" }}
                    style={{
                      border: `1px solid ${token.voidBorder}`,
                      background: token.glassBg,
                      borderRadius: token.voidRadius,
                    }}
                  >
                    <Flex align="center" justify="space-between" gap={12}>
                      <Text style={{ fontSize: 12, color: token.voidTextMuted, flexShrink: 0, minWidth: 160 }}>
                        {field.label}
                      </Text>
                      {renderEditField(field, formValues[field.key])}
                    </Flex>
                  </Card>
                </React.Fragment>
              );
            })
          ) : rawData ? (
            visibleViewFields.map((field) => {
              const value = rawData[field.key];
              return (
                <Card
                  key={field.key}
                  size="small"
                  bodyStyle={{ padding: "10px 14px" }}
                  style={{
                    border: `1px solid ${token.voidBorder}`,
                    background: token.glassBg,
                    borderRadius: token.voidRadius,
                  }}
                >
                  <Flex align="center" justify="space-between" gap={12}>
                    <Text style={{ fontSize: 12, color: token.voidTextMuted, flexShrink: 0, minWidth: 160 }}>
                      {field.label}
                    </Text>
                    {formatViewValue(field.key, value, token)}
                  </Flex>
                </Card>
              );
            })
          ) : (
            <Flex justify="center" align="center" style={{ padding: "60px 0" }}>
              <Empty description={<Text style={{ color: token.voidTextMuted }}>No hay datos disponibles</Text>} />
            </Flex>
          )}
        </Flex>
      )}
    </Drawer>
  );
};

export default React.memo(DgaConfigDrawer);
