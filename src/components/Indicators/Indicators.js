import React, { useState, useEffect, useContext } from "react";
import {
  Row,
  Col,
  Typography,
  Statistic,
  Card,
  Spin,
  DatePicker,
  Button,
} from "antd";

import nivel_img from "../../assets/images/nivel.png";
import acumulado_img from "../../assets/images/acumulado.png";
import { getNovusData1 } from "./controller";
import { AppContext } from "../../App";
import api_novus from "../../api/novus/endpoints";

const { Title } = Typography;

const Indicators = () => {
  const { state } = useContext(AppContext);
  const [load, setLoad] = useState(false);
  const [ind1, setInd1] = useState(0);
  const [ind2, setInd2] = useState(0.0);

  useEffect(() => {
    getNovusData1(state, setInd1, setInd2, api_novus, setLoad);
  }, [state.selected_profile]);

  return (
    <Row justify="center" style={{ padding: "20px" }}>
      <Col span={6}>
        <Title level={2}>Indicadores</Title>
      </Col>
      <Col span={17}>
        <DatePicker
          style={{ width: "250px" }}
          placeholder="Selecciona una fecha inicial"
        />
        <DatePicker
          style={{ width: "250px" }}
          placeholder="Selecciona una fecha final"
        />
        <Button type="primary">Filtrar</Button>
      </Col>
      <Col>
        <Card
          hoverable
          style={{
            margin: "10px",
            border: "2px solid rgb(31, 52, 97)",
            borderRadius: "15px",
          }}
        >
          {load ? (
            <Spin size={"large"} />
          ) : (
            <>
              <Statistic
                title={
                  <div style={{ color: "rgb(31, 52, 97)" }}>
                    <b>Peak acumulado semana anterior</b>
                  </div>
                }
                value={ind1[0] ? ind1[0].m3 : 0}
                valueStyle={{ color: "rgb(31, 52, 97)" }}
                prefix={<img src={acumulado_img} width={"70%"} />}
                suffix="(m³)"
              />
              <div style={{ float: "right" }}>{ind1[0] ? ind1[0].date : 0}</div>
            </>
          )}
        </Card>
      </Col>
      <Col>
        <Card
          hoverable
          style={{
            margin: "10px",
            border: "2px solid rgb(31, 52, 97)",
            borderRadius: "15px",
          }}
        >
          {load ? (
            <Spin size={"large"} />
          ) : (
            <>
              <Statistic
                title={
                  <div style={{ color: "rgb(31, 52, 97)" }}>
                    <b>Menor nivel semana anterior</b>
                  </div>
                }
                value={ind2[0] ? ind2[0].mt : 0}
                valueStyle={{ color: "rgb(31, 52, 97)" }}
                prefix={<img src={nivel_img} width={"70%"} />}
                suffix="(m)"
              />

              <div style={{ float: "right" }}>{ind2[0] ? ind2[0].date : 0}</div>
            </>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default Indicators;
