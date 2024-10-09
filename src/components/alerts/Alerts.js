import React, { useState } from "react";
import {
  Row,
  Col,
  Table,
  Input,
  Statistic,
  Card,
  Progress,
  Checkbox,
} from "antd";
import { Pie } from "@ant-design/plots";

const Alerts = () => {
  const config = {
    data: [
      { type: "Total m³", value: 550000000 },
      { type: "DGA m³", value: 550000000 },
    ],
    angleField: "value",
    colorField: "type",
    tooltip: {
      visible: true,
      formatter: (datum) => {
        return {
          name: datum.type,
          value: datum.value.toLocaleString("es-ES") + " m³",
        };
      },
    },
    label: {
      text: "value",
      position: "outside",
      style: {
        fontWeight: "bold",
        color: "#fff",
      },
    },
    legend: {
      color: {
        position: "left-top",
        rowPadding: 2,
      },
    },
  };
  return (
    <Row>
      <Col span={24}>
        <h1>Alertas</h1>
      </Col>
      <Col span={7}>
        <Card
          bordered
          hoverable
          extra="SEMANA ANTERIOR"
          title="CAUDAL"
          style={{ width: "98%" }}
        >
          Mayor al caudal autorizado por DGA
          <hr />
          <Statistic
            value={"10,7"}
            title={<b>01-01-2024 10:00 hrs</b>}
            suffix="lt/s"
            valueStyle={{ color: "red" }}
          />
          <Statistic
            extra="01-01-2024"
            value={"12,2"}
            title={<b>03-01-2024 10:00 hrs</b>}
            suffix="lt/s"
            valueStyle={{ color: "red" }}
          />
          <Statistic
            extra="26-01-2024"
            value={"11,3"}
            title={<b>06-01-2024 10:00 hrs</b>}
            suffix="lt/s"
            valueStyle={{ color: "red" }}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card bordered hoverable extra="SEMANA ANTERIOR" title="NIVEL FREÁTICO">
          Nivel riesgoso(cercano al posicionamiento de la bomba)
          <hr />
          <Statistic
            value={"20,7"}
            title={<b>01-01-2024 10:00 hrs</b>}
            suffix="m"
            valueStyle={{ color: "red" }}
          />
          <Statistic
            extra="01-01-2024"
            value={"24,2"}
            title={<b>12-01-2024 10:00 hrs</b>}
            suffix="m"
            valueStyle={{ color: "red" }}
          />
          <Statistic
            extra="26-01-2024"
            value={"21,3"}
            title={<b>01-01-2024 10:00 hrs</b>}
            suffix="m"
            valueStyle={{ color: "red" }}
          />
        </Card>
      </Col>
      <Col span={9} style={{ paddingLeft: "6px" }}>
        <Card bordered hoverable extra="ANUAL" title="TOTALIZADO">
          El consumo anual m³ autorizado por la DGA
          <hr />
          <Statistic
            value={"1.000.000.000"}
            title={<b>Desde 01/01/24 - 31/12/24</b>}
            suffix="m³"
            valueStyle={{ color: "black" }}
          />
          <Row justify={"start"} style={{ marginTop: "10px" }}>
            <Col span={24}>
              <Row>
                <Col span={22}>
                  <Progress
                    percent={52}
                    percentPosition={{
                      align: "end",
                      type: "inner",
                    }}
                    size={[300, 20]}
                    format={(percent) => `490.000.000 m³/ 1.000.000.000 m³`}
                    status="active"
                    strokeColor={{
                      "0%": "#108ee9",
                      "50%": "#108ee9",
                      "100%": "#87d068",
                    }}
                  />
                </Col>
                <Col span={2}>60%</Col>
              </Row>
              <Checkbox style={{ marginTop: "10px" }}>
                Activar notificación al{" "}
                <Input
                  size={"small"}
                  type={"number"}
                  style={{ width: "70px" }}
                  suffix={"%"}
                  step={10}
                />
              </Checkbox>
              <Checkbox style={{ marginTop: "10px" }}>
                Activar notificación al{" "}
                <Input
                  size={"small"}
                  type={"number"}
                  style={{ width: "70px" }}
                  suffix={"%"}
                  step={10}
                />
              </Checkbox>
              <Checkbox style={{ marginTop: "10px" }}>
                Activar notificación al{" "}
                <Input
                  size={"small"}
                  type={"number"}
                  style={{ width: "70px" }}
                  suffix={"%"}
                  step={10}
                />
              </Checkbox>
            </Col>
          </Row>
        </Card>
      </Col>
      <Col span={24}>
        <Table
          title={() => "Gestión de notificaciones"}
          pagination={false}
          bordered
          size="small"
          columns={[
            { title: "Nombre", dataIndex: "name" },
            { title: "Email", dataIndex: "email" },
            { title: "Teléfono", dataIndex: "phone" },
            { title: "Cargo", dataIndex: "position" },
          ]}
          dataSource={[
            {
              key: "1",
              name: "Juan Perez",
              email: "juan@gmail.com",
              phone: "+569 12345678",
              position: "Administrador",
            },
            {
              key: "1",
              name: "Luis Soto",
              email: "luisoto@gmail.com",
              phone: "+569 83422678",
              position: "Operador",
            },
          ]}
        />
      </Col>
    </Row>
  );
};

export default Alerts;
