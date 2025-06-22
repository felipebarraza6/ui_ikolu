import React, { useContext, useEffect, useState } from "react";
import {
  Row,
  Col,
  Typography,
  Statistic,
  Card,
  Descriptions,
  Flex,
  Table,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import caudal_img from "../../assets/images/caudal.png";
import nivel_img from "../../assets/images/nivel.png";
import acumulado_img from "../../assets/images/acumulado.png";
import { AppContext } from "../../App";
import QueueAnim from "rc-queue-anim";
import MyLastRegisters from "./MyLastRegisters";
import sh from "../../api/sh/endpoints";
import { BsClockHistory } from "react-icons/bs";
import Well from "./Well";
import dateConverter from "xlsx-populate/lib/dateConverter";

const { Countdown } = Statistic;
const { Title, Text } = Typography;

const numberForMiles = new Intl.NumberFormat("de-DE");

const processNivel = (value) => parseFloat(value).toFixed(1);
const processCaudal = (value) => parseFloat(value).toFixed(1);
const processAcum = (value) => numberForMiles.format(value);

const MyWell = () => {
  const { state, dispatch } = useContext(AppContext);
  const [frecuency, setFrecuency] = useState(60);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [nivel, setNivel] = useState(0);
  const [caudal, setCaudal] = useState(0);
  const [finishCounter, setFinishCounter] = useState(0);
  const [acumulado, setAcumulado] = useState(0);
  const [acumHora, setAcumHora] = useState(0);
  const [acumDia, setAcumDia] = useState(0);
  const [deadline, setDeadline] = useState(null);
  const [lastCaption, setLastCaption] = useState(null);
  const [acumAyer, setAcumAyer] = useState(0);
  const [acumulado2, setAcumulado2] = useState(0);
  const [dataSource, setDataSource] = useState([]);

  const [zoomNivel, setZoomNivel] = useState(false);
  const [zoomCaudal, setZoomCaudal] = useState(false);
  const [zoomAcumulado, setZoomAcumulado] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onFinishCounter = async () => {
    setFinishCounter(finishCounter + 1);

    const token = localStorage.getItem("token");
    const selected_profile = state.selected_profile;

    try {
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

      if (
        userProfileResponse.results &&
        userProfileResponse.results.length > 0
      ) {
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
          result.total_hora =
            result.total - (userProfileResponse.results[i + 1]?.total || 0);
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
        setAcumulado2(0.0);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  useEffect(() => {
    if (
      state.selected_profile &&
      state.selected_profile.modules &&
      state.selected_profile.config_data
    ) {
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
  };

  const MobileMetricCard = ({
    icon,
    image,
    title,
    value,
    unit,
    onMouseEnter,
    onMouseLeave,
  }) => (
    <div
      size="small"
      style={{
        borderRadius: "12px",
        overflow: "hidden",
        margin: "4px",
        padding: "0px",
        height: "80px",
        transition: "all 0.3s ease",
      }}
      bodyStyle={{ padding: 0, height: "100%" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Cabecera con título */}
      <div
        style={{
          fontSize: "11px",
          fontWeight: "600",
          textAlign: "center",
          display: "flex",
          color: "white",
          backgroundColor: "#1F3461",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon && <span style={{ marginRight: "4px" }}>{icon}</span>}
        {title}
      </div>

      {/* Contenido: valor centrado */}
      <div
        style={{
          height: "52px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: "700",
              display: "inline-block",
              minWidth: "70px",
            }}
          >
            {value} {unit}
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div style={{ padding: "2px" }}>
        {/* Grid 2x2 para móvil */}
        <Row gutter={[4, 4]} style={{ marginBottom: "4px" }}>
          <Col xs={12}>
            <QueueAnim delay={200} duration={800} type="left">
              <div key="ultima-hora-mobile">
                <MobileMetricCard
                  icon={<CalendarOutlined style={{ fontSize: "10px" }} />}
                  title="Última hora"
                  value={
                    <Flex vertical>
                      <Text>
                        {lastCaption
                          ? `${lastCaption.slice(11, 13)} ${lastCaption.slice(
                              14,
                              16
                            )} hrs`
                          : "No hay datos"}
                      </Text>
                    </Flex>
                  }
                />
              </div>
            </QueueAnim>
          </Col>

          <Col xs={12}>
            <QueueAnim delay={400} duration={800} type="left">
              <div key="caudal-mobile">
                <MobileMetricCard
                  title={
                    state.selected_profile?.is_prom_flow
                      ? "Caudal Medio"
                      : "Caudal"
                  }
                  value={caudal}
                  unit={
                    state.selected_profile?.is_prom_flow ? "(L/h)" : "(L/s)"
                  }
                  onMouseEnter={() => setZoomCaudal(true)}
                  onMouseLeave={() => setZoomCaudal(false)}
                />
              </div>
            </QueueAnim>
          </Col>

          <Col xs={12}>
            <QueueAnim delay={600} duration={800} type="left">
              <div key="nivel-mobile">
                <MobileMetricCard
                  title="Nivel Freático"
                  value={parseFloat(nivel).toLocaleString("es-ES", {
                    minimumFractionDigits: 1,
                  })}
                  unit="(m)"
                  onMouseEnter={() => setZoomNivel(true)}
                  onMouseLeave={() => setZoomNivel(false)}
                />
              </div>
            </QueueAnim>
          </Col>

          <Col xs={12}>
            <QueueAnim delay={800} duration={800} type="left">
              <div key="acumulado-mobile">
                <MobileMetricCard
                  title="Acumulado"
                  value={numberForMiles.format(acumulado)}
                  unit="(m³)"
                  onMouseEnter={() => setZoomAcumulado(true)}
                  onMouseLeave={() => setZoomAcumulado(false)}
                />
              </div>
            </QueueAnim>
          </Col>
        </Row>

        {/* Pozo animado */}
        <QueueAnim delay={1000} duration={800} type="bottom">
          <div
            key="pozo-mobile"
            style={{ textAlign: "center", marginBottom: "4px" }}
          >
            <Well
              total={acumulado}
              nivel={nivel}
              caudal={caudal}
              profW={state.selected_profile?.config_data?.d1}
            />
          </div>
        </QueueAnim>

        {/* Counter de siguiente medición */}
        <QueueAnim delay={1200} duration={800} type="left">
          <div
            key="counter-mobile"
            style={{ margin: "2px", marginBottom: "4px" }}
          >
            <Card
              size="small"
              hoverable
              style={{
                borderRadius: "12px",

                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              bodyStyle={{ padding: "8px" }}
            >
              <Row gutter={8} align="middle">
                <Col xs={12}>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#666",
                        marginBottom: "2px",
                        fontWeight: "500",
                      }}
                    >
                      Frecuencia
                    </div>
                    <div
                      style={{
                        backgroundColor: "#1F3461",
                        color: "white",
                        padding: "3px 6px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "600",
                        display: "inline-block",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      }}
                    >
                      {state.selected_profile?.frecuency}/min
                    </div>
                  </div>
                </Col>
                <Col xs={12}>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#666",
                        marginBottom: "2px",
                        fontWeight: "500",
                      }}
                    >
                      Siguiente medición
                    </div>
                    {deadline && (
                      <Countdown
                        value={deadline}
                        valueStyle={{
                          fontSize: "11px",
                          fontWeight: "600",
                          color: "#1F3461",
                        }}
                        suffix={
                          <ClockCircleOutlined
                            style={{ fontSize: "11px", color: "#1F3461" }}
                          />
                        }
                        onFinish={() => onFinishCounter()}
                      />
                    )}
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        </QueueAnim>

        {/* Información diaria */}
        <QueueAnim delay={1400} duration={800} type="left">
          <div key="descripcion-diaria-mobile" style={{ margin: "2px" }}>
            <Descriptions
              size="small"
              bordered
              style={{
                borderRadius: "12px",

                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}
            >
              <Descriptions.Item
                label={
                  <span style={{ fontSize: "11px", fontWeight: "500" }}>
                    <CalendarOutlined
                      style={{ marginRight: "4px", fontSize: "10px" }}
                    />
                    {new Date().toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "long",
                    })}
                  </span>
                }
                span={3}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#1F3461",
                  }}
                >
                  {acumDia} (m³)
                </span>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span style={{ fontSize: "11px", fontWeight: "500" }}>
                    <CalendarOutlined
                      style={{ marginRight: "4px", fontSize: "10px" }}
                    />
                    {new Date(
                      new Date().setDate(new Date().getDate() - 1)
                    ).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "long",
                    })}
                  </span>
                }
                span={3}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#1F3461",
                  }}
                >
                  {acumAyer} (m³)
                </span>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span style={{ fontSize: "11px", fontWeight: "500" }}>
                    <HistoryOutlined
                      style={{ marginRight: "4px", fontSize: "10px" }}
                    />
                    Historial {new Date().toLocaleDateString()}
                  </span>
                }
              >
                <MyLastRegisters />
              </Descriptions.Item>
            </Descriptions>
          </div>
        </QueueAnim>
      </div>
    );
  }

  return (
    <Flex
      justify="space-around"
      align="top"
      style={{ padding: "10px" }}
      vertical={false}
    >
      <Flex vertical style={{ width: "100%" }}>
        <QueueAnim delay={400} duration={1200} type="left">
          <div key={"card-last-hour"}>
            <Card hoverable style={styles.cardValues} size="small">
              <Row justify="space-around" align={"middle"}>
                <Col xs={24} lg={6} xl={6}>
                  <center>
                    <BsClockHistory
                      style={{ fontSize: "48px", color: "#2E5E9C" }}
                    />
                  </center>
                </Col>
                <Col xs={24} lg={18} xl={18} style={styles.colCard}>
                  <Title level={5} style={{ marginTop: "-10px" }}>
                    Última hora
                  </Title>
                  <Text style={styles.valueCard}>
                    {lastCaption ? lastCaption.slice(0, 10) : "No hay datos"}
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
          <div key={"card-flow"}>
            <Card
              hoverable
              style={styles.cardValues}
              size="small"
              onMouseLeave={() => setZoomCaudal(false)}
              onMouseEnter={() => setZoomCaudal(true)}
            >
              <Row justify="space-between">
                <Col xs={24} lg={6} xl={6}>
                  <center>
                    <img src={caudal_img} alt="caudal_img" width="100%" />
                  </center>
                </Col>
                <Col xs={24} lg={18} xl={18} style={styles.colCard}>
                  <Title level={5} style={{ marginTop: "-10px" }}>
                    {state.selected_profile?.is_prom_flow
                      ? "Caudal Medio"
                      : "Caudal"}
                  </Title>
                  <Text style={styles.valueCard}>
                    <b>
                      {caudal}
                      {state.selected_profile?.is_prom_flow ? "(L/h)" : "(L/s)"}
                    </b>
                  </Text>
                </Col>
              </Row>
            </Card>
          </div>
        </QueueAnim>

        <QueueAnim delay={800} duration={1200} type="left">
          <div key={"card-water-level"}>
            <Card
              hoverable
              style={styles.cardValues}
              size="small"
              onMouseLeave={() => setZoomNivel(false)}
              onMouseEnter={() => setZoomNivel(true)}
            >
              <Row justify="space-around">
                <Col xs={24} lg={6} xl={6}>
                  <center>
                    <img src={nivel_img} alt="nivel_img" width="75%" />
                  </center>
                </Col>
                <Col xs={24} lg={18} xl={18} style={styles.colCard}>
                  <Title level={5} style={{ marginTop: "-10px" }}>
                    Nivel Freático
                  </Title>
                  <Text style={styles.valueCard}>{nivel} (m)</Text>
                </Col>
              </Row>
            </Card>
          </div>
        </QueueAnim>

        <QueueAnim delay={1000} duration={1200} type="left">
          <div key={"card-accumulated"}>
            <Card
              hoverable
              style={styles.cardValues}
              size="small"
              onMouseLeave={() => setZoomAcumulado(false)}
              onMouseEnter={() => setZoomAcumulado(true)}
            >
              <Row justify="space-around">
                <Col xs={24} lg={6} xl={6}>
                  <center>
                    <img src={acumulado_img} alt="acumulado_img" width="100%" />
                  </center>
                </Col>
                <Col xs={24} lg={18} xl={18} style={styles.colCard}>
                  <Title level={5} style={{ marginTop: "-10px" }}>
                    Acumulado
                  </Title>
                  <Text style={styles.valueCard}>
                    {numberForMiles.format(acumulado)} (m³)
                  </Text>
                </Col>
              </Row>
            </Card>
          </div>
        </QueueAnim>

        {state.user.username === "lecheriavalleverde" && (
          <Col span={13} style={{ marginBottom: "10px" }}>
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
          <div key={"description-daily-yesterday"}>
            <Descriptions
              size="small"
              bordered
              style={{
                marginBottom: "10px",
                width: "370px",
                borderRadius: "10px",
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

      <Flex vertical style={{ width: "100%" }}>
        <Well
          total={acumulado}
          nivel={nivel}
          caudal={caudal}
          profW={state.selected_profile?.config_data?.d1}
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
              }}
            >
              <Descriptions.Item label="Frecuencia" span={2}>
                {state.selected_profile?.frecuency}/min
              </Descriptions.Item>
              <Descriptions.Item label="Siguiente medición" span={2}>
                {deadline && (
                  <Countdown
                    value={deadline}
                    valueStyle={{ fontSize: "14px" }}
                    suffix={<ClockCircleOutlined />}
                    onFinish={() => onFinishCounter()}
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
