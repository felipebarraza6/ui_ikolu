import React, { useContext, useEffect, useState } from "react";
import {
  Row,
  Col,
  Typography,
  Modal,
  Input,
  Card,
  Form,
  Button,
  Table,
  Select,
} from "antd";

import caudal_img from "../../assets/images/caudal.png";
import nivel_img from "../../assets/images/nivel.png";
import acumulado_img from "../../assets/images/acumulado.png";
import pozo1 from "../../assets/images/pozo1.png";
import { AppContext } from "../../App";
import api_novus from "../../api/novus/endpoints";
import { getNovusData } from "./controller";
import sh from "../../api/sh/endpoints";
const { Title, Paragraph } = Typography;

const numberForMiles = new Intl.NumberFormat("de-DE");

const MyWell = () => {
  const { state } = useContext(AppContext);
  const [caudal, setCaudal] = useState(0.0);
  const [nivel, setNivel] = useState(0.0);
  const [acumulado, setAcumulado] = useState(0);
  const [dataSource, setDataSource] = useState([]);

  const [form] = Form.useForm();

  let dateToday = new Date();
  let fechaFormateada = dateToday.toLocaleDateString("es-CL");

  let month = dateToday.toLocaleString("es", { month: "long" });
  let day = dateToday.getDate();
  let fechaConMes = `Ingresaras el periodo de correspondiente al mes "0${
    state.selected_profile.title == "Las Liras"
      ? dateToday.getMonth()
      : dateToday.getFullYear()
  }"`;

  const getAccCaudal = async () => {
    var nowDate = new Date();
    var antHour = 0;
    var date = `${nowDate.getFullYear()}-${
      nowDate.getMonth() + 1 > 9
        ? nowDate.getMonth() + 1
        : `0${nowDate.getMonth() + 1}`
    }-${
      nowDate.getDate() - 1 > 9
        ? nowDate.getDate() - 1
        : `0${nowDate.getDate() - 1}`
    }T00:00:00`;
    const rq = await api_novus
      .dataCaudal("3grecdi1va", "", date, state.selected_profile.token_service)
      .then((r) => {
        var val1 = r.result[0].value;
        var val2 = r.result[1].value;
        var calc =
          (val1 / state.selected_profile.scale -
            val2 / state.selected_profile.scale) /
          3600;
        setCaudal(calc);
      });
  };

  const getData = async () => {
    const rq = await sh.get_data_sh(state.selected_profile.id).then((r) => {
      console.log(r);
      setNivel(
        r.results[0]
          ? parseFloat(r.results[0].nivel) > 0.0 || isNaN(r.results[0].nivel)
            ? r.results[0].nivel
            : 0.0
          : 0.0
      );
      setCaudal(
        r.results[0]
          ? parseFloat(r.results[0].flow) > 0.0 || isNaN(r.results[0].flow)
            ? r.results[0].flow
            : 0.0
          : 0.0
      );
      setAcumulado(r.results[0] ? r.results[0].total : 0);
    });
  };

  useEffect(() => {
    //getNovusData(setCaudal, setNivel, state, api_novus, setAcumulado, acumulado, nivel)

    getData();
  }, [state.selected_profile]);

  return (
    <Row justify={"center"} style={{ padding: "0px" }}>
      <Col span={24}>
        <Title level={2}>Mi Pozo</Title>
      </Col>
      <Col span={window.innerWidth > 900 ? 6 : 24}>
        <Card
          hoverable
          style={{
            marginBottom: "10px",
            marginTop: "20px",
            border: "solid 1px grey",
            borderRadius: "15px",
            width: "350px",
          }}
        >
          <Row align="middle">
            <Col span={7}>
              <img src={caudal_img} width="60px" />
            </Col>
            <Col span={12}>
              <Title level={5} style={{ color: "#222221" }}>
                Caudal
              </Title>
            </Col>
            <Col span={12} offset={7} style={{ marginTop: "-15px" }}>
              <Typography.Paragraph level={5}>
                {parseFloat(caudal).toFixed(1) === "3276.7" ? (
                  <div style={{ color: "red" }}>
                    {parseFloat(caudal).toFixed(1)}
                  </div>
                ) : (
                  <b>
                    {parseFloat(caudal).toLocaleString("es-ES", {
                      minimumFractionDigits: 1,
                    })}{" "}
                    (Litros/seg)
                  </b>
                )}
              </Typography.Paragraph>
            </Col>
          </Row>
        </Card>

        <Card
          hoverable
          style={{
            marginBottom: "10px",
            marginTop: "20px",
            border: "solid 1px grey",
            borderRadius: "15px",
            width: "350px",
          }}
        >
          <Row align="middle">
            <Col span={7}>
              <img src={nivel_img} width="60px" />
            </Col>
            <Col span={12}>
              <Title level={5} style={{ color: "#222221" }}>
                Nivel Freático
              </Title>
            </Col>
            <Col span={12} offset={7} style={{ marginTop: "-19px" }}>
              <Typography.Paragraph level={5}>
                <b>
                  {parseFloat(state.selected_profile.d3 - nivel).toLocaleString(
                    "es-ES",
                    {
                      minimumFractionDigits: 1,
                    }
                  )}{" "}
                  (Metros)
                </b>
              </Typography.Paragraph>
            </Col>
          </Row>
        </Card>
        <Card
          hoverable
          style={{
            marginBottom: "50px",
            marginTop: "20px",
            border: "solid 1px grey",
            borderRadius: "15px",
            width: "350px",
          }}
        >
          <Row align="middle">
            <Col span={7}>
              <img src={acumulado_img} width="60px" />
            </Col>
            <Col span={17}>
              <Title level={5} style={{ color: "#222221" }}>
                Acumulado
              </Title>
            </Col>
            <Col span={12} offset={7} style={{ marginTop: "-18px" }}>
              <Typography.Paragraph level={5}>
                <b>
                  {state.user.username === "fermin"
                    ? numberForMiles.format(acumulado * 1)
                    : numberForMiles.format(acumulado)}
                </b>
                <br />
              </Typography.Paragraph>
              <Typography.Paragraph level={5} style={{ marginTop: "-20px" }}>
                <b>(Metros cúbicos)</b>
              </Typography.Paragraph>
            </Col>
          </Row>
        </Card>
      </Col>
      {window.innerWidth > 900 && (
        <Col span={18} style={{ paddingLeft: "140px", paddingTop: "70px" }}>
          <center>
            <img
              src={pozo1}
              width={"430px"}
              style={{
                position: "absolute",
                marginLeft: "-240px",
                marginTop: "-80px",
              }}
            />
          </center>
          <Input
            disabled
            style={{
              color: "white",
              backgroundColor:
                parseFloat(caudal).toFixed(1) === "3276.7"
                  ? "#cf1322"
                  : "#1F3461",
              border: "0px solid #1F3461",
              fontSize: "17px",
              width:
                parseFloat(caudal).toFixed(1) === "3276.7" ? "80px" : "150px",
              marginTop: "40px",
              marginLeft: "90px",
              position: "absolute",
              borderRadius: "10px",
            }}
            value={`${parseFloat(caudal).toLocaleString("es-ES", {
              minimumFractionDigits: 1,
            })} (Litros/seg)`}
          />

          <Input
            disabled
            style={{
              color: "white",
              backgroundColor: "#1F3461",
              border: "0px solid #1F3461",
              fontSize: "17px",
              width: "160px",
              marginTop: "20px",
              marginLeft: "340px",
              position: "absolute",
              borderRadius: "10px",
            }}
            value={`${
              state.user.username === "fermin"
                ? numberForMiles.format(acumulado * 1)
                : state.selected_profile.title == "PAINE"
                ? "6094"
                : numberForMiles.format(acumulado)
            } (m³)`}
          />
          <Input
            disabled
            style={{
              color: "white",
              backgroundColor: "#1F3461",
              border: "0px solid #1F3461",
              fontSize: "17px",
              width: "130px",
              marginTop: "280px",
              marginLeft: "300px",
              position: "absolute",
              borderRadius: "10px",
            }}
            value={`${parseFloat(
              state.selected_profile.d3 - nivel
            ).toLocaleString("es-ES", {
              minimumFractionDigits: 1,
            })} (Metros)`}
          />
        </Col>
      )}
      <Col></Col>
    </Row>
  );
};

export default MyWell;
