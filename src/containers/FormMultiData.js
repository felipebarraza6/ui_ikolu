import React from "react";
import {
  Form,
  Input,
  Flex,
  Button,
  Checkbox,
  Table,
  Statistic,
  Select,
  Card,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

const FormMultiData = () => {
  return (
    <Flex vertical gap={"large"}>
      <Flex>
        <h1>Dashboard de recurso hidrico </h1>
      </Flex>
      <Flex gap={"large"}>
        <Form layout="inline">
          <Form.Item label="Fecha de inicio">
            <Input type="date" />
          </Form.Item>
          <Form.Item label="Fecha de fin">
            <Input type="date" />
          </Form.Item>
          <Form.Item>
            <Button type="primary">Filtrar</Button>
          </Form.Item>
        </Form>
      </Flex>

      <Flex gap={"large"} justify="space-between">
        <Card hoverable>
          <Statistic
            title="Indicator 1"
            value={100}
            prefix={<PlusOutlined />}
            valueStyle={{ color: "#3f8600" }}
            suffix="m³"
          />
        </Card>
        <Card hoverable>
          <Statistic
            title="Indicator 2"
            value={200}
            prefix={<PlusOutlined />}
            valueStyle={{ color: "#3f8600" }}
            suffix="m³"
          />
        </Card>
        <Card hoverable>
          <Statistic
            title="Indicator 3"
            value={300}
            prefix={<PlusOutlined />}
            valueStyle={{ color: "#3f8600" }}
            suffix="m³"
          />
        </Card>
        <Card hoverable>
          <Statistic
            title="Indicator 4"
            value={400}
            prefix={<PlusOutlined />}
            valueStyle={{ color: "#3f8600" }}
            suffix="m³"
          />
        </Card>
        <Card hoverable>
          <Statistic
            title="Indicator 5"
            value={400}
            prefix={<PlusOutlined />}
            valueStyle={{ color: "#3f8600" }}
            suffix="m³"
          />
        </Card>
      </Flex>

      <Card title="Consumo dentro del periodo" hoverable>
        <Table
          dataSource={[
            {
              fecha: "2025-01-01",
              hora: "00:00",
              nivel: 10,
              caudal: 20,
              totalizado: 30,
              consumoHora: 40,
            },
            {
              fecha: "2025-01-01",
              hora: "00:01",
              nivel: 10,
              caudal: 20,
              totalizado: 30,
              consumoHora: 40,
            },
            // Add more test data here
            // Repeat the data for the entire day (24 times)
          ]}
          columns={[
            {
              title: "Fecha",
              dataIndex: "fecha",
              key: "fecha",
            },
            {
              title: "Hora",
              dataIndex: "hora",
              key: "hora",
            },
            {
              title: "Nivel",
              dataIndex: "nivel",
              key: "nivel",
            },
            {
              title: "Caudal",
              dataIndex: "caudal",
              key: "caudal",
            },
            {
              title: "Totalizado",
              dataIndex: "totalizado",
              key: "totalizado",
            },
            {
              title: "Consumo por Hora",
              dataIndex: "consumoHora",
              key: "consumoHora",
            },
          ]}
        />
      </Card>

      <Form layout="vertical">
        <Form.Item label="Pregunta 1">
          <Checkbox>Respuesta 1</Checkbox>
          <Checkbox>Respuesta 2</Checkbox>
          <Checkbox>Respuesta 3</Checkbox>
        </Form.Item>
        <Form.Item label="Pregunta 2">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item label="Pregunta 3">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Button type="primary">Enviar</Button>
      </Form>
    </Flex>
  );
};

export default FormMultiData;
