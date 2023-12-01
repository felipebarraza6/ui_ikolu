import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Statistic,
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

const { Title } = Typography;

const Stats24Hours = ({ data }) => {
  console.log(data);
  const [total, setTotal] = useState(0);
  const [totalProm, setTotalProm] = useState(0);
  const [maxHours, setMaxHours] = useState(0);
  const [minHours, setMinHours] = useState(0);
  const [flowMax, setFlowMax] = useState(0);
  const [flowMin, setFlowMin] = useState(0);
  const [nivelMax, setNivelMax] = useState(0);
  const [nivelMin, setNivelMin] = useState(0);

  const getTotal = () => {
    var count = 0;
    const sum = data.reduce((accumulator, currentValue) => {
      if (currentValue.type === "acumulado(m³/hora)") {
        count++;
        return accumulator + currentValue.value;
      }
      return accumulator;
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
    const filteredData = data.filter(
      (item) => item.type === "acumulado(m³/hora)"
    );
    if (filteredData.length > 0) {
      const maxHour = filteredData.reduce((prev, current) => {
        return prev.value > current.value ? prev : current;
      });
      setMaxHours(maxHour);
      return maxHour.date;
    }
    return null;
  };

  const getMinHour = () => {
    const filteredData = data.filter(
      (item) => item.type === "acumulado(m³/hora)"
    );
    if (filteredData.length > 0) {
      const minHour = filteredData.reduce((prev, current) => {
        return prev.value < current.value ? prev : current;
      });
      setMinHours(minHour);
      return minHour.date;
    }
    return null;
  };

  const flowMinMax = () => {
    const filteredData = data.filter((item) => item.type === "caudal (lt/s)");
    if (filteredData.length > 0) {
      const max = filteredData.reduce((prev, current) =>
        prev.value > current.value ? prev : current
      );
      const min = filteredData.reduce((prev, current) =>
        prev.value < current.value ? prev : current
      );
      setFlowMax(max);
      setFlowMin(min);
    }
  };

  const nivelMinMax = () => {
    const filteredData = data.filter(
      (item) => item.type === "nivel freático(m)"
    );
    if (filteredData.length > 0) {
      const max = filteredData.reduce((prev, current) =>
        prev.value > current.value ? prev : current
      );
      const min = filteredData.reduce((prev, current) =>
        prev.value < current.value ? prev : current
      );
      setNivelMax(max);
      setNivelMin(min);
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

  const ModalTotal = () => {
    var totals = [];
    data.reduce((accumulator, currentValue) => {
      if (currentValue.type === "acumulado(m³/hora)") {
        totals.push({ ...currentValue, sum: currentValue.value });
        return accumulator;
      }
      return accumulator;
    }, 0);

    console.log(totals);
    Modal.info({
      icon: <TableOutlined />,
      title: "Detalle Consumo total (m³)",
      width: "700px",
      okText: "Volver",
      content: (
        <>
          <Table
            style={{ marginTop: "10px", textAlign: "center" }}
            dataSource={totals}
            size="small"
            bordered
            columns={[
              { title: "Hora", dataIndex: "date" },
              {
                title: "acumulado (m³/hora)",
                dataIndex: "value",
                align: "center",
                render: (value) => `${value} m³`,
              },
              {
                dataIndex: "sum",
              },
            ]}
          />
        </>
      ),
    });
  };

  return (
    <>
      <Row justify={"space-evenly"} align={"top"} style={{ marginTop: "20px" }}>
        <Col>
          <Card style={styles.cardStats.ind1} size="small">
            <Row justify={"center"}>
              <Col>
                <Tag
                  color={styles.cardStats.ind1.tag.color}
                  style={{ fontSize: "16px" }}
                >
                  Consumo total (m³)
                </Tag>
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
              <Col span={24}>
                <Button
                  onClick={ModalTotal}
                  size="small"
                  style={styles.cardStats.ind1.btnDetail}
                  type="primary"
                  block
                  icon={<TableOutlined />}
                >
                  Ver Detalle
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col>
          <Card style={styles.cardStats.ind2} size="small">
            <Row justify={"center"}>
              <Col>
                <Tag
                  color={styles.cardStats.ind2.tag.color}
                  style={{ fontSize: "16px" }}
                >
                  Consumo promedio (m³/hora)
                </Tag>
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
              <Col span={24}>
                <Button
                  size="small"
                  style={styles.cardStats.ind2.btnDetail}
                  type="primary"
                  block
                  icon={<TableOutlined />}
                >
                  Ver Detalle
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col>
          <Card style={styles.cardStats.ind3} size="small">
            <Row justify={"center"}>
              <Tag
                color={styles.cardStats.ind3.tag.color}
                style={{ marginBottom: "10px", fontSize: "16px" }}
              >
                Consumo (m³/hora)
              </Tag>
            </Row>
            <Row align="middle">
              <Col span={10}>
                <Tag color="green" icon={<RiseOutlined />}>
                  Max
                </Tag>
              </Col>
              <Col span={14}>
                <Tag color="green">{maxHours.date}</Tag>
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
              <Col span={10}>
                <Tag color="volcano" icon={<FallOutlined />}>
                  Min
                </Tag>
              </Col>
              <Col span={14}>
                <Tag color="volcano">{minHours.date}</Tag> <br />{" "}
                <Tag color="volcano">{minHours.value} m³/hora</Tag>
              </Col>
            </Row>
            <Button
              size="small"
              style={styles.cardStats.ind3.btnDetail}
              block
              type="primary"
              icon={<TableOutlined />}
            >
              Ver Detalle
            </Button>
          </Card>
        </Col>
        <Col>
          <Card style={styles.cardStats.ind4} size="small">
            <Row justify={"center"}>
              <Tag
                color={styles.cardStats.ind4.tag.color}
                style={{ marginBottom: "10px", fontSize: "16px" }}
              >
                Caudal (lt/s)
              </Tag>
            </Row>
            <Row align="middle">
              <Col span={10}>
                <Tag color="green" icon={<RiseOutlined />}>
                  Max
                </Tag>
              </Col>
              <Col span={14}>
                <Tag color="green">{flowMax.date}</Tag>
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
                  Min
                </Tag>
              </Col>
              <Col span={14}>
                <Tag color="volcano">{flowMin.date}</Tag> <br />{" "}
                <Tag color="volcano">{flowMin.value} lt/s</Tag>
              </Col>
            </Row>
            <Button
              size="small"
              style={styles.cardStats.ind4.btnDetail}
              block
              type="primary"
              icon={<TableOutlined />}
            >
              Ver Detalle
            </Button>
          </Card>
        </Col>
        <Col>
          <Card style={styles.cardStats.ind5} size="small">
            <Row justify={"center"}>
              <Tag
                color={styles.cardStats.ind5.tag.color}
                style={{ marginBottom: "10px", fontSize: "17px" }}
              >
                Nivel freático (m)
              </Tag>
            </Row>
            <Row align="middle">
              <Col span={10}>
                <Tag color="green" icon={<RiseOutlined />}>
                  Max
                </Tag>
              </Col>
              <Col span={14}>
                <Tag color="green">{nivelMax.date}</Tag>
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
                  Min
                </Tag>
              </Col>
              <Col span={14}>
                <Tag color="volcano">{nivelMin.date}</Tag> <br />{" "}
                <Tag color="volcano">{nivelMin.value} m</Tag>
              </Col>
            </Row>
            <Button
              size="small"
              style={styles.cardStats.ind5.btnDetail}
              type="primary"
              block
              icon={<TableOutlined />}
            >
              Ver Detalle
            </Button>
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
      minHeight: "24vh",
      border: "2px #002c8c solid",
      borderRadius: "20px",
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
        color: "#002c8c",
      },
    },
    ind2: {
      width: "100%",
      minHeight: "24vh",
      border: "2px #262626 solid",
      borderRadius: "20px",
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
        color: "#262626",
      },
    },
    ind3: {
      width: "180px",
      border: "2px #262626 solid",
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
        color: "#262626",
      },
    },
    ind4: {
      width: "180px",
      border: "2px #5b8c00 solid",
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
        color: "#5b8c00",
      },
    },
    ind5: {
      width: "180px",
      border: "2px #cf1322 solid",
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
        color: "#cf1322",
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

export default Stats24Hours;
