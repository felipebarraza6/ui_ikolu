import React, { useContext, useEffect, useState } from "react";
import { Row, Col, Typography, Statistic, Card, Tag, Table, Affix } from "antd";
import { ClockCircleFilled } from "@ant-design/icons";
import caudal_img from "../../assets/images/caudal.png";
import nivel_img from "../../assets/images/nivel.png";
import acumulado_img from "../../assets/images/acumulado.png";
import pozo1 from "../../assets/images/pozo1.png";
import { AppContext } from "../../App";
import QueueAnim from "rc-queue-anim";
import TableStandardVeryWell from "./TableStandarVerySmall";
const { Countdown } = Statistic;
const { Title, Text } = Typography;

const numberForMiles = new Intl.NumberFormat("de-DE");

const MyWell = () => {
  const { state } = useContext(AppContext);
  const [frecuency, setFrecuency] = useState(60);

  const [nivel, setNivel] = useState(0);
  const [caudal, setCaudal] = useState(0);
  const [finishCounter, setFinishCounter] = useState(0);
  const [acumulado, setAcumulado] = useState(0);
  const [deadline, setDeadline] = useState(null);
  const [lastCaption, setLastCaption] = useState(null);

  const onFinishCounter = (finishCounter) => {
    setFinishCounter(finishCounter + 1);
  };

  const processAcum = (acum) => {
    console.log(acum);
    const acumulado = parseInt(acum);
    if (acumulado > 0) {
      return acumulado;
    } else {
      return 0;
    }
  };

  useEffect(() => {
    const now = new Date();
    const minutesUntilNextHour = 60 - now.getMinutes();
    const list_pf = [55, 56, 57, 58];
    let miliseconds = 60000;
    let frequency = 60; // default frequency is 60 minutes

    const minutesUntilNextFrequency =
      frequency - (now.getMinutes() % frequency);
    const deadline = new Date(
      now.getTime() + minutesUntilNextFrequency * miliseconds
    );
    setLastCaption(state.selected_profile.modules.m1.date_time_medition);
    setNivel(state.selected_profile.modules.m1.water_table);
    setCaudal(state.selected_profile.modules.m1.flow);
    setAcumulado(state.selected_profile.modules.m1.total);
    setDeadline(deadline);
  }, [state.selected_profile, finishCounter]);

  return (
    <QueueAnim delay={500} duration={900} type="alpha">
      <div key="mywell" style={{ padding: "20px", position: "fixed" }}>
        <Row justify={window.innerWidth > 900 ? "center" : "start"}>
          <>
            <Col xl={12} lg={12} xs={6}>
              <Title level={window.innerWidth > 900 ? 2 : 4}>Mi Pozo</Title>
              {window.innerWidth > 900 && (
                <Typography.Paragraph
                  style={{ fontWeight: "600", marginLeft: "10px" }}
                >
                  Última medición
                  <br />
                  <ClockCircleFilled style={{ marginRight: "10px" }} />
                  {""}
                  {lastCaption} hrs
                </Typography.Paragraph>
              )}
            </Col>
            <Col
              xl={12}
              lg={12}
              xs={18}
              style={{ paddingTop: window.innerWidth > 900 ? "0px" : "10px" }}
            >
              <Title
                level={5}
                style={{
                  textAlign: "right",
                  marginBottom: "-5px",
                  marginTop: window.innerWidth < 900 && "-10px",
                }}
              >
                {window.innerWidth > 900
                  ? `Tiempo restante para la siguiente medición (c/ ${frecuency} minutos)`
                  : "Siguiente medición"}
              </Title>
              <Countdown
                valueStyle={{
                  textAlign: "right",
                  fontSize: window.innerWidth > 900 ? "25px" : "20px",
                }}
                style={{
                  textAlign: "right",
                  color: "black",
                  marginBottom: window.innerWidth < 900 && "15px",
                }}
                value={deadline}
                onFinish={onFinishCounter}
              />
              {window.innerWidth < 900 && (
                <Typography.Title
                  level={5}
                  style={{
                    marginLeft: "10px",
                    marginTop: "-10px",
                    textAlign: "right",
                  }}
                >
                  Última medición
                  <br />
                  <span style={{ fontSize: "13px" }}>{lastCaption}</span>
                </Typography.Title>
              )}
            </Col>

            <Col lg={10} xs={6} style={{ marginTop: "20px" }}>
              <QueueAnim delay={400} duration={1200} type="left">
                <div key={"card"}>
                  <Card hoverable style={styles.cardValues} size="small">
                    <Row
                      justify={
                        window.innerWidth > 900 ? "space-between" : "center"
                      }
                    >
                      <Col xs={24} lg={6} xl={6}>
                        <center>
                          <img
                            src={caudal_img}
                            alt="caudal_img"
                            width={window.innerWidth > 900 ? "100%" : "70%"}
                            style={{
                              marginBottom:
                                window.innerWidth > 900 ? "0px" : "5px",
                            }}
                          />
                        </center>
                      </Col>
                      <Col xs={24} lg={18} xl={18} style={styles.colCard}>
                        {window.innerWidth > 900 && (
                          <Title level={5} style={{ marginTop: "-10px" }}>
                            Caudal
                          </Title>
                        )}

                        {window.innerWidth > 900 ? (
                          <Text style={styles.valueCard}>{caudal} (L/s)</Text>
                        ) : (
                          <>
                            <center>
                              <Tag color="#1F3461">Caudal</Tag>
                              <Tag color="#1F3461">1.2 (L/s)</Tag>
                            </center>
                          </>
                        )}
                      </Col>
                    </Row>
                  </Card>
                </div>
              </QueueAnim>

              <QueueAnim delay={800} duration={1200} type="left">
                <div key={"card2"}>
                  <Card hoverable style={styles.cardValues} size="small">
                    <Row
                      justify={
                        window.innerWidth > 900 ? "space-around" : "center"
                      }
                    >
                      <Col xs={24} lg={6} xl={6}>
                        <center>
                          <img
                            src={nivel_img}
                            alt="caudal_img"
                            width={window.innerWidth > 900 ? "75%" : "50%"}
                            style={{
                              marginBottom:
                                window.innerWidth > 900 ? "0px" : "5px",
                            }}
                          />
                        </center>
                      </Col>
                      <Col xs={24} lg={18} xl={18} style={styles.colCard}>
                        {window.innerWidth > 900 && (
                          <Title level={5} style={{ marginTop: "-10px" }}>
                            Nivel Freático
                          </Title>
                        )}

                        {window.innerWidth > 900 ? (
                          <Text style={styles.valueCard}>{nivel} (m)</Text>
                        ) : (
                          <center>
                            <Tag color="#1F3461">Nivel Freático</Tag>
                            <Tag color="#1F3461">
                              {parseFloat(nivel).toLocaleString("es-ES", {
                                minimumFractionDigits: 1,
                              })}{" "}
                              (m)
                            </Tag>
                          </center>
                        )}
                      </Col>
                    </Row>
                  </Card>
                </div>
              </QueueAnim>
              <QueueAnim delay={1000} duration={1200} type="left">
                <div key={"card3"}>
                  <Card
                    hoverable
                    bordered={false}
                    style={styles.cardValues}
                    size="small"
                  >
                    <Row
                      justify={
                        window.innerWidth > 900 ? "space-around" : "center"
                      }
                    >
                      <Col xs={24} lg={6} xl={6}>
                        <center>
                          <img
                            src={acumulado_img}
                            alt="caudal_img"
                            width={window.innerWidth > 900 ? "100%" : "70%"}
                            style={{
                              marginBottom:
                                window.innerWidth > 900 ? "0px" : "5px",
                            }}
                          />
                        </center>
                      </Col>
                      <Col xs={24} lg={18} xl={18} style={styles.colCard}>
                        {window.innerWidth > 900 && (
                          <Title level={5} style={{ marginTop: "-10px" }}>
                            Acumulado
                          </Title>
                        )}

                        {window.innerWidth > 900 ? (
                          <Text style={styles.valueCard}>
                            {numberForMiles.format(acumulado)} (m³)
                          </Text>
                        ) : (
                          <center>
                            <Tag color="#1F3461">Acumulado</Tag>
                            <Tag color="#1F3461">
                              {numberForMiles.format(acumulado)} (m³)
                            </Tag>
                          </center>
                        )}
                      </Col>
                    </Row>
                  </Card>
                </div>
              </QueueAnim>
            </Col>

            <Col xs={24} lg={12} xl={12}>
              <Row justify={"end"}>
                <Col span={24}>
                  <QueueAnim delay={300} duration={1200} type="bottom">
                    <div key={"pozo1"}>
                      <img
                        src={pozo1}
                        width={window.innerWidth < 900 ? "100%" : "90%"}
                        alt="pozo"
                        style={styles.well}
                      />
                    </div>
                  </QueueAnim>
                  <QueueAnim delay={400} duration={1200} type="scale">
                    <div key={"pozo2"}>
                      <Text style={styles.textFlow}>{caudal}(L/s)</Text>
                    </div>
                  </QueueAnim>
                  <QueueAnim delay={1000} duration={1200} type="scale">
                    <div key={"pozo2"}>
                      <Text style={styles.textTotal}>
                        {numberForMiles.format(acumulado)} (m³)
                      </Text>
                    </div>
                  </QueueAnim>
                  <QueueAnim delay={800} duration={1200} type="scale">
                    <div key={"pozo2"}>
                      <Text style={styles.textNivel}>{nivel} (m)</Text>
                    </div>
                  </QueueAnim>
                </Col>
              </Row>
            </Col>
          </>
        </Row>
      </div>
    </QueueAnim>
  );
};

