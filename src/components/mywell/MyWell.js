import React, { useContext, useEffect, useState } from "react";
import { Row, Col, Typography, Statistic, Card, Tag, Table } from "antd";
import { ClockCircleFilled } from "@ant-design/icons";
import caudal_img from "../../assets/images/caudal.png";
import nivel_img from "../../assets/images/nivel.png";
import acumulado_img from "../../assets/images/acumulado.png";
import pozo1 from "../../assets/images/pozo1.png";
import { AppContext } from "../../App";
import sh from "../../api/sh/endpoints";
import TableStandarVerySmall from "./TableStandarVerySmall";
import QueueAnim from "rc-queue-anim";
const { Countdown } = Statistic;
const { Title, Text } = Typography;

const numberForMiles = new Intl.NumberFormat("de-DE");

const MyWell = () => {
  const { state } = useContext(AppContext);
  const position_sensor_nivel = parseFloat(state.selected_profile.d3);
  const [caudal, setCaudal] = useState(0.0);
  const [frecuency, setFrecuency] = useState(60);
  const [nivel, setNivel] = useState(0.0);
  const [finishCounter, setFinishCounter] = useState(0);
  const [acumulado, setAcumulado] = useState(0);
  const [acumulado2, setAcumulado2] = useState(0);
  const [deadline, setDeadline] = useState(null);
  const [lastCaption, setLastCaption] = useState(null);
  const [dataSource, setDataSource] = useState([]);

  const onFinishCounter = (finishCounter) => {
    setFinishCounter(finishCounter + 1);
  };

  const processNivel = (nivel_response) => {
    nivel_response = parseFloat(nivel_response).toFixed(1);
    if (nivel_response > 0.0 && nivel_response < position_sensor_nivel) {
      return parseFloat(position_sensor_nivel - nivel_response).toFixed(1);
    } else if (nivel_response > position_sensor_nivel || nivel_response < 0.0) {
      nivel_response = 50.0;
      return parseFloat(position_sensor_nivel - nivel_response).toFixed(1);
    } else {
      nivel_response = 0.0;
      return parseFloat(position_sensor_nivel - nivel_response).toFixed(1);
    }
  };

  const processCaudal = (caudal) => {
    const flow = parseFloat(caudal).toFixed(1);
    if (flow > 0.5) {
      return parseFloat(flow).toFixed(1);
    } else {
      return parseFloat(0.0).toFixed(1);
    }
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

  const getData = async () => {
    const rq = await sh.get_data_sh(state.selected_profile.id).then((r) => {
      var nivel = 0.0;
      var flow = 0.0;
      var total = 0;
      var total2 = 0;
      var nivel_response = r.results.length > 0 ? r.results[0].nivel : 0.0;
      if (r.results.length > 0) {
        window.innerWidth > 900
          ? setLastCaption(
              `FECHA: ${r.results[0].date_time_medition.slice(
                0,
                10
              )} / HORA: ${r.results[0].date_time_medition.slice(11, 16)} Hrs.`
            )
          : setLastCaption(
              `${r.results[0].date_time_medition.slice(
                0,
                10
              )} / ${r.results[0].date_time_medition.slice(11, 16)} Hrs.`
            );

        if (r.results[0].nivel !== null) {
          nivel = processNivel(r.results[0].nivel);
        }
        if (r.results[0].flow !== null) {
          flow = processCaudal(r.results[0].flow);
        }
        if (r.results[0].total !== null) {
          total = processAcum(r.results[0].total);
        }
        if (r.results[0].total2 !== null) {
          total2 = processAcum(r.results[0].total2);
        }
        setDataSource(r.results);
        setNivel(nivel);
        setCaudal(flow);
        setAcumulado(total);
        setAcumulado2(total2);
      } else {
        setNivel(0.0);
        setCaudal(0.0);
        setAcumulado(0.0);
      }
    });

    return rq;
  };

  useEffect(() => {
    getData();
    const now = new Date();
    const minutesUntilNextHour = 60 - now.getMinutes();
    const list_pf = [55, 56, 57, 58];
    let miliseconds = 60000;
    let frequency = 60; // default frequency is 60 minutes

    if (list_pf.includes(state.selected_profile.id)) {
      frequency = 5;
      setFrecuency(5); // change frequency to 5 minutes if selected_profile.id is in list_pf
    }

    const minutesUntilNextFrequency =
      frequency - (now.getMinutes() % frequency);
    const deadline = new Date(
      now.getTime() + minutesUntilNextFrequency * miliseconds
    );
    setDeadline(deadline);
  }, [state.selected_profile, finishCounter]);

  return (
    <QueueAnim delay={500} duration={900} type="alpha">
      <div key="mywell">
        <Row justify={window.innerWidth > 900 ? "center" : "start"}>
          {state.selected_profile.standard === "CAUDALES_MUY_PEQUENOS" ||
          state.selected_profile.standard === "MENOR" ? (
            <Col xl={24} lg={24} xs={24}>
              <TableStandarVerySmall />
            </Col>
          ) : (
            <>
              <Col xl={12} lg={12} xs={6}>
                <Title level={window.innerWidth > 900 ? 2 : 4}>Mi Pozo</Title>
                {window.innerWidth > 900 && (
                  <Typography.Paragraph
                    style={{ fontWeight: "600", marginLeft: "10px" }}
                  >
                    Última medición
                    <br />
                    <ClockCircleFilled /> {lastCaption}
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

              {window.innerWidth < 900 ? (
                <Col span={24} style={{ marginTop: "10px" }}>
                  <Row justify={"space-evenly"} gutter={[16, 16]}>
                    <Col span={8}>
                      <Card
                        size="small"
                        style={{ backgroundColor: "#1F3461", color: "white" }}
                      >
                        <b>Caudal </b>
                        <br />
                        {parseFloat(caudal).toLocaleString("es-ES", {
                          minimumFractionDigits: 1,
                        })}{" "}
                        (L/s)
                      </Card>
                    </Col>
                    {state.selected_profile.type_dga === "SUB" && (
                      <Col span={8}>
                        <Card
                          size="small"
                          style={{ backgroundColor: "#1F3461", color: "white" }}
                        >
                          <b>Nivel Freático</b>
                          <br />
                          {parseFloat(nivel).toLocaleString("es-ES", {
                            minimumFractionDigits: 1,
                          })}{" "}
                          (m)
                        </Card>
                      </Col>
                    )}

                    <Col span={8}>
                      <Card
                        size="small"
                        style={{ backgroundColor: "#1F3461", color: "white" }}
                      >
                        <b>Acumulado</b>
                        <br />
                        {dataSource[0].total} (m³)
                      </Card>
                    </Col>
                  </Row>
                </Col>
              ) : (
                <Col
                  lg={10}
                  xs={6}
                  style={{ marginTop: "20px" }}
                  xl={state.selected_profile.type_dga === "SUB" ? 12 : 12}
                >
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
                                {state.selected_profile.is_prom_flow
                                  ? "Caudal Medio"
                                  : "Caudal"}
                              </Title>
                            )}

                            {window.innerWidth > 900 ? (
                              <Text style={styles.valueCard}>
                                <b>
                                  {caudal}
                                  {state.selected_profile.is_prom_flow
                                    ? "(L/h)"
                                    : "(L/s)"}
                                </b>
                              </Text>
                            ) : (
                              <>
                                <center>
                                  <Tag color="#1F3461">Caudal</Tag>
                                  <Tag color="#1F3461">
                                    {parseFloat(
                                      dataSource[0].flow
                                    ).toLocaleString("es-ES", {
                                      minimumFractionDigits: 1,
                                    })}{" "}
                                    (L/s)
                                  </Tag>
                                </center>
                              </>
                            )}
                          </Col>
                        </Row>
                      </Card>
                    </div>
                  </QueueAnim>

                  {state.selected_profile.type_dga === "SUB" && (
                    <QueueAnim delay={800} duration={1200} type="left">
                      <div key={"card2"}>
                        <Card hoverable style={styles.cardValues} size="small">
                          <Row
                            justify={
                              window.innerWidth > 900
                                ? "space-around"
                                : "center"
                            }
                          >
                            <Col xs={24} lg={6} xl={6}>
                              <center>
                                <img
                                  src={nivel_img}
                                  alt="caudal_img"
                                  width={
                                    window.innerWidth > 900 ? "75%" : "50%"
                                  }
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
                                <Text style={styles.valueCard}>
                                  <b>
                                    {parseFloat(nivel).toLocaleString("es-ES", {
                                      minimumFractionDigits: 1,
                                    })}{" "}
                                    (m)
                                  </b>
                                </Text>
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
                  )}
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
                                <b>{numberForMiles.format(acumulado)} (m³)</b>
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
              )}
              {state.user.username === "lecheriavalleverde" && (
                <Col span={12}>
                  <Table
                    bordered
                    title={() => "Telemetría"}
                    size="small"
                    dataSource={dataSource}
                    pagination={false}
                    columns={[
                      {
                        title: "Fecha",
                        dataIndex: "date_time_medition",
                        render: (date) => date.slice(0, 10),
                      },
                      {
                        title: "Hora",
                        dataIndex: "date_time_medition",
                        render: (time) => time.slice(11, 16) + " hrs",
                      },
                      {
                        title: "Caudal(lt/s)",
                        dataIndex: "flow",
                        render: (flow) => parseFloat(flow).toFixed(1),
                      },
                      {
                        title: "Total (m³)",
                        dataIndex: "total",
                        render: (total) => processAcum(total),
                      },
                    ]}
                  />
                </Col>
              )}

              {state.selected_profile.type_dga === "SUB" && (
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
                          <Text style={styles.textFlow}>
                            {parseFloat(caudal).toLocaleString("es-ES", {
                              minimumFractionDigits: 1,
                            })}{" "}
                            (L/s)
                          </Text>
                        </div>
                      </QueueAnim>
                      <QueueAnim delay={1000} duration={1200} type="scale">
                        <div key={"pozo2"}>
                          <Text style={styles.textTotal}>
                            {numberForMiles.format(acumulado)} (m³)
                          </Text>
                        </div>
                      </QueueAnim>
                      {state.selected_profile.type_dga === "SUB" && (
                        <QueueAnim delay={800} duration={1200} type="scale">
                          <div key={"pozo2"}>
                            <Text style={styles.textNivel}>
                              {parseFloat(nivel).toLocaleString("es-ES", {
                                minimumFractionDigits: 1,
                              })}{" "}
                              (m)
                            </Text>
                          </div>
                        </QueueAnim>
                      )}
                    </Col>
                  </Row>
                </Col>
              )}
            </>
          )}
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
    marginLeft: window.innerWidth > 900 ? "58%" : "64%",
    position: "absolute",
    borderRadius: "10px",
  },
};

export default MyWell;
