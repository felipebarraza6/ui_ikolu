import React, { useState, useContext } from "react";
import { Form, Input, Button, Flex, Select } from "antd";
import { RocketFilled, ClearOutlined, PlusOutlined } from "@ant-design/icons";
import sh from "../../api/sh/endpoints";
import { AppContext } from "../../App";

const FormSupport = ({ update, setUpdate }) => {
  const [form] = Form.useForm();
  const { state } = useContext(AppContext);
  const selected_id = state.selected_profile.id;
  const handleSubmit = async (values) => {
    console.log("Form values: ", values);
    values = {
      ...values,
      point_catchment: selected_id,
      type_notification: "SUPPORT",
    };
    const rq = await sh.notifications.create(values).then((res) => {
      console.log("Notification created: ", res);
      form.resetFields();
      setUpdate(!update);
    });

    // Handle form submission logic here
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        label="Título"
        name="title"
        rules={[{ required: true, message: "Campo requerido" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Variable"
        name="type_variable"
        style={{ marginBottom: "50px" }}
        help="Seleccione una variable para especificar el tipo de incidencia."
      >
        <Select placeholder="Seleccione una opción.">
          <Select.Option value="NIVEL">Nivel Freático (m)</Select.Option>
          <Select.Option value="CAUDAL">Caudal (lt/s)</Select.Option>
          <Select.Option value="CAUDAL PROMEDIO">
            Caudal Medio (lt)
          </Select.Option>
          <Select.Option value="TOTALIZADO">Totalizado (m³)</Select.Option>
          <Select.Option value="TODOS">Análasis completo</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        label="Mensaje"
        name="message"
        rules={[{ required: true, message: "Campo obligatorio" }]}
      >
        <Input.TextArea placeholder="Describa su requerimiento..." rows={4} />
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

export default FormSupport;
