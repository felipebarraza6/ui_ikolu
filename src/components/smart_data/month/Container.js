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
import img_caudal from "../../../assets/images/caudal.png";
import img_nivel from "../../../assets/images/nivel.png";
import img_total from "../../../assets/images/acumulado.png";
import { AppContext } from "../../../App";
import QueueAnim from "rc-queue-anim";

const { TabPane } = Tabs;

const Container = ({ data, dateSelected }) => {
  const [activeKey, setActiveKey] = useState("1");

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
  const activate = state.selected_profile.profile_ikolu.m4;
  console.log(activate);

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
        hour: caudalMax.date_time_medition.slice(5, 10),
        value: caudalMax.flow,
      });
      setCaudalMin({
        hour: caudalMin.date_time_medition.slice(5, 10),
        value: caudalMin.flow,
      });

      let nivelMax = data.reduce((prev, current) =>
        prev.water_table > current.water_table ? prev : current
      );

      setNivelMax({
        hour: nivelMax.date_time_medition.slice(5, 10),
        value: nivelMax.water_table,
      });

      let nivelMin = data.reduce((prev, current) => {
        if (current.water_table === 0) return prev;
        return prev.water_table < current.water_table && prev.water_table !== 0
          ? prev
          : current;
      });

      setNivelMin({
        hour: nivelMin.date_time_medition.slice(5, 10),
        value: nivelMin.water_table,
      });

      let max = data.reduce((prev, current) =>
        prev.total_diff > current.total_diff ? prev : current
      );
      console.log(max.date_time_medition.slice(5, 10));
      setMaxConsumoHora({
        hour: max.date_time_medition.slice(5, 10),
        value: max.total_diff,
      });

      let min = data.reduce((prev, current) => {
        if (current.total_diff === 0) return prev;
        return prev.total_diff < current.total_diff && prev.total_diff !== 0
          ? prev
          : current;
      });

      setMinConsumoHora({
        hour: min.date_time_medition.slice(5, 10),
        value: min.total_diff,
      });
      setAcumulado({
        first: {
          hour: data[0].date_time_medition.slice(5, 10),
          value: parseInt(data[0].total).toLocaleString("es-CL"),
        },
        last: {
          hour: data[data.length - 1].date_time_medition.slice(5, 10),
          value: parseInt(data[data.length - 1].total).toLocaleString("es-CL"),
        },
      });
    } else {
      setMaxConsumoHora({
        hour: "00:00",
        value: 0,
      });
      setMinConsumoHora({
        hour: "00:00",
        value: 0,
      });
      setAcumulado({
        first: {
          hour: "00:00",
          value: 0,
        },
        last: {
          hour: "00:00",
          value: 0,
        },
      });
      setCaudalMax({
        hour: "00:00",
        value: 0,
      });
      setCaudalMin({
        hour: "00:00",
        value: 0,
      });
      setNivelMax({
        hour: "00:00",
        value: 0,
      });
      setNivelMin({
        hour: "00:00",
        value: 0,
      });
    }
  }, [data]);

  return (
    <QueueAnim delay={300} duration={900} type="alpha">
      <div key="login">
        <Flex vertical gap="small" style={{ width: "100%" }}>
          <>
            <Tabs
              activeKey={activeKey}
              onChange={handleTabChange}
              size="small"
              type="card"
              style={{ width: "100%" }}
              tabBarStyle={{
                paddingTop: "5px",
                position: "flex",
                justifyContent: "center",
                paddingLeft: "5px",
                paddingRight: "5px",
                width: "100%",
                borderRadius: "10px 10px 0px 0px",
                background:
                  "linear-gradient(90deg, rgba(89,128,55,0.40940126050420167) 0%, rgba(30,48,85,0.7763480392156863)",
              }}
            >
              <TabPane
                key="1"
                tab={
                  <Flex gap={"small"}>
                    <img
                      alt="nivel"
                      style={{
                        width: "30px",
                        color: "white",
                        filter:
                          activeKey === "1"
                            ? "brightness(0) invert(1)"
                            : "none",
                      }}
                      src={img_total}
                    />
                    Acumulado(m³)
                  </Flex>
                }
              >
                <Card hoverable style={styles.card}>
                  <TotalLine data={data} />
                </Card>
              </TabPane>
              <TabPane
                tab={
                  <Flex gap={"small"}>
                    <img
                      alt="nivel"
                      style={{
                        width: "30px",
                        filter:
                          activeKey === "2"
                            ? "brightness(0) invert(1)"
                            : "none",
                      }}
                      src={img_total}
                    />
                    Consumo Hora(m³/h)
                  </Flex>
                }
                key="2"
              >
                <Card hoverable style={styles.card}>
                  <span style={{ color: "white" }}>
                    Consumo promedio por hora
                  </span>
                  <TotalHour data={data} />
                </Card>
              </TabPane>
              <TabPane
                key="3"
                tab={
                  <Flex gap={"small"}>
                    <img
                      alt="nivel"
                      style={{
                        width: "30px",
                        filter:
                          activeKey === "3"
                            ? "brightness(0) invert(1)"
                            : "none",
                      }}
                      src={img_total}
                    />
                    Consumo día(m³/d)
                  </Flex>
                }
              >
                <Card hoverable style={styles.card}>
                  <TotalDay data={data} />
                </Card>
              </TabPane>
              <TabPane
                tab={
                  <Flex gap={"small"}>
                    <img
                      alt="caudal"
                      style={{
                        width: "40px",
                        filter:
                          activeKey === "4"
                            ? "brightness(0) invert(1)"
                            : "none",
                      }}
                      src={img_caudal}
                    />
                    Caudal(lt/s)
                  </Flex>
                }
                key="4"
              >
                <Card hoverable style={styles.card}>
                  <span style={{ color: "white" }}>
                    Caudal promedio por día
                  </span>
                  <FlowArea data={data} />
                </Card>
              </TabPane>
              <TabPane
                key="5"
                tab={
                  <Flex gap={"small"}>
                    <img
                      alt="nivel"
                      style={{
                        width: "25px",
                        filter:
                          activeKey === "5"
                            ? "brightness(0) invert(1)"
                            : "none",
                      }}
                      src={img_nivel}
                    />
                    Nivel freático (m)
                  </Flex>
                }
              >
                <Card hoverable style={styles.card}>
                  <span style={{ color: "white" }}>
                    Nivel freático promedio por día
                  </span>
                  <WaterTableBar data={data} />
                </Card>
              </TabPane>
              <TabPane tab={"Datos"} key="6" icon={<DatabaseOutlined />}>
                <Card hoverable style={styles.cardData}>
                  <TableData data={data} dateSelected={dateSelected} />
                </Card>
              </TabPane>
            </Tabs>
            <Flex justify="center" gap="small">
              <Card
                size="small"
                style={styles.cardStat}
                title="Resumen Acumulado"
                styles={{
                  header: {
                    color: "white",
                    fontWeight: "700",
                    background: "rgba(30,48,85)",
                    textAlign: "center",
                    borderRadius: "5px 5px 0px 0px",
                    borderColor: "transparent",
                  },
                }}
              >
                <Flex vertical gap="small">
                  <Statistic
                    title={
                      <p
                        style={{
                          color: "#577D37",
                          marginTop: -11,
                          borderRadius: "0px 0px 15px 15px",
                          fontWeight: "500",
                          textAlign: "center",
                          backgroundColor: "white",
                          padding: "4px",
                          fontSize: "12px",
                        }}
                      >
                        Primer y último registro
                      </p>
                    }
                    prefix={
                      <Tag color="rgb(30, 48, 85)">
                        {data.length > 0 ? `${acumulado.first.hour} ` : "00:00"}
                      </Tag>
                    }
                    value={acumulado.first.value}
                    suffix={`m³`}
                    valueStyle={{ fontSize: "14px", color: "white" }}
                  />
                  <Statistic
                    value={acumulado.last.value}
                    suffix={`m³`}
                    prefix={
                      <Tag color="rgb(30, 48, 85)">
                        {data.length > 0
                          ? `${acumulado.last.hour} hrs`
                          : "00:00"}
                      </Tag>
                    }
                    valueStyle={{ fontSize: "14px", color: "white" }}
                  />
                </Flex>
              </Card>
              <Card
                size="small"
                style={styles.cardStat}
                title="Consumos MAX/MIN"
                styles={{
                  header: {
                    color: "white",
                    fontWeight: "700",
                    background: "rgba(30,48,85)",
                    textAlign: "center",
                    borderRadius: "5px 5px 0px 0px",
                    borderColor: "transparent",
                  },
                }}
              >
                <Flex vertical gap="small" justify="center">
                  <Statistic
                    prefix={
                      <Tag color="rgba(30,48,85)">{maxConsumoHora.hour}</Tag>
                    }
                    title={
                      <p
                        style={{
                          color: "#577D37",
                          marginTop: -11,
                          borderRadius: "0px 0px 15px 15px",
                          fontWeight: "500",
                          textAlign: "center",
                          backgroundColor: "white",
                          padding: "4px",
                          fontSize: "12px",
                        }}
                      >
                        Promedio máximo y mínimo
                      </p>
                    }
                    value={maxConsumoHora.value}
                    suffix={`m³/h `}
                    valueStyle={{ fontSize: "14px", color: "white" }}
                  />
                  <Statistic
                    prefix={
                      <Tag color="rgb(30, 48, 85)">{minConsumoHora.hour}</Tag>
                    }
                    value={minConsumoHora.value}
                    suffix={`m³/h`}
                    valueStyle={{ fontSize: "14px", color: "white" }}
                  />
                </Flex>
              </Card>
              <Card
                size="small"
                style={styles.cardStat}
                title="Consumo del mes"
                styles={{
                  header: {
                    color: "white",
                    fontWeight: "700",
                    background: "rgba(30,48,85)",
                    textAlign: "center",
                    borderRadius: "5px 5px 0px 0px",
                    marginBottom: "-8px",
                    borderColor: "transparent",
                  },
                  "& hover": {
                    background: "rgba(30,48,85,0.8)",
                    mouse: "pointer",
                  },
                }}
              >
                <Flex vertical gap="small">
                  <Statistic
                    title={
                      <p
                        style={{
                          color: "#577D37",
                          marginTop: -4,
                          borderRadius: "0px 0px 15px 15px",
                          fontWeight: "500",
                          textAlign: "center",
                          backgroundColor: "white",
                          padding: "4px",
                          fontSize: "12px",
                        }}
                      >
                        Consumo registrado
                      </p>
                    }
                    value={
                      data.length > 0
                        ? data
                            .reduce(
                              (sum, record) => sum + record.total_today_diff,
                              0
                            )
                            .toLocaleString("es-CL")
                        : 0
                    }
                    suffix="m³"
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
                title="Caudal MAX/MIN"
                styles={{
                  header: {
                    color: "white",
                    fontWeight: "700",
                    background: "rgba(30,48,85)",
                    textAlign: "center",
                    borderRadius: "5px 5px 0px 0px",
                    borderColor: "transparent",
                  },
                }}
              >
                <Flex vertical gap="small">
                  <Statistic
                    title={
                      <p
                        style={{
                          color: "#577D37",
                          marginTop: -11,
                          borderRadius: "0px 0px 15px 15px",
                          fontWeight: "500",
                          textAlign: "center",
                          backgroundColor: "white",
                          padding: "4px",
                          fontSize: "12px",
                        }}
                      >
                        Promedio máximo y mínimo
                      </p>
                    }
                    prefix={
                      <Tag color="rgb(30, 48, 85)">{caudalMax.hour} </Tag>
                    }
                    value={caudalMax.value}
                    suffix="lt"
                    valueStyle={{ fontSize: "14px", color: "white" }}
                  />
                  <Statistic
                    prefix={
                      <Tag color="rgb(30, 48, 85)">{caudalMin.hour} </Tag>
                    }
                    value={caudalMin.value}
                    suffix="lt"
                    valueStyle={{ fontSize: "14px", color: "white" }}
                  />
                </Flex>
              </Card>
              <Card
                size="small"
                style={styles.cardStat}
                title="Nivel Freático MAX/MIN"
                styles={styles.cardStat}
              >
                <Flex vertical gap="small">
                  <Statistic
                    title={
                      <p
                        style={{
                          color: "#577D37",
                          marginTop: -11,
                          borderRadius: "0px 0px 15px 15px",
                          fontWeight: "500",
                          textAlign: "center",
                          backgroundColor: "white",
                          padding: "4px",
                          fontSize: "12px",
                        }}
                      >
                        Promedio máximo y mínimo
                      </p>
                    }
                    prefix={<Tag color="rgb(30, 48, 85)">{nivelMax.hour} </Tag>}
                    value={nivelMax.value}
                    suffix="m"
                    valueStyle={{ fontSize: "14px", color: "white" }}
                  />
                  <Statistic
                    prefix={<Tag color="rgb(30, 48, 85)">{nivelMin.hour} </Tag>}
                    value={nivelMin.value}
                    valueStyle={{ fontSize: "14px", color: "white" }}
                    suffix="m"
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
    background:
      "linear-gradient(90deg, rgba(89,128,55,0.40940126050420167) 0%, rgba(30,48,85,0.7763480392156863)",
    header: {
      color: "white",
      fontWeight: "700",
      background: "rgba(30,48,85)",
      textAlign: "center",
      borderRadius: "5px 5px 0px 0px",
      borderColor: "transparent",
    },
  },

  card: {
    marginTop: "-16px",
    borderRadius: "0px 0px 10px 10px",
    width: "100%",
    background:
      "radial-gradient(circle, rgba(30,48,85,1) 0%, rgba(43,46,51,1) 100%)",
  },
  cardData: {
    marginTop: "-16px",
    borderRadius: "0px",
    width: "100%",
  },
};

export default Container;
