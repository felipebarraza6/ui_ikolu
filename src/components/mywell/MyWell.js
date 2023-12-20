import React, { useContext, useEffect, useState } from "react";
import { Row, Col, Typography, Statistic, Card } from "antd";
import { ClockCircleFilled } from "@ant-design/icons";
import caudal_img from "../../assets/images/caudal.png";
import nivel_img from "../../assets/images/nivel.png";
import acumulado_img from "../../assets/images/acumulado.png";
import pozo1 from "../../assets/images/pozo1.png";
import { AppContext } from "../../App";
import sh from "../../api/sh/endpoints";
const { Countdown } = Statistic;
const { Title, Text } = Typography;

const numberForMiles = new Intl.NumberFormat("de-DE");

const MyWell = () => {
  const { state } = useContext(AppContext);
  const position_sensor_nivel = parseFloat(state.selected_profile.d3);
  const [caudal, setCaudal] = useState(0.0);
  const [nivel, setNivel] = useState(0.0);
  const [finishCounter, setFinishCounter] = useState(0);
  const [acumulado, setAcumulado] = useState(0);
  const [deadline, setDeadline] = useState(null);
  const [lastCaption, setLastCaption] = useState(null);

  const onFinishCounter = (finishCounter) => {
    setFinishCounter(finishCounter + 1);
  };

  const getData = async () => {
    const rq = await sh.get_data_sh(state.selected_profile.id).then((r) => {
      var nivel = 0.0;
      var flow = 0.0;
      var total = 0;
      var nivel_response = r.results[0].nivel;
      if (r.results.length > 0) {
        console.log(r);
        setLastCaption(
          `FECHA: ${r.results[0].date_time_medition.slice(
            0,
            10
          )} / HORA: ${r.results[0].date_time_medition.slice(11, 16)} Hrs.`
        );
        if (r.results[0].nivel !== null) {
          if (nivel_response > 0.0 && nivel_response < position_sensor_nivel) {
            nivel = position_sensor_nivel - nivel_response;
          } else if (nivel_response > position_sensor_nivel) {
            nivel_response = 50.0;
            nivel = position_sensor_nivel - nivel_response;
          }
        }
        if (r.results[0].flow !== null) {
          flow = r.results[0].flow;
        }
        if (r.results[0].total !== null) {
          total = r.results[0].total;
        }
        setNivel(nivel);
        setCaudal(flow);
        setAcumulado(total);
      }
    });

    return rq;
  };

  useEffect(() => {
    getData();
    const now = new Date();
    const minutesUntilNextHour = 60 - now.getMinutes();
    const deadline = new Date(now.getTime() + minutesUntilNextHour * 60000);
    setDeadline(deadline);
  }, [state.selected_profile, finishCounter]);

  return (
    <Row justify={"center"}>
      <Col span={12}>
        <Title level={2}>Mi Pozo</Title>
        <Typography.Paragraph style={{ fontWeight: "600", marginLeft: "10px" }}>
          Última medición
          <br />
          <ClockCircleFilled /> {lastCaption}
        </Typography.Paragraph>
      </Col>
      <Col span={12}>
        <Title level={5} style={{ textAlign: "right", marginBottom: "-5px" }}>
          Tiempo restante para la siguiente medición
        </Title>
        <Countdown
          valueStyle={{ textAlign: "right" }}
          style={{ textAlign: "right", color: "black", marginBottom: "15px" }}
          value={deadline}
          onFinish={onFinishCounter}
        />
      </Col>
      <Col span={12}>
        <Card hoverable style={styles.cardValues} size="small">
          <Row align="middle" justify={"space-around"}>
            <Col span={6}>
              <img src={caudal_img} alt="caudal_img" width="100%" />
            </Col>
            <Col span={18} style={styles.colCard}>
              <Title level={5} style={{ marginTop: "-10px" }}>
                Caudal
              </Title>
              <Text level={5} style={styles.valueCard}>
                <b>
                  {parseFloat(caudal).toLocaleString("es-ES", {
                    minimumFractionDigits: 1,
                  })}{" "}
                  (L/s)
                </b>
              </Text>
            </Col>
          </Row>
        </Card>
        <Card hoverable style={styles.cardValues} size="small">
          <Row align="middle" justify={"space-around"}>
            <Col span={6}>
              <img src={nivel_img} alt="nivel_img" width="90%" />
            </Col>
            <Col span={18} style={styles.colCard}>
              <Title level={5} style={{ marginTop: "-10px" }}>
                Nivel Freático
              </Title>
              <Text level={5} style={styles.valueCard}>
                <b>
                  {parseFloat(nivel).toLocaleString("es-ES", {
                    minimumFractionDigits: 1,
                  })}{" "}
                  (m)
                </b>
              </Text>
            </Col>
          </Row>
        </Card>
        <Card hoverable style={styles.cardValues} size="small">
          <Row align="middle" justify={"space-around"}>
            <Col span={6}>
              <img src={acumulado_img} width="100%" alt="total_img" />
            </Col>
            <Col span={18} style={styles.colCard}>
              <Title level={5} style={{ marginTop: "-10px" }}>
                Acumulado
              </Title>
              <Text style={styles.valueCard}>
                <b>{numberForMiles.format(acumulado)} </b>
                <b>(m³)</b>
              </Text>
            </Col>
          </Row>
        </Card>
      </Col>
      <Col span={12}>
        <Row justify={"end"}>
          <Col span={24}>
            <img src={pozo1} width={"100%"} alt="pozo" style={styles.well} />
            <Text style={styles.textFlow}>
              {parseFloat(caudal).toLocaleString("es-ES", {
                minimumFractionDigits: 1,
              })}{" "}
              (L/s)
            </Text>
            <Text style={styles.textTotal}>
              {numberForMiles.format(acumulado)} (m³)
            </Text>
            <Text style={styles.textNivel}>
              {parseFloat(nivel).toLocaleString("es-ES", {
                minimumFractionDigits: 1,
              })}{" "}
              (m)
            </Text>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

const styles = {
  colCard: {
    paddingLeft: "20px",
  },
  cardValues: {
    marginBottom: "10px",
    border: "solid 1px grey",
    padding: "20px",
    borderRadius: "15px",
    width: "350px",
  },
  valueCard: {
    color: "white",
    backgroundColor: "#1F3461",
    borderRadius: "5px",
    padding: "3px",
  },
  well: {
    position: "absolute",
  },
  textFlow: {
    color: "white",
    backgroundColor: "#1F3461",
    border: "0px solid #1F3461",
    fontSize: "17px",
    marginTop: "120px",
    marginLeft: "68px",
    padding: "5px",
    position: "absolute",
    borderRadius: "10px",
  },
  textTotal: {
    color: "white",
    backgroundColor: "#1F3461",
    border: "0px solid #1F3461",
    fontSize: "17px",
    padding: "5px",
    marginTop: "80px",
    marginLeft: "325px",
    position: "absolute",
    borderRadius: "10px",
  },
  textNivel: {
    color: "white",
    backgroundColor: "#1F3461",
    border: "0px solid #1F3461",
    fontSize: "17px",
    marginTop: "240px",
    padding: "5px",
    marginLeft: "280px",
    position: "absolute",
    borderRadius: "10px",
  },
};

export default MyWell;
