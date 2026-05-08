import React, { useContext, useState, useEffect } from "react";
import {
  Drawer,
  Form,
  Input,
  Button,
  Select,
  notification,
  Row,
  Col,
  Tabs,
  Switch,
  Tag,
  Flex,
} from "antd";
import {
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import sh from "../../api/sh/endpoints";
import { useResponsive } from "../../hooks/useResponsive";

const { TabPane } = Tabs;

const typeLabels = {
  CAUDAL_PROMEDIO: "Caudal Promedio",
  CAUDAL: "Caudal",
  NIVEL: "Nivel",
  TOTALIZADO: "Totalizado",
};

const typeColors = {
  CAUDAL_PROMEDIO: "blue",
  CAUDAL: "cyan",
  NIVEL: "geekblue",
  TOTALIZADO: "green",
};

const WellConfigDrawer = ({ visible, onClose }) => {
  const { state } = useContext(AppContext);
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(false);
  const isAdmin = state.user?.is_staff || false;

  const [form] = Form.useForm();

  const profile = state.selected_profile || {};

  useEffect(() => {
    if (visible && profile.id) {
      const cd = profile.config_data || {};
      form.setFieldsValue({
        title: profile.title,
        frecuency: profile.frecuency,
        lat: profile.lat,
        lon: profile.lon,
        is_telemetry: cd.is_telemetry ?? true,
        d1: cd.d1,
        d2: cd.d2,
        d3: cd.d3,
        d4: cd.d4,
        d5: cd.d5,
        d6: cd.d6,
        variables: cd.variables || [],
      });
    }
  }, [visible, profile.id]);

  const handleSave = async (values) => {
    setLoading(true);
    try {
      const {
        variables,
        d1,
        d2,
        d3,
        d4,
        d5,
        d6,
        is_telemetry,
        ...general
      } = values;
      const payload = {
        ...general,
        config_data: {
          ...(profile.config_data || {}),
          is_telemetry,
          d1,
          d2,
          d3,
          d4,
          d5,
          d6,
          variables,
        },
      };
      await sh.update_data_sh(profile.id, payload);
      notification.success({ message: "Configuración guardada" });
      onClose();
    } catch (err) {
      notification.error({
        message: "Error al guardar",
        description: "Verifica que el endpoint de configuración esté disponible.",
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    color: "white",
    borderColor: "rgba(255,255,255,0.2)",
  };

  const numberInputStyle = {
    ...inputStyle,
  };

  const buttonStyle = {
    width: "100%",
    background: "#1F3461",
    borderColor: "#1F3461",
    height: 44,
    fontWeight: 600,
  };

  const tabStyle = {
    color: "rgba(255,255,255,0.7)",
  };

  const renderVariableFields = (name, restField, variable) => {
    const type = variable?.type_variable;
    const isTotalizado = type === "TOTALIZADO";
    const isNivel = type === "NIVEL";
    const isCaudal = type === "CAUDAL" || type === "CAUDAL_PROMEDIO";

    return (
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          padding: "12px",
          marginBottom: 10,
        }}
      >
        {/* Header: código + tipo */}
        <Flex justify="space-between" align="center" style={{ marginBottom: 10 }}>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600 }}>
            {variable?.str_variable || `Var ${name + 1}`}
          </span>
          <Tag
            color={typeColors[type] || "default"}
            style={{ fontSize: 10, margin: 0, padding: "0 6px", lineHeight: "18px" }}
          >
            {typeLabels[type] || type}
          </Tag>
        </Flex>

        {/* Campos comunes */}
        <Row gutter={[10, 0]}>
          <Col span={12}>
            <Form.Item
              {...restField}
              name={[name, "label"]}
              label={<span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>Nombre</span>}
              style={{ marginBottom: 6 }}
            >
              <Input style={inputStyle} placeholder="Nombre" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              {...restField}
              name={[name, "str_variable"]}
              label={<span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>Código</span>}
              style={{ marginBottom: 6 }}
            >
              <Input style={inputStyle} placeholder="Código técnico" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              {...restField}
              name={[name, "unit_measurement"]}
              label={<span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>Unidad</span>}
              style={{ marginBottom: 6 }}
            >
              <Input style={inputStyle} placeholder="Ej: lt/s, m, m³" />
            </Form.Item>
          </Col>
        </Row>

        {/* Campos específicos por tipo */}
        {isTotalizado && (
          <Row gutter={[10, 0]}>
            <Col span={12}>
              <Form.Item
                {...restField}
                name={[name, "pulses_factor"]}
                label={<span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>Pulsos (Lt/p)</span>}
                style={{ marginBottom: 6 }}
              >
                <Input type="number" step="0.01" style={numberInputStyle} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                {...restField}
                name={[name, "addition"]}
                label={<span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>Adición</span>}
                style={{ marginBottom: 6 }}
              >
                <Input type="number" step="0.01" style={numberInputStyle} />
              </Form.Item>
            </Col>
          </Row>
        )}

        {isNivel && (
          <Row gutter={[10, 0]}>
            <Col span={12}>
              <Form.Item
                {...restField}
                name={[name, "calculate_nivel"]}
                label={<span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>Base de cálculo (m)</span>}
                style={{ marginBottom: 6 }}
              >
                <Input type="number" step="0.01" style={numberInputStyle} />
              </Form.Item>
            </Col>
          </Row>
        )}

        {isCaudal && (
          <Form.Item
            {...restField}
            name={[name, "convert_to_lt"]}
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Switch
              checkedChildren="Convertir a Lt"
              unCheckedChildren="Sin conversión"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            />
          </Form.Item>
        )}
      </div>
    );
  };

  return (
    <Drawer
      title={
        <span style={{ color: "#BDC00C", fontWeight: 700, fontSize: 17, letterSpacing: 0.5 }}>
          CONFIGURACIÓN DEL PUNTO
        </span>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={isMobile ? "100%" : 560}
      styles={{
        body: { background: "#0a0e27", padding: "24px" },
        header: { background: "#0f152e", borderBottom: "1px solid rgba(255,107,53,0.25)" },
        mask: { background: "rgba(0,0,0,0.75)" },
      }}
      closeIcon={<span style={{ color: "#BDC00C", fontSize: 18 }}>✕</span>}
      extra={
        <Button
          icon={<CloseOutlined />}
          onClick={onClose}
          style={{
            background: "transparent",
            borderColor: "rgba(255,255,255,0.3)",
            color: "rgba(255,255,255,0.85)",
          }}
        >
          Cerrar
        </Button>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Tabs
          defaultActiveKey="general"
          style={{ color: "white" }}
          tabBarStyle={{ borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: 20 }}
        >
          <TabPane
            tab={<span style={tabStyle}>General</span>}
            key="general"
          >
            <Row gutter={[12, 0]}>
              <Col span={12}>
                <Form.Item
                  name="title"
                  label={<span style={{ color: "rgba(255,255,255,0.7)" }}>Nombre del punto</span>}
                  rules={[{ required: true }]}
                >
                  <Input style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="frecuency"
                  label={
                    <span style={{ color: isAdmin ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)" }}>
                      Frecuencia (min) {!isAdmin && "— Solo admin"}
                    </span>
                  }
                >
                  <Select style={inputStyle} disabled={!isAdmin}>
                    <Select.Option value="1">1 min</Select.Option>
                    <Select.Option value="5">5 min</Select.Option>
                    <Select.Option value="10">10 min</Select.Option>
                    <Select.Option value="60">60 min</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[12, 0]}>
              <Col span={12}>
                <Form.Item
                  name="lat"
                  label={<span style={{ color: "rgba(255,255,255,0.7)" }}>Latitud</span>}
                >
                  <Input type="number" step="0.000001" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="lon"
                  label={<span style={{ color: "rgba(255,255,255,0.7)" }}>Longitud</span>}
                >
                  <Input type="number" step="0.000001" style={inputStyle} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="is_telemetry"
              valuePropName="checked"
              style={{ marginBottom: 16 }}
            >
              <Switch
                checkedChildren="Activo"
                unCheckedChildren="Inactivo"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              />
            </Form.Item>

            <div style={{ margin: "16px 0 8px" }}>
              <span style={{ color: "#BDC00C", fontSize: 13, fontWeight: 600 }}>
                DATOS TÉCNICOS DEL POZO
              </span>
            </div>

            <Row gutter={[12, 0]}>
              <Col span={12}>
                <Form.Item
                  name="d1"
                  label={<span style={{ color: "rgba(255,255,255,0.7)" }}>Profundidad (m)</span>}
                >
                  <Input type="number" step="0.01" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="d2"
                  label={<span style={{ color: "rgba(255,255,255,0.7)" }}>Bomba (m)</span>}
                >
                  <Input type="number" step="0.01" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="d3"
                  label={<span style={{ color: "rgba(255,255,255,0.7)" }}>Nivel (m)</span>}
                >
                  <Input type="number" step="0.01" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="d4"
                  label={<span style={{ color: "rgba(255,255,255,0.7)" }}>Ducto (pulg)</span>}
                >
                  <Input type="number" step="0.01" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="d5"
                  label={<span style={{ color: "rgba(255,255,255,0.7)" }}>Flujómetro (pulg)</span>}
                >
                  <Input type="number" step="0.01" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="d6"
                  label={<span style={{ color: "rgba(255,255,255,0.7)" }}>m³ Iniciales</span>}
                >
                  <Input type="number" step="1" style={inputStyle} />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={<span style={tabStyle}>Variables</span>}
            key="variables"
          >
            <Form.List name="variables">
              {(fields) => (
                <Flex vertical>
                  {fields.length === 0 && (
                    <div style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", padding: 24 }}>
                      No hay variables configuradas
                    </div>
                  )}
                  {fields.map(({ key, name, ...restField }) => {
                    const variable = form.getFieldValue(["variables", name]);
                    return (
                      <div key={key}>
                        {renderVariableFields(name, restField, variable)}
                      </div>
                    );
                  })}
                </Flex>
              )}
            </Form.List>
          </TabPane>
        </Tabs>

        <Form.Item style={{ marginTop: 16 }}>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={loading}
            style={buttonStyle}
          >
            Guardar
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default WellConfigDrawer;
