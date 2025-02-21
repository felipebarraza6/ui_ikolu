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
  const status_module = state.selected_profile.profile_ikolu.m3;
  console.log(status_module);
  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]);
  const [loadingTab1, setLoadingTab1] = useState(false);
  const [initialDate, setInitialDate] = useState("");
  const [finishDate, setFinishDate] = useState("");

  const [loadingExcel, setLoadingExcel] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const numberForMiles = new Intl.NumberFormat("de-DE");

  const [form] = Form.useForm();

  const downloadDataToExcel = async () => {
    setLoadingExcel(true);
    const rq = await sh
      .get_data_sh_range_to_excel(
        state.selected_profile.id,
        initialDate,
        finishDate,
        state.selected_profile.title
      )
      .then((res) => {
        setLoadingExcel(false);
      });
    console.log(rq);
  };

  const getData = async () => {
    setLoadingTab1(true);

    // Get the data for the requested page
    const rq = await sh.get_data_sh_range(
      state.selected_profile.id,
      initialDate,
      finishDate,
      page
    );

    setLoadingTab1(false);
    setData(rq.results);
    setTotal(rq.count);
  };

  useEffect(() => {
    getData(page);
  }, [state.selected_profile, page]);

  const disabledDownload = () => {
    if (!initialDate || !finishDate) {
      return true;
    } else {
      if (status_module) {
        return false;
      } else {
        return true;
      }
    }
  };
  console.log(state);
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
                                disabledTime={(current) =>
                                  current && current.isSame(moment(), "day")
                                }
                                onChange={(x) => {
                                  if (x) {
                                    setInitialDate(
                                      dayjs(x).format("YYYY-MM-DD")
                                    );
                                  } else {
                                    form.resetFields();
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
                                    dayjs(x).format("YYYY-MM-DD") < initialDate
                                  ) {
                                    notification.error({
                                      message:
                                        "La fecha final no puede ser menor a la fecha inicial",
                                    });
                                    setFinishDate("");
                                  } else {
                                    if (x) {
                                      setFinishDate(
                                        dayjs(x).format("YYYY-MM-DD")
                                      );
                                    } else {
                                      form.resetFields();
                                      setInitialDate("");
                                      setFinishDate("");
                                      setData([]);
                                    }
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

                          <Button
                            icon={<FileExcelFilled />}
                            type="primary"
                            loading={loadingExcel}
                            disabled={disabledDownload()}
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
                        disabled: !status_module,
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
            <>
              {" "}
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
                            disabledTime={(current) =>
                              current && current.isSame(moment(), "day")
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
                  <Col style={{ paddingTop: "0px", paddingLeft: "0px" }}>
                    desde: <b>{initialDate ? initialDate : "YYYY-MM-DD"} </b>
                    hasta: <b>{finishDate ? finishDate : "YYYY-MM-DD"} </b>
                    {finishDate && (
                      <>
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
                      title={() => "a"}
                      bordered
                      size={"small"}
                      loading={loadingTab1}
                      pagination={{
                        total: total,
                        pageSize: 10,
                        showSizeChanger: false,
                        current: page,
                        disabled: !status_module,
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
