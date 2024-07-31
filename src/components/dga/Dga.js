import React, { useEffect, useContext, useState } from "react";
import {
  Row,
  Col,
  Table,
  Typography,
  Statistic,
  Button,
  Tooltip,
  Tag,
} from "antd";
import sh from "../../api/sh/endpoints";
import { FileImageOutlined, SecurityScanFilled } from "@ant-design/icons";
import { AppContext } from "../../App";
import { QRCodeCanvas } from "qrcode.react";
const { Countdown } = Statistic;

const { Title, Text } = Typography;

const Dga = () => {
  const { state } = useContext(AppContext);
  const standart = state.selected_profile.standard;
  const position_sensor_nivel = parseFloat(state.selected_profile.d3);
  const [data, setData] = useState([]);
  const [countElements, setCountElements] = useState(0);
  const [page, setPage] = useState(1);
  const [deadline, setDeadline] = useState(null);

  const numberForMiles = new Intl.NumberFormat("de-DE");

  const processNivel = (nivel_response) => {
    nivel_response = parseFloat(nivel_response).toFixed(1);
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

  const getDataSh = async () => {
    const rq = await sh
      .get_data_send_dga(state.selected_profile.id, page)
      .then((r) => {
        const now = new Date();
        let deadline;

        if (standart === "MAYOR") {
          const minutesUntilNextHour = 60 - now.getMinutes();
          deadline = new Date(now.getTime() + minutesUntilNextHour * 60000);
        } else if (standart === "MEDIO") {
          const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          deadline = new Date(
            tomorrow.getFullYear(),
            tomorrow.getMonth(),
            tomorrow.getDate(),
            9,
            0,
            0
          );
        }

        setDeadline(deadline);

        setCountElements(r.count);
        var process_list = [];
        r.results.map((e, index) => {
          process_list.push({
            nivel: r.results[0].nivel
              ? processNivel(r.results[index].nivel)
              : 0,
            caudal: r.results[index].flow
              ? processCaudal(r.results[0].flow)
              : 0,
            acumulado: r.results[0].total
              ? processAcum(r.results[index].total)
              : 0,
            fecha: `${r.results[index].date_time_medition.slice(0, 10)}`,
            hora: `${r.results[index].date_time_medition.slice(11, 16)}`,
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
          DGA - {standart} <br />
          <span style={{ fontSize: "16px" }}>
            Últimos datos enviados a DGA el{" "}
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </Title>
      </Col>
      <Col xs={24} lg={16} xl={16} style={{ padding: "20px" }}>
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
            { title: "Día", dataIndex: "dia" }, // Add a new column for the day of the week
            { title: "Hora", dataIndex: "hora" },
            {
              title: window.innerWidth > 900 ? "Caudal(L/s)" : "l/s",
              dataIndex: "caudal",
              render: (flow) => processCaudal(flow),
            },
            {
              title: window.innerWidth > 900 ? "Nivel Freático(m)" : "m",
              dataIndex: "nivel",
              render: (nivel) => nivel,
            },
            {
              title: window.innerWidth > 900 ? "Acumulado(m³)" : "m³",
              dataIndex: "acumulado",
              render: (acumulado) =>
                numberForMiles.format(processAcum(acumulado)),
              width: "10%",
            },
          ]}
        />
      </Col>
      <Col
        xs={24}
        lg={16}
        xl={8}
        style={{
          border: "2px solid #1F3461",
          borderRadius: "10px",
          marginTop: window.innerWidth > 900 ? "-100px" : "0px",
          minHeight: "30vh",
        }}
      >
        <Row>
          <center>
            <Col span={24}>
              <Title
                level={4}
                style={{ paddingLeft: "10px", paddingRight: "10px" }}
              >
                Siguiente envío de información a servicio DGA
              </Title>
            </Col>
            <Col span={24} style={{ marginBottom: "10px" }}>
              {state.selected_profile.is_send_dga ? (
                <Countdown
                  valueStyle={{ color: "white" }}
                  style={{
                    textAlign: "center",
                    backgroundColor: "#1F3461",
                    marginBottom: "30px",
                    marginTop: "20px",
                  }}
                  value={deadline}
                />
              ) : (
                <Tag color="red-inverse">
                  <b>No programado</b>
                </Tag>
              )}
            </Col>

            {state.selected_profile.qr_dga ? (
              <>
                <Title
                  level={5}
                  style={{
                    paddingLeft: "10px",
                    paddingRight: "10px",
                    marginBottom: "20px",
                  }}
                >
                  {standart === "MAYOR"
                    ? "El estándar Mayor envía información cada una hora"
                    : "El estándar Medio envía información cada 24 horas"}
                </Title>
                <QRCodeCanvas
                  size={200}
                  value={`https://snia.mop.gob.cl/cExtracciones2/#/consultaQR/${state.selected_profile.code_dga_site}`}
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
            <Text
              level={4}
              style={{
                color: "white",
                backgroundColor: "#1F3461",
                border: "0px solid #1F3461",
                fontSize: "17px",
                fontWeight: "bold",
                padding: "5px",
                borderRadius: "10px",
              }}
            >
              {state.selected_profile.code_dga_site
                ? state.selected_profile.code_dga_site
                : "CÓDIGO DE OBRA"}
            </Text>
            <br />
            <Tooltip
              style={{}}
              color="#1F3461"
              title={
                <Text style={{ color: "white" }}>
                  Los siguientes datos son proporcionados por la DGA, respecto a
                  dudas o iconsistencias: ponte en contacto con{" "}
                  <b>soporte@smarthydro.cl</b>
                </Text>
              }
            >
              <Button
                icon={<SecurityScanFilled />}
                type="primary"
                onClick={() => {
                  window.open(
                    `https://snia.mop.gob.cl/cExtracciones2/#/consultaQR/${state.selected_profile.code_dga_site}`,
                    "_blank"
                  );
                }}
                style={{
                  paddingBottom: "50px",
                  marginTop: "20px",
                  backgroundColor: "#1F3461",
                  borderColor: "#1F3461",
                }}
              >
                Ver <b> {state.selected_profile.code_dga_site}</b> <br />
                en plataforma oficia DGA
              </Button>
            </Tooltip>
            <br />
            <br />
          </center>
        </Row>
      </Col>
    </Row>
  );
};

export default Dga;
