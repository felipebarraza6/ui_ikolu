import React, { useState } from "react";
import { Modal, Form, Input, DatePicker } from "antd";

const ModalNuevoRegistro = ({ visible, onCancel, onCreate }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onCreate(values.nombre, values.anio.year());
        form.resetFields();
      })
      .catch(() => {});
  };

  return (
    <Modal
      open={visible}
      title="Nuevo registro de consumo"
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleOk}
      okText="Crear"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Nombre del registro"
          name="nombre"
          rules={[{ required: true, message: "Ingrese un nombre" }]}
        >
          <Input placeholder="Ej: Consumo Planta Norte" />
        </Form.Item>
        <Form.Item
          label="Año"
          name="anio"
          rules={[{ required: true, message: "Seleccione un año" }]}
        >
          <DatePicker picker="year" style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalNuevoRegistro;
