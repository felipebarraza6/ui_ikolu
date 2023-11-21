import React, { useState, useEffect } from "react";
import { Row, Col, Statistic, Button, Tag, Typography } from "antd";
import wall from "../../assets/images/walldga.png";
import { InfoCircleFilled, EyeFilled } from "@ant-design/icons";

const { Title } = Typography;

const Stats24Hours = ({ data }) => {
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
    const maxHour = filteredData.reduce((prev, current) => {
      return prev.value > current.value ? prev : current;
    });
    setMaxHours(maxHour);
    return maxHour.date;
  };

  const getMinHour = () => {
    console.log(data);
    const filteredData = data.filter(
      (item) => item.type === "acumulado(m³/hora)"
    );
    const maxHour = filteredData.reduce((prev, current) => {
      return prev.value < current.value ? prev : current;
    });
    setMinHours(maxHour);
    return maxHour.date;
  };

  const flowMinMax = () => {
    // Recorrer el array data y filtrar por el tipo "caudal (m)"
    const filteredData = data.filter((item) => item.type === "caudal (lt/s)");

    // Encontrar el valor máximo y mínimo
    const max = filteredData.reduce((prev, current) =>
      prev.value > current.value ? prev : current
    );
    const min = filteredData.reduce((prev, current) =>
      prev.value < current.value ? prev : current
    );
    setFlowMax(max);
    setFlowMin(min);
  };

  const nivelMinMax = () => {
    // Recorrer el array data y filtrar por el tipo "caudal (m)"
    const filteredData = data.filter((item) => item.type === "nivel (m)");

    // Encontrar el valor máximo y mínimo
    const max = filteredData.reduce((prev, current) =>
      prev.value > current.value ? prev : current
    );
    const min = filteredData.reduce((prev, current) =>
      prev.value < current.value ? prev : current
    );
    setNivelMax(max);
    setNivelMin(min);
    // Imprimir la fecha y el valor máximo o mínimo
  };

  useEffect(() => {
    if (data.length > 0) {
      getTotal();
      getMaxHour();
      getMinHour();
      flowMinMax();
      nivelMinMax();
    }
  }, [data]);

  return (
    <>
      <Row justify={"space-evenly"} align={"top"} style={{ marginTop: "20px" }}>
        <Col>
          <div
            style={{
              background: `url(${wall})`,
              padding: "25px",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center center",
              borderRadius: "20px",
            }}
          >
            <Statistic
              suffix={<Tag color="#002c8c">m³/hora</Tag>}
              valueStyle={{
                color: "white",
              }}
              title={
                <Row>
                  <Col>
                    <Tag color="#002c8c">Consumo total (m³)</Tag>
                  </Col>
                </Row>
              }
              value={total.toLocaleString().replace(/,/g, ".")}
            />
          </div>
        </Col>
        <Col>
          <div
            style={{
              background: `url(${wall})`,
              padding: "25px",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center top",
              borderRadius: "20px",
            }}
          >
            <Statistic
              suffix={<Tag color="#262626">m³/hora</Tag>}
              valueStyle={{ color: "white" }}
              title={
                <Row>
                  <Col>
                    <Tag color="#262626">Promedio consumo (m³/hora)</Tag>
                  </Col>
                </Row>
              }
              value={totalProm}
            />
          </div>
        </Col>
        <Col>
          <div
            style={{
              background: `url(${wall})`,
              padding: "25px",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "bottom center",
              borderRadius: "20px",
              width: "150px",
            }}
          >
            <Row align="middle">
              <Col span={24} style={{ marginBottom: "10px" }}>
                <Tag color="#262626">Hora consumo (m³/hora)</Tag>
              </Col>
              <Col span={10}>
                <Tag color="green-inverse">Max</Tag>
              </Col>
              <Col span={14}>
                <Tag color="green-inverse">{maxHours.date}</Tag>
                <br />
                <Tag color="green-inverse"> {maxHours.value} m³/hora</Tag>
              </Col>
              <Col
                span={24}
                style={{
                  borderBottom: "2px dashed white",
                  marginTop: "5px",
                  marginBottom: "5px",
                }}
              ></Col>
              <Col span={10}>
                <Tag color="volcano-inverse">Min</Tag>
              </Col>
              <Col span={14}>
                <Tag color="volcano-inverse">{minHours.date}</Tag> <br />{" "}
                <Tag color="volcano-inverse">{minHours.value} m³/hora</Tag>
              </Col>
            </Row>
          </div>
        </Col>
        <Col>
          <div
            style={{
              background: `url(${wall})`,
              padding: "25px",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center right",
              borderRadius: "20px",
              width: "150px",
            }}
          >
            <Row align="middle">
              <Col span={24} style={{ marginBottom: "10px" }}>
                <Tag color="#5b8c00">Caudal (lt/s)</Tag>
              </Col>
              <Col span={10}>
                <Tag color="green-inverse">Max</Tag>
              </Col>
              <Col span={14}>
                <Tag color="green-inverse">{flowMax.date}</Tag>
                <br /> <Tag color="green-inverse">{flowMax.value} lt/s</Tag>
              </Col>
              <Col
                span={24}
                style={{
                  borderBottom: "2px dashed white",
                  marginTop: "5px",
                  marginBottom: "5px",
                }}
              ></Col>
              <Col span={10}>
                <Tag color="volcano-inverse">Min</Tag>
              </Col>
              <Col span={14}>
                <Tag color="volcano-inverse">{flowMin.date}</Tag> <br />{" "}
                <Tag color="volcano-inverse">{flowMin.value} lt/s</Tag>
              </Col>
            </Row>
          </div>
        </Col>
        <Col>
          <div
            style={{
              background: `url(${wall})`,
              padding: "25px",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "bottom right",
              borderRadius: "20px",
              width: "150px",
            }}
          >
            <Row align="middle">
              <Col span={24} style={{ marginBottom: "10px" }}>
                <Tag color="#cf1322">Nivel (m)</Tag>
              </Col>
              <Col span={10}>
                <Tag color="green-inverse">Max</Tag>
              </Col>
              <Col span={14}>
                <Tag color="green-inverse">{nivelMax.date}</Tag>
                <br /> <Tag color="green-inverse">{nivelMax.value} m</Tag>
              </Col>
              <Col
                span={24}
                style={{
                  borderBottom: "2px dashed white",
                  marginTop: "5px",
                  marginBottom: "5px",
                }}
              ></Col>
              <Col span={10}>
                <Tag color="volcano-inverse">Min</Tag>
              </Col>
              <Col span={14}>
                <Tag color="volcano-inverse">{nivelMin.date}</Tag> <br />{" "}
                <Tag color="volcano-inverse">{nivelMin.value} m</Tag>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </>
  );
};

const styles = {
  divStat: {
    background: `url(${wall})`,
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
