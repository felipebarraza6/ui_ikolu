import React, { useState } from "react";
import {
  Form,
  Input,
  Flex,
  Button,
  Checkbox,
  Table,
  Statistic,
  Select,
  DatePicker,
  Card,
} from "antd";
import { PlusOutlined, DashboardFilled } from "@ant-design/icons";
import moment from "moment";

const FormMultiData = () => {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const options = [
    {
      label:
        "Actualmente la empresa no monitorea ni registra el consumo de agua",
      value: 1,
      score: 0.0,
    },
    {
      label:
        "La empresa monitorea y registra el consumo de agua, pero no tiene metas de reducción establecidas",
      value: 2,
      score: 0.88,
    },
    {
      label:
        "La empresa monitorea y registra el consumo de agua y ha establecido metas de reducción específicas de acuerdo con su desempeño anterior (p. ej., una reducción del consumo de agua del 5% en comparación con el año tomado como referencia)",
      value: 3,
      score: 1.75,
    },
    {
      label:
        "La empresa monitorea y registra el consumo de agua y ha establecido metas específicas con bases científicas que son necesarias para alcanzar un uso sostenible de la cuenca hidrográfica local",
      value: 4,
      score: 2.63,
    },
    {
      label:
        "La empresa ha alcanzado las metas de reducción específicas durante el período evaluado",
      value: 5,
      score: 0.88,
    },
  ];

  const handleCheckboxChange = (checkedValues) => {
    setSelectedOptions(checkedValues);
  };

  const calculateScore = () => {
    const totalScore = selectedOptions.reduce((acc, value) => {
      const option = options.find((opt) => opt.value === value);
      return acc + (option ? option.score : 0);
    }, 0);
    return Math.min(totalScore, 3.5);
  };

  return (
    <Flex vertical gap={"large"}>
      <Card
        title={"Resumen del Recurso hidrico"}
        extra={
          <Flex gap={"large"}>
            <Form layout="inline">
              <Form.Item>
                <DatePicker
                  placeholder="Selecciona una año"
                  style={{ width: "200px" }}
                  picker="year"
                  mode="year"
                  defaultValue={moment().subtract(2, "years")}
                  disabledDate={(current) => current && current > moment()}
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary">Filtrar</Button>
              </Form.Item>
            </Form>
          </Flex>
        }
      >
        <Card
          title={
            <div style={{ color: "white" }}>
              ¿De qué manera se monitorea y se administra el consumo de agua de
              su empresa?
            </div>
          }
          style={{
            background:
              "linear-gradient(169deg, rgba(15,120,142,1) 0%, rgba(22,119,240,1) 99%, rgba(60,87,93,1) 100%)",
            marginBottom: "20px",
            color: "white",
          }}
        >
          <Form layout="vertical">
            <Form.Item label="" style={{ color: "white" }}>
              <div style={{ fontWeight: "200" }}>
                Seleccione una sola respuesta que indique si la empresa
                monitorea el uso del agua y si establece metas (respuestas 1 a
                4). Si la empresa establece metas, la respuesta 5 también puede
                ser relevante.
              </div>
              <Flex vertical style={{ marginTop: "10px" }}>
                <Checkbox.Group onChange={handleCheckboxChange}>
                  {options.map((option) => (
                    <Checkbox
                      key={option.value}
                      value={option.value}
                      style={{ color: "white" }}
                    >
                      {option.label}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              </Flex>
            </Form.Item>
            <Button>Enviar</Button>
          </Form>
          <div>Puntaje total: {calculateScore()}</div>
        </Card>
        <Table
          size="small"
          bordered
          columns={[
            {
              title: "Enero",
              dataIndex: "enero",
              width: "14.2%",
            },
            { title: "Febrero", dataIndex: "febrero", width: "14.2%" },
            { title: "Marzo", dataIndex: "marzo", width: "14.2%" },
            { title: "Abril", dataIndex: "abril", width: "14.2%" },
            { title: "Mayo", dataIndex: "mayo", width: "14.2%" },
            { title: "Junio", dataIndex: "junio", width: "14.2%" },
          ]}
          dataSource={[
            {
              enero: 10,
              febrero: 20,
              marzo: 30,
              abril: 40,
              mayo: 50,
              junio: 60,
            },
          ]}
          pagination={false}
        />
        <Table
          size="small"
          style={{ marginBottom: "20px" }}
          bordered
          pagination={false}
          dataSource={[
            {
              julio: 10,
              agosto: 20,
              septiembre: 30,
              octubre: 40,
              noviembre: 50,
              diciembre: 75,
            },
          ]}
          columns={[
            { title: "Julio", dataIndex: "julio", width: "14.2%" },
            { title: "Agosto", dataIndex: "agosto", width: "14.2%" },
            { title: "Septiembre", dataIndex: "septiembre", width: "14.2%" },
            { title: "Octubre", dataIndex: "octubre", width: "14.2%" },
            { title: "Noviembre", dataIndex: "noviembre", width: "14.2%" },
            { title: "Diciembre", dataIndex: "diciembre", width: "14.2%" },
          ]}
        />
        <Flex justify="center">
          <Card
            hoverable
            title={<div style={{ color: "white" }}>Consumo total de agua</div>}
            extra={
              <img
                src={
                  "https://s3.amazonaws.com/blab-impact-js-production/app/images/es-es/BIA-Logo@2x-6d655d272b0461db5c9c7ce0959a1a71.png"
                }
                style={{ marginTop: "10px", filter: "brightness(0) invert(1)" }}
                width={"100px"}
              />
            }
            style={{
              marginBottom: "20px",
              width: "500px",
              fontSize: "17px",
              fontWeight: "400",
              color: "white",
              background:
                "linear-gradient(169deg, rgba(15,120,142,1) 0%, rgba(22,119,240,1) 99%, rgba(60,87,93,1) 100%)",
            }}
          >
            <Flex gap={"large"}>
              <Flex>
                <Flex>
                  <Statistic
                    title={
                      <div style={{ color: "white" }}>
                        Consumo total de agua (en litros) durante los últimos 12
                        meses
                      </div>
                    }
                    value={415}
                    suffix={"m³"}
                    valueStyle={{ color: "white" }}
                  />
                </Flex>
                <Flex align="center">
                  <Checkbox children={"a"} style={{ color: "white" }}>
                    No hacemos seguimiento de este valor
                  </Checkbox>
                </Flex>
              </Flex>
            </Flex>
          </Card>
        </Flex>
        <Table
          bordered
          size="small"
          columns={[
            { title: "Fecha", dataIndex: "fecha", width: "16.6%" },
            { title: "Hora", dataIndex: "hora", width: "16.6%" },
            { title: "Nivel", dataIndex: "nivel", width: "16.6%" },
            { title: "Caudal", dataIndex: "caudal", width: "16.6%" },
            { title: "Totalizado", dataIndex: "totalizado", width: "16.6%" },
            {
              title: "Consumo por hora",
              dataIndex: "consumoHora",
              width: "16.6%",
            },
          ]}
          dataSource={[
            {
              fecha: "2025-01-01",
              hora: "00:00",
              nivel: 10,
              caudal: 20,
              totalizado: 10,
              consumoHora: 40,
            },
            {
              fecha: "2025-02-01",
              hora: "00:00",
              nivel: 10,
              caudal: 20,
              totalizado: 20,
              consumoHora: 40,
            },
            {
              fecha: "2025-03-01",
              hora: "00:00",
              nivel: 10,
              caudal: 20,
              totalizado: 30,
              consumoHora: 40,
            },
            {
              fecha: "2025-04-01",
              hora: "00:00",
              nivel: 10,
              caudal: 20,
              totalizado: 40,
              consumoHora: 40,
            },
            {
              fecha: "2025-05-01",
              hora: "00:00",
              nivel: 10,
              caudal: 20,
              totalizado: 50,
              consumoHora: 40,
            },
            {
              fecha: "2025-06-01",
              hora: "00:00",
              nivel: 10,
              caudal: 20,
              totalizado: 60,
              consumoHora: 40,
            },
            {
              fecha: "2025-07-01",
              hora: "00:00",
              nivel: 10,
              caudal: 20,
              totalizado: 70,
              consumoHora: 40,
            },
            {
              fecha: "2025-08-01",
              hora: "00:00",
              nivel: 10,
              caudal: 20,
              totalizado: 80,
              consumoHora: 40,
            },
            {
              fecha: "2025-09-01",
              hora: "00:00",
              nivel: 10,
              caudal: 20,
              totalizado: 90,
              consumoHora: 40,
            },
            {
              fecha: "2025-10-01",
              hora: "00:00",
              nivel: 10,
              caudal: 20,
              totalizado: 100,
              consumoHora: 40,
            },
            {
              fecha: "2025-11-01",
              hora: "00:00",
              nivel: 10,
              caudal: 20,
              totalizado: 110,
              consumoHora: 40,
            },
            {
              fecha: "2025-12-01",
              hora: "00:00",
              nivel: 10,
              caudal: 20,
              totalizado: 120,
              consumoHora: 40,
            },
          ]}
        />
      </Card>
    </Flex>
  );
};

export default FormMultiData;