const styles = {
  colCard: {
    paddingLeft: window.innerWidth > 900 && "20px",
  },
  cardValues: {
    marginBottom: "10px",
    padding: window.innerWidth > 900 ? "14px" : "0px",
    borderRadius: "15px",
    border: "0px solid #1F3461",
    marginLeft: window.innerWidth > 900 && "30px",
    background:
      "linear-gradient(90deg, rgba(2,0,36,0.14189425770308128) 0%, rgba(255,255,255,1) 100%)",
    width: window.innerWidth > 900 ? "250px" : "100%",
  },
  valueCard: {
    color: "white",
    backgroundColor: "#1F3461",
    marginTop: window.innerWidth > 900 ? "0px" : "-15px",
    borderRadius: "5px",
    padding: window.innerWidth > 900 ? "3px" : "1px",
  },
  well: {
    position: "absolute",
    marginTop: window.innerWidth > 900 ? "-55px" : "20px",
    paddingLeft: window.innerWidth < 900 && "0px",
    marginLeft: window.innerWidth > 900 ? "-5px" : "0px",
  },
  textFlow: {
    color: "white",
    backgroundColor: "#1F3461",
    border: "0px solid #1F3461",
    fontSize: window.innerWidth > 900 ? "17px" : "14px",
    marginTop: window.innerWidth > 900 ? "70px" : "30%",
    marginLeft: window.inner > 900 ? "68px" : "12%",
    padding: window.innerWidth > 900 ? "5px" : "5px",
    position: "absolute",
    borderRadius: "10px",
  },
  textTotal: {
    color: "white",
    backgroundColor: "#1F3461",
    border: "0px solid #1F3461",
    fontSize: window.innerWidth > 900 ? "17px" : "14px",
    padding: window.innerWidth > 900 ? "5px" : "5px",
    marginTop: window.innerWidth > 900 ? "45px" : "23%",
    marginLeft: window.inner > 900 ? "305px" : "62%",
    position: "absolute",
    borderRadius: "10px",
  },
  textNivel: {
    color: "white",
    backgroundColor: "#1F3461",
    border: "0px solid #1F3461",
    fontSize: window.innerWidth > 900 ? "17px" : "14px",
    marginTop: window.inner > 900 ? "100px" : "55%",
    padding: window.innerWidth > 900 ? "5px" : "5px",
    marginLeft: window.innerWidth > 900 ? "53%" : "64%",
    position: "absolute",
    borderRadius: "10px",
  },
};

export default MyWell;
