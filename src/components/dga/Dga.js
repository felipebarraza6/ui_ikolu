import React, { useEffect, useContext, useState } from "react";
import {
  Row,
  Col,
  Table,
  Typography,
  Statistic,
  Button,
  Tooltip,
  Affix,
  Tag,
  Modal,
  Alert,
} from "antd";
import sh from "../../api/sh/endpoints";
import {
  CheckCircleFilled,
  FileImageOutlined,
  CloudServerOutlined,
  LinkOutlined,
} from "@ant-design/icons";
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
      .get_data_send_dga(state.selected_profile, page)
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
        } else if (standart === "MENOR") {
          const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          deadline = new Date(
            tomorrow.getFullYear(),
            tomorrow.getMonth(),
            1,
            9,
            0,
            0
          );
        } else {
          deadline = new Date(
            now.getFullYear(),

            now.getMonth(),
            now.getDate(),
            now.getHours(),
            now.getMinutes() + 1,
            now.getSeconds()
          );
        }

        setDeadline(deadline);

        setCountElements(r.count);
        var process_list = [];
        r.results.map((e, index) => {
          process_list.push({
            id: e.id,
            nivel: parseFloat(e.nivel) > 0 ? processNivel(e.nivel) : 0,
            caudal: parseFloat(e.flow) > 0 ? processCaudal(e.flow) : 0,
            acumulado: parseFloat(e.total) > 0 ? processAcum(e.total) : 0,
            fecha: `${new Date(
              r.results[index].date_time_medition
            ).getDate()}-${new Date(
              r.results[index].date_time_medition
            ).toLocaleString("default", { month: "short" })}`,
            hora: `${r.results[index].date_time_medition.slice(11, 16)}`,
            n_voucher: e.n_voucher,
          });
        });
        console.log(r.results);
        setData(process_list);
      });
  };

  useEffect(() => {
    getDataSh();
  }, [state.selected_profile, page]);

  return (
    <Row align={"top"} justify={"space-evenly"}>
      <Col span={24}>
        <Title level={3}>
          <span style={{ fontSize: "16px" }}>
            Datos enviados a la DGA del {new Date().getDate()} y{" "}
            {new Date().getDate() - 1} de{" "}
            {new Date().toLocaleString("es-CL", { month: "long" })}{" "}
          </span>
        </Title>
      </Col>
      <Col xs={24} lg={16} xl={19} style={{ paddingRight: "10px" }}>
        <Table
          style={{ borderRadius: "20px" }}
          bordered
          loading={data.length === 0}
          pagination={{
            total: countElements,
            pageSize: 10,
            onChange: (page) => setPage(page),
          }}
          size="small"
          dataSource={data}
          columns={[
            { title: "Fecha", dataIndex: "fecha", width: "50%", fixed: "top" },
            { title: "Hora", dataIndex: "hora", width: "10%" },
            {
              title: window.innerWidth > 900 ? "Caudal(L/s)" : "l/s",
              dataIndex: "caudal",
              render: (flow) => processCaudal(flow),
            },
            {
              title: window.innerWidth > 900 ? "N.Freático(m)" : "m",
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
            {
              title: <center>Comprobante ingreso DGA</center>,
              render: (obj) =>
                obj.n_voucher ? (
                  <Alert
                    icon={<CheckCircleFilled />}
                    size="small"
                    showIcon
                    style={{ width: "210px", padding: "5px" }}
                    type="success"
                    message={<>{obj.n_voucher}</>}
                  />
                ) : (
                  <Alert
                    icon={<CloudServerOutlined />}
                    size="small"
                    style={{ width: "210px", padding: "5px" }}
                    showIcon
                    type="error"
                    description={<>Servicio DGA no disponible ref: #{obj.id}</>}
                  />
                ),
            },
          ]}
        />
      </Col>
      <Col xs={24} lg={16} xl={5}>
        <Affix offsetTop={185}>
          <Row
            justify={"center"}
            align={"middle"}
            style={{
              border: "2px solid #1F3461",
              zIndex: -10,
              borderRadius: "10px",
              marginTop: window.innerWidth > 900 ? "-70px" : "0px",
            }}
          >
            <Col>
              <Title level={4} style={{ textAlign: "center" }}>
                Siguiente envío de información a servicio DGA
              </Title>
            </Col>
            <Col span={24}>
              {state.selected_profile.is_send_dga ? (
                <Countdown
                  valueStyle={{ color: "white" }}
                  style={{
                    textAlign: "center",
                    backgroundColor: "#1F3461",
                  }}
                  value={deadline}
                />
              ) : (
                <Tag color="red-inverse">
                  <b>No programado</b>
                </Tag>
              )}
            </Col>
            <Col>
              {state.selected_profile.code_dga_site ? (
                <center>
                  <Title
                    level={5}
                    style={{
                      paddingLeft: "10px",
                      paddingRight: "10px",
                    }}
                  >
                    {standart === "MAYOR" &&
                      "El estándar Mayor envía información cada una hora"}
                    {standart === "MEDIO" &&
                      "El estándar Mayor envía información cada un día"}
                    {standart === "MENOR" &&
                      "El estándar Mayor envía información cada un mes"}
                    {standart === "MENOR" &&
                      "El estándar Mayor envía información cada seis meses"}
                  </Title>
                  <QRCodeCanvas
                    size={150}
                    value={`https://snia.mop.gob.cl/cExtracciones2/#/consultaQR/${state.selected_profile.code_dga_site}`}
                  />
                  <br />
                  <br />
                </center>
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
            </Col>
            <Col>
              <Text
                level={4}
                style={{
                  color: "#1F3461",
                  fontSize: "17px",
                  fontWeight: "bold",
                  borderRadius: "10px",
                }}
              >
                {state.selected_profile.code_dga_site
                  ? state.selected_profile.code_dga_site
                  : "CÓDIGO DE OBRA"}
              </Text>
            </Col>
            <Col>
              <Tooltip
                placement="right"
                color="#1F3461"
                title={
                  <Text style={{ color: "white" }}>
                    Los siguientes datos son proporcionados por la DGA, respecto
                    a dudas o inconsistencias: ponte en contacto con{" "}
                    <b>soporte@smarthydro.cl</b>
                  </Text>
                }
              >
                <Button
                  icon={<LinkOutlined />}
                  type="primary"
                  onClick={() => {
                    window.open(
                      `https://snia.mop.gob.cl/cExtracciones2/#/consultaQR/${state.selected_profile.code_dga_site}`,
                      "_blank"
                    );
                  }}
                  style={{
                    backgroundColor: "#1F3461",
                    borderColor: "#1F3461",
                  }}
                >
                  Plataforma DGA
                </Button>
              </Tooltip>
            </Col>
            <br />
            <br />
            <br />
          </Row>
        </Affix>
      </Col>
    </Row>
  );
};

export default Dga;
