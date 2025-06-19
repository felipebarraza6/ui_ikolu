import React, { useState, useContext, useEffect } from "react";
import { Tabs, Card, Flex, Statistic, Tag } from "antd";
import {
  FlowArea,
  TotalLine,
  TotalHour,
  TotalDay,
  WaterTableBar,
} from "./LineGraph";
import { DatabaseOutlined } from "@ant-design/icons";
import TableData from "./TableData";
import img_caudal from "../../../../assets/images/caudal.png";
import img_nivel from "../../../../assets/images/nivel.png";
import img_total from "../../../../assets/images/acumulado.png";
import { AppContext } from "../../../../App";
import QueueAnim from "rc-queue-anim";

const { TabPane } = Tabs;

const Container = ({ data }) => {
  const [activeKey, setActiveKey] = useState("1");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [maxConsumoHora, setMaxConsumoHora] = useState({
    hour: "00:00",
    value: 0,
  });
  const [minConsumoHora, setMinConsumoHora] = useState({
    hour: "00:00",
    value: 0,
  });
  const [acumulado, setAcumulado] = useState({
    first: {
      hour: "00:00",
      value: 0,
      flow: 0,
      nivel: 0,
    },
    last: {
      hour: "00:00",
      value: 0,
    },
  });

  const [caudalMax, setCaudalMax] = useState(0);
  const [caudalMin, setCaudalMin] = useState(0);

  const [nivelMax, setNivelMax] = useState(0);
  const [nivelMin, setNivelMin] = useState(0);

  const { state } = useContext(AppContext);
  const configProfile = state.selected_profile.config_data;
  const activate = state.selected_profile.profile_ikolu.m4;
  const flow_dga = state.selected_profile.dga.flow_granted_dga;
  const total_flow = state.selected_profile.dga.total_granted_dga;
  console.log(total_flow);

  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  useEffect(() => {
    if (data.length > 0) {
      let caudalMax = data.reduce((prev, current) =>
        prev.flow > current.flow ? prev : current
      );

      let caudalMin = data.reduce((prev, current) => {
        if (current.flow === 0) return prev;
        return prev.flow < current.flow && prev.flow !== 0 ? prev : current;
      });

      setCaudalMax({
        hour: caudalMax.date_time_medition.slice(11, 16),
        value: caudalMax.flow,
      });
      setCaudalMin({
        hour: caudalMin.date_time_medition.slice(11, 16),
        value: caudalMin.flow,
      });

      let nivelMax = data.reduce((prev, current) =>
        prev.water_table > current.water_table ? prev : current
      );

      setNivelMax({
        hour: nivelMax.date_time_medition.slice(11, 16),
        value: nivelMax.water_table,
      });

      let nivelMin = data.reduce((prev, current) => {
        if (current.water_table === 0) return prev;
        return prev.water_table < current.water_table && prev.water_table !== 0
          ? prev
          : current;
      });

      setNivelMin({
        hour: nivelMin.date_time_medition.slice(11, 16),
        value: nivelMin.water_table,
      });

      let max = data.reduce((prev, current) =>
        prev.total_diff > current.total_diff ? prev : current
      );
      console.log(max.date_time_medition.slice(11, 16));
      setMaxConsumoHora({
        hour: max.date_time_medition.slice(11, 16),
        value: max.total_diff,
      });

      let min = data.reduce((prev, current) => {
        if (current.total_diff === 0) return prev;
        return prev.total_diff < current.total_diff && prev.total_diff !== 0
          ? prev
          : current;
      });

      setMinConsumoHora({
        hour: min.date_time_medition.slice(11, 16),
        value: min.total_diff,
      });
      setAcumulado({
        first: {
          hour: data[0].date_time_medition.slice(11, 16),
          value: parseInt(data[0].total).toLocaleString("es-CL"),
          flow: data[0].flow,
          nivel: parseFloat(data[0].water_table).toFixed(2),
        },
        last: {
          hour: data[data.length - 1].date_time_medition.slice(11, 16),
          value: parseInt(data[data.length - 1].total).toLocaleString("es-CL"),
        },
      });
    }
  }, [data]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <QueueAnim delay={300} duration={900} type="alpha">
      <div key="login" style={{ paddingTop: isMobile ? "0px" : "20px" }}>
        <Flex
          vertical
          gap={isMobile ? "small" : "small"}
          style={{ width: "100%" }}
        >
          <>
            <Tabs
              activeKey={activeKey}
              onChange={handleTabChange}
              size="small"
              type="card"
              style={{ width: "100%", marginTop: isMobile ? "5px" : "0px" }}
              tabBarStyle={{
                paddingTop: "5px",
                position: "flex",
                justifyContent: "center",
                paddingLeft: "5px",
                paddingRight: "5px",
                width: "100%",
                borderRadius: "10px 10px 0px 0px",
                marginBottom: isMobile ? "5px" : "16px",
              }}
              tabBarGutter={isMobile ? 2 : 4}
            >
              <TabPane
                key="1"
                tab={
                  <Flex gap={isMobile ? "4px" : "small"} align="center">
                    <img
                      alt="nivel"
                      style={{
                        width: isMobile ? "20px" : "30px",
                        color: "white",
                        filter: activeKey === "1" && "brightness(0) invert(1)",
                      }}
                      src={img_total}
                    />
                    <span style={{ fontSize: isMobile ? "12px" : "14px" }}>
                      Acumulado(m³)
                    </span>
                  </Flex>
                }
              >
                <Card hoverable style={styles.card}>
                  <span style={{ color: "black" }}>
                    {total_flow && (
                      <Flex vertical>
                        <Flex>
                          Autorizado: {total_flow.toLocaleString("es-CL")} m³ /{" "}
                          {data.length > 0 ? (
                            <b style={{ marginLeft: "5px" }}>
                              {" "}
                              {(
                                parseInt(configProfile.d6) +
                                parseInt(data[0].total)
                              ).toLocaleString("es-CL")}{" "}
                              m³
                            </b>
                          ) : (
                            ""
                          )}
                        </Flex>
                        <Flex gap="small">
                          Estas utilizando un
                          {data.length > 0 ? (
                            <b>
                              {total_flow && data.length > 0 && (
                                <b>
                                  {(
                                    ((parseInt(configProfile.d6) +
                                      parseInt(data[0].total)) /
                                      total_flow) *
                                    100
                                  ).toFixed(2)}
                                  %
                                </b>
                              )}
                            </b>
                          ) : (
                            ""
                          )}{" "}
                          de tu consumo autorizado.
                        </Flex>
                      </Flex>
                    )}
                  </span>
                  <TotalLine data={data} limitTotal={total_flow} />
                </Card>
              </TabPane>

              <TabPane
                tab={
                  <Flex gap={isMobile ? "4px" : "small"} align="center">
                    <img
                      alt="nivel"
                      style={{
                        width: isMobile ? "20px" : "30px",
                        filter:
                          activeKey === "2"
                            ? "brightness(0) invert(1)"
                            : "none",
                      }}
                      src={img_total}
                    />
                    <span style={{ fontSize: isMobile ? "12px" : "14px" }}>
                      Consumo Hora(m³/h)
                    </span>
                  </Flex>
                }
                key="2"
              >
                <Card hoverable style={styles.card}>
                  <FlowArea data={data} limitFlow={flow_dga} />
                </Card>
              </TabPane>
              <TabPane
                key="3"
                tab={
                  <Flex gap={isMobile ? "4px" : "small"} align="center">
                    <img
                      alt="nivel"
                      style={{
                        width: isMobile ? "20px" : "30px",
                        filter:
                          activeKey === "3"
                            ? "brightness(0) invert(1)"
                            : "none",
                      }}
                      src={img_total}
                    />
                    <span style={{ fontSize: isMobile ? "12px" : "14px" }}>
                      Consumo día(m³/d)
                    </span>
                  </Flex>
                }
              >
                <Card hoverable style={styles.card}>
                  <WaterTableBar data={data} />
                </Card>
              </TabPane>
              <TabPane
                tab={
                  <Flex gap={isMobile ? "4px" : "small"} align="center">
                    <img
                      alt="caudal"
                      style={{
                        width: isMobile ? "25px" : "40px",
                        filter: activeKey === "4" && "brightness(0) invert(1)",
                      }}
                      src={img_caudal}
                    />
                    <span style={{ fontSize: isMobile ? "12px" : "14px" }}>
                      Caudal(L/s)
                    </span>
                  </Flex>
                }
                key="4"
              >
                <Card hoverable style={styles.card}>
                  <FlowArea data={data} limitFlow={flow_dga} />
                </Card>
              </TabPane>
              <TabPane
                key="5"
                tab={
                  <Flex gap={isMobile ? "4px" : "small"} align="center">
                    <img
                      alt="nivel"
                      style={{
                        width: isMobile ? "18px" : "25px",
                        filter: activeKey === "5" && "brightness(0) invert(1)",
                      }}
                      src={img_nivel}
                    />
                    <span style={{ fontSize: isMobile ? "12px" : "14px" }}>
                      Nivel freático (m)
                    </span>
                  </Flex>
                }
              >
                <Card hoverable style={styles.card}>
                  <WaterTableBar data={data} />
                </Card>
              </TabPane>
              <TabPane
                tab={
                  <Flex gap={isMobile ? "4px" : "small"} align="center">
                    <DatabaseOutlined
                      style={{ fontSize: isMobile ? "14px" : "16px" }}
                    />
                    <span style={{ fontSize: isMobile ? "12px" : "14px" }}>
                      Datos
                    </span>
                  </Flex>
                }
                key="6"
                icon={<DatabaseOutlined />}
              >
                <Card hoverable style={styles.cardData}>
                  <TableData data={data} />
                </Card>
              </TabPane>
            </Tabs>
            <Flex justify="center" gap="small" vertical={isMobile}>
              <Card
                size="small"
                style={styles.cardStat}
                title="Última medición cargada"
                styles={styles.cardStat}
              >
                <Flex vertical gap="small">
                  <p
                    style={{
                      marginTop: -11,
                      borderRadius: "0px 0px 15px 15px",
                      fontWeight: "500",
                      textAlign: "center",
                      backgroundColor: "white",
                      padding: "4px",
                      fontSize: "12px",
                    }}
                  >
                    {data.length > 0
                      ? data[0].n_voucher
                        ? data[0].n_voucher
                        : "En procesamiento..."
                      : "00:00"}
                  </p>
                  <Flex
                    vertical
                    style={{ width: "100%", marginTop: "-12px" }}
                    gap={"small"}
                  >
                    <Tag color="rgb(30, 48, 85)">
                      {data.length > 0
                        ? `${acumulado.first.hour} hrs`
                        : "00:00"}
                    </Tag>
                    <Flex>
                      <Flex vertical>
                        <Tag
                          color="rgb(30, 48, 85)"
                          style={{ marginBottom: "2px" }}
                        >
                          Caudal
                        </Tag>
                        <Tag color="#1F3461">
                          {data.length > 0
                            ? `${acumulado.first.flow} lt/s`
                            : "0"}
                        </Tag>
                      </Flex>
                      <Flex vertical>
                        <Tag color="#1F3461" style={{ marginBottom: "2px" }}>
                          Acumulado
                        </Tag>
                        <Tag color="#1F3461">
                          {data.length > 0
                            ? `${acumulado.first.value} m³`
                            : "0"}
                        </Tag>
                      </Flex>
                      <Flex vertical>
                        <Tag color="#1F3461" style={{ marginBottom: "2px" }}>
                          Nivel Freático
                        </Tag>
                        <Tag color="#1F3461">
                          {data.length > 0 ? `${acumulado.first.nivel} m` : "0"}
                        </Tag>
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
              </Card>

              <Card
                size="small"
                style={styles.cardStat}
                title="Mediciones cargadas"
                styles={styles.cardStat}
              >
                <Flex vertical gap="small">
                  <Statistic
                    title={
                      <p
                        style={{
                          marginTop: -11,
                          borderRadius: "0px 0px 15px 15px",
                          fontWeight: "500",
                          textAlign: "center",
                          backgroundColor: "white",
                          padding: "4px",
                          fontSize: "12px",
                        }}
                      >
                        Cuentan con un número de comprobante
                      </p>
                    }
                    value={
                      data.length > 0
                        ? data.reduce((acc, item) => {
                            if (item.n_voucher) {
                              return acc + 1;
                            }
                            return acc;
                          }, 0)
                        : 0
                    }
                    suffix={data.length > 1 ? "mediciones" : "medicion"}
                    valueStyle={{
                      fontSize: "22px",
                      color: "white",
                      textAlign: "center",
                    }}
                  />
                </Flex>
              </Card>
              <Card
                size="small"
                style={styles.cardStat}
                title="Mediciones en preparación"
                styles={styles.cardStat}
              >
                <Flex vertical gap="small">
                  <Statistic
                    title={
                      <p
                        style={{
                          marginTop: -11,
                          borderRadius: "0px 0px 15px 15px",
                          fontWeight: "500",
                          textAlign: "center",
                          backgroundColor: "white",
                          padding: "4px",
                          fontSize: "12px",
                        }}
                      >
                        Mediciones sin número de comprobante
                      </p>
                    }
                    value={
                      data.length > 0
                        ? data.reduce((acc, item) => {
                            if (item.send_dga) {
                              return acc + 1;
                            }
                            return acc;
                          }, 0)
                        : 0
                    }
                    suffix={data.length > 1 ? "medicion" : "mediciones"}
                    valueStyle={{
                      fontSize: "22px",
                      color: "white",
                      textAlign: "center",
                    }}
                  />
                </Flex>
              </Card>
              <Card
                size="small"
                style={styles.cardStat}
                title="Errores de envío a DGA"
                styles={styles.cardStat}
              >
                <Flex vertical gap="small">
                  <Statistic
                    title={
                      <p
                        style={{
                          marginTop: -11,
                          borderRadius: "0px 0px 15px 15px",
                          fontWeight: "500",
                          textAlign: "center",
                          backgroundColor: "white",
                          padding: "4px",
                          fontSize: "12px",
                        }}
                      >
                        Mediciones con error en su envío
                      </p>
                    }
                    value={
                      data.length > 0
                        ? data.reduce((acc, item) => {
                            if (!item.n_voucher) {
                              return acc + 1;
                            }
                            return acc;
                          }, 0)
                        : 0
                    }
                    suffix="Errores"
                    valueStyle={{
                      fontSize: "22px",
                      textAlign: "center",
                      color: "white",
                    }}
                  />
                </Flex>
              </Card>
            </Flex>
          </>
        </Flex>
      </div>
    </QueueAnim>
  );
};

const styles = {
  cardStat: {
    width: "100%",
    background: "#1F3461",
    header: {
      color: "white",
      fontWeight: "700",
      background: "#1F3461",
      textAlign: "center",
      borderRadius: "5px 5px 0px 0px",
      borderColor: "transparent",
    },
  },

  card: {
    marginTop: window.innerWidth > 900 ? "-16px" : "-6px",
    borderRadius: "0px 0px 10px 10px",
    width: "100%",
    background: "white",
  },
  cardData: {
    marginTop: "-16px",
    borderRadius: "0px",
    width: "100%",
    background: "white",
  },
};

export default Container;
