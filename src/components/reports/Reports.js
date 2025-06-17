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
} from "antd";
import { AppContext } from "../../App";
import dayjs from "dayjs";

import {
  TableOutlined,
  FileExcelFilled,
  ClearOutlined,
} from "@ant-design/icons";
import sh from "../../api/sh/endpoints";
import QueueAnim from "rc-queue-anim";

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
  const numberForMiles = new Intl.NumberFormat("de-DE");

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
        description: "Hubo un problema al intentar obtener los datos del reporte.",
      });
      console.error("Error fetching data:", error);
    } finally {
      setLoadingTab1(false);
    }
  };

  useEffect(() => {
    // Only fetch data if initialDate and finishDate are set,
    // or if the component just mounted for an initial load if no dates are pre-selected.
    // If no dates are selected, the table will be empty until selected.
    if (initialDate && finishDate) {
      getData();
    } else if (state.selected_profile) {
      // Potentially fetch some default data on profile change if no dates are set
      // For now, it will wait for date selection.
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
    <QueueAnim type="scaleBig" delay={300} duration={1500}>
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
                              <DatePicker
                                style={{ width: "100%" }}
                                placeholder="Desde"
                                disabledDate={(current) =>
                                  current && current >= moment().endOf("day")
                                }
                                onChange={(x) => {
                                  if (x) {
                                    setInitialDate(dayjs(x).format("YYYY-MM-DD"));
                                  } else {
                                    form.resetFields(["initialDate", "finishDate"]); // Reset specific fields
                                    setInitialDate("");
                                    setFinishDate("");
                                    setData([]);
                                  }
                                }}
                                locale="es"
                              />
                            </Form.Item>
                            <Form.Item name="finishDate">
                              <DatePicker
                                style={{ width: "100%" }}
                                placeholder="Hasta"
                                disabled={!initialDate} // Disable if initialDate is not set
                                disabledDate={(current) =>
                                  current && (current >= moment().endOf("day") || current < moment(initialDate).startOf('day')) // Disable dates before initial date
                                }
                                onChange={(x) => {
                                  if (x) {
                                    if (initialDate && dayjs(x).format("YYYY-MM-DD") < initialDate) {
                                      notification.error({
                                        message:
                                          "La fecha final no puede ser menor a la fecha inicial",
                                      });
                                      setFinishDate("");
                                      form.setFieldsValue({ finishDate: null }); // Clear the DatePicker value
                                    } else {
                                      setFinishDate(dayjs(x).format("YYYY-MM-DD"));
                                    }
                                  } else {
                                    setFinishDate("");
                                    setData([]);
                                  }
                                }}
                              />
                            </Form.Item>
                          </Form>
                          <Button
                            type="primary"
                            icon={<TableOutlined />}
                            disabled={!initialDate || !finishDate}
                            style={{
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

                          <Button
                            icon={<ClearOutlined />}
                            type="primary"
                            disabled={!initialDate && !finishDate && data.length === 0} // Disable if nothing to clear
                            style={{
                              textAlign: "left",
                              backgroundColor:
                                (!initialDate && !finishDate && data.length === 0)
                                  ? "#D9D9D9"
                                  : "#1F3461",
                              color:
                                (!initialDate && !finishDate && data.length === 0)
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
                              backgroundColor:
                                disabledDownload() ? "#D9D9D9" : "#1F3461",
                              color:
                                disabledDownload() ? "#1F3461" : "white",
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
                          render: (a) => numberForMiles.format(a),
                        },
                        {
                          title: "Acumulado/hora (m³)",
                          dataIndex: "total_diff",
                          render: (a) => numberForMiles.format(a),
                        },
                        {
                          title: "Contador diario (m³)",
                          dataIndex: "total_today_diff",
                          render: (a) => numberForMiles.format(a),
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
                          <DatePicker
                            style={{ width: "100%" }}
                            placeholder="Selecciona una fecha inicial"
                            disabledDate={(current) =>
                              current && current >= moment().endOf("day")
                            }
                            onSelect={(x) => {
                              setInitialDate(dayjs(x).format("YYYY-MM-DD"));
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col style={{ paddingTop: "-20px" }}>
                        <Form.Item name="finishDate">
                          <DatePicker
                            style={{ width: "100%" }}
                            placeholder="Selecciona una fecha final"
                            disabled={!initialDate}
                            disabledDate={(current) =>
                              current && (current >= moment().endOf("day") || current < moment(initialDate).startOf('day'))
                            }
                            onSelect={(x) => {
                              if (
                                initialDate &&
                                dayjs(x).format("YYYY-MM-DD") <= initialDate
                              ) {
                                notification.error({
                                  placement:
                                    window.innerWidth < 900 ? "bottom" : "topRight", // Defaulting to topRight for larger screens
                                  style: { zIndex: 1000000 },
                                  closeIcon: <></>,
                                  message:
                                    "La fecha final no puede ser menor o igual a la fecha inicial",
                                });
                                setFinishDate("");
                                form.setFieldsValue({ finishDate: null });
                              } else {
                                setFinishDate(dayjs(x).format("YYYY-MM-DD"));
                              }
                            }}
                          />
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
                          {moment(finishDate).diff(moment(initialDate), "days") + 1}{" "}
                          día/s
                        </b>
                      </>
                    )}
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
                      disabled={!initialDate && !finishDate && data.length === 0}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        backgroundColor:
                          (!initialDate && !finishDate && data.length === 0) ? "#D9D9D9" : "#1F3461",
                        color:
                          (!initialDate && !finishDate && data.length === 0) ? "#1F3461" : "white",
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
                {/* Tabs are removed here as they were part of the 'main' branch conflict and not present in the 'ikolu_sma' table structure */}
                <Table
                  title={() => "Datos del Reporte"} {/* More meaningful title */}
                  bordered
                  size={"small"}
                  loading={loadingTab1}
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
                      render: (date) => {
                        // Assuming date_time_medition still contains full timestamp, if not,
                        // this render will need adjustment based on the actual data format from API
                        return moment(date).format("YYYY-MM-DD HH:mm");
                      },
                    },
                    {
                      title: "Caudal (L/s)",
                      dataIndex: "flow",
                      render: (a) => parseFloat(a).toFixed(2), // Ensure consistent formatting
                    },
                    {
                      title: "Acumulado (m³)",
                      dataIndex: "total",
                      render: (a) => numberForMiles.format(a),
                    },
                    {
                      title: "Acumulado/hora (m³)",
                      dataIndex: "total_diff",
                      render: (a) => numberForMiles.format(a),
                    },
                    {
                      title: "Contador diario (m³)",
                      dataIndex: "total_today_diff",
                      render: (a) => numberForMiles.format(a),
                    },
                    {
                      title: "Nivel Freático (m)",
                      dataIndex: "water_table",
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