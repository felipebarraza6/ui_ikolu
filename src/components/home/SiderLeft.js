import { Button, Card, Affix, Modal, Row, Col } from "antd";
import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppContext } from "../../App";
import {
  ArrowRightOutlined,
  MessageOutlined,
  OrderedListOutlined,
  DatabaseFilled,
} from "@ant-design/icons";
import logo from "../../assets/images/logozivo.png";
import minLogo from "../../assets/images/logo-blanco.png";
import QueueAnim from "rc-queue-anim";

const SiderRight = () => {
  const location = useLocation();

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
                  <img src={logo} width="50px" style={{ marginTop: "10px" }} />
                  <br />
                  <span style={{ color: "white", fontSize: "20px" }}>
                    Ikolu App
                  </span>
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
                    <Button
                      type="link"
                      style={{
                        color:
                          location.pathname == "/supp" ? "black" : "#1F3461",
                        backgroundColor: "white",
                        paddingLeft: "10px",
                        borderRadius: "0px",
                        paddingRight: "10px",
                      }}
                      block
                      icon={<DatabaseFilled />}
                    >
                      Telemetría
                    </Button>
                  </Col>
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
                  <span style={{ color: "white" }}>Un producto de:</span>
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
