import React, { useState, useEffect, useContext } from "react";
import sh from "../../api/sh/endpoints";
import Stats from "./Stats";
import { Tabs, Card, Table, Typography, Statistic, Row, Col } from "antd";
import { Line, Area, Column } from "@ant-design/plots";
import { AppContext } from "../../App";
import dayjs from "dayjs";
import {
  BarChartOutlined,
  LineChartOutlined,
  AreaChartOutlined,
  TableOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const GraphicLine = ({ option, initialDate, endDate, id_profile }) => {
  const [data, setData] = useState([]);
  const [dataTable, setDataTable] = useState([]);
  const { state } = useContext(AppContext);

  const numberForMiles = new Intl.NumberFormat("de-DE");

  const position_sensor_nivel = parseFloat(state.selected_profile.d3);

  var parsedDate = dayjs(initialDate);

  const firstDayOfMonth = dayjs(
    `${parsedDate.year()}-${parsedDate.month() + 1}-01`
  );
  const lastDayOfMonth = firstDayOfMonth.endOf("month");

  const processNivel = (nivel_response) => {
    if (nivel_response > 0.0 && nivel_response < position_sensor_nivel) {
      return parseFloat(position_sensor_nivel - nivel_response);
    } else if (nivel_response > position_sensor_nivel || nivel_response < 0.0) {
      nivel_response = 50.0;
      return parseFloat(position_sensor_nivel - nivel_response);
    } else {
      nivel_response = 0.0;
      return parseFloat(position_sensor_nivel - nivel_response);
    }
  };

  const processCaudal = (caudal) => {
    const flow = parseFloat(caudal);
    if (flow > 0.0) {
      return flow;
    } else {
      return parseFloat(0.0);
    }
  };

  const processAcum = (acum) => {
    const acumulado = parseInt(acum);
    if (acumulado > 0) {
      return acumulado;
    } else {
      return 0;
    }
  };

  const asyncFetch = async () => {
    var date = new Date(initialDate);
    const rq1 = await sh
      .get_data_structural(
        id_profile,
        date.getFullYear(),
        date.getMonth() + 1,
        option === 1 ? date.getDate() : ""
      )
      .then((res) => {
        res.results.map((element) => {
          var date_time = element.date_time_medition.slice(11, 16);
          element.date_time_medition = date_time;
          element.caudal = processCaudal(element.flow);
          element.acumulado = processAcum(element.total);
          element.nivel = processNivel(element.nivel);
          element.acumulado_hora = processAcum(element.total_hora);
          return element;
        });

        setData(res.results.reverse());
      });
  };

  const asyncFetch2 = async () => {
    var date = new Date(initialDate);
    const rq1 = await sh
      .get_data_structural_month(
        id_profile,
        date.getFullYear(),
        date.getMonth() + 1
      )
      .then((res) => {
        res.results.map((element) => {
          var date_time = element.date_time_medition.slice(8, 10);
          element.date_time_medition = date_time;
          element.caudal = processCaudal(element.flow);
          element.acumulado = processAcum(element.total);
          element.nivel = processNivel(element.nivel);
          element.acumulado_hora = processAcum(element.total_hora);
          return element;
        });

        setData(res.results.reverse());
      });
  };

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

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

  const monthName = monthNames[parsedDate.month()];
  const monthNameShort = monthNamesMobile[parsedDate.month()];

  const parsedTitle = (d) => {
    if (option === 1) {
      return `${d} hrs.`;
    } else {
      if (window.innerWidth > 900) {
        return `${d} de ${monthName}`;
      } else {
        return `${d} de ${monthNameShort}`;
      }
    }
  };

  const parsedText = () => {
    if (option === 1) {
      if (window.innerWidth > 900) {
        return `Hora (00:00 - 23:00 / ${parsedDate.date()} de ${monthName} del ${parsedDate.year()}) `;
      } else {
        return `Hora (00:00 - 23:00 ${parsedDate.format(
          "DD"
        )}/${parsedDate.format("MM")}/${parsedDate.format("YY")}) `;
      }
    } else {
      if (window.innerWidth > 900) {
        return `Días (01 al ${lastDayOfMonth.format(
          "DD"
        )} de ${monthName} del ${parsedDate.year()})`;
      } else {
        return `Días (01 al ${lastDayOfMonth.format(
          "DD"
        )} de ${monthNameShort} del ${parsedDate.year()})`;
      }
    }
  };

  const configCaudal = {
    data: data,
    xField: "date_time_medition",
    tooltip: {
      title: parsedTitle,
      formatter: (datum) => {
        return {
          name: "Caudal",
          value: parseFloat(datum.caudal).toFixed(1) + " (L/s)",
        };
      },
    },
    xAxis: {
      title: {
        text: parsedText(),
        style: {
          fontSize: window.innerWidth > 900 ? 16 : 13,
          fontWeight: "bold",
        },
      },
    },
    yField: "caudal",
    yAxis: {
      title: {
        text: "Caudal (L/s)",
        style: {
          fontSize: window.innerWidth > 900 ? 20 : 15,
          fontWeight: "bold",
        },
      },
      reverse: true,
      min: 0,
      max: Math.max(
        ...data.map((item) => parseFloat(item.caudal + 0.5).toFixed(1))
      ),
      label: {
        formatter: (text) => parseFloat(text).toFixed(1), // Redondear a un decimal
      },
    },
    point: {
      size: 4,
      shape: "point",
      style: {
        fill: "white",
        stroke: "#001d66",
        lineWidth: 4,
      },
    },
    smooth: true,
    color: "#1677ff",
  };

  const configNivel = {
    data: data,
    xField: "date_time_medition",
    tooltip: {
      title: parsedTitle,
      formatter: (datum) => {
        return {
          name: "Nivel Freático",
          value: parseFloat(datum.nivel).toFixed(1) + " (m)",
        };
      },
    },
    xAxis: {
      title: {
        text: parsedText(),
        style: {
          fontSize: window.innerWidth > 900 ? 16 : 13,
          fontWeight: "bold",
        },
      },
    },
    yField: "nivel",
    yAxis: {
      title: {
        text: "Nivel Freático (m)",
        style: {
          fontSize: window.innerWidth > 900 ? 20 : 15,
          fontWeight: "bold",
        },
      },
      reverse: true,
      min: 0,
      max: Math.max(
        ...data.map((item) => parseFloat(item.nivel + 0.5).toFixed(1))
      ),
      label: {
        formatter: (text) => parseFloat(text).toFixed(1), // Redondear a un decimal
      },
    },

    point: {
      size: 4,
      shape: "point",
      style: {
        fill: "white",
        stroke: "#597ef7",
        lineWidth: 4,
      },
    },
    smooth: true,
    color: "#69b1ff",
  };
  const configAcumulado = {
    data: data,
    xField: "date_time_medition",
    tooltip: {
      title: parsedTitle,
      formatter: (datum) => {
        return {
          name: "Acumulado",
          value: numberForMiles.format(datum.acumulado) + " (m³)",
        };
      },
    },
    xAxis: {
      title: {
        text: parsedText(),
        style: {
          fontSize: window.innerWidth > 900 ? 16 : 13,
          fontWeight: "bold",
        },
      },
    },
    yField: "acumulado",
    yAxis: {
      title: {
        text: "Acumulado (m³)",
        style: {
          fontSize: window.innerWidth > 900 ? 20 : 15,
          fontWeight: "bold",
        },
      },
      reverse: true,
      min: Math.min(
        ...data.map((item) => {
          const acumulado = processAcum(item.acumulado);
          return acumulado > 0.0
            ? processAcum(acumulado - 1)
            : processAcum(acumulado);
        })
      ),
      max: Math.max(...data.map((item) => parseInt(item.acumulado + 1))),
      label: {
        formatter: (text) => numberForMiles.format(text), // Redondear a un decimal
      },
    },
    point: {
      size: 4,
      shape: "point",
      style: {
        fill: "white",
        stroke: "#91caff",
        lineWidth: 4,
      },
    },
    smooth: true,
    color: "#91caff",
  };

  const configAcumuladoHora = {
    data: data,
    xField: "date_time_medition",
    tooltip: {
      title: parsedTitle,

      formatter: (datum) => {
        return {
          name: "Acumulado",
          value: `${numberForMiles.format(datum.acumulado_hora)} ${
            option === 1 ? " (m³/hora)" : " (m³/día)"
          }`,
        };
      },
    },
    xAxis: {
      title: {
        text: parsedText(),
        style: {
          fontSize: window.innerWidth > 900 ? 16 : 13,
          fontWeight: "bold",
        },
      },
    },
    yField: "acumulado_hora",
    yAxis: {
      title: {
        text: option === 1 ? "Acumulado (m³/hora)" : "Acumulado (m³/día)",
        style: {
          fontSize: window.innerWidth > 900 ? 20 : 15,
          fontWeight: "bold",
        },
      },
      reverse: true,
      min: 0,
      tickInterval: 5,
      max: Math.max(...data.map((item) => parseInt(item.acumulado_hora + 1))),
      label: {
        formatter: (text) => numberForMiles.format(text), // Redondear a un decimal
      },
    },
    point: {
      size: 4,
      shape: "point",
      style: {
        fill: "white",
        stroke: "#91caff",
        lineWidth: 4,
      },
    },
    smooth: true,
    color: "#91caff",
  };

  useEffect(() => {
    if (data.length > 0) {
      const totalRow = {
        date_time_medition: "TOTAL",
        total_hora: data.reduce(
          (acc, current) => acc + current.acumulado_hora,
          0
        ),
        total: data[data.length - 1].total, // Agregar el campo "total" con el último valor de "data"
      };

      setDataTable([totalRow, ...data]); // Agregar totalRow como el primer elemento
    }
    if (option === 1) {
      setData([]);
      asyncFetch();
    } else if (option === 2) {
      setData([]);
      asyncFetch2();
    }
  }, [option, initialDate, state.selected_profile]);

  return (
    <>
      {data && (
        <>
          <Tabs type="card">
            <Tabs.TabPane
              tab={
                window.innerWidth > 900 ? (
                  <>
                    <LineChartOutlined /> Caudal (L/s)
                  </>
                ) : (
                  "l/s"
                )
              }
              key="1"
            >
              <Card style={{ marginTop: "-20px" }} hoverable>
                <Line {...configCaudal} />
              </Card>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={
                window.innerWidth > 900 ? (
                  <>
                    <BarChartOutlined /> Nivel Freático (m)
                  </>
                ) : (
                  "m"
                )
              }
              key="2"
            >
              <Card style={{ marginTop: "-20px" }} hoverable>
                <Column {...configNivel} />
              </Card>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={
                window.innerWidth > 900 ? (
                  <>
                    <AreaChartOutlined /> Acumulado (m³)
                  </>
                ) : (
                  "m³"
                )
              }
              key="3"
            >
              <Card style={{ marginTop: "-20px" }} hoverable>
                <Area {...configAcumulado} />
              </Card>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={
                window.innerWidth > 900 ? (
                  option === 1 ? (
                    <>
                      <AreaChartOutlined /> Acumulado (m³/hora)
                    </>
                  ) : (
                    <>
                      <AreaChartOutlined /> Acumulado (m³/día)
                    </>
                  )
                ) : option === 1 ? (
                  "m³/hora"
                ) : (
                  "m³/día"
                )
              }
              key="4"
            >
              <Card style={{ marginTop: "-20px" }} hoverable>
                <Area {...configAcumuladoHora} />
              </Card>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={
                window.innerWidth > 900 ? (
                  <>
                    <TableOutlined /> Datos
                  </>
                ) : (
                  "datos"
                )
              }
              key="5"
            >
              <Card style={{ marginTop: "-20px" }} hoverable size="small">
                <Row
                  justify={"space-evenly"}
                  align={window.innerWidth > 900 ? "middle" : "top"}
                  style={{ marginBottom: "10px" }}
                >
                  <Col xl={6} lg={6} xs={12}>
                    <Card
                      size="small"
                      style={{ backgroundColor: "rgb(31, 52, 97)" }}
                    >
                      <Statistic
                        parseFloat
                        style={{ minHeight: window.innerWidth < 900 && "90px" }}
                        title={
                          <span style={{ color: "white" }}>
                            Promedio Caudal
                          </span>
                        }
                        suffix="L/s"
                        valueStyle={{ color: "white" }}
                        value={
                          data.length > 0
                            ? processCaudal(
                                parseFloat(
                                  data.reduce(
                                    (total, item) => total + item.caudal,
                                    0
                                  ) / data.length
                                ).toFixed(1)
                              )
                            : 0
                        }
                      ></Statistic>
                    </Card>
                  </Col>
                  <Col xl={6} lg={6} xs={12}>
                    <Card
                      size="small"
                      bordered
                      style={{ backgroundColor: "rgb(31, 52, 97)" }}
                    >
                      <Statistic
                        title={
                          <span style={{ color: "white" }}>
                            Promedio Nivel Freático
                          </span>
                        }
                        precision={1}
                        style={{ minHeight: window.innerWidth < 900 && "90px" }}
                        valueStyle={{ color: "white" }}
                        suffix={"m"}
                        value={
                          data.length > 0
                            ? processNivel(
                                parseFloat(
                                  data.reduce(
                                    (total, item) => total + item.nivel,
                                    0
                                  ) / data.length
                                ).toFixed(1)
                              )
                            : 0
                        }
                      ></Statistic>
                    </Card>
                  </Col>
                  <Col xl={6} lg={6} xs={12}>
                    <Card
                      size="small"
                      style={{ backgroundColor: "rgb(31, 52, 97)" }}
                    >
                      <Statistic
                        suffix="m³"
                        style={{ minHeight: window.innerWidth < 900 && "90px" }}
                        title={
                          <span style={{ color: "white" }}>
                            Último registro acumulado
                          </span>
                        }
                        valueStyle={{ color: "white" }}
                        value={numberForMiles.format(
                          data.length > 0 && data[data.length - 1].total
                        )}
                      ></Statistic>
                    </Card>
                  </Col>
                  <Col xl={6} lg={6} xs={12}>
                    <Card
                      size="small"
                      style={{ backgroundColor: "rgb(31, 52, 97)" }}
                    >
                      <Statistic
                        style={{ minHeight: window.innerWidth < 900 && "90px" }}
                        title={
                          <span style={{ color: "white" }}>
                            Total consumido
                          </span>
                        }
                        suffix="m³"
                        valueStyle={{ color: "white" }}
                        value={numberForMiles.format(
                          data.reduce(
                            (acc, current) => acc + current.acumulado_hora,
                            0
                          )
                        )}
                      ></Statistic>
                    </Card>
                  </Col>
                </Row>

                <Table
                  dataSource={data}
                  style={{ width: "100%" }}
                  pagination={{ simple: true, pageSize: 7 }}
                  title={() => parsedText()}
                  size="small"
                  bordered
                  columns={[
                    {
                      title:
                        window.innerWidth > 900
                          ? option === 1
                            ? "Hora"
                            : monthName
                          : option === 1
                          ? "hh"
                          : monthNameShort,
                      dataIndex: "date_time_medition",
                    },
                    {
                      title: window.innerWidth > 900 ? "Caudal (L/s)" : "l/s",
                      dataIndex: "caudal",
                      render: (caudal) =>
                        parseFloat(processCaudal(caudal)).toFixed(1),
                    },
                    {
                      title:
                        window.innerWidth > 900 ? "Nivel Freático (m)" : "m",
                      dataIndex: "nivel",
                      render: (nivel) =>
                        parseFloat(processNivel(nivel)).toFixed(1),
                    },
                    {
                      title: window.innerWidth > 900 ? "Acumulado (m³)" : "m³",
                      dataIndex: "total",
                      render: (acum) => numberForMiles.format(acum),
                    },
                    {
                      title:
                        window.innerWidth > 900
                          ? "Acumulado (m³/hora)"
                          : "m³/h",
                      dataIndex: "total_hora",
                      render: (acum) => (
                        <>
                          {acum === undefined ? 0 : numberForMiles.format(acum)}
                        </>
                      ),
                    },
                  ]}
                />
              </Card>
            </Tabs.TabPane>
          </Tabs>
          {state.selected_profile.module_5 && (
            <Stats option={option} data={data} parsedDate={parsedDate} />
          )}
        </>
      )}
    </>
  );
};

export default GraphicLine;
