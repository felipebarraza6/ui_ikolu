import React, { useContext, useEffect, useState } from "react";
import {
  Row,
  Col,
  Typography,
  Statistic,
  Card,
  Tag,
  Descriptions,
  Flex,
  Table, // Added Table import
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import caudal_img from "../../assets/images/caudal.png";
import nivel_img from "../../assets/images/nivel.png";
import acumulado_img from "../../assets/images/acumulado.png";
import pozo1 from "../../assets/images/pozo1.png"; // This image is not used in the provided JSX
import { AppContext } from "../../App";
import QueueAnim from "rc-queue-anim";
import MyLastRegisters from "./MyLastRegisters";
import sh from "../../api/sh/endpoints";
import { BsClockHistory } from "react-icons/bs";
import Well from "./Well";

const { Countdown } = Statistic;
const { Title, Text } = Typography;

const numberForMiles = new Intl.NumberFormat("de-DE");

// Placeholder functions for data processing. You need to implement their actual logic.
const processNivel = (value) => parseFloat(value).toFixed(1);
const processCaudal = (value) => parseFloat(value).toFixed(1);
const processAcum = (value) => numberForMiles.format(value);

const MyWell = () => {
  const { state, dispatch } = useContext(AppContext);
  const [frecuency, setFrecuency] = useState(60); // This state variable is declared but not used.

  const [nivel, setNivel] = useState(0);
  const [caudal, setCaudal] = useState(0);
  const [finishCounter, setFinishCounter] = useState(0);
  const [acumulado, setAcumulado] = useState(0);
  const [acumHora, setAcumHora] = useState(0);
  const [acumDia, setAcumDia] = useState(0);
  const [deadline, setDeadline] = useState(null);
  const [lastCaption, setLastCaption] = useState(null);
  const [acumAyer, setAcumAyer] = useState(0);
  const [acumulado2, setAcumulado2] = useState(0); // From main branch
  const [dataSource, setDataSource] = useState([]); // From main branch

  const [zoomNivel, setZoomNivel] = useState(false);
  const [zoomCaudal, setZoomCaudal] = useState(false);
  const [zoomAcumulado, setZoomAcumulado] = useState(false);

  const onFinishCounter = async () => {
    setFinishCounter(finishCounter + 1);

    const token = localStorage.getItem("token");
    const selected_profile = state.selected_profile;

    try {
      // Logic from ikolu_sma
      const userProfileResponse = await sh.get_profile();
      console.log(userProfileResponse);
      const profile_data = userProfileResponse.user.catchment_points;
      const selected_profile_data =
        profile_data.find((profile) => profile.id === selected_profile?.id) ||
        profile_data[0];

      dispatch({
        type: "UPDATE",
        payload: {
          token: token,
          user: userProfileResponse.user,
          profile_data: profile_data,
          selected_profile: selected_profile_data,
        },
      });

      // Logic from main for data processing, assuming `sh.get_profile()` returns data structured like `r.results`
      // You might need to adjust this part based on your actual API response structure for get_profile()
      // or if there's another API call that `main` branch intended to make.
      // For now, I'm assuming `userProfileResponse` contains `results` array.
      if (userProfileResponse.results && userProfileResponse.results.length > 0) {
        let currentNivel = 0;
        let currentFlow = 0;
        let currentTotal = 0;
        let currentTotal2 = 0;

        if (userProfileResponse.results[0].nivel !== null) {
          currentNivel = processNivel(userProfileResponse.results[0].nivel);
        }
        if (userProfileResponse.results[0].flow !== null) {
          currentFlow = processCaudal(userProfileResponse.results[0].flow);
        }
        if (userProfileResponse.results[0].total !== null) {
          currentTotal = processAcum(userProfileResponse.results[0].total);
        }
        if (userProfileResponse.results[0].total2 !== null) {
          currentTotal2 = processAcum(userProfileResponse.results[0].total2);
        }

        userProfileResponse.results.forEach((result, i) => {
          result.total_hora = result.total - (userProfileResponse.results[i + 1]?.total || 0);
          if (result.total_hora < 0 || isNaN(result.total_hora)) {
            result.total_hora = 0;
          }
        });
        setDataSource(userProfileResponse.results);
        setNivel(currentNivel);
        setCaudal(currentFlow > 0 ? currentFlow : 0.0);
        setAcumulado(currentTotal);
        setAcumulado2(currentTotal2);
      } else {
        setNivel(0.0);
        setCaudal(0.0);
        setAcumulado(0.0);
        setAcumulado2(0.0); // Also reset acumulado2
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      // Handle error, e.g., show a message to the user
    }
  };

  useEffect(() => {
    // Ensure selected_profile and its nested properties exist before accessing
    if (state.selected_profile && state.selected_profile.modules && state.selected_profile.config_data) {
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
    }
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
      marginTop: "30px",
      marginLeft: window.innerWidth > 900 ? "-5px" : "0px",
    },
    textFlow: {
      color: "white",
      background: zoomCaudal
        ? "linear-gradient(31deg, rgba(31,52,97,1) 0%, rgba(56,67,74,1) 100%)"
        : "#1F3461",
      border: "0px solid #1F3461",
      fontSize: zoomCaudal ? "17px" : "13px",
      left: "-20px",
      marginTop: window.innerWidth > 900 ? "-360px" : "23%",
      padding: window.innerWidth > 900 ? "5px" : "5px",
      position: "absolute",
      borderRadius: "10px",
      transition: "all 0.3s ease-in-out",
    },
    textTotal: {
      color: "white",
      background: zoomAcumulado
        ? "linear-gradient(31deg, rgba(31,52,97,1) 0%, rgba(56,67,74,1) 100%)"
        : "#1F3461",
      border: "0px solid #1F3461",
      fontSize: zoomAcumulado ? "17px" : "13px",
      padding: window.innerWidth > 900 ? "5px" : "5px",
      marginTop: window.innerWidth > 900 ? "-350px" : "23%",
      marginLeft: "280px",
      position: "absolute",
      borderRadius: "10px",
      transition: "all 0.3s ease-in-out",
    },
    textNivel: {
      color: "white",
      background: zoomNivel
        ? "linear-gradient(31deg, rgba(31,52,97,1) 0%, rgba(56,67,74,1) 100%)"
        : "#1F3461",
      border: "0px solid #1F3461",
      fontSize: zoomNivel ? "17px" : "13px",
      marginTop: window.innerWidth > 900 ? "-220px" : "30%",
      left: "230px",
      padding: window.innerWidth > 900 ? "5px" : "5px",
      position: "absolute",
      borderRadius: "10px",
      transition: "all 0.3s ease-in-out",
    },
  };

  return (
    <Flex justify="space-around" align="top" style={{ padding: "10px" }}>
      <Flex vertical style={{ width: "100%" }}>
        <QueueAnim delay={400} duration={1200} type="left">
          <div key={"card-last-hour"}> {/* Changed key for clarity */}
            <Card
              hoverable
              bordered={false}
              style={styles.cardValues}
              size="small"
            >
              <Row
                justify={window.innerWidth > 900 ? "space-around" : "center"}
                align={"middle"}
              >
                <Col xs={24} lg={6} xl={6}>
                  <center>
                    <BsClockHistory
                      style={{ fontSize: "48px", color: "#2E5E9C" }}
                    />
                  </center>
                </Col>
                <Col xs={24} lg={18} xl={18} style={styles.colCard}>
                  {window.innerWidth > 900 && (
                    <Title level={5} style={{ marginTop: "-10px" }}>
                      Última hora
                    </Title>
                  )}
                  <Text style={styles.valueCard}>
                    {numberForMiles.format(acumHora)} (m³)
                  </Text>
                  <br />
                  <Text>
                    {lastCaption && (
                      <u>
                        {lastCaption.slice(11, 13)}
                        {":00 hrs "}
                      </u>
                    )}
                  </Text>
                </Col>
              </Row>
            </Card>
          </div>
        </QueueAnim>
        <QueueAnim delay={600} duration={1200} type="left">
          <div key={"card-flow"}> {/* Changed key for clarity */}
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
                  {window.innerWidth > 900 ? (
                    <>
                      <Title level={5} style={{ marginTop: "-10px" }}>
                        {state.selected_profile.is_prom_flow
                          ? "Caudal Medio"
                          : "Caudal"}
                      </Title>
                      <Text style={styles.valueCard}>
                        <b>
                          {caudal}
                          {state.selected_profile.is_prom_flow
                            ? "(L/h)"
                            : "(L/s)"}
                        </b>
                      </Text>
                    </>
                  ) : (
                    <center>
                      <Tag color="#1F3461">Caudal</Tag>
                      <Tag color="#1F3461">
                        {caudal} (L/s)
                      </Tag>
                    </center>
                  )}
                </Col>
              </Row>
            </Card>
          </div>
        </QueueAnim>

        <QueueAnim delay={800} duration={1200} type="left">
          <div key={"card-water-level"}> {/* Changed key for clarity */}
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
                      alt="nivel_img"
                      width={window.innerWidth > 900 ? "75%" : "50%"}
                      style={{
                        marginBottom: window.innerWidth > 900 ? "0px" : "5px",
                      }}
                    />
                  </center>
                </Col>
                <Col xs={24} lg={18} xl={18} style={styles.colCard}>
                  {window.innerWidth > 900 ? (
                    <>
                      <Title level={5} style={{ marginTop: "-10px" }}>
                        Nivel Freático
                      </Title>
                      <Text style={styles.valueCard}>{nivel} (m)</Text>
                    </>
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
          <div key={"card-accumulated"}> {/* Changed key for clarity */}
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
                      alt="acumulado_img"
                      width={window.innerWidth > 900 ? "100%" : "70%"}
                      style={{
                        marginBottom: window.innerWidth > 900 ? "0px" : "5px",
                      }}
                    />
                  </center>
                </Col>
                <Col xs={24} lg={18} xl={18} style={styles.colCard}>
                  {window.innerWidth > 900 ? (
                    <>
                      <Title level={5} style={{ marginTop: "-10px" }}>
                        Acumulado
                      </Title>
                      <Text style={styles.valueCard}>
                        {numberForMiles.format(acumulado)} (m³)
                      </Text>
                    </>
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

        {/* This is the Table component from the 'main' branch, conditionally rendered */}
        {state.user.username === "lecheriavalleverde" && (
            <Col span={13} style={{ marginBottom: "10px" }}> {/* Added marginBottom for spacing */}
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
                  {
                    title:
                      state.user.id === 43
                        ? "Acumulado (lt/h)"
                        : "Acumulado (m³)",
                    dataIndex: "total_hora",
                    render: (a) =>
                      state.user.id === 43
                        ? numberForMiles.format(parseFloat(a * 1000))
                        : numberForMiles.format(a),
                  },
                ]}
              />
            </Col>
        )}

        <QueueAnim delay={1200} duration={1200} type="left">
          <div key={"description-daily-yesterday"}> {/* Changed key for clarity */}
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
                    <CalendarOutlined style={{ marginRight: "5px" }} />
                    {new Date().toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "long",
                    })}
                  </>
                }
                span={3}
              >
                {acumDia} (m³)
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <CalendarOutlined style={{ marginRight: "5px" }} />
                    {new Date(
                      new Date().setDate(new Date().getDate() - 1)
                    ).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "long",
                    })}
                  </>
                }
                span={3}
              >
                {acumAyer} (m³)
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
          </div>
        </QueueAnim>
      </Flex>
      <Flex vertical style={{ width: "80%", minHeight: "80vh" }}>
        <Well
          total={acumulado}
          nivel={nivel}
          caudal={caudal}
          profW={state.selected_profile.config_data.d1}
        />

        <QueueAnim delay={1200} duration={1200} type="bottom">
          <div key={"description_well"}>
            <Descriptions
              bordered
              size="small"
              layout="vertical"
              style={{
                borderRadius: "10px",
                width: "85%",
                background:
                  "linear-gradient(90deg, rgba(2,0,36,0.14189425770308128) 0%, rgba(255,255,255,1) 100%)",
              }}
            >
              <Descriptions.Item label="Frecuencia" span={2}>
                {state.selected_profile.frecuency}/min
              </Descriptions.Item>
              <Descriptions.Item label="Siguiente medición" span={2}>
                {deadline && (
                  <Countdown
                    value={deadline}
                    valueStyle={{ fontSize: "14px" }}
                    suffix={<ClockCircleOutlined />}
                    onFinish={() => onFinishCounter()} // Removed redundant finishCounter argument
                  />
                )}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </QueueAnim>
      </Flex>
    </Flex>
  );
};

export default MyWell;