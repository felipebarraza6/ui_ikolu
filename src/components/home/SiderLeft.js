import { Button, Card, Affix, Modal, Row, Col } from "antd";
import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../../App";
import {
  ArrowRightOutlined,
  MessageOutlined,
  BarChartOutlined,
  HistoryOutlined,
  FileFilled,
  DatabaseFilled,
} from "@ant-design/icons";
import logo from "../../assets/images/logozivo.png";
import minLogo from "../../assets/images/logo-blanco.png";
import QueueAnim from "rc-queue-anim";

const SiderRight = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { state } = useContext(AppContext);

  return (
    <QueueAnim delay={200} duration={900} type="left">
      <div key="left">
        <Affix offsetTop={0}>
          <Row
            style={{
              background:
                "radial-gradient(circle, rgba(59,63,96,1) 0%, rgba(31,52,97,1) 100%)",
              minHeight: "100vh",
              paddingTop: "10px",
              zIndex: 99,
            }}
            align={"space-around"}
          >
            <Row>
              <Col span={24}>
                <center>
                  <img
                    src={logo}
                    width="50px"
                    style={{ marginTop: "10px", marginRight: "10px" }}
                  />
                  <img
                    src={
                      "https://veset.cl/wp-content/uploads/2022/01/LOGO-VESET-CON-%C2%AE.png"
                    }
                    style={{
                      width: "100px",
                      backgroundColor: "white",
                      borderRadius: "10px",
                    }}
                  />
                  <br />
                </center>
              </Col>
              <Col span={24} style={{ minHeight: "300px" }}>
                <Row align={"top"}>
                  <Button
                    type="link"
                    style={{
                      color: location.pathname == "/" ? "#1F3461" : "black",
                      backgroundColor: "white",
                      paddingLeft: "10px",
                      borderRadius: "0px",
                      marginBottom: "10px",
                      width: "100%",
                      paddingRight: "10px",
                      textAlign: "left",
                    }}
                    icon={<DatabaseFilled style={{ color: "#1F3461" }} />}
                    onClick={() => {
                      navigate("/");
                    }}
                  >
                    <div style={{ textAlign: "start" }}>Telemetría</div>
                  </Button>

                  <Button
                    type="link"
                    style={{
                      color: location.pathname == "/dga" ? "black" : "#1F3461",
                      backgroundColor: "white",
                      paddingLeft: "10px",
                      borderRadius: "0px",
                      width: "100%",
                      paddingRight: "10px",
                      marginBottom: "10px",
                      textAlign: "left",
                    }}
                    onClick={() => {
                      navigate("/dga");
                    }}
                    icon={<HistoryOutlined />}
                  >
                    DGA
                  </Button>
                  <Button
                    type="link"
                    style={{
                      color:
                        location.pathname == "/charts" ? "black" : "#1F3461",
                      backgroundColor: "white",
                      paddingLeft: "10px",
                      borderRadius: "0px",
                      width: "100%",
                      paddingRight: "10px",
                      marginBottom: "10px",
                      textAlign: "left",
                    }}
                    onClick={() => {
                      navigate("/charts");
                    }}
                    icon={<BarChartOutlined />}
                  >
                    Gráficos e indicadores
                  </Button>
                  <Button
                    type="link"
                    style={{
                      color:
                        location.pathname == "/reports" ? "black" : "#1F3461",
                      backgroundColor: "white",
                      paddingLeft: "10px",
                      borderRadius: "0px",
                      width: "100%",
                      paddingRight: "10px",
                      textAlign: "left",
                    }}
                    onClick={() => {
                      navigate("/reports");
                    }}
                    icon={<FileFilled />}
                  >
                    Documentación
                  </Button>
                </Row>
              </Col>

              <Col
                span={24}
                style={{
                  textAlign: "left",
                }}
              >
                <Button
                  block
                  type="default"
                  icon={<MessageOutlined />}
                  onClick={() => {
                    Modal.info({
                      icon: <MessageOutlined />,
                      content: (
                        <>
                          <p>
                            Si surge cualquier inconveniente con el
                            funcionamiento de la plataforma, no dudes en
                            escribirnos directamente a: <br />
                          </p>
                          <p style={{ fontSize: "17px" }}>
                            <b>soporte@smarthydro.cl</b>
                          </p>
                        </>
                      ),
                    });
                  }}
                  style={{
                    borderColor: "#1F3461",
                    color:
                      location.pathname !== "/docrespaldo"
                        ? "#1F3461"
                        : "white",
                  }}
                >
                  {location.pathname === "/docrespaldo" && (
                    <ArrowRightOutlined />
                  )}
                  Soporte
                </Button>
              </Col>

              <Col span={24}>
                <center>
                  <span style={{ color: "white", textAlign: "left" }}>
                    Un producto de:
                  </span>
                  <br />
                  <br />
                  <img src={minLogo} width={"130px"} />
                </center>
              </Col>
            </Row>
          </Row>
        </Affix>
      </div>
    </QueueAnim>
  );
};

export default SiderRight;
