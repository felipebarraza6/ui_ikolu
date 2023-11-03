import React, { useContext, useState } from "react";
import moment from "moment";
import { Row, Col, Typography, Table, Button, DatePicker } from "antd";
import { AppContext } from "../../App";
import dayjs from "dayjs";

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
  const [initialDate, setInitialDate] = useState("");
  const [finishDate, setFinishDate] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  console.log(data);

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
        setData(r.results);
        setTotal(r.count);
      });
  };

  const postDataDownload = () => {
    const rq = sh.downloadFile(
      state.selected_profile.id,
      initialDate,
      finishDate,
      state.selected_profile.title
    );
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
        setData(r.results);
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
              onClick={postDataDownload}
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
