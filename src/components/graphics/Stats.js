import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Statistic,
  Tabs,
  Button,
  Tag,
  Typography,
  Table,
  Card,
  Modal,
} from "antd";
import wall from "../../assets/images/walldga.png";
import {
  RiseOutlined,
  FallOutlined,
  EyeFilled,
  TableOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Stats = ({ data, option, parsedDate }) => {
  const [total, setTotal] = useState(0);
  const [totalProm, setTotalProm] = useState(0);
  const [maxHours, setMaxHours] = useState(0);
  const [minHours, setMinHours] = useState(0);
  const [flowMax, setFlowMax] = useState(0);
  const [flowMin, setFlowMin] = useState(0);
  const [nivelMax, setNivelMax] = useState(0);
  const [nivelMin, setNivelMin] = useState(0);
  console.log(data);
  const monthNamesMobile = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];

  const monthNameShort = monthNamesMobile[parsedDate.month()];
  const getTotal = () => {
    var count = 0;
    const sum = data.reduce((accumulator, currentValue) => {
      count++;
      return accumulator + currentValue.acumulado_hora;
    }, 0);

    setTotal(sum);
    setTotalProm(
      parseFloat(sum / count).toLocaleString("es-ES", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })
    );
  };

  const getMaxHour = () => {
    if (data.length > 0) {
      const maxHour = data.reduce((prev, current) => {
        return prev.total_hora > current.total_hora ? prev : current;
      });
      setMaxHours({
        date: maxHour.date_time_medition,
        value: maxHour.total_hora,
      });
      return maxHour.date;
    }
    return null;
  };

  const getMinHour = () => {
    if (data.length > 0) {
      const minHour = data.reduce((prev, current) => {
        return prev.total_hora < current.total_hora ? prev : current;
      });
      setMinHours({
        date: minHour.date_time_medition,
        value: minHour.total_hora,
      });
      return minHour.date;
    }
    return null;
  };

  const flowMinMax = () => {
    if (data.length > 0) {
      const max = data.reduce((prev, current) =>
        prev.flow > current.flow ? prev : current
      );
      const min = data.reduce((prev, current) =>
        prev.flow < current.flow ? prev : current
      );

      setFlowMax({
        date: max.date_time_medition,
        value: parseFloat(max.flow).toFixed(1),
      });
      setFlowMin({
        date: min.date_time_medition,
        value: min.flow > 0.5 ? parseFloat(min.flow).toFixed(1):parseFloat(0.0).toFixed(1),
      });
    }
  };

  const nivelMinMax = () => {
    if (data.length > 0) {
      const max = data.reduce((prev, current) =>
        prev.nivel > current.nivel ? prev : current
      );
      const min = data.reduce((prev, current) =>
        prev.nivel < current.nivel ? prev : current
      );
      setNivelMax({
        date: max.date_time_medition,
        value: parseFloat(max.nivel).toFixed(1),
      });
      setNivelMin({
        date: min.date_time_medition,
        value: parseFloat(min.nivel).toFixed(1),
      });
    }
  };

  useEffect(() => {
    if (data) {
      if (data.length > 0) {
        getTotal();
        getMaxHour();
        getMinHour();
        flowMinMax();
        nivelMinMax();
      }
    }
  }, [data]);

  return (
    <>
      <Row justify={"space-evenly"} align={"top"} style={{ marginTop: "20px" }}>
        <Col xs={11} xl={4} lg={4}>
          <Card style={styles.cardStats.ind4} size="small">
            <Row justify={"center"}>
              {window.innerWidth > 900 ? (
                <Tag
                  color={styles.cardStats.ind4.tag.color}
                  style={{ marginBottom: "10px", fontSize: "16px" }}
                >
                  Caudal (L/s)
                </Tag>
              ) : (
                <Text style={{ marginBottom: "10px" }}>Caudal (L/s)</Text>
              )}
            </Row>
            <Row align="middle" justify={"space-evenly"}>
              <Col span={10}>
                <Tag color="green" icon={<RiseOutlined />}>
                  {window.innerWidth > 900 ? "Max" : ""}
                </Tag>
              </Col>
              <Col span={14}>
                <Tag color="green">
                  {flowMax.date} {option === 1 ? "hrs" : `de ${monthNameShort}`}
                </Tag>
                <br /> <Tag color="green">{flowMax.value} lt/s</Tag>
              </Col>
              <Col
                span={24}
                style={{
                  borderBottom: "2px dashed black",
                  marginTop: "5px",
                  marginBottom: "5px",
                }}
              ></Col>
              <Col span={10}>
                <Tag color="volcano" icon={<FallOutlined />}>
                  {window.innerWidth > 900 ? "Min" : ""}
                </Tag>
              </Col>
              <Col span={14}>
                <Tag color="volcano">
                  {flowMin.date} {option === 1 ? "hrs" : `de ${monthNameShort}`}
                </Tag>{" "}
                <br /> <Tag color="volcano">{flowMin.value} lt/s</Tag>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={11} xl={4} lg={4}>
          <Card style={styles.cardStats.ind5} size="small">
            <Row justify={"center"}>
              {window.innerWidth > 900 ? (
                <Tag
                  color={styles.cardStats.ind5.tag.color}
                  style={{ marginBottom: "10px", fontSize: "17px" }}
                >
                  Nivel freático (m)
                </Tag>
              ) : (
                <Text style={{ marginBottom: "10px" }}>Nivel freático (m)</Text>
              )}
            </Row>
            <Row align="middle">
              <Col span={10}>
                <Tag color="green" icon={<RiseOutlined />}>
                  {window.innerWidth > 900 ? "Max" : ""}
                </Tag>
              </Col>
              <Col span={14}>
                <Tag color="green">
                  {nivelMax.date}{" "}
                  {option === 1 ? "hrs" : `de ${monthNameShort}`}
                </Tag>
                <br /> <Tag color="green">{nivelMax.value} m</Tag>
              </Col>
              <Col
                span={24}
                style={{
                  borderBottom: "2px dashed black",
                  marginTop: "5px",
                  marginBottom: "5px",
                }}
              ></Col>
              <Col span={10}>
                <Tag color="volcano" icon={<FallOutlined />}>
                  {window.innerWidth > 900 ? "Min" : ""}
                </Tag>
              </Col>
              <Col span={14}>
                <Tag color="volcano">
                  {nivelMin.date}{" "}
                  {option === 1 ? "hrs" : `de ${monthNameShort}`}
                </Tag>{" "}
                <br /> <Tag color="volcano">{nivelMin.value} m</Tag>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={11} xl={4} lg={4}>
          <Card style={styles.cardStats.ind1} size="small">
            <Row justify={"center"}>
              <Col>
                {window.innerWidth > 900 ? (
                  <Tag
                    color={styles.cardStats.ind1.tag.color}
                    style={{ fontSize: "16px" }}
                  >
                    Consumo total (m³)
                  </Tag>
                ) : (
                  <Text style={{ marginBottom: "10px" }}>
                    Consumo total (m³)
                  </Text>
                )}
              </Col>
            </Row>
            <Row align={"middle"}>
              <Col
                span={24}
                style={{ marginBottom: "34px", marginTop: "40px" }}
              >
                <Statistic
                  suffix={
                    <Row>
                      <Col style={{ fontSize: "16px" }}>m³</Col>
                    </Row>
                  }
                  valueStyle={styles.cardStats.ind1.value}
                  value={total.toLocaleString().replace(/,/g, ".")}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={11} xl={4} lg={4}>
          <Card style={styles.cardStats.ind3} size="small">
            <Row justify={"center"}>
              {window.innerWidth > 900 ? (
                <Tag
                  color={styles.cardStats.ind3.tag.color}
                  style={{ marginBottom: "10px", fontSize: "16px" }}
                >
                  Consumo (m³/{option === 1 ? "hora" : `día`})
                </Tag>
              ) : (
                <Text style={{ marginBottom: "10px" }}>
                  Consumo (m³/{option === 1 ? "hora" : `día`})
                </Text>
              )}
            </Row>
            <Row align="middle" justify={"space-evenly"}>
              <Col lg={10} xl={10} xs={6}>
                <Tag color="green" icon={<RiseOutlined />}>
                  {window.innerWidth > 900 ? "Max" : ""}
                </Tag>
              </Col>
              <Col lg={10} xl={10} xs={16}>
                <Tag color="green">
                  {maxHours.date}{" "}
                  {option === 1 ? "hrs" : `de ${monthNameShort}`}
                </Tag>
                <br />
                <Tag color="green"> {maxHours.value} m³/hora</Tag>
              </Col>
              <Col
                span={24}
                style={{
                  borderBottom: "2px dashed #262626",
                  marginTop: "5px",
                  marginBottom: "5px",
                }}
              ></Col>
              <Col lg={10} xl={10} xs={6}>
                <Tag color="volcano" icon={<FallOutlined />}>
                  {window.innerWidth > 900 ? "Min" : ""}
                </Tag>
              </Col>
              <Col lg={10} xl={10} xs={16}>
                <Tag color="volcano">
                  {minHours.date}{" "}
                  {option === 1 ? "hrs" : `de ${monthNameShort}`}
                </Tag>{" "}
                <br /> <Tag color="volcano">{minHours.value} m³/hora</Tag>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} xl={6} lg={6}>
          <Card style={styles.cardStats.ind2} size="small">
            <Row justify={"center"}>
              <Col>
                {window.innerWidth > 900 ? (
                  <Tag
                    color={styles.cardStats.ind2.tag.color}
                    style={{ fontSize: "16px" }}
                  >
                    Consumo promedio (m³/{option === 1 ? "hora" : `día`})
                  </Tag>
                ) : (
                  <Text style={{ marginBottom: "10px" }}>
                    Consumo promedio (m³/{option === 1 ? "hora" : `día`})
                  </Text>
                )}
              </Col>
            </Row>
            <Row align={"middle"}>
              <Col
                span={24}
                style={{ marginBottom: "34px", marginTop: "40px" }}
              >
                <Statistic
                  suffix={
                    <Row>
                      <Col style={{ fontSize: "16px" }}>m³</Col>
                    </Row>
                  }
                  valueStyle={styles.cardStats.ind2.value}
                  value={totalProm}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </>
  );
};

