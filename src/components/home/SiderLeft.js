import { Button, Card, Affix, Modal, Row, Col } from "antd";
import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppContext } from "../../App";
import { ArrowRightOutlined, MessageOutlined } from "@ant-design/icons";
import logo from "../../assets/images/logozivo.png";
import minLogo from "../../assets/images/logo-blanco.png";

const SiderRight = () => {
  const location = useLocation();

  const { state } = useContext(AppContext);

  return (
    <Affix offsetTop={110}>
      <Row
        style={{
          backgroundColor: "#1F3461",
          borderRadius: "20px",
          minHeight: "85vh",
          paddingTop: "10px",
          marginLeft: "2px",
        }}
        align={"space-around"}
      >
        <Row>
          <Col span={24}>
            <center>
              <img src={logo} width="50px" style={{ marginTop: "10px" }} />
            </center>
          </Col>
          <Col span={24} style={{ minHeight: "300px" }}>
            <Row align={"top"}>
              <Col
                span={24}
                style={{
                  backgroundColor:
                    location.pathname == "/" ? "white" : "#1F3461",
                }}
              >
                <Link to="/">
                  <Button
                    type="link"
                    style={{
                      color: location.pathname !== "/" ? "white" : "#1F3461",
                    }}
                  >
                    {location.pathname === "/" && <ArrowRightOutlined />}{" "}
                    {state.selected_profile.standard ===
                      "CAUDALES_MUY_PEQUENOS" ||
                    state.selected_profile.standard === "MENOR"
                      ? "Registros"
                      : "Mi Pozo"}
                  </Button>
                </Link>
              </Col>
              {state.selected_profile.module_2 && (
                <Col
                  span={24}
                  style={{
                    backgroundColor:
                      location.pathname == "/dga" ? "white" : "#1F3461",
                  }}
                >
                  <Link to="/dga">
                    <Button
                      disabled={!state.selected_profile.module_2}
                      type="link"
                      style={{
                        color:
                          location.pathname !== "/dga" ? "white" : "#1F3461",
                      }}
                    >
                      {location.pathname === "/dga" && <ArrowRightOutlined />}{" "}
                      DGA
                    </Button>
                  </Link>
                </Col>
              )}
              {state.selected_profile.module_3 && (
                <Col
                  span={24}
                  style={{
                    backgroundColor:
                      location.pathname == "/reportes" ? "white" : "#1F3461",
                  }}
                >
                  <Link to="/reportes">
                    <Button
                      disabled={!state.selected_profile.module_3}
                      type="link"
                      style={{
                        color:
                          location.pathname !== "/reportes"
                            ? "white"
                            : "#1F3461",
                      }}
                    >
                      {location.pathname === "/reportes" && (
                        <ArrowRightOutlined />
                      )}{" "}
                      Datos y Reportes
                    </Button>
                  </Link>
                </Col>
              )}
              {state.selected_profile.module_4 && (
                <Col
                  span={24}
                  style={{
                    backgroundColor:
                      location.pathname == "/graficos" ? "white" : "#1F3461",
                  }}
                >
                  <Link to="/graficos">
                    <Button
                      disabled={!state.selected_profile.module_4}
                      type="link"
                      style={{
                        color:
                          location.pathname !== "/graficos"
                            ? "white"
                            : "#1F3461",
                      }}
                    >
                      {location.pathname === "/graficos" && (
                        <ArrowRightOutlined />
                      )}{" "}
                      Gráficos
                    </Button>
                  </Link>
                </Col>
              )}
              {console.log(state.selected_profile)}
              {state.selected_profile.code_dga_site === "OB-0111-1111" && (
                <>
                  <Col
                    span={24}
                    style={{
                      backgroundColor:
                        location.pathname == "/doc" ? "white" : "#1F3461",
                      paddingBottom: "10px",
                    }}
                  >
                    <Link to="/doc">
                      <Button
                        disabled={!state.selected_profile.module_4}
                        type="link"
                        style={{
                          color:
                            location.pathname !== "/doc" ? "white" : "#1F3461",
                          textAlign: "left",
                        }}
                      >
                        {location.pathname === "/doc" && <ArrowRightOutlined />}{" "}
                        Documentación y <br />
                        respaldo
                      </Button>
                    </Link>
                  </Col>
                  <Col
                    span={24}
                    style={{
                      backgroundColor:
                        location.pathname == "/alert" ? "white" : "#1F3461",
                    }}
                  >
                    <Link to="/alert">
                      <Button
                        disabled={!state.selected_profile.module_4}
                        type="link"
                        style={{
                          color:
                            location.pathname !== "/alert"
                              ? "white"
                              : "#1F3461",
                          textAlign: "left",
                        }}
                      >
                        {location.pathname === "/alert" && (
                          <ArrowRightOutlined />
                        )}{" "}
                        Alertas
                      </Button>
                    </Link>
                  </Col>
                </>
              )}
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
                        Si surge cualquier inconveniente con el funcionamiento
                        de la plataforma, no dudes en escribirnos directamente
                        a: <br />
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
                borderRadius: "0px",
                color:
                  location.pathname !== "/docrespaldo" ? "#1F3461" : "white",
              }}
            >
              {location.pathname === "/docrespaldo" && <ArrowRightOutlined />}
              Soporte
            </Button>
          </Col>

          <Col span={24}>
            <center>
              <img src={minLogo} width={"130px"} />
            </center>
          </Col>
        </Row>
      </Row>
    </Affix>
  );
};

export default SiderRight;
