import React, { useContext, useEffect, useState } from "react";
import { Row, Col, Typography, Statistic, Card, Tag, Descriptions } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import caudal_img from "../../assets/images/caudal.png";
import nivel_img from "../../assets/images/nivel.png";
import acumulado_img from "../../assets/images/acumulado.png";
import pozo1 from "../../assets/images/pozo1.png";
import { AppContext } from "../../App";
import QueueAnim from "rc-queue-anim";
import MyLastRegisters from "./MyLastRegisters";
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
  const [acumHora, setAcumHora] = useState(0);
  const [acumDia, setAcumDia] = useState(0);
  const [deadline, setDeadline] = useState(null);
  const [lastCaption, setLastCaption] = useState(null);
  const [yesterdayDate, setYesterdayDate] = useState(null);
  const [acumAyer, setAcumAyer] = useState(0);

  const [zoomNivel, setZoomNivel] = useState(false);
  const [zoomCaudal, setZoomCaudal] = useState(false);
  const [zoomAcumulado, setZoomAcumulado] = useState(false);

  const onFinishCounter = (finishCounter) => {
    setFinishCounter(finishCounter + 1);
  };

  useEffect(() => {
    const now = new Date();
    let miliseconds = 60000;
    let frequency = state.selected_profile.frecuency;

    const minutesUntilNextFrequency =
      frequency - (now.getMinutes() % frequency);
    const deadline = new Date(
      now.getTime() + minutesUntilNextFrequency * miliseconds
    );
    setLastCaption(state.selected_profile.modules.m1.date_time_medition);
    setAcumHora(state.selected_profile.modules.m1.total_diff);
    setAcumDia(state.selected_profile.modules.m1.total_today_diff);
    setAcumAyer(state.selected_profile.modules.total_consumed_yesterday);

    setNivel(state.selected_profile.modules.m1.water_table);
    setCaudal(state.selected_profile.modules.m1.flow);
    setAcumulado(state.selected_profile.modules.m1.total);
    setDeadline(deadline);
  }, [state.selected_profile, finishCounter]);

  const styles = {
    colCard: {
      paddingLeft: window.innerWidth > 900 && "20px",
    },
    cardValues: {
      marginBottom: "10px",
      padding: window.innerWidth > 900 ? "14px" : "0px",
      borderRadius: "15px",
      border: "0px solid #1F3461",
      background:
        "linear-gradient(90deg, rgba(2,0,36,0.14189425770308128) 0%, rgba(255,255,255,1) 100%)",
      width: window.innerWidth > 900 ? "280px" : "100%",
    },
    valueCard: {
      color: "white",
      backgroundColor: "#1F3461",
      marginTop: window.innerWidth > 900 ? "0px" : "-15px",
      borderRadius: "5px",
      padding: window.innerWidth > 900 ? "3px" : "1px",
    },
    well: {
      paddingLeft: window.innerWidth < 900 && "0px",
      marginLeft: window.innerWidth > 900 ? "-5px" : "0px",
    },
    textFlow: {
      color: "white",
      background: zoomCaudal
        ? "linear-gradient(31deg, rgba(31,52,97,1) 0%, rgba(56,67,74,1) 100%)"
        : "#1F3461",
      border: "0px solid #1F3461",
      fontSize: zoomCaudal ? "20px" : "17px",
      marginTop: window.innerWidth > 900 ? "-320px" : "30%",
      marginLeft: window.inner > 900 ? "68px" : "12%",
      padding: window.innerWidth > 900 ? "5px" : "5px",
      position: "absolute",
      borderRadius: "10px",
    },
    textTotal: {
      color: "white",
      background: zoomAcumulado
        ? "linear-gradient(31deg, rgba(31,52,97,1) 0%, rgba(56,67,74,1) 100%)"
        : "#1F3461",
      border: "0px solid #1F3461",
      fontSize: zoomAcumulado ? "20px" : "17px",
      padding: window.innerWidth > 900 ? "5px" : "5px",
      marginTop: window.innerWidth > 900 ? "-340px" : "23%",
      marginLeft: "280px",
      position: "absolute",
      borderRadius: "10px",
    },
    textNivel: {
      color: "white",
      background: zoomNivel
        ? "linear-gradient(31deg, rgba(31,52,97,1) 0%, rgba(56,67,74,1) 100%)"
        : "#1F3461",
      border: "0px solid #1F3461",
      fontSize: zoomNivel ? "20px" : "17px",
      marginTop: window.innerWidth > 900 ? "-120px" : "30%",
      marginLeft: "260px",
      padding: window.innerWidth > 900 ? "5px" : "5px",
      position: "absolute",
      borderRadius: "10px",
    },
  };

  return (
    <Row align={"middle"} style={{ padding: "20px" }}>
      <Col lg={12} xs={6}>
        <QueueAnim delay={400} duration={1200} type="left">
          <div key={"card"}>
            <Descriptions
              size="small"
              bordered
              style={{
                marginBottom: "10px",
                width: "370px",
                borderRadius: "10px",
                background:
                  "linear-gradient(90deg, rgba(2,0,36,0.14189425770308128) 0%, rgba(255,255,255,1) 100%)",
              }}
            >
              <Descriptions.Item
                label={
                  <>
                    <CalendarOutlined /> Consumo ayer
                  </>
                }
                span={3}
              >
                {acumAyer} (m³)
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <CalendarOutlined /> Consumo hoy
                  </>
                }
                span={3}
              >
                {acumDia} (m³)
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <HistoryOutlined /> Historial{" "}
                    {new Date().toLocaleDateString()}
                  </>
                }
              >
                <MyLastRegisters />
              </Descriptions.Item>
            </Descriptions>
            <Card
              hoverable
              style={styles.cardValues}
              size="small"
              onMouseLeave={() => {
                setZoomCaudal(false);
              }}
              onMouseEnter={() => {
                setZoomCaudal(true);
              }}
            >
              <Row
                justify={window.innerWidth > 900 ? "space-between" : "center"}
              >
                <Col xs={24} lg={6} xl={6}>
                  <center>
                    <img
                      src={caudal_img}
                      alt="caudal_img"
                      width={window.innerWidth > 900 ? "100%" : "70%"}
                      style={{
                        marginBottom: window.innerWidth > 900 ? "0px" : "5px",
                      }}
                    />
                  </center>
                </Col>
                <Col xs={24} lg={18} xl={18} style={styles.colCard}>
                  <Title level={5} style={{ marginTop: "-10px" }}>
                    Caudal
                  </Title>

                  <Text style={styles.valueCard}>{caudal} (L/s)</Text>
                </Col>
              </Row>
            </Card>
          </div>
        </QueueAnim>
        <QueueAnim delay={800} duration={1200} type="left">
          <div key={"card2"}>
            <Card
              hoverable
              style={styles.cardValues}
              size="small"
              onMouseLeave={() => {
                setZoomNivel(false);
              }}
              onMouseEnter={() => {
                setZoomNivel(true);
              }}
            >
              <Row
                justify={window.innerWidth > 900 ? "space-around" : "center"}
              >
                <Col xs={24} lg={6} xl={6}>
                  <center>
                    <img
                      src={nivel_img}
                      alt="caudal_img"
                      width={window.innerWidth > 900 ? "75%" : "50%"}
                      style={{
                        marginBottom: window.innerWidth > 900 ? "0px" : "5px",
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
              onMouseLeave={() => {
                setZoomAcumulado(false);
              }}
              onMouseEnter={() => {
                setZoomAcumulado(true);
              }}
            >
              <Row
                justify={window.innerWidth > 900 ? "space-around" : "center"}
              >
                <Col xs={24} lg={6} xl={6}>
                  <center>
                    <img
                      src={acumulado_img}
                      alt="caudal_img"
                      width={window.innerWidth > 900 ? "100%" : "70%"}
                      style={{
                        marginBottom: window.innerWidth > 900 ? "0px" : "5px",
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
        <QueueAnim delay={1200} duration={1200} type="left">
          <div key={"card3"}>
            <Card
              hoverable
              bordered={false}
              style={styles.cardValues}
              size="small"
            >
              <Row
                justify={window.innerWidth > 900 ? "space-around" : "center"}
              >
                <Col xs={24} lg={6} xl={6}>
                  <center>
                    <img
                      src={acumulado_img}
                      alt="caudal_img"
                      width={window.innerWidth > 900 ? "100%" : "70%"}
                      style={{
                        marginBottom: window.innerWidth > 900 ? "0px" : "5px",
                      }}
                    />
                  </center>
                </Col>
                <Col xs={24} lg={18} xl={18} style={styles.colCard}>
                  {window.innerWidth > 900 && (
                    <Title level={5} style={{ marginTop: "-10px" }}>
                      Consumo {lastCaption && lastCaption.slice(11, 16)} hrs
                    </Title>
                  )}
                  <Text style={styles.valueCard}>
                    {numberForMiles.format(acumHora)} (m³)
                  </Text>
                </Col>
              </Row>
            </Card>
          </div>
        </QueueAnim>
      </Col>
      <Col xs={24} lg={12} xl={12}>
        <QueueAnim delay={200} duration={1200} type="bottom">
          <div key={"description_well"}>
            <Descriptions
              bordered
              size="small"
              style={{
                marginBottom: "10px",
                borderRadius: "10px",
                background:
                  "linear-gradient(90deg, rgba(2,0,36,0.14189425770308128) 0%, rgba(255,255,255,1) 100%)",
              }}
            >
              <Descriptions.Item label="Frecuencía" span={2}>
                {state.selected_profile.frecuency}/min
              </Descriptions.Item>
              <Descriptions.Item label="Siguiente medición" span={2}>
                {deadline && (
                  <Countdown
                    value={deadline}
                    valueStyle={{ fontSize: "14px" }}
                    suffix={<ClockCircleOutlined />}
                    onFinish={() => onFinishCounter(finishCounter)}
                  />
                )}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </QueueAnim>
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
          <div key={"flow_text"}>
            <Text style={styles.textFlow}>{caudal}(L/s)</Text>
          </div>
        </QueueAnim>
        <QueueAnim delay={1000} duration={1200} type="scale">
          <div key={"acum_text"}>
            <Text style={styles.textTotal}>
              {numberForMiles.format(acumulado)} (m³)
            </Text>
          </div>
        </QueueAnim>
        <QueueAnim delay={800} duration={1200} type="scale">
          <div key={"nivel_text"}>
            <Text style={styles.textNivel}>{nivel} (m)</Text>
          </div>
        </QueueAnim>
      </Col>
    </Row>
  );
};

export default MyWell;