const styles = {
  cardStats: {
    ind1: {
      width: "100%",
      minHeight: "20vh",
      border: "2px #001d66 solid",
      borderRadius: "20px",
      marginBottom: window.innerWidth < 900 ? "10px" : "0px",
      value: {
        textAlign: "center",
      },
      btnDetail: {
        color: "#fff",
        marginTop: "10px",
      },
      background:
        "linear-gradient(90deg, rgba(244,244,244,1) 0%, rgba(232,229,229,1) 49%, rgba(255,255,255,1) 100%)",
      tag: {
        color: "#4096ff",
      },
    },
    ind2: {
      width: "100%",
      minHeight: "20vh",
      border: "2px #001d66 solid",
      borderRadius: "20px",
      marginBottom: window.innerWidth < 900 ? "10px" : "0px",
      value: {
        textAlign: "center",
      },
      btnDetail: {
        color: "#fff",
        marginTop: "10px",
      },
      background:
        "linear-gradient(90deg, rgba(244,244,244,1) 0%, rgba(232,229,229,1) 49%, rgba(255,255,255,1) 100%)",
      tag: {
        color: "#4096ff",
      },
    },
    ind3: {
      width: "100%",
      minHeight: "20vh",
      border: "2px #001d66 solid",
      borderRadius: "20px",
      marginBottom: window.innerWidth < 900 ? "10px" : "0px",
      value: {
        paddingLeft: "10px",
      },
      btnDetail: {
        color: "#fff",
        marginTop: "10px",
      },
      background:
        "linear-gradient(90deg, rgba(244,244,244,1) 0%, rgba(232,229,229,1) 49%, rgba(255,255,255,1) 100%)",
      tag: {
        color: "#4096ff",
      },
    },
    ind4: {
      width: "100%",
      minHeight: "20vh",
      border: "2px #001d66 solid",
      marginBottom: window.innerWidth < 900 ? "10px" : "0px",
      borderRadius: "20px",
      value: {
        paddingLeft: "10px",
      },
      btnDetail: {
        color: "#fff",
        marginTop: "10px",
      },
      background:
        "linear-gradient(90deg, rgba(244,244,244,1) 0%, rgba(232,229,229,1) 49%, rgba(255,255,255,1) 100%)",
      tag: {
        color: "#001d66",
      },
    },
    ind5: {
      width: "100%",
      minHeight: "20vh",
      border: "2px #001d66 solid",
      marginBottom: window.innerWidth < 900 ? "10px" : "0px",
      borderRadius: "20px",
      value: {
        paddingLeft: "10px",
      },
      btnDetail: {
        marginTop: "10px",
      },
      background:
        "linear-gradient(90deg, rgba(244,244,244,1) 0%, rgba(232,229,229,1) 49%, rgba(255,255,255,1) 100%)",
      tag: {
        color: "#597ef7",
      },
    },
  },
  divStat: {
    backgroundRepeat: "no-repeat",
    padding: "0px 10px 10px 10px",
    backgroundPosition: { op1: "center center" },
    borderRadius: "15px",
    width: "200px",
    col: {
      marginTop: "15px",
      marginLeft: "-10px",
    },
    title: {
      fontSize: "16px",
      backgroundColor: "#002c8c",
      color: "#fff",
      marginTop: "0px",
      padding: "5px",
      borderRadius: "10px",
    },
    tag: { fontSize: "15px", padding: "3px" },
    buttons: {
      backgroundColor: "#002c8c",
      margin: "5px",
    },
  },
};

export default Stats;
