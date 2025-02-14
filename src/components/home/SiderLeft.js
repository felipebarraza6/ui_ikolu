import { Button, Card, Affix, Modal, Row, Col, Typography } from "antd";
import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../../App";
import {
  ArrowRightOutlined,
  MessageOutlined,
  OneToOneOutlined,
} from "@ant-design/icons";
import logo from "../../assets/images/logozivo.png";
import minLogo from "../../assets/images/logo-blanco.png";
import QueueAnim from "rc-queue-anim";
const { Title } = Typography;

const SiderLeft = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { state } = useContext(AppContext);
  console.log(state);

  return (
    <QueueAnim delay={200} duration={900} type="left">
      <div key="left">
        <Affix offsetTop={0}>
          <Row
            style={{
              minHeight: "100vh",
              paddingTop: "10px",
              zIndex: 99,
              position: "fixed",
              width: "100%",
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
                    alt="logo"
                  />

                  <br />
                  <span style={{ color: "white", fontSize: "20px" }}>
                    Ikolu App
                  </span>
                </center>
              </Col>

              <Col></Col>
              <Col span={24} style={{ minHeight: "300px", padding: "10px" }}>
                <Row align={"top"} gutter={[0, 10]}>
                  <Button
                    icon={<OneToOneOutlined />}
                    type={location.pathname == "/" ? "primary" : "default"}
                    onClick={() => {
                      navigate("/");
                    }}
                    style={{ textAlign: "left" }}
                    children={
                      state.selected_profile.profile_ikolu.entry_by_form
                        ? "Formulario"
                        : "Telemetría"
                    }
                    block
                  ></Button>
                </Row>
              </Col>

              <Col
                span={24}
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  padding: "10px",
                  height: "125px",
                }}
              >
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

export default SiderLeft;
