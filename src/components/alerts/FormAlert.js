import React, { useState, useContext } from "react";
import { Form, Input, Button, Flex, Select, Alert } from "antd";
import { RocketFilled, ClearOutlined, PlusOutlined } from "@ant-design/icons";
import sh from "../../api/sh/endpoints";
import { AppContext } from "../../App";

const FormAlert = ({ update, setUpdate }) => {
  const [form] = Form.useForm();
  const { state } = useContext(AppContext);
  const selected_id = state.selected_profile.id;
  const canManageAlerts = state.selected_profile?.profile_ikolu?.m6 || false;

  const handleSubmit = async (values) => {
    console.log("Form values: ", values);
    values = {
      ...values,
      point_catchment: selected_id,
      type_notification: "ALERT",
    };
    const rq = await sh.notifications.create(values).then((res) => {
      console.log("Notification created: ", res);
      form.resetFields();
      setUpdate(!update);
    });

    // Handle form submission logic here
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
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        label="Nombre"
        name="title"
        rules={[{ required: true, message: "Campo requerido" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Variable"
        name="type_variable"
        rules={[{ required: true, message: "Campo requerido" }]}
      >
        <Select placeholder="Seleccione una opción.">
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
        rules={[{ required: true, message: "Campo requerido" }]}
        name="type_alert"
        style={{ marginBottom: "50px" }}
        help="Está condición se aplicará al valor de la variable seleccionada."
      >
        <Select placeholder="Seleccione una opción.">
          <Select.Option value="MAX">Mayor que</Select.Option>
          <Select.Option value="MIN">Menor que</Select.Option>
          <Select.Option value="EQUALS">Igual que</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        label="Valor"
        name="value"
        rules={[{ required: true, message: "Campo requerido" }]}
      >
        <Input placeholder="0" />
      </Form.Item>

      <Form.Item
        label="Email"
        help="Ingrese un correo electrónico para recibir notificaciones."
        name="message"
        rules={[{ required: true, message: "Campo obligatorio" }]}
      >
        <Input placeholder="nombre@dominio.cl" rows={4} />
      </Form.Item>

      <Flex gap="small">
        <Button type="primary" htmlType="submit" icon={<RocketFilled />}>
          Crear
        </Button>
        <Button
          type="primary"
          icon={<ClearOutlined />}
          onClick={() => form.resetFields()}
        >
          Limpiar
        </Button>
      </Flex>
    </Form>
  );
};

export default FormAlert;
