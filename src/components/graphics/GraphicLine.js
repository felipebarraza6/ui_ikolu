import React, { useState, useEffect, useContext } from "react";
import sh from "../../api/sh/endpoints";
import Stats24Hours from "./Stats24ours";
import StatsMonth from "./StatsMonth";
import { Tabs, Card, Row, Col, Table } from "antd";
import { Line, Area, Column } from "@ant-design/plots";
import { AppContext } from "../../App";
import {
  BarChartOutlined,
  LineChartOutlined,
  LineOutlined,
  TableOutlined,
} from "@ant-design/icons";
import LineChart from "@ant-design/plots/es/components/line";

const GraphicLine = ({ option, initialDate, endDate, id_profile }) => {
  const [dataFlow, setDataFlow] = useState([]);
  const [dataNivel, setDataNivel] = useState([]);
  const [dataAcumulado, setDataAcumulado] = useState([]);
  const [data, setData] = useState([]);
  const { state } = useContext(AppContext);

  const position_sensor_nivel = parseFloat(state.selected_profile.d3);

  useEffect(() => {
    if (option === 1) {
      asyncFetch();
    } else if (option === 2) {
      asyncFetch2();
    }
  }, [option, initialDate, state.selected_profile]);

  const processNivel = (nivel_response) => {
    if (nivel_response > 0.0 && nivel_response < position_sensor_nivel) {
      return parseFloat(position_sensor_nivel - nivel_response).toFixed(1);
    } else if (nivel_response > position_sensor_nivel || nivel_response < 0.0) {
      nivel_response = 50.0;
      return parseFloat(position_sensor_nivel - nivel_response).toFixed(1);
    } else {
      nivel_response = 0.0;
      return parseFloat(position_sensor_nivel - nivel_response).toFixed(1);
    }
  };

  const processCaudal = (caudal) => {
    const flow = parseFloat(caudal).toFixed(1);
    console.log(flow);
    if (flow > 0.0) {
      return flow;
    } else {
      return parseFloat(0.0).toFixed(1);
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
        console.log(res.results);

        setData(res.results.reverse());
      });
  };
  const asyncFetch2 = async () => {
    var date = new Date(initialDate);
    const rq1 = await sh
      .get_data_structural_month(
        id_profile,
        date.getFullYear(),
        date.getMonth()
      )
      .then((res) => {
        res.results.map((element) => {
          var date_time = element.date_time_medition.slice(8, 10);
          element.date_time_medition = date_time;
          element.caudal = parseFloat(element.flow);
          element.acumulado = parseInt(element.total);
          element.nivel = parseFloat(element.nivel);
          element.acumulado_hora = parseInt(element.total_hora);
          return element;
        });

        setData(res.results.reverse());
      });
  };

  const configCaudalDay = {
    data: data,
    xField: "date_time_medition",
    autoFit: true,
    tooltip: {
      title: (d) => `${d} hrs.`,
    },
    xAxis: {
      title: {
        text: "Hora (00:00 - 23:00)",
        style: {
          fontSize: 14,
        },
      },
      tickInterval: 1,
    },
    yField: ["caudal"],
    yAxis: {
      title: {
        text: "Caudal (lt/s)",
        style: {
          fontSize: 14,
        },
      },
      tickInterval: 1,
      min: Math.min(...data.map((item) => item.caudal)),

      label: {
        formatter: (v) =>
          `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s}.`),
      },
    },
    point: {
      shapeField: "square",
      sizeField: 13,
    },
    interaction: {
      tooltip: {
        marker: false,
      },
    },
    style: {
      lineWidth: 4,
    },
  };

  const configNivelDay = {
    data: data,
    xField: "date_time_medition",
    autoFit: true,
    tooltip: {
      title: (d) => `${d} hrs.`,
    },
    xAxis: {
      title: {
        text: "Hora",
        style: {
          fontSize: 14,
        },
      },
      tickInterval: 1,
    },
    yField: ["nivel"],
    yAxis: {
      title: {
        text: "Nivel (m)",
        style: {
          fontSize: 14,
        },
      },
      tickInterval: 1,
      min: Math.min(...data.map((item) => item.nivel)),

      label: {
        formatter: (v) =>
          `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s}.`),
      },
    },
    point: {
      shapeField: "square",
      sizeField: 13,
    },

    style: {
      lineWidth: 4,
      color: "black",
    },
  };
  const configAcumuladoDay = {
    data: data,
    tooltip: {
      title: (d) => `${d} hrs.`,
    },
    xField: "date_time_medition",
    xAxis: {
      title: {
        text: "Hora",
        style: {
          fontSize: 14,
        },
      },
      tickInterval: 1,
    },
    yField: ["acumulado"],
    yAxis: {
      title: {
        text: "Acumulado (m³)",
        style: {
          fontSize: 14,
        },
      },
      tickInterval: Math.pow(
        10,
        Math.floor(Math.log10((item) => item.acumulado)) - 1
      ),
      min: Math.min(...data.map((item) => item.acumulado)),
    },

    style: {
      lineWidth: 4,
      color: "black",
    },
  };

  const configAcumuladoHoraDay = {
    data: data,
    tooltip: {
      title: (d) => `${d} hrs.`,
    },
    xField: "date_time_medition",
    xAxis: {
      title: {
        text: "Hora",
        style: {
          fontSize: 14,
        },
      },
      tickInterval: 1,
    },
    yField: ["acumulado_hora"],
    yAxis: {
      title: {
        text: "Acumulado (m³/hora)",
        style: {
          fontSize: 14,
        },
      },
      tickInterval: Math.pow(
        10,
        Math.floor(Math.log10((item) => item.acumulado - 10)) - 1
      ),
      min: Math.min(...data.map((item) => item.acumulado)),
    },
    point: {
      shapeField: "square",
      sizeField: 13,
    },

    style: {
      lineWidth: 4,
      color: "black",
    },
  };

  const configCaudalMonth = {
    data: data,
    xField: "date_time_medition",
    autoFit: true,
    tooltip: {
      title: (d) => `Día: ${d} `,
    },
    xAxis: {
      title: {
        text: "Día",
        style: {
          fontSize: 14,
        },
      },
      tickInterval: 1,
    },
    yField: ["caudal"],
    yAxis: {
      title: {
        text: "Caudal (lt/s)",
        style: {
          fontSize: 14,
        },
      },
      tickInterval: 1,
      min: Math.min(...data.map((item) => item.caudal)),

      label: {
        formatter: (v) =>
          `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s}.`),
      },
    },
    point: {
      shapeField: "square",
      sizeField: 13,
    },
    interaction: {
      tooltip: {
        marker: false,
      },
    },
    style: {
      lineWidth: 4,
    },
  };

  const configNivelMonth = {
    data: data,
    xField: "date_time_medition",
    autoFit: true,
    tooltip: {
      title: (d) => `Día: ${d} `,
    },
    xAxis: {
      title: {
        text: "Día",
        style: {
          fontSize: 14,
        },
      },
      tickInterval: 1,
    },
    yField: ["nivel"],
    yAxis: {
      title: {
        text: "Nivel (m)",
        style: {
          fontSize: 14,
        },
      },
      tickInterval: 1,
      min: Math.min(...data.map((item) => item.caudal)),

      label: {
        formatter: (v) =>
          `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s}.`),
      },
    },
    point: {
      shapeField: "square",
      sizeField: 13,
    },

    style: {
      lineWidth: 4,
      color: "black",
    },
  };

  const configAcumuladoMonth = {
    data: data,
    tooltip: {
      title: (d) => `Día: ${d} `,
    },
    xField: "date_time_medition",
    xAxis: {
      title: {
        text: "Día",
        style: {
          fontSize: 14,
        },
      },
      tickInterval: 1,
    },
    yField: ["acumulado"],
    yAxis: {
      title: {
        text: "Acumulado (m³)",
        style: {
          fontSize: 14,
        },
      },
      tickInterval: Math.pow(
        10,
        Math.floor(Math.log10((item) => item.acumulado - 10)) - 1
      ),
      min: Math.min(...data.map((item) => item.acumulado)),
    },

    style: {
      lineWidth: 4,
      color: "black",
    },
  };

  const configAcumuladoHoraMonth = {
    data: data,
    tooltip: {
      title: (d) => `Día: ${d} `,
    },
    xField: "date_time_medition",
    xAxis: {
      title: {
        text: "Día",
        style: {
          fontSize: 14,
        },
      },
      tickInterval: 1,
    },
    yField: ["acumulado_hora"],
    yAxis: {
      title: {
        text: "Acumulado (m³/hora)",
        style: {
          fontSize: 14,
        },
      },
      tickInterval: Math.pow(
        10,
        Math.floor(Math.log10((item) => item.acumulado - 10)) - 1
      ),
      min: Math.min(...data.map((item) => item.acumulado)),
    },
    point: {
      shapeField: "square",
      sizeField: 13,
    },

    style: {
      lineWidth: 4,
      color: "black",
    },
  };

  return (
    <>
      {option === 1 ? (
        <>
          {data && (
            <>
              <Tabs type="card">
                <Tabs.TabPane
                  tab={
                    window.innerWidth > 900 ? (
                      <>
                        <LineChartOutlined /> Caudal (lt/s)
                      </>
                    ) : (
                      "lt/s"
                    )
                  }
                  key="1"
                >
                  <Card style={{ marginTop: "-20px" }} hoverable>
                    <Line {...configCaudalDay} />
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
                    <Column {...configNivelDay} />
                  </Card>
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={
                    window.innerWidth > 900 ? (
                      <>
                        <LineChartOutlined /> Acumulado (m³)
                      </>
                    ) : (
                      "m³"
                    )
                  }
                  key="3"
                >
                  <Card style={{ marginTop: "-20px" }} hoverable>
                    <Area {...configAcumuladoDay} />
                  </Card>
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={
                    window.innerWidth > 900 ? (
                      <>
                        <BarChartOutlined /> Acumulado (m³/hora)
                      </>
                    ) : (
                      "m³/hora"
                    )
                  }
                  key="4"
                >
                  <Card style={{ marginTop: "-20px" }} hoverable>
                    <Column {...configAcumuladoHoraDay} />
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
                    <Table
                      dataSource={data}
                      style={{ width: "100%" }}
                      pagination={{ simple: true }}
                      size="small"
                      bordered
                      columns={[
                        {
                          title: window.innerWidth > 900 ? "Hora" : "hh",
                          dataIndex: "date_time_medition",
                        },
                        {
                          title:
                            window.innerWidth > 900 ? "Caudal (lt/s)" : "lt/s",
                          dataIndex: "caudal",
                        },
                        {
                          title:
                            window.innerWidth > 900
                              ? "Nivel Freático (m)"
                              : "m",
                          dataIndex: "nivel",
                        },
                        {
                          title:
                            window.innerWidth > 900 ? "Acumulado (m³)" : "m³",
                          dataIndex: "total",
                        },
                        {
                          title:
                            window.innerWidth > 900
                              ? "Acumulado (m³/hora)"
                              : "m³/h",
                          dataIndex: "total_hora",
                          render: (acum) => (
                            <>{acum === undefined ? 0 : acum}</>
                          ),
                        },
                      ]}
                    />
                  </Card>
                </Tabs.TabPane>
              </Tabs>
            </>
          )}
        </>
      ) : (
        <>
          <Tabs type="card">
            <Tabs.TabPane
              tab={
                window.innerWidth > 900 ? (
                  <>
                    <LineOutlined /> Caudal (lt/s)
                  </>
                ) : (
                  "lt/s"
                )
              }
              key="1"
            >
              <Card style={{ marginTop: "-20px" }} hoverable>
                <Line {...configCaudalMonth} />
              </Card>
            </Tabs.TabPane>

            <Tabs.TabPane
              tab={window.innerWidth > 900 ? "Nivel Freático (m)" : "m"}
              key="2"
            >
              <Card style={{ marginTop: "-20px" }} hoverable>
                <Column {...configNivelMonth} />
              </Card>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={window.innerWidth > 900 ? "Acumulado (m³)" : "m³"}
              key="3"
            >
              <Card style={{ marginTop: "-20px" }} hoverable>
                <Area {...configAcumuladoMonth} />
              </Card>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={window.innerWidth > 900 ? "Acumulado (m³/hora)" : "m³/hora"}
              key="4"
            >
              <Card style={{ marginTop: "-20px" }} hoverable>
                <Column {...configAcumuladoHoraMonth} />
              </Card>
            </Tabs.TabPane>
          </Tabs>
          <StatsMonth />
        </>
      )}
    </>
  );
};

export default GraphicLine;
