import React, { useState, useContext, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Flex,
  Select,
  Alert,
  DatePicker,
  Switch,
  Divider,
} from "antd";
import {
  RocketFilled,
  CloseOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import sh from "../../api/sh/endpoints";
import { AppContext } from "../../App";

const { RangePicker } = DatePicker;

const darkStyles = `
  .alert-form-dark .ant-form-item-label > label {
    color: rgba(255,255,255,0.85) !important;
    font-weight: 500 !important;
    font-size: 14px !important;
  }
  .alert-form-dark .ant-form-item-explain-error {
    color: #ff7875 !important;
    font-size: 12px !important;
    margin-top: 4px !important;
  }
  .alert-form-dark .ant-input,
  .alert-form-dark .ant-input-number-input,
  .alert-form-dark .ant-select-selector,
  .alert-form-dark .ant-picker {
    background: rgba(255,255,255,0.95) !important;
    color: #1F3461 !important;
    border-color: rgba(255,255,255,0.3) !important;
    border-radius: 8px !important;
  }
  .alert-form-dark .ant-select-arrow,
  .alert-form-dark .ant-picker-suffix {
    color: #1F3461 !important;
  }
  .alert-form-dark .ant-switch {
    background: rgba(255,255,255,0.2) !important;
  }
  .alert-form-dark .ant-switch-checked {
    background: #FF6B35 !important;
  }
  .alert-form-dark .ant-switch-inner-checked,
  .alert-form-dark .ant-switch-inner-unchecked {
    color: #fff !important;
    font-weight: 600 !important;
    font-size: 11px !important;
  }
  .alert-form-dark .ant-select-selection-placeholder {
    color: #888 !important;
  }
  .alert-form-dark .ant-picker-input > input {
    color: #1F3461 !important;
  }
  .alert-form-dark .ant-picker-input > input::placeholder {
    color: #888 !important;
  }
  .alert-form-dark .ant-input::placeholder {
    color: #888 !important;
  }
`;

const FormAlert = ({ record = null, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const { state } = useContext(AppContext);
  const selected_id = state.selected_profile.id;
  const canManageAlerts = state.selected_profile?.profile_ikolu?.m6 || false;
  const isEditing = !!record;
  const [submitting, setSubmitting] = useState(false);

  const hasRange = Form.useWatch("has_date_range", form);

  useEffect(() => {
    if (isEditing && record) {
      const hasDates = !!record.start_date || !!record.end_date;
      form.setFieldsValue({
        title: record.title,
        type_variable: record.type_variable,
        type_alert: record.type_alert,
        value: record.value,
        emails: record.emails || [],
        has_date_range: hasDates,
        date_range:
          hasDates && record.start_date && record.end_date
            ? [dayjs(record.start_date), dayjs(record.end_date)]
            : null,
      });
    } else {
      form.resetFields();
    }
  }, [record, form, isEditing]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    const payload = {
      title: values.title,
      type_variable: values.type_variable,
      type_alert: values.type_alert,
      value: values.value,
      message: values.title || "",
      emails: values.emails || [],
      point_catchment: selected_id,
      type_notification: "ALERT",
    };

    if (!isEditing) {
      payload.is_active = true;
    }

    if (
      values.has_date_range &&
      values.date_range &&
      values.date_range.length === 2
    ) {
      payload.start_date = values.date_range[0].format("YYYY-MM-DD");
      payload.end_date = values.date_range[1].format("YYYY-MM-DD");
    } else {
      payload.start_date = null;
      payload.end_date = null;
    }

    try {
      if (isEditing) {
        await sh.notifications.update(record.id, payload);
      } else {
        await sh.notifications.create(payload);
      }

      form.resetFields();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving alert:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!canManageAlerts) {
    return (
      <Alert
        message="Módulo de alertas no activado"
        description="Este punto de captación no tiene habilitado el módulo de alertas. Contacte al administrador para activarlo."
        type="warning"
        showIcon
      />
    );
  }

  return (
    <div className="alert-form-dark">
      <style>{darkStyles}</style>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ maxWidth: "100%" }}
      >
        <Form.Item
          label="Nombre de la alerta"
          name="title"
          rules={[{ required: true, message: "Ingresa un nombre" }]}
        >
          <Input placeholder="Ej: Nivel crítico - Pozo 1" />
        </Form.Item>

        <Flex gap="middle" wrap="wrap">
          <Form.Item
            label="Variable"
            name="type_variable"
            rules={[{ required: true, message: "Selecciona una variable" }]}
            style={{ flex: 1, minWidth: 160 }}
          >
            <Select placeholder="Seleccione variable">
              <Select.Option value="NIVEL">Nivel Freático (m)</Select.Option>
              <Select.Option value="CAUDAL">Caudal (lt/s)</Select.Option>
              <Select.Option value="CAUDAL PROMEDIO">
                Caudal Medio (lt)
              </Select.Option>
              <Select.Option value="TOTALIZADO">Totalizado (m³)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Condición"
            name="type_alert"
            rules={[{ required: true, message: "Selecciona una condición" }]}
            style={{ flex: 1, minWidth: 160 }}
          >
            <Select placeholder="Condición">
              <Select.Option value="MAX">Mayor que (&gt;)</Select.Option>
              <Select.Option value="MIN">Menor que (&lt;)</Select.Option>
              <Select.Option value="EQUALS">Igual que (=)</Select.Option>
            </Select>
          </Form.Item>
        </Flex>

        <Form.Item
          label="Umbral (valor límite)"
          name="value"
          rules={[{ required: true, message: "Ingresa el umbral" }]}
        >
          <Input placeholder="Ej: 15.5" type="number" />
        </Form.Item>

        <Divider style={{ margin: "12px 0", borderColor: "rgba(255,255,255,0.1)" }} />

        <Form.Item
          label="Modo de vigencia"
          name="has_date_range"
          valuePropName="checked"
          initialValue={false}
        >
          <Switch
            checkedChildren="Rango de fechas"
            unCheckedChildren="Siempre activa"
          />
        </Form.Item>

        {hasRange && (
          <Form.Item
            label="Rango de operación"
            name="date_range"
            rules={[
              { required: true, message: "Seleccione el rango de fechas" },
            ]}
          >
            <RangePicker
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              placeholder={["Fecha inicio", "Fecha fin"]}
            />
          </Form.Item>
        )}

        <Divider style={{ margin: "12px 0", borderColor: "rgba(255,255,255,0.1)" }} />

        <Form.Item
          label="Emails de notificación"
          name="emails"
          rules={[
            { required: true, message: "Agrega al menos un email" },
          ]}
        >
          <Select
            mode="tags"
            placeholder="operador@empresa.cl, soporte@empresa.cl"
            tokenSeparators={[",", " "]}
            open={false}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Flex gap="middle" style={{ marginTop: 8 }}>
          <Button
            size="large"
            block
            icon={<CloseOutlined />}
            onClick={onCancel}
            disabled={submitting}
            style={{
              background: "transparent",
              borderColor: "rgba(255,255,255,0.3)",
              color: "rgba(255,255,255,0.85)",
              fontWeight: 500,
            }}
          >
            Cancelar
          </Button>
          <Button
            type="primary"
            size="large"
            block
            htmlType="submit"
            icon={isEditing ? <SaveOutlined /> : <RocketFilled />}
            loading={submitting}
            style={{
              background: "#FF6B35",
              borderColor: "#FF6B35",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            {isEditing ? "Guardar cambios" : "Crear alerta"}
          </Button>
        </Flex>
      </Form>
    </div>
  );
};

export default FormAlert;
