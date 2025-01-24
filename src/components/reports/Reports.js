import React, { useContext, useState, useEffect } from "react";
import moment from "moment";
import "moment/locale/es";
import {
  Row,
  Col,
  Typography,
  Table,
  Button,
  DatePicker,
  Tooltip,
  Alert,
  Card,
  notification,
  Tag,
  Form,
  Tabs,
} from "antd";
import { AppContext } from "../../App";
import dayjs from "dayjs";
import * as XLSX from "xlsx";

import {
  TableOutlined,
  FileExcelFilled,
  ClearOutlined,
  InfoCircleFilled,
  FallOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import sh from "../../api/sh/endpoints";
import QueueAnim from "rc-queue-anim";

const { Title } = Typography;

const Reports = () => {
  const { state } = useContext(AppContext);
  const position_sensor_nivel = parseFloat(state.selected_profile.d3);
  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]);
  const [loadingTab2, setLoadingTab2] = useState(false);
  const [loadingTab1, setLoadingTab1] = useState(false);
  const [initialDate, setInitialDate] = useState("");
  const [finishDate, setFinishDate] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const numberForMiles = new Intl.NumberFormat("de-DE");

  const [form] = Form.useForm();

  const processLevel = (level_response) => {
    if (level_response > 0.0 && level_response < position_sensor_nivel) {
      return parseFloat(position_sensor_nivel - level_response).toFixed(1);
    } else if (level_response > position_sensor_nivel || level_response < 0.0) {
      level_response = 50.0;
      return parseFloat(position_sensor_nivel - level_response).toFixed(1);
    } else {
      level_response = 0.0;
      return parseFloat(position_sensor_nivel - level_response).toFixed(1);
    }
  };

  const processFlow = (flow) => {
    const flowValue = parseFloat(flow).toFixed(1);
    if (flowValue > 0.5) {
      return flowValue;
    } else {
      return parseFloat(0.0).toFixed(1);
    }
  };

  const processAccumulated = (accumulated) => {
    const accumulatedValue = parseInt(accumulated);
    if (accumulatedValue > 0) {
      return accumulatedValue;
    } else {
      return 0;
    }
  };

  const downloadDataToExcel = async () => {
    // Convertir los datos en el formato deseado para el archivo Excel
    const filteredData = data.map((item) => ({
      Fecha: item.date_time_medition,
      Hora: item.date_time_medition_hour,
      "Acumulado (m³)": item.total,
      "Nivel (m)": item.nivel,
      "Caudal (l/s)": item.flow,
      "Acumulado (m³)/ hora": item.total_hora,
    }));

    const filteredData2 = data2.map((item) => ({
      Fecha: item.date_time_medition,
      "Acumulado (m³)/ día": item.total_hora,
    }));

    // Crear el archivo Excel y descargarlo
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const worksheet2 = XLSX.utils.json_to_sheet(filteredData2);

    // Set column widths based on the length of the title text
    const columnWidths = Object.keys(worksheet).reduce((widths, cell) => {
      const column = cell.replace(/[0-9]/g, "");
      const value = worksheet[cell].v;
      const length = value ? value.toString().length : 10; // Default width if value is empty
      widths[column] = Math.max(widths[column] || 0, length);
      return widths;
    }, {});

    const columnWidths2 = Object.keys(worksheet2).reduce((widths, cell) => {
      const column = cell.replace(/[0-9]/g, "");
      const value = worksheet2[cell].v;
      const length = value ? value.toString().length : 10; // Default width if value is empty
      widths[column] = Math.max(widths[column] || 0, length);
      return widths;
    }, {});

    // Apply column widths to the worksheets
    worksheet["!cols"] = Object.keys(columnWidths).map((column) => ({
      wch: columnWidths[column],
    }));
    worksheet2["!cols"] = Object.keys(columnWidths2).map((column) => ({
      wch: columnWidths2[column],
    }));

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Detalle");
    XLSX.utils.book_append_sheet(workbook, worksheet2, "Resumen diario");

    // Función para aplicar estilos a las celdas
    const applyStyles = (worksheet, range, style) => {
      const { s, e } = XLSX.utils.decode_range(range);
      for (let row = s.r; row <= e.r; row++) {
        for (let col = s.c; col <= e.c; col++) {
          const cell = XLSX.utils.encode_cell({ r: row, c: col });
          if (!worksheet[cell]) {
            worksheet[cell] = {};
          }
          worksheet[cell].s = style;
        }
      }
    };

    // Crear estilos para las celdas
    const borderStyle = {
      border: {
        top: { style: "thin", color: { rgb: "00000000" } },
        bottom: { style: "thin", color: { rgb: "00000000" } },
        left: { style: "thin", color: { rgb: "00000000" } },
        right: { style: "thin", color: { rgb: "00000000" } },
      },
    };

    const headerStyle = {
      fill: { fgColor: { rgb: "00000000" } },
      font: { color: { rgb: "FFFFFFFF" } },
    };

    // Aplicar estilos a las celdas con datos
    applyStyles(worksheet, "A1:Z1000", borderStyle);

    // Aplicar estilo a la primera fila
    applyStyles(worksheet, "A1:Z1", headerStyle);

    XLSX.writeFile(
      workbook,
      `${state.user.username}_${state.selected_profile.title}.xlsx`
    );
  };

  const getData = async () => {
    setLoadingTab1(true);
    setLoadingTab2(true);

    // Get the data for the requested page
    const rq = await sh.get_data_sh_range(
      state.selected_profile.id,
      initialDate,
      finishDate,
      page
    );

    const updatedResults = rq.results.map((item, index) => {
      const nextTotal = rq.results[index + 1] ? rq.results[index + 1].total : 0;
      const currentTotal = item.total;
      const total_hora = currentTotal - nextTotal;
      return {
        ...item,
        date_time_medition_hour: item.date_time_medition.slice(11, 16),
        level: processLevel(item.level),
        flow: processFlow(item.flow),
        total: processAccumulated(item.total),
        total_hora: index === rq.results.length - 1 ? 0 : total_hora,
        date_time_medition: item.date_time_medition.slice(0, 10),
      };
    });

    const sumTotal = updatedResults.reduce((acc, item) => {
      const currentDate = item.date_time_medition.slice(0, 10);
      const existingItem = acc.find((el) => el.date === currentDate);

      if (existingItem) {
        existingItem.total_hora += item.total_hora;
      } else {
        acc.push({
          ...item,
          total_hora: item.total_hora,
          date: currentDate,
        });
      }

      return acc;
    }, []);
    console.log(rq.count);

    setLoadingTab1(false);
    setLoadingTab2(false);
    setData(updatedResults);

    setData2(sumTotal);
    setTotal(rq.count);
  };
  console.log(page);
  useEffect(() => {
    getData(page);
  }, [state.selected_profile, page]);

  console.log(state);
  return (
    <QueueAnim type="top" delay={300} duration={1000}>
      <div key="1">
        <Row style={{ padding: "0px", marginTop: "-20px" }} justify={"center"}>
          <Col xl={24} lg={24} xs={24}>
            <Title
              level={4}
              style={{ textAlign: window.innerWidth < 900 && "center" }}
            >
              Datos y reportes
            </Title>
          </Col>
          {window.innerWidth > 900 ? (
            <>
              {" "}
              <Col
                span={18}
                style={{
                  marginTop: "0px",
                  marginBottom: "0px",
                  paddingRight: "30px",
                }}
              >
                <QueueAnim type="left" delay={500} duration={1000}>
                  <div key="2">
                    <Tabs type="line" size="small">
                      <Tabs.TabPane
                        tab="Datos"
                        key="1"
                        icon={<TableOutlined />}
                      >
                        <Table
                          bordered
                          size={"small"}
                          loading={loadingTab1}
                          pagination={{
                            total: total,
                            pageSize: 10,
                            onChange: (page) => {
                              setPage(page);
                            },
                          }}
                          columns={[
                            {
                              title: "Fecha",
                              dataIndex: "date_time_medition",
                            },
                            {
                              title: "Hora",
                              dataIndex: "date_time_medition_hour",
                            },
                            { title: "Caudal (L/s)", dataIndex: "flow" },
                            {
                              hidden: state.user.id === 43,
                              title: () => (
                                <Tooltip title="Nivel Freático (m)">
                                  Nivel...
                                </Tooltip>
                              ),
                              dataIndex: "nivel",
                            },
                            {
                              title: "Acumulado (m³)",
                              dataIndex: "total",
                              render: (a) => numberForMiles.format(a),
                            },
                            {
                              title: "Acumulado/hora (m³)",
                              dataIndex: "total_hora",
                              render: (a) => numberForMiles.format(a),
                            },
                          ]}
                          dataSource={data}
                        />
                      </Tabs.TabPane>
                      {total > 0 && (
                        <Tabs.TabPane
                          tab={
                            <>
                              Detalle:{" "}
                              {moment(finishDate) &&
                                moment(finishDate).diff(
                                  moment(initialDate),
                                  "days"
                                ) + 1}{" "}
                              día/s ({initialDate.slice(5, 12)} /{" "}
                              {finishDate.slice(5, 12)})
                            </>
                          }
                          key="2"
                        >
                          <Table
                            bordered
                            size={"small"}
                            loading={loadingTab2}
                            pagination={{ simple: true }}
                            columns={[
                              {
                                title: "Fecha",
                                dataIndex: "date_time_medition",
                              },
                              {
                                title: "Acumulado/día (m³)",
                                dataIndex: "total_hora",
                                render: (text, record) => {
                                  const max = data2.reduce((prev, current) =>
                                    prev.total_hora > current.total_hora
                                      ? prev
                                      : current
                                  );

                                  const min = data2.reduce((prev, current) =>
                                    prev.total_hora < current.total_hora
                                      ? prev
                                      : current
                                  );

                                  return record.total_hora ===
                                    max.total_hora ? (
                                    <Tag
                                      color="blue-inverse"
                                      icon={<RiseOutlined />}
                                      style={{ fontSize: "15px" }}
                                    >
                                      {text}
                                    </Tag>
                                  ) : record.total_hora === min.total_hora ? (
                                    <Tag
                                      color="volcano-inverse"
                                      icon={<FallOutlined />}
                                      style={{ fontSize: "15px" }}
                                    >
                                      {text}
                                    </Tag>
                                  ) : (
                                    text
                                  );
                                },
                              },
                            ]}
                            dataSource={data2}
                          />
                        </Tabs.TabPane>
                      )}
                    </Tabs>
                  </div>
                </QueueAnim>
              </Col>
              <Col span={6}>
                <QueueAnim type="scale" delay={500} duration={1000}>
                  <div key="3">
                    <Card
                      size="small"
                      style={{
                        marginTop: "0px",
                        paddingBottom: "20px",
                        border: "2px solid #1F3461",
                        background:
                          "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(161,181,199,0.4150035014005602) 100%)",
                      }}
                      hoverable
                    >
                      <Row justify={"center"} align={"top"}>
                        <Col span={24}>
                          <Title level={5} style={{ textAlign: "center" }}>
                            Selecciona un rango de tiempo a visualizar
                          </Title>
                          <Form form={form} layout="vertical">
                            <Col span={24}></Col>
                            <Col span={24} style={{ paddingTop: "20px" }}>
                              <Form.Item name="initialDate">
                                <DatePicker
                                  style={{ width: "100%" }}
                                  placeholder="Selecciona una fecha inicial"
                                  disabledDate={(current) =>
                                    current && current >= moment().endOf("day")
                                  }
                                  disabledTime={(current) =>
                                    current && current.isSame(moment(), "day")
                                  }
                                  onChange={(x) => {
                                    setInitialDate(
                                      dayjs(x).format("YYYY-MM-DD")
                                    );
                                  }}
                                  locale="es"
                                />
                              </Form.Item>
                            </Col>
                            <Col span={24} style={{ paddingTop: "-20px" }}>
                              <Form.Item name="finishDate">
                                <DatePicker
                                  style={{ width: "100%" }}
                                  placeholder="Selecciona una fecha final"
                                  disabled={initialDate ? false : true}
                                  disabledDate={(current) =>
                                    current && current >= moment().endOf("day")
                                  }
                                  disabledTime={(current) =>
                                    current && current.isSame(moment(), "day")
                                  }
                                  onChange={(x) => {
                                    if (
                                      initialDate &&
                                      dayjs(x).format("YYYY-MM-DD") <
                                        initialDate
                                    ) {
                                      notification.error({
                                        message:
                                          "La fecha final no puede ser menor a la fecha inicial",
                                      });
                                      setFinishDate("");
                                    } else {
                                      setFinishDate(
                                        dayjs(x).format("YYYY-MM-DD")
                                      );
                                    }
                                  }}
                                />
                              </Form.Item>
                            </Col>
                          </Form>
                        </Col>
                        <Col
                          span={24}
                          style={{ paddingTop: "0px", paddingLeft: "0px" }}
                        >
                          desde:{" "}
                          <b>{initialDate ? initialDate : "YYYY-MM-DD"} </b>
                          <br />
                          hasta:{" "}
                          <b>{finishDate ? finishDate : "YYYY-MM-DD"} </b>
                          {finishDate && (
                            <>
                              <br />
                              <br />
                              Visualización:{" "}
                              <b>
                                {moment(finishDate) &&
                                  moment(finishDate).diff(
                                    moment(initialDate),
                                    "days"
                                  ) + 1}{" "}
                                día/s
                              </b>
                            </>
                          )}
                          <br />
                          <br />
                          <Button
                            type="primary"
                            icon={<TableOutlined />}
                            disabled={!initialDate || !finishDate}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              backgroundColor:
                                !initialDate || !finishDate
                                  ? "#D9D9D9"
                                  : "#1F3461",
                              color:
                                !initialDate || !finishDate
                                  ? "#1F3461"
                                  : "white",
                              borderColor: "#1F3461",
                            }}
                            onClick={getData}
                          >
                            Previsualizar reporte
                          </Button>
                        </Col>
                        <Col
                          span={24}
                          style={{ paddingTop: "10px", paddingLeft: "0px" }}
                        >
                          <Button
                            icon={<ClearOutlined />}
                            type="primary"
                            disabled={!initialDate || !finishDate}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              backgroundColor:
                                !initialDate || !finishDate
                                  ? "#D9D9D9"
                                  : "#1F3461",
                              color:
                                !initialDate || !finishDate
                                  ? "#1F3461"
                                  : "white",
                              borderColor: "#1F3461",
                            }}
                            block={false}
                            onClick={() => {
                              setInitialDate("");
                              setFinishDate("");
                              form.resetFields();
                              setData([]);
                              setTotal(0);
                              setData2([]);
                            }}
                          >
                            Limpiar
                          </Button>
                        </Col>
                        <Col
                          span={24}
                          style={{ paddingTop: "10px", paddingLeft: "0px" }}
                        >
                          {state.user.id !== 43 && (
                            <Button
                              icon={<FileExcelFilled />}
                              type="primary"
                              disabled={!initialDate || !finishDate}
                              style={{
                                width: "100%",
                                textAlign: "left",
                                backgroundColor:
                                  !initialDate || !finishDate
                                    ? "#D9D9D9"
                                    : "#1F3461",
                                color:
                                  !initialDate || !finishDate
                                    ? "#1F3461"
                                    : "white",
                                borderColor: "#1F3461",
                              }}
                              block={false}
                              onClick={downloadDataToExcel}
                            >
                              Descargar reporte (.xlsx)
                            </Button>
                          )}
                        </Col>
                      </Row>
                    </Card>
                  </div>
                </QueueAnim>
              </Col>
            </>
          ) : (
            <>
              {" "}
              <Col xs={24} style={{ paddingLeft: "10px" }}>
                <Row justify={"center"} align={"top"}>
                  <Col span={24}>
                    <Title level={4} style={{ textAlign: "center" }}>
                      Selecciona un rango de tiempo a visualizar
                    </Title>
                    <Form form={form} layout="vertical">
                      <Col span={24} style={{ paddingTop: "20px" }}>
                        <Form.Item name="initialDate">
                          <DatePicker
                            style={{ width: "100%" }}
                            placeholder="Selecciona una fecha inicial"
                            disabledDate={(current) =>
                              current && current >= moment().endOf("day")
                            }
                            disabledTime={(current) =>
                              current && current.isSame(moment(), "day")
                            }
                            onSelect={(x) => {
                              setInitialDate(dayjs(x).format("YYYY-MM-DD"));
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={24} style={{ paddingTop: "-20px" }}>
                        <Form.Item name="finishDate">
                          <DatePicker
                            style={{ width: "100%" }}
                            placeholder="Selecciona una fecha final"
                            defaultValue={initialDate}
                            disabledDate={(current) =>
                              current && current >= moment().endOf("day")
                            }
                            disabledTime={(current) =>
                              current && current.isSame(moment(), "day")
                            }
                            onSelect={(x) => {
                              if (
                                initialDate &&
                                dayjs(x).format("YYYY-MM-DD") <= initialDate
                              ) {
                                notification.error({
                                  placement:
                                    window.innerWidth < 900 && "bottom",
                                  style: { zIndex: 1000000 },
                                  closeIcon: <></>,
                                  message:
                                    "La fecha final no puede ser menor o igual a la fecha inicial",
                                });
                                setFinishDate("");
                              } else {
                                setFinishDate(dayjs(x).format("YYYY-MM-DD"));
                              }
                            }}
                          />
                        </Form.Item>
                      </Col>
                    </Form>
                  </Col>
                  <Col
                    span={24}
                    style={{ paddingTop: "0px", paddingLeft: "0px" }}
                  >
                    desde: <b>{initialDate ? initialDate : "YYYY-MM-DD"} </b>
                    <br />
                    hasta: <b>{finishDate ? finishDate : "YYYY-MM-DD"} </b>
                    {finishDate && (
                      <>
                        <br />
                        <br />
                        Visualización:{" "}
                        <b>
                          {moment(finishDate) &&
                            moment(finishDate).diff(
                              moment(initialDate),
                              "days"
                            ) + 1}{" "}
                          día/s
                        </b>
                      </>
                    )}
                    <br />
                    <br />
                    <Button
                      type="primary"
                      icon={<TableOutlined />}
                      block={false}
                      disabled={!initialDate || !finishDate}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        backgroundColor:
                          !initialDate || !finishDate ? "#D9D9D9" : "#1F3461",
                        color:
                          !initialDate || !finishDate ? "#1F3461" : "white",
                        borderColor: "#1F3461",
                      }}
                      onClick={getData}
                    >
                      Previsualizar reporte
                    </Button>
                  </Col>
                  <Col
                    span={24}
                    style={{ paddingTop: "10px", paddingLeft: "0px" }}
                  >
                    <Button
                      icon={<ClearOutlined />}
                      type="primary"
                      disabled={!initialDate || !finishDate}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        backgroundColor:
                          !initialDate || !finishDate ? "#D9D9D9" : "#1F3461",
                        color:
                          !initialDate || !finishDate ? "#1F3461" : "white",
                        borderColor: "#1F3461",
                      }}
                      block={false}
                      onClick={() => {
                        setInitialDate("");
                        setFinishDate("");
                        form.resetFields();
                        setData([]);
                        setTotal(0);
                        setData2([]);
                      }}
                    >
                      Limpiar
                    </Button>
                  </Col>
                  <Col
                    span={24}
                    style={{ paddingTop: "10px", paddingLeft: "0px" }}
                  >
                    <Button
                      icon={<FileExcelFilled />}
                      type="primary"
                      disabled={!initialDate || !finishDate}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        backgroundColor:
                          !initialDate || !finishDate ? "#D9D9D9" : "#1F3461",
                        color:
                          !initialDate || !finishDate ? "#1F3461" : "white",
                        borderColor: "#1F3461",
                      }}
                      block={false}
                      onClick={downloadDataToExcel}
                    >
                      Descargar reporte (.xlsx)
                    </Button>
                  </Col>
                </Row>
              </Col>
              <Col
                span={24}
                style={{
                  marginTop: "10px",
                  marginBottom: "0px",
                  paddingRight: "10px",
                }}
              >
                <Tabs type="card">
                  <Tabs.TabPane tab="Datos" key="1" icon={<TableOutlined />}>
                    <Table
                      bordered
                      size={"small"}
                      loading={loadingTab1}
                      pagination={{
                        total: total,
                        pageSize: 10,
                        current: page,

                        onChange: (page) => {
                          console.log(page);
                          setPage(page);
                        },
                      }}
                      columns={[
                        {
                          title: "Fecha",
                          dataIndex: "date_time_medition",
                        },
                        {
                          title: "Hora",
                          dataIndex: "date_time_medition_hour",
                        },

                        { title: "(l/s)", dataIndex: "flow" },
                        { title: "m", dataIndex: "nivel" },
                        { title: "m³", dataIndex: "total" },
                        { title: "m³/hora", dataIndex: "total_hora" },
                      ]}
                      dataSource={data}
                    />
                  </Tabs.TabPane>
                  {total > 0 && (
                    <Tabs.TabPane
                      tab={
                        <>
                          Detalle:{" "}
                          {moment(finishDate) &&
                            moment(finishDate).diff(
                              moment(initialDate),
                              "days"
                            ) + 1}{" "}
                          día/s ({initialDate.slice(5, 12)} /{" "}
                          {finishDate.slice(5, 12)})
                        </>
                      }
                      key="2"
                    >
                      <Table
                        bordered
                        loading={loadingTab2}
                        size={"small"}
                        pagination={{ simple: true, pageSize: 10 }}
                        columns={[
                          {
                            title: "Fecha",
                            dataIndex: "date_time_medition",
                          },
                          {
                            title: "m³/día",
                            dataIndex: "total_hora",
                            render: (text, record) => {
                              const max = data2.reduce((prev, current) =>
                                prev.total_hora > current.total_hora
                                  ? prev
                                  : current
                              );
                              const min = data2.reduce((prev, current) =>
                                prev.total_hora < current.total_hora
                                  ? prev
                                  : current
                              );
                              return record.total_hora === max.total_hora ? (
                                <Tag
                                  color="blue-inverse"
                                  icon={<RiseOutlined />}
                                  style={{ fontSize: "15px" }}
                                >
                                  {text}
                                </Tag>
                              ) : record.total_hora === min.total_hora ? (
                                <Tag
                                  color="volcano-inverse"
                                  icon={<FallOutlined />}
                                  style={{ fontSize: "15px" }}
                                >
                                  {text}
                                </Tag>
                              ) : (
                                text
                              );
                            },
                          },
                        ]}
                        dataSource={data2}
                      />
                    </Tabs.TabPane>
                  )}
                </Tabs>
              </Col>
            </>
          )}
        </Row>
      </div>
    </QueueAnim>
  );
};

export default Reports;
