import React, { useContext, useState } from "react";
import moment from "moment";
import "moment/locale/es";
import {
  Row,
  Col,
  Typography,
  Table,
  Button,
  DatePicker,
  Card,
  Form,
  Tabs,
} from "antd";
import { AppContext } from "../../App";
import dayjs from "dayjs";
import * as XLSX from "xlsx";

import {
  TableOutlined,
  FileExcelFilled,
  CalendarOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import sh from "../../api/sh/endpoints";

const { Title } = Typography;

const Reports = () => {
  const { state } = useContext(AppContext);
  const position_sensor_nivel = parseFloat(state.selected_profile.d3);
  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]);
  const [initialDate, setInitialDate] = useState("");
  const [finishDate, setFinishDate] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [form] = Form.useForm();

  const downloadDataToExcel = async () => {
    const pageSize = 10; // Número de elementos por página
    let currentPage = 1; // Página actual
    let allData = []; // Array para almacenar todos los datos

    // Función para obtener los datos de una página específica
    const getDataPage = async (page) => {
      const rq = await sh.get_data_sh_range(
        state.selected_profile.id,
        initialDate,
        finishDate,
        page
      );
      return rq.results;
    };

    // Obtener los datos de la primera página
    let pageData = await getDataPage(currentPage);
    allData = allData.concat(pageData);

    // Obtener los datos de las páginas restantes
    while (pageData.length === pageSize) {
      currentPage++;
      pageData = await getDataPage(currentPage);
      allData = allData.concat(pageData);
    }

    // Dividir los datos en lotes más pequeños
    const batchSize = 1000; // Tamaño del lote
    const batches = Math.ceil(allData.length / batchSize);
    const processedData = [];
    const processedData2 = [];

    for (let i = 0; i < batches; i++) {
      const startIndex = i * batchSize;
      const endIndex = startIndex + batchSize;
      const batch = allData.slice(startIndex, endIndex);
      const updatedResults = batch.map((item, index) => {
        if (index === 0) {
          return {
            ...item,
            total_hora: item.total - batch[index + 1].total,
            date_time_medition_hour: item.date_time_medition.slice(11, 16),
            nivel: processNivel(item.nivel),
            date_time_medition: item.date_time_medition.slice(0, 10),
          };
        } else {
          const previousTotal = batch[index - 1].total;
          const currentTotal = item.total;
          const total_hora = previousTotal - currentTotal;
          return {
            ...item,
            total_hora,
            date_time_medition_hour: item.date_time_medition.slice(11, 16),
            nivel: processNivel(item.nivel),
            date_time_medition: item.date_time_medition.slice(0, 10),
          };
        }
      });

      const sumTotal = updatedResults.reduce((acc, item, index) => {
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

      processedData2.push(...sumTotal);
      processedData.push(...updatedResults);
    }

    // Convertir los datos en el formato deseado para el archivo Excel
    const filteredData = processedData.map((item) => ({
      Fecha: item.date_time_medition,
      Hora: item.date_time_medition_hour,
      "Acumulado (m³)": item.total,
      "Nivel (m)": item.nivel,
      "Caudal (l/s)": item.flow,
      "Acumulado (m³)/ hora": item.total_hora,
    }));

    const filteredData2 = processedData2.map((item) => ({
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

  const processNivel = (nivel_response) => {
    if (nivel_response > 0.0 && nivel_response < position_sensor_nivel) {
      return parseFloat(position_sensor_nivel - nivel_response).toFixed(1);
    } else if (nivel_response > position_sensor_nivel) {
      nivel_response = 50.0;
      return parseFloat(position_sensor_nivel - nivel_response).toFixed(1);
    }
  };

  const getData = async () => {
    const rq = await sh
      .get_data_sh_range(
        state.selected_profile.id,
        initialDate,
        finishDate,
        page
      )
      .then(async (r) => {
        const selfGetAll = async () => {
          const pageSize = 10; // Número de elementos por página
          let currentPage = 1; // Página actual
          let allData = []; // Array para almacenar todos los datos

          // Función para obtener los datos de una página específica
          const getDataPage = async (page) => {
            const rq = await sh.get_data_sh_range(
              state.selected_profile.id,
              initialDate,
              finishDate,
              page
            );
            return rq.results;
          };

          // Obtener los datos de la primera página
          let pageData = await getDataPage(currentPage);
          allData = allData.concat(pageData);

          // Obtener los datos de las páginas restantes
          while (pageData.length === pageSize) {
            currentPage++;
            pageData = await getDataPage(currentPage);
            allData = allData.concat(pageData);
          }

          // Dividir los datos en lotes más pequeños
          const batchSize = 1000; // Tamaño del lote
          const batches = Math.ceil(allData.length / batchSize);

          for (let i = 0; i < batches; i++) {
            const startIndex = i * batchSize;
            const endIndex = startIndex + batchSize;
            const batch = allData.slice(startIndex, endIndex);
            const updatedResults = batch.map((item, index) => {
              if (index === 0) {
                return {
                  ...item,
                  total_hora: item.total - batch[index + 1].total,
                  date_time_medition_hour: item.date_time_medition.slice(
                    11,
                    16
                  ),
                  nivel: processNivel(item.nivel),
                  date_time_medition: item.date_time_medition.slice(0, 10),
                };
              } else {
                const previousTotal = batch[index - 1].total;
                const currentTotal = item.total;
                const total_hora = previousTotal - currentTotal;
                return {
                  ...item,
                  total_hora,
                  date_time_medition_hour: item.date_time_medition.slice(
                    11,
                    16
                  ),
                  nivel: processNivel(item.nivel),
                  date_time_medition: item.date_time_medition.slice(0, 10),
                };
              }
            });

            const sumTotal = updatedResults.reduce((acc, item, index) => {
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
            setData2(sumTotal);
          }
        };

        const updatedResults = r.results.map((item, index) => {
          if (index === 0) {
            return {
              ...item,
              total_hora: item.total - r.results[index + 1].total,
              date_time_medition_hour: item.date_time_medition.slice(11, 16),
              nivel: processNivel(item.nivel),
              date_time_medition: item.date_time_medition.slice(0, 10),
            };
          } else {
            const previousTotal = r.results[index - 1].total;
            const currentTotal = item.total;
            const total_hora = previousTotal - currentTotal;
            return {
              ...item,
              total_hora,
              date_time_medition_hour: item.date_time_medition.slice(11, 16),
              nivel: processNivel(item.nivel),
              date_time_medition: item.date_time_medition.slice(0, 10),
            };
          }
        });

        setData(updatedResults);
        setTotal(r.count);

        await selfGetAll(); // Wait for the data to be processed and stored in data2
      });
  };

  const getDataPage = async (page) => {
    const rq = await sh
      .get_data_sh_range(
        state.selected_profile.id,
        initialDate,
        finishDate,
        page
      )
      .then((r) => {
        console.log(r);
        const updatedResults = r.results.map((item, index) => {
          if (index === 0) {
            return {
              ...item,
              total_hora: item.total - r.results[index + 1].total,
              date_time_medition_hour: item.date_time_medition.slice(11, 16),
              nivel: processNivel(item.nivel),
              date_time_medition: item.date_time_medition.slice(0, 10),
            };
          } else {
            const previousTotal = r.results[index - 1].total;
            const currentTotal = item.total;
            const total_hora = previousTotal - currentTotal;
            return {
              ...item,
              total_hora,
              date_time_medition_hour: item.date_time_medition.slice(11, 16),
              nivel: processNivel(item.nivel),
              date_time_medition: item.date_time_medition.slice(0, 10),
            };
          }
        });

        setData(updatedResults);
        setTotal(r.count);
      });
  };

  return (
    <Row style={{ padding: "0px", marginTop: "-20px" }} justify={"center"}>
      <Col xl={24} lg={24} xs={24}>
        <Title
          level={2}
          style={{ textAlign: window.innerWidth < 900 && "center" }}
        >
          Datos y reportes ({total})
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
              paddingRight: "10px",
            }}
          >
            <Card hoverable>
              <Tabs type="card">
                <Tabs.TabPane tab="Datos" key="1" icon={<TableOutlined />}>
                  <Table
                    bordered
                    size={"small"}
                    pagination={{
                      total: total,
                      simple: true,
                      page: page,
                      onChange: (x) => {
                        setPage(x);
                        getDataPage(x);
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
                      { title: "Caudal (lt/s)", dataIndex: "flow" },
                      { title: "Nivel (m)", dataIndex: "nivel" },
                      { title: "Acumulado (m³)", dataIndex: "total" },
                      { title: "Acumulado/hora (m³)", dataIndex: "total_hora" },
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
                          moment(finishDate).diff(moment(initialDate), "days") +
                            1}{" "}
                        día/s ({initialDate.slice(5, 12)} /{" "}
                        {finishDate.slice(5, 12)})
                      </>
                    }
                    key="2"
                  >
                    <Table
                      bordered
                      size={"small"}
                      pagination={{ simple: true }}
                      columns={[
                        {
                          title: "Fecha",
                          dataIndex: "date_time_medition",
                        },
                        {
                          title: "Acumulado/día (m³)",
                          dataIndex: "total_hora",
                        },
                      ]}
                      dataSource={data2}
                    />
                  </Tabs.TabPane>
                )}
              </Tabs>
            </Card>
          </Col>
          <Col span={6}>
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
                        locale="es"
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
                          setFinishDate(dayjs(x).format("YYYY-MM-DD"));
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Form>
              </Col>
              <Col span={24} style={{ paddingTop: "0px", paddingLeft: "0px" }}>
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
                        moment(finishDate).diff(moment(initialDate), "days") +
                          1}{" "}
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
                      !initialDate || !finishDate ? "#D9D9D9" : "#1F3461",
                    color: !initialDate || !finishDate ? "#1F3461" : "white",
                    borderColor: "#1F3461",
                  }}
                  onClick={getData}
                >
                  Previsualizar reporte
                </Button>
              </Col>
              <Col span={24} style={{ paddingTop: "10px", paddingLeft: "0px" }}>
                <Button
                  icon={<ClearOutlined />}
                  type="primary"
                  disabled={!initialDate || !finishDate}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    backgroundColor:
                      !initialDate || !finishDate ? "#D9D9D9" : "#1F3461",
                    color: !initialDate || !finishDate ? "#1F3461" : "white",
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
              <Col span={24} style={{ paddingTop: "10px", paddingLeft: "0px" }}>
                <Button
                  icon={<FileExcelFilled />}
                  type="primary"
                  disabled={!initialDate || !finishDate}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    backgroundColor:
                      !initialDate || !finishDate ? "#D9D9D9" : "#1F3461",
                    color: !initialDate || !finishDate ? "#1F3461" : "white",
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
                        onSelect={(x) => {
                          setFinishDate(dayjs(x).format("YYYY-MM-DD"));
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Form>
              </Col>
              <Col span={24} style={{ paddingTop: "0px", paddingLeft: "0px" }}>
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
                        moment(finishDate).diff(moment(initialDate), "days") +
                          1}{" "}
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
                    color: !initialDate || !finishDate ? "#1F3461" : "white",
                    borderColor: "#1F3461",
                  }}
                  onClick={getData}
                >
                  Previsualizar reporte
                </Button>
              </Col>
              <Col span={24} style={{ paddingTop: "10px", paddingLeft: "0px" }}>
                <Button
                  icon={<ClearOutlined />}
                  type="primary"
                  disabled={!initialDate || !finishDate}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    backgroundColor:
                      !initialDate || !finishDate ? "#D9D9D9" : "#1F3461",
                    color: !initialDate || !finishDate ? "#1F3461" : "white",
                    borderColor: "#1F3461",
                  }}
                  block={false}
                  onClick={() => {
                    setInitialDate("");
                    setFinishDate("");
                    form.resetFields();
                    setData([]);
                  }}
                >
                  Limpiar
                </Button>
              </Col>
              <Col span={24} style={{ paddingTop: "10px", paddingLeft: "0px" }}>
                <Button
                  icon={<FileExcelFilled />}
                  type="primary"
                  disabled={!initialDate || !finishDate}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    backgroundColor:
                      !initialDate || !finishDate ? "#D9D9D9" : "#1F3461",
                    color: !initialDate || !finishDate ? "#1F3461" : "white",
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
                  pagination={{
                    total: total,
                    page: page,
                    onChange: (x) => {
                      setPage(x);
                      getDataPage(x);
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

                    { title: "(lt/s)", dataIndex: "flow" },
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
                        moment(finishDate).diff(moment(initialDate), "days") +
                          1}{" "}
                      día/s ({initialDate.slice(5, 12)} /{" "}
                      {finishDate.slice(5, 12)})
                    </>
                  }
                  key="2"
                >
                  <Table
                    bordered
                    size={"small"}
                    pagination={{ simple: true }}
                    columns={[
                      {
                        title: "Fecha",
                        dataIndex: "date_time_medition",
                      },
                      {
                        title: "m³/día",
                        dataIndex: "total_hora",
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
  );
};

export default Reports;
