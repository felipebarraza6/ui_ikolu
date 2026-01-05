import React, { useState, useContext, useEffect } from "react";
import { Tabs, Card, Flex, Statistic, Tag } from "antd";
import {
  FlowArea,
  TotalLine,
  TotalHour,
  TotalDay,
  WaterTableBar,
} from "./LineGraph";
import { ApartmentOutlined } from "@ant-design/icons";
import TableData from "../TableData";
import img_caudal from "../../../assets/images/caudal.png";
import img_nivel from "../../../assets/images/nivel.png";
import img_total from "../../../assets/images/acumulado.png";
import { AppContext } from "../../../App";
import QueueAnim from "rc-queue-anim";

const { TabPane } = Tabs;

const Container = ({ data, isToday = false }) => {
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

  // Obtener variables configuradas para mostrar/ocultar tabs y stats
  const variables = state.selected_profile.config_data?.variables || [];

  // Determinar qué variables existen
  const hasCaudal = variables.some(v => v.type_variable === "CAUDAL" || v.type_variable === "CAUDAL_PROMEDIO");
  const hasNivel = variables.some(v => v.type_variable === "NIVEL" || v.type_variable === "NIVEL_FREATICO");
  const hasTotalizado = variables.some(v => v.type_variable === "TOTALIZADO");

  console.log("📊 Variables disponibles:", { hasCaudal, hasNivel, hasTotalizado });

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
              style={{
                width: "100%",
                marginTop: isMobile ? "5px" : "0px",
                marginBottom: "10px",
              }}
              tabBarStyle={{
                position: "flex",
                justifyContent: "center",
                marginBottom: isMobile ? "5px" : "16px",
              }}
              tabBarGutter={isMobile ? 2 : 4}
            >
              {hasTotalizado && <TabPane
                key="1"
                tab={
                  <Flex
                    gap={isMobile ? "4px" : "small"}
                    align="center"
                    justify="center"
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      backgroundColor:
                        activeKey === "1" ? "#1f3461" : "transparent",
                    }}
                  >
                    <img
                      alt="acumulado"
                      style={{
                        width: isMobile ? "20px" : "25px",
                        filter:
                          activeKey === "1"
                            ? "brightness(0) invert(1)"
                            : "grayscale(100%)",
                      }}
                      src={img_total}
                    />
                    <span
                      style={{
                        fontSize: isMobile ? "12px" : "12px",
                        color: activeKey === "1" ? "white" : "inherit",
                      }}
                    >
                      Acumulado(m³)
                    </span>
                  </Flex>
                }
              >
                <Card hoverable style={styles.card}>
                  <TotalLine data={data} />
                </Card>
              </TabPane>}
              {hasTotalizado && <TabPane
                tab={
                  <Flex
                    gap={isMobile ? "4px" : "small"}
                    align="center"
                    justify="center"
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      backgroundColor:
                        activeKey === "2" ? "#1f3461" : "transparent",
                    }}
                  >
                    <img
                      alt="consumo hora"
                      style={{
                        width: isMobile ? "20px" : "25px",
                        filter:
                          activeKey === "2"
                            ? "brightness(0) invert(1)"
                            : "grayscale(100%)",
                      }}
                      src={img_total}
                    />
                    <span
                      style={{
                        fontSize: isMobile ? "12px" : "12px",
                        color: activeKey === "2" ? "white" : "inherit",
                      }}
                    >
                      Consumo Hora(m³/h)
                    </span>
                  </Flex>
                }
                key="2"
              >
                <Card hoverable style={styles.card}>
                  <TotalHour data={data} />
                </Card>
              </TabPane>}
              {hasTotalizado && <TabPane
                tab={
                  <Flex
                    gap={isMobile ? "4px" : "small"}
                    align="center"
                    justify="center"
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      backgroundColor:
                        activeKey === "3" ? "#1f3461" : "transparent",
                    }}
                  >
                    <img
                      alt="consumo dia"
                      style={{
                        width: isMobile ? "20px" : "25px",
                        filter:
                          activeKey === "3"
                            ? "brightness(0) invert(1)"
                            : "grayscale(100%)",
                      }}
                      src={img_total}
                    />
                    <span
                      style={{
                        fontSize: isMobile ? "12px" : "12px",
                        color: activeKey === "3" ? "white" : "inherit",
                      }}
                    >
                      Consumo día(m³/d)
                    </span>
                  </Flex>
                }
                key="3"
              >
                <Card hoverable style={styles.card}>
                  <TotalDay data={data} />
                </Card>
              </TabPane>}
              {hasCaudal && <TabPane
                key="4"
                tab={
                  <Flex
                    gap={isMobile ? "4px" : "small"}
                    align="center"
                    justify="center"
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      backgroundColor:
                        activeKey === "4" ? "#1f3461" : "transparent",
                    }}
                  >
                    <img
                      alt="caudal"
                      style={{
                        width: isMobile ? "20px" : "25px",
                        filter:
                          activeKey === "4"
                            ? "brightness(0) invert(1)"
                            : "grayscale(100%)",
                      }}
                      src={img_caudal}
                    />
                    <span
                      style={{
                        fontSize: isMobile ? "12px" : "12px",
                        color: activeKey === "4" ? "white" : "inherit",
                      }}
                    >
                      Caudal(L/s)
                    </span>
                  </Flex>
                }
              >
                <Card hoverable style={styles.card}>
                  <FlowArea data={data} />
                </Card>
              </TabPane>}
              {hasNivel && <TabPane
                key="5"
                tab={
                  <Flex
                    gap={isMobile ? "4px" : "small"}
                    align="center"
                    justify="center"
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      backgroundColor:
                        activeKey === "5" ? "#1f3461" : "transparent",
                    }}
                  >
                    <img
                      alt="nivel"
                      style={{
                        width: isMobile ? "20px" : "25px",
                        filter:
                          activeKey === "5"
                            ? "brightness(0) invert(1)"
                            : "grayscale(100%)",
                      }}
                      src={img_nivel}
                    />
                    <span
                      style={{
                        fontSize: isMobile ? "12px" : "12px",
                        color: activeKey === "5" ? "white" : "inherit",
                      }}
                    >
                      Nivel freático (m)
                    </span>
                  </Flex>
                }
              >
                <Card hoverable style={styles.card}>
                  <WaterTableBar data={data} />
                </Card>
              </TabPane>}
              <TabPane
                tab={
                  <Flex
                    gap={isMobile ? "4px" : "small"}
                    align="center"
                    justify="center"
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      backgroundColor:
                        activeKey === "6" ? "#1f3461" : "transparent",
                    }}
                  >
                    <ApartmentOutlined
                      style={{
                        fontSize: isMobile ? "14px" : "16px",
                        color: activeKey === "6" ? "white" : "inherit",
                      }}
                    />
                    <span
                      style={{
                        fontSize: isMobile ? "12px" : "14px",
                        color: activeKey === "6" ? "white" : "inherit",
                      }}
                    >
                      Resumen
                    </span>
                  </Flex>
                }
                key="6"
              >
                <Card hoverable style={styles.cardData}>
                  <TableData data={data} periodType="day" isToday={isToday} />
                </Card>
              </TabPane>
            </Tabs>
            <Flex justify="center" gap="small" vertical={isMobile}>
              {hasTotalizado && <Card
                size="small"
                style={styles.cardStat}
                title="Resumen Acumulado"
                hoverable
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
                          marginTop: -11,
                          borderRadius: "0px 0px 15px 15px",
                          fontWeight: "500",
                          textAlign: "center",
                          padding: "4px",
                          fontSize: "12px",
                        }}
                      >
                        Primer y último registro
                      </p>
                    }
                    prefix={
                      <Tag color="rgb(30, 48, 85)">
                        {data.length > 0
                          ? `${acumulado.first.hour} hrs`
                          : "00:00"}
                      </Tag>
                    }
                    value={acumulado.first.value}
                    suffix={`m³`}
                    valueStyle={{ fontSize: "14px" }}
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
                    valueStyle={{ fontSize: "14px" }}
                  />
                </Flex>
              </Card>}
              {hasTotalizado && <Card
                size="small"
                hoverable
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
                      <Tag color="rgba(30,48,85)">
                        {maxConsumoHora.hour} hrs
                      </Tag>
                    }
                    title={
                      <p
                        style={{
                          marginTop: -11,
                          borderRadius: "0px 0px 15px 15px",
                          fontWeight: "500",
                          textAlign: "center",
                          padding: "4px",
                          fontSize: "12px",
                        }}
                      >
                        Consumo máximo y mínimo
                      </p>
                    }
                    value={maxConsumoHora.value}
                    suffix={`m³/h `}
                    valueStyle={{ fontSize: "14px" }}
                  />
                  <Statistic
                    prefix={
                      <Tag color="rgb(30, 48, 85)">
                        {minConsumoHora.hour} hrs
                      </Tag>
                    }
                    value={minConsumoHora.value}
                    suffix={`m³/h`}
                    valueStyle={{ fontSize: "14px" }}
                  />
                </Flex>
              </Card>}
              {hasTotalizado && <Card
                size="small"
                hoverable
                style={styles.cardStat}
                title="Consumo del día"
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
                          marginTop: -4,
                          borderRadius: "0px 0px 15px 15px",
                          fontWeight: "500",
                          textAlign: "center",
                          padding: "4px",
                          fontSize: "12px",
                        }}
                      >
                        Consumo registrado
                      </p>
                    }
                    value={
                      data.length > 0
                        ? data[0].total_today_diff.toLocaleString("es-CL")
                        : 0
                    }
                    suffix="m³"
                    valueStyle={{
                      fontSize: "22px",
                      textAlign: "center",
                    }}
                  />
                </Flex>
              </Card>}
              {hasCaudal && <Card
                size="small"
                style={styles.cardStat}
                hoverable
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
                          marginTop: -11,
                          borderRadius: "0px 0px 15px 15px",
                          fontWeight: "500",
                          textAlign: "center",
                          padding: "4px",
                          fontSize: "12px",
                        }}
                      >
                        Registro máximo y mínimo
                      </p>
                    }
                    prefix={
                      <Tag color="rgb(30, 48, 85)">{caudalMax.hour} hrs</Tag>
                    }
                    value={caudalMax.value}
                    suffix="lt/s"
                    valueStyle={{ fontSize: "14px" }}
                  />
                  <Statistic
                    prefix={
                      <Tag color="rgb(30, 48, 85)">{caudalMin.hour} hrs</Tag>
                    }
                    value={caudalMin.value}
                    suffix="lt/s"
                    valueStyle={{ fontSize: "14px" }}
                  />
                </Flex>
              </Card>}
              {hasNivel && <Card
                size="small"
                hoverable
                style={styles.cardStat}
                title="Nivel Freático MAX/MIN"
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
                          padding: "4px",
                          fontSize: "12px",
                        }}
                      >
                        Registro máximo y mínimo
                      </p>
                    }
                    prefix={
                      <Tag color="rgb(30, 48, 85)">{nivelMax.hour} hrs</Tag>
                    }
                    value={nivelMax.value}
                    suffix="m"
                    valueStyle={{ fontSize: "14px" }}
                  />
                  <Statistic
                    prefix={
                      <Tag color="rgb(30, 48, 85)">{nivelMin.hour} hrs</Tag>
                    }
                    value={nivelMin.value}
                    valueStyle={{ fontSize: "14px" }}
                    suffix="m"
                  />
                </Flex>
              </Card>}
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
    marginTop: window.innerWidth > 900 ? "-16px" : "-6px",
    borderRadius: "0px 0px 10px 10px",
    width: "100%",
  },
  cardData: {
    marginTop: "-16px",

    borderRadius: "0px",
    width: "100%",
  },
};

export default Container;
