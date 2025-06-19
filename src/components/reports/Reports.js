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
  notification,
  Tag,
  Form,
  Tabs, // Added Tabs for the 'main' branch logic, but will be removed if 'ikolu_sma' is chosen
  Tooltip, // Added missing Tooltip import
  ConfigProvider,
} from "antd";
import { AppContext } from "../../App";
import dayjs from "dayjs";
import locale from "antd/locale/es_ES";
import "dayjs/locale/es";

import {
  TableOutlined,
  FileExcelFilled,
  ClearOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import sh from "../../api/sh/endpoints";
import QueueAnim from "rc-queue-anim";
import {
  formatVolume,
  formatFlow,
  formatLevel,
} from "../../utils/numberFormatter";

const { Title } = Typography;

const Reports = () => {
  const { state } = useContext(AppContext);
  const status_module = state.selected_profile.profile_ikolu.m3;
  // console.log(status_module); // Removed console.log
  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]); // This state is not used in the ikolu_sma branch
  const [loadingTab1, setLoadingTab1] = useState(false);
  const [initialDate, setInitialDate] = useState("");
  const [finishDate, setFinishDate] = useState("");

  const [loadingExcel, setLoadingExcel] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  // Removido: const numberForMiles = new Intl.NumberFormat("de-DE");
  // Ahora usamos las funciones globales de formateo

  const [form] = Form.useForm();

  // The following functions (processLevel, processFlow, processAccumulated)
  // are part of a merge conflict and are commented out to prioritize
  // the 'ikolu_sma' branch's data fetching logic.
  // If these processing steps are needed, they should be carefully
  // re-integrated and tested.

  // const processLevel = (level_response) => {
  //   if (level_response > 0.0 && level_response < position_sensor_nivel) {
  //     return parseFloat(position_sensor_nivel - level_response).toFixed(1);
  //   } else if (level_response > position_sensor_nivel || level_response < 0.0) {
  //     level_response = 50.0;
  //     return parseFloat(position_sensor_nivel - level_response).toFixed(1);
  //   } else {
  //     level_response = 0.0;
  //     return parseFloat(position_sensor_nivel - level_response).toFixed(1);
  //   }
  // };

  // const processFlow = (flow) => {
  //   const flowValue = parseFloat(flow).toFixed(1);
  //   if (flowValue > 0.5) {
  //     return flowValue;
  //   } else if (flowValue < 0.0) {
  //     return 0.0;
  //   } else {
  //     return parseFloat(0.0).toFixed(1);
  //   }
  // };

  // const processAccumulated = (accumulated, last_total) => {
  //   console.log(last_total);
  //   const accumulatedValue = parseInt(accumulated);
  //   if (accumulatedValue > 0) {
  //     return accumulatedValue;
  //   } else {
  //     return last_total;
  //   }
  // };

  const downloadDataToExcel = async () => {
    setLoadingExcel(true);
    try {
      await sh.get_data_sh_range_to_excel(
        state.selected_profile.id,
        initialDate,
        finishDate,
        state.selected_profile.title
      );
    } catch (error) {
      notification.error({
        message: "Error al descargar el archivo",
        description: "Hubo un problema al intentar descargar el reporte Excel.",
      });
      console.error("Error downloading excel:", error);
    } finally {
      setLoadingExcel(false);
    }
  };

  const getData = async () => {
    setLoadingTab1(true);
    try {
      // Get the data for the requested page
      const rq = await sh.get_data_sh_range(
        state.selected_profile.id,
        initialDate,
        finishDate,
        page
      );
      setData(rq.results);
      setTotal(rq.count);

      // The following data processing logic was present in the 'main' branch
      // but is excluded here to resolve the merge conflict and adhere to 'ikolu_sma'.
      // If this processing is required, it should be re-implemented and tested.
      // const updatedResults = rq.results.map((item, index) => {
      //   const nextTotal = rq.results[index + 1] ? rq.results[index + 1].total : 0;
      //   const previusTotal = rq.results[index - 1]
      //     ? rq.results[index - 1].total
      //     : 0;
      //   var currentTotal = item.total;
      //   if (currentTotal < 0) {
      //     currentTotal = previusTotal;
      //   } else {
      //     currentTotal = item.total;
      //   }

      //   var total_hora = currentTotal - nextTotal;

      //   if (total_hora > item.total) {
      //     total_hora = 0;
      //   }

      //   return {
      //     ...item,
      //     date_time_medition_hour: item.date_time_medition.slice(11, 16),
      //     level: processLevel(item.level),
      //     flow: processFlow(item.flow),
      //     total: processAccumulated(item.total, previusTotal),
      //     total_hora: index === rq.results.length - 1 ? 0 : total_hora,
      //     date_time_medition: item.date_time_medition.slice(0, 10),
      //   };
      // });

      // const sumTotal = updatedResults.reduce((acc, item) => {
      //   const currentDate = item.date_time_medition.slice(0, 10);
      //   const existingItem = acc.find((el) => el.date === currentDate);

      //   if (existingItem) {
      //     existingItem.total_hora += item.total_hora;
      //   } else {
      //     acc.push({
      //       ...item,
      //       total_hora: item.total_hora,
      //       date: currentDate,
      //     });
      //   }

      //   return acc;
      // }, []);
    } catch (error) {
      notification.error({
        message: "Error al cargar datos",
        description:
          "Hubo un problema al intentar obtener los datos del reporte.",
      });
      console.error("Error fetching data:", error);
    } finally {
      setLoadingTab1(false);
    }
  };

  useEffect(() => {
    // Cargar datos automáticamente cuando se seleccionen ambas fechas
    if (initialDate && finishDate) {
      getData();
    }
  }, [state.selected_profile, page, initialDate, finishDate]); // Added initialDate and finishDate to dependencies

  const disabledDownload = () => {
    if (!initialDate || !finishDate) {
      return true;
    } else {
      // Assuming status_module indicates whether the feature is enabled for the profile
      return !status_module;
    }
  };
  // console.log(state); // Removed console.log

  return (
    <QueueAnim type="alpha" delay={300} duration={1500}>
      <div key="1">
        <Row
          style={{ marginTop: "0px", padding: "0px", minHeight: "90vh" }}
          justify={"center"}
          align={"top"}
        >
          {window.innerWidth > 900 ? (
            <>
              <Col
                span={24}
                style={{
                  marginTop: "0px",
                  marginBottom: "0px",
                }}
              >
                <QueueAnim type="left" delay={500} duration={1000}>
                  <div key="2">
                    <Table
                      title={() => (
                        <Row
                          justify={"space-around"}
                          align={"top"}
                          style={{ marginTop: "25px", marginBottom: "20px" }}
                        >
                          <Form form={form} layout="inline">
                            <Form.Item name="initialDate">
                              <ConfigProvider locale={locale}>
                                <DatePicker
                                  style={{ width: "100%" }}
                                  placeholder="Desde"
                                  value={
                                    initialDate ? dayjs(initialDate) : null
                                  }
                                  disabledDate={(current) =>
                                    current && current >= dayjs().endOf("day")
                                  }
                                  onChange={(date) => {
                                    if (date) {
                                      setInitialDate(date.format("YYYY-MM-DD"));
                                    } else {
                                      form.resetFields([
                                        "initialDate",
                                        "finishDate",
                                      ]);
                                      setInitialDate("");
                                      setFinishDate("");
                                      setData([]);
                                    }
                                  }}
                                  format="DD/MM/YYYY"
                                />
                              </ConfigProvider>
                            </Form.Item>
                            <Form.Item name="finishDate">
                              <ConfigProvider locale={locale}>
                                <DatePicker
                                  style={{ width: "100%" }}
                                  placeholder="Hasta"
                                  value={finishDate ? dayjs(finishDate) : null}
                                  disabled={!initialDate}
                                  disabledDate={(current) =>
                                    current &&
                                    (current >= dayjs().endOf("day") ||
                                      current <
                                        dayjs(initialDate).startOf("day"))
                                  }
                                  onChange={(date) => {
                                    if (date) {
                                      if (
                                        initialDate &&
                                        date.format("YYYY-MM-DD") < initialDate
                                      ) {
                                        notification.error({
                                          message:
                                            "La fecha final no puede ser menor a la fecha inicial",
                                        });
                                        setFinishDate("");
                                        form.setFieldsValue({
                                          finishDate: null,
                                        });
                                      } else {
                                        setFinishDate(
                                          date.format("YYYY-MM-DD")
                                        );
                                        // Los datos se cargarán automáticamente por el useEffect
                                      }
                                    } else {
                                      setFinishDate("");
                                      setData([]);
                                    }
                                  }}
                                  format="DD/MM/YYYY"
                                />
                              </ConfigProvider>
                            </Form.Item>
                          </Form>

                          <Button
                            icon={<ClearOutlined />}
                            type="primary"
                            disabled={
                              !initialDate && !finishDate && data.length === 0
                            } // Disable if nothing to clear
                            style={{
                              textAlign: "left",
                              backgroundColor:
                                !initialDate && !finishDate && data.length === 0
                                  ? "#D9D9D9"
                                  : "#1F3461",
                              color:
                                !initialDate && !finishDate && data.length === 0
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
                              // setData2([]); // data2 is not used in this branch
                            }}
                          >
                            Limpiar
                          </Button>

                          <Button
                            icon={<FileExcelFilled />}
                            type="primary"
                            loading={loadingExcel}
                            disabled={disabledDownload()}
                            style={{
                              textAlign: "left",
                              backgroundColor: disabledDownload()
                                ? "#D9D9D9"
                                : "#1F3461",
                              color: disabledDownload() ? "#1F3461" : "white",
                              borderColor: "#1F3461",
                            }}
                            onClick={downloadDataToExcel}
                          >
                            Descargar reporte (.xlsx)
                          </Button>
                          <Col
                            style={{ paddingTop: "10px", paddingLeft: "0px" }}
                          ></Col>
                        </Row>
                      )}
                      footer={() =>
                        total > 0 && (
                          <Tag color={"rgb(31, 52, 97)"}>{total} registros</Tag>
                        )
                      }
                      size={"small"}
                      loading={loadingTab1}
                      pagination={{
                        total: total,
                        showSizeChanger: false,
                        disabled: !status_module || !initialDate || !finishDate, // Disable if no dates or module not active
                        pageSize: 10,
                        onChange: (page) => {
                          setPage(page);
                        },
                      }}
                      columns={[
                        {
                          title: "Fecha",
                          dataIndex: "date_time_medition",
                          render: (date) => {
                            return moment(date).format("YYYY-MM-DD HH:mm");
                          },
                        },
                        { title: "Caudal (L/s)", dataIndex: "flow" },
                        {
                          title: "Acumulado (m³)",
                          dataIndex: "total",
                          render: (a) => formatVolume(a),
                        },
                        {
                          title: "Acumulado/hora (m³)",
                          dataIndex: "total_diff",
                          render: (a) => formatVolume(a),
                        },
                        {
                          title: "Contador diario (m³)",
                          dataIndex: "total_today_diff",
                          render: (a) => formatVolume(a),
                        },
                        {
                          title: () => "Nivel Freático (m)",
                          dataIndex: "water_table",
                        },
                      ]}
                      dataSource={data}
                    />
                  </div>
                </QueueAnim>
              </Col>
            </>
          ) : (
            // Mobile View
            <>
              <Col xs={24} style={{ paddingLeft: "10px" }}>
                <Row justify={"center"} align={"top"}>
                  <Col>
                    <Title level={4} style={{ textAlign: "center" }}>
                      Selecciona un rango de tiempo a visualizar
                    </Title>
                    <Form form={form} layout="vertical">
                      <Col style={{ paddingTop: "20px" }}>
                        <Form.Item name="initialDate">
                          <ConfigProvider locale={locale}>
                            <DatePicker
                              style={{ width: "100%" }}
                              placeholder="Selecciona una fecha inicial"
                              value={initialDate ? dayjs(initialDate) : null}
                              disabledDate={(current) =>
                                current && current >= dayjs().endOf("day")
                              }
                              onChange={(date) => {
                                if (date) {
                                  setInitialDate(date.format("YYYY-MM-DD"));
                                }
                              }}
                              format="DD/MM/YYYY"
                            />
                          </ConfigProvider>
                        </Form.Item>
                      </Col>
                      <Col style={{ paddingTop: "-20px" }}>
                        <Form.Item name="finishDate">
                          <ConfigProvider locale={locale}>
                            <DatePicker
                              style={{ width: "100%" }}
                              placeholder="Selecciona una fecha final"
                              value={finishDate ? dayjs(finishDate) : null}
                              disabled={!initialDate}
                              disabledDate={(current) =>
                                current &&
                                (current >= dayjs().endOf("day") ||
                                  current < dayjs(initialDate).startOf("day"))
                              }
                              onChange={(date) => {
                                if (date) {
                                  if (
                                    initialDate &&
                                    date.format("YYYY-MM-DD") <= initialDate
                                  ) {
                                    notification.error({
                                      placement:
                                        window.innerWidth < 900
                                          ? "bottom"
                                          : "topRight",
                                      style: { zIndex: 1000000 },
                                      closeIcon: <></>,
                                      message:
                                        "La fecha final no puede ser menor o igual a la fecha inicial",
                                    });
                                    setFinishDate("");
                                    form.setFieldsValue({ finishDate: null });
                                  } else {
                                    setFinishDate(date.format("YYYY-MM-DD"));
                                    // Los datos se cargarán automáticamente por el useEffect
                                  }
                                }
                              }}
                              format="DD/MM/YYYY"
                            />
                          </ConfigProvider>
                        </Form.Item>
                      </Col>
                    </Form>
                  </Col>
                  <Col style={{ paddingTop: "0px", paddingLeft: "0px" }}>
                    desde: <b>{initialDate || "YYYY-MM-DD"} </b>
                    hasta: <b>{finishDate || "YYYY-MM-DD"} </b>
                    {finishDate && (
                      <>
                        Visualización:{" "}
                        <b>
                          {moment(finishDate).diff(
                            moment(initialDate),
                            "days"
                          ) + 1}{" "}
                          día/s
                        </b>
                      </>
                    )}
                  </Col>
                  <Col
                    span={24}
                    style={{ paddingTop: "10px", paddingLeft: "0px" }}
                  >
                    <Button
                      icon={<ClearOutlined />}
                      type="primary"
                      disabled={
                        !initialDate && !finishDate && data.length === 0
                      }
                      style={{
                        width: "100%",
                        textAlign: "left",
                        backgroundColor:
                          !initialDate && !finishDate && data.length === 0
                            ? "#D9D9D9"
                            : "#1F3461",
                        color:
                          !initialDate && !finishDate && data.length === 0
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
                        // setData2([]); // data2 is not used in this branch
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
                {/* Tabla con scroll horizontal solo en móvil */}
                <Table
                  title={() => "Datos del Reporte"}
                  bordered
                  size={"small"}
                  loading={loadingTab1}
                  scroll={{ x: 800 }} // Scroll horizontal solo para móvil
                  pagination={{
                    total: total,
                    pageSize: 10,
                    showSizeChanger: false,
                    current: page,
                    disabled: !status_module || !initialDate || !finishDate,
                    onChange: (page) => {
                      setPage(page);
                    },
                  }}
                  columns={[
                    {
                      title: "Fecha",
                      dataIndex: "date_time_medition",
                      width: 120,
                      render: (date) => {
                        // Assuming date_time_medition still contains full timestamp, if not,
                        // this render will need adjustment based on the actual data format from API
                        return moment(date).format("DD/MM HH:mm");
                      },
                    },
                    {
                      title: "Caudal (L/s)",
                      dataIndex: "flow",
                      width: 100,
                      render: (a) => parseFloat(a).toFixed(2), // Ensure consistent formatting
                    },
                    {
                      title: "Acumulado (m³)",
                      dataIndex: "total",
                      width: 120,
                      render: (a) => formatVolume(a),
                    },
                    {
                      title: "Acum./hora (m³)",
                      dataIndex: "total_diff",
                      width: 120,
                      render: (a) => formatVolume(a),
                    },
                    {
                      title: "Cont. diario (m³)",
                      dataIndex: "total_today_diff",
                      width: 130,
                      render: (a) => formatVolume(a),
                    },
                    {
                      title: "Nivel Freático (m)",
                      dataIndex: "water_table",
                      width: 130,
                      render: (a) => parseFloat(a).toFixed(2), // Ensure consistent formatting
                    },
                  ]}
                  dataSource={data}
                />
              </Col>
            </>
          )}
        </Row>
      </div>
    </QueueAnim>
  );
};

export default Reports;
