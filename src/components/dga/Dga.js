import React, { useEffect, useContext, useState } from "react";
import { Row, Col, Table, Typography, Button, Card } from "antd";
import sh from "../../api/sh/endpoints";
import { FileImageOutlined } from "@ant-design/icons";
import { AppContext } from "../../App";

const { Title } = Typography;

const Dga = () => {
  const { state } = useContext(AppContext);
  const [data, setData] = useState([]);
  const [countElements, setCountElements] = useState(0);
  const [page, setPage] = useState(1);

  const numberForMiles = new Intl.NumberFormat("de-DE");

  const getDataSh = async () => {
    const rq = await sh
      .get_data_send_dga(state.selected_profile.id, page)
      .then((r) => {
        setCountElements(r.count);
        console.log(r.results);
        var process_list = [];
        let today = new Date();
        let year = today.getFullYear();
        let month = today.getMonth() + 1;
        let day = today.getDate() - 1;
        let formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
          .toString()
          .padStart(2, "0")} `;
        r.results.map((e, index) => {
          process_list.push({
            nivel: r.results[0].nivel
              ? parseFloat(
                  state.selected_profile.d3 - r.results[0].nivel
                ).toFixed(1)
              : 0,
            caudal: r.results[index].flow ? r.results[0].flow : 0,
            acumulado: r.results[0].total
              ? numberForMiles.format(r.results[index].total)
              : 0,
            fecha: `${r.results[index].date_time_medition.slice(
              0,
              10
            )} ${r.results[index].date_time_medition.slice(11, 16)}`,
          });
        });
        setData(process_list);
      });
  };

  useEffect(() => {
    getDataSh();
  }, [state.selected_profile, page]);

  return (
    <Row>
      <Col span={24}>
        <Title level={2}>
          DGA <br />
          <span style={{ fontSize: "20px" }}>
            Datos enviados a DGA en las últimas 24 horas:{" "}
            <strong>({countElements})</strong>
          </span>
        </Title>
      </Col>
      <Col span={14} style={{ padding: "20px" }}>
        <Table
          style={{ borderRadius: "20px" }}
          bordered
          pagination={{
            total: countElements,
            onChange: (page) => setPage(page),
          }}
          size="small"
          dataSource={data}
          columns={[
            { title: "Fecha", dataIndex: "fecha" },
            {
              title: "Caudal(lt)",
              dataIndex: "caudal",
              render: (flow) => (flow < 0 ? "0.0" : flow),
            },
            { title: "Acumulado(m³)", dataIndex: "acumulado" },
            { title: "Nivel Freático(m)", dataIndex: "nivel" },
          ]}
        />
      </Col>
      <Col span={10}>
        <center>
          {state.selected_profile.qr_dga ? (
            <>
              <img
                width={"50%"}
                src={`https://api.smarthydro.cl/${state.selected_profile.qr_dga}`}
              />
              <br />
              <br />
            </>
          ) : (
            <>
              <FileImageOutlined
                style={{
                  fontWeight: "100",
                  fontSize: "150px",
                  textAlign: "center",
                  color: "#1f3461",
                }}
              />
              <br />
              <br />
            </>
          )}
          <Title level={4}>
            {state.selected_profile.code_dga_site
              ? state.selected_profile.code_dga_site
              : "CÓDIGO DE OBRA"}
          </Title>
        </center>
      </Col>
    </Row>
  );
};

export default Dga;
