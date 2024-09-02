import React, { useState } from "react";
import { Row, Col, Table, Button, Statistic, Card, Tooltip } from "antd";
import { Pie } from "@ant-design/plots";

const Alerts = () => {
  const config = {
    data: [
      { type: "Total m³", value: 1100000000 },
      { type: "DGA m³", value: 1000000000 },
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
      <Col span={8}>
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
            value={"0,7"}
            title={<b>01-01-2024 10:00 hrs</b>}
            suffix="m"
            valueStyle={{ color: "red" }}
          />
          <Statistic
            extra="01-01-2024"
            value={"0,2"}
            title={<b>12-01-2024 10:00 hrs</b>}
            suffix="m"
            valueStyle={{ color: "red" }}
          />
          <Statistic
            extra="26-01-2024"
            value={"0,3"}
            title={<b>01-01-2024 10:00 hrs</b>}
            suffix="m"
            valueStyle={{ color: "red" }}
          />
        </Card>
      </Col>
      <Col span={8} style={{ paddingLeft: "6px" }}>
        <Card bordered hoverable extra="ANUAL" title="TOTALIZADO">
          El consumo de m³ supero el consumo anual autorizado por la DGA
          <hr />
          <Statistic
            value={"1.100.000.000"}
            title={<b>03-04-2024 16:00 hrs</b>}
            suffix="m³"
            valueStyle={{ color: "red" }}
          />
          <Pie
            {...config}
            style={{ marginTop: "-100px", marginBottom: "-90px" }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default Alerts;
