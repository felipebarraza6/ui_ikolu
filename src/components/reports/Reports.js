import React, { useContext, useState } from "react";
import moment from "moment";
import { Row, Col, Typography, Table, Button, DatePicker } from "antd";
import { AppContext } from "../../App";
import dayjs from "dayjs";
import * as XLSX from "xlsx";

import {
  CloudDownloadOutlined,
  DownloadOutlined,
  LeftSquareOutlined,
} from "@ant-design/icons";
import sh from "../../api/sh/endpoints";

const { Title } = Typography;

const Reports = () => {
  const { state } = useContext(AppContext);
  const [selectDownload, setSelectDownload] = useState(null);
  const [data, setData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [initialDate, setInitialDate] = useState("");
  const [finishDate, setFinishDate] = useState("");
  const [totals, setTotals] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

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

    for (let i = 0; i < batches; i++) {
      const startIndex = i * batchSize;
      const endIndex = startIndex + batchSize;
      const batch = allData.slice(startIndex, endIndex);

      const updatedResults = batch.map((item, index) => {
        if (index === 0) {
          return {
            ...item,
            total_hora: item.total - batch[index + 1].total,
          };
        } else {
          const previousTotal = batch[index - 1].total;
          const currentTotal = item.total;
          const total_hora = previousTotal - currentTotal;
          return { ...item, total_hora };
        }
      });

      processedData.push(...updatedResults);
    }

    // Convertir los datos en el formato deseado para el archivo Excel
    const filteredData = processedData.map((item) => ({
      Fecha: item.date_time_medition,
      "Acumulado (m³)": item.total,
      "Nivel (m)": item.nivel,
      "Caudal (l/s)": item.flow,
      "Acumulado (m³)/ hora": item.total_hora,
    }));

    // Crear el archivo Excel y descargarlo
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, "data.xlsx");

    console.log(filteredData);

    // Resto del código...
  };

  const getData = async () => {
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
            };
          } else {
            const previousTotal = r.results[index - 1].total;
            const currentTotal = item.total;
            const total_hora = previousTotal - currentTotal;
            return { ...item, total_hora };
          }
        });

        setData(updatedResults);
        setTotal(r.count);
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
            };
          } else {
            const previousTotal = r.results[index - 1].total;
            const currentTotal = item.total;
            const total_hora = previousTotal - currentTotal;
            return { ...item, total_hora };
          }
        });

        setData(updatedResults);
        setTotal(r.count);
      });
  };

  return (
    <Row style={{ padding: "10px" }} justify={"center"}>
      <Col span={24}>
        <Title level={2}>Datos y reportes</Title>
      </Col>
      <Col
        span={18}
        style={{ marginTop: "0px", marginBottom: "0px", paddingRight: "10px" }}
      >
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
              title: "Fecha / Hora",
              render: (x) =>
                `${x.date_time_medition.slice(
                  0,
                  10
                )} / ${x.date_time_medition.slice(11, 16)}`,
            },
            { title: "Nivel (m)", dataIndex: "nivel" },
            { title: "Caudal (l/s)", dataIndex: "flow" },
            { title: "Acumulado (m³)", dataIndex: "total" },
            { title: "Acumulado/hora (m³)", dataIndex: "total_hora" },
          ]}
          dataSource={data}
        />
      </Col>
      <Col span={6} style={{ paddingLeft: "10px" }}>
        <Row justify={"center"} align={"top"}>
          <Col span={24} style={{ paddingTop: "10px" }}>
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Selecciona una fecha inicial"
              onSelect={(x) => {
                setInitialDate(dayjs(x).format("YYYY-MM-DD"));
              }}
            />
          </Col>
          <Col span={24} style={{ paddingTop: "10px" }}>
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Selecciona una fecha final"
              onSelect={(x) => {
                setFinishDate(dayjs(x).format("YYYY-MM-DD"));
              }}
            />
          </Col>
          <Col span={24} style={{ paddingTop: "20px", paddingLeft: "10px" }}>
            desde: <b>{initialDate} </b>
            <br />
            hasta: <b>{finishDate} </b>
            <br />
            <br />
            {finishDate && (
              <>
                Visualización:{" "}
                <b>
                  {moment(finishDate) &&
                    moment(finishDate).diff(moment(initialDate), "days")}{" "}
                </b>
                días
              </>
            )}
            <br />
            <br />
            <Button
              type="primary"
              icon={<LeftSquareOutlined />}
              block={false}
              style={{ width: "100%", textAlign: "left" }}
              onClick={getData}
            >
              Previsualizar reporte
            </Button>
          </Col>
          <Col span={24} style={{ paddingTop: "10px", paddingLeft: "10px" }}>
            <Button
              icon={<DownloadOutlined />}
              type="primary"
              style={{ width: "100%", textAlign: "left" }}
              block={false}
              onClick={downloadDataToExcel}
            >
              Descargar reporte
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default Reports;
