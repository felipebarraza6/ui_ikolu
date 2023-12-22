import React, { useState, useEffect, useContext } from "react";
import sh from "../../api/sh/endpoints";
import Stats24Hours from "./Stats24ours";
import StatsMonth from "./StatsMonth";
import { Tabs, Card } from "antd";
import { Line, Area, Column } from "@ant-design/plots";
import { AppContext } from "../../App";

const GraphicLine = ({ option, initialDate, endDate, id_profile }) => {
  const [dataFlow, setDataFlow] = useState([]);
  const [dataNivel, setDataNivel] = useState([]);
  const [dataAcumulado, setDataAcumulado] = useState([]);
  const [data, setData] = useState([]);
  const { state } = useContext(AppContext);

  useEffect(() => {
    if (option === 1) {
      asyncFetch();
    } else if (option === 2) {
      asyncFetch2();
    }
  }, [option, initialDate, state.selected_profile]);

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
          element.caudal = parseFloat(element.flow);
          element.acumulado = parseInt(element.total);
          element.nivel = parseFloat(element.nivel);
          element.acumulado_hora = parseInt(element.total_hora);
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
        text: "Hora",
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
                  tab={window.innerWidth > 900 ? "Caudal (lt/s)" : "lt/s"}
                  key="1"
                >
                  <Card style={{ marginTop: "-20px" }} hoverable>
                    <Line {...configCaudalDay} />
                  </Card>
                </Tabs.TabPane>

                <Tabs.TabPane
                  tab={window.innerWidth > 900 ? "Nivel Freático (m)" : "m"}
                  key="2"
                >
                  <Card style={{ marginTop: "-20px" }} hoverable>
                    <Column {...configNivelDay} />
                  </Card>
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={window.innerWidth > 900 ? "Acumulado (m³)" : "m³"}
                  key="3"
                >
                  <Card style={{ marginTop: "-20px" }} hoverable>
                    <Area {...configAcumuladoDay} />
                  </Card>
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={
                    window.innerWidth > 900 ? "Acumulado (m³/hora)" : "m³/hora"
                  }
                  key="4"
                >
                  <Card style={{ marginTop: "-20px" }} hoverable>
                    <Column {...configAcumuladoHoraDay} />
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
              tab={window.innerWidth > 900 ? "Caudal (lt/s)" : "lt/s"}
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
