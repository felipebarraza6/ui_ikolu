import React, { useState, useContext } from "react";
import { Form, Input, Button, Flex, Select, Row, Col } from "antd";
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
        <Input
          placeholder="Ingrese el título del ticket"
          style={{ borderColor: "#FF6B35" }}
        />
      </Form.Item>

      <Form.Item
        label="Variable"
        name="type_variable"
        help="Seleccione una variable para especificar el tipo de incidencia."
      >
        <Select
          placeholder="Seleccione una opción"
          style={{ borderColor: "#FF6B35" }}
        >
          <Select.Option value="NIVEL">Nivel Freático (m)</Select.Option>
          <Select.Option value="CAUDAL">Caudal (L/s)</Select.Option>
          <Select.Option value="CAUDAL PROMEDIO">
            Caudal Medio (L/s)
          </Select.Option>
          <Select.Option value="TOTALIZADO">Acumulado (m³)</Select.Option>
          <Select.Option value="TODOS">Análisis completo</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Mensaje"
        name="message"
        rules={[{ required: true, message: "Campo obligatorio" }]}
      >
        <Input.TextArea
          placeholder="Describa detalladamente su requerimiento o problema..."
          rows={4}
          style={{ borderColor: "#FF6B35" }}
        />
      </Form.Item>

      <Row gutter={8}>
        <Col span={12}>
          <Button
            type="primary"
            htmlType="submit"
            icon={<RocketFilled />}
            style={{
              width: "100%",
              backgroundColor: "#FF6B35",
              borderColor: "#FF6B35",
              fontWeight: "500",
            }}
          >
            Crear Ticket
          </Button>
        </Col>
        <Col span={12}>
          <Button
            type="default"
            icon={<ClearOutlined />}
            onClick={() => form.resetFields()}
            style={{
              width: "100%",
              borderColor: "#1F3461",
              color: "#1F3461",
            }}
          >
            Limpiar
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default FormSupport;
