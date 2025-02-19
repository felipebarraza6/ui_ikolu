import { Button, Card, Affix, Modal, Row, Col, Typography } from "antd";
import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../../App";
import {
  OneToOneOutlined,
  DatabaseOutlined,
  CloudDownloadOutlined,
} from "@ant-design/icons";
import logo from "../../assets/images/logozivo.png";
import minLogo from "../../assets/images/logo-blanco.png";
import QueueAnim from "rc-queue-anim";
const { Title } = Typography;

const SiderLeft = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { state } = useContext(AppContext);

  return (
    <QueueAnim delay={200} duration={900} type="left">
      <div key="left">
        <Affix offsetTop={0}>
          <Row>
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

              <Col span={24} style={{ minHeight: "300px", padding: "10px" }}>
                <Row align={"top"} gutter={[0, 10]}>
                  <Button
                    icon={<OneToOneOutlined />}
                    type={location.pathname == "/" ? "primary" : "default"}
                    onClick={() => {
                      navigate("/");
                    }}
                    style={{ textAlign: "left" }}
                    block
                    children={
                      state.selected_profile.profile_ikolu.entry_by_form
                        ? "Formulario"
                        : "Telemetría"
                    }
                  ></Button>
                  {state.selected_profile.profile_ikolu.standard && (
                    <Button
                      block
                      type={location.pathname == "/dga" ? "primary" : "default"}
                      onClick={() => navigate("/dga")}
                      icon={<DatabaseOutlined />}
                    >
                      DGA
                    </Button>
                  )}
                  {state.user.username === "arrocerospti" && (
                    <Button
                      block
                      type={
                        location.pathname === "/registers_pti"
                          ? "primary"
                          : "default"
                      }
                      onClick={() => navigate("/registers_pti")}
                      icon={<DatabaseOutlined />}
                    >
                      Registros
                    </Button>
                  )}

                  {state.user.username !== "arrocerospti" &&
                  state.user.username !== "lecheriavalleverde" ? (
                    <Button
                      icon={<CloudDownloadOutlined />}
                      block
                      type={
                        location.pathname === "/extraction_data"
                          ? "primary"
                          : "default"
                      }
                      onClick={() => navigate("/extraction_data")}
                    >
                      Reportes
                    </Button>
                  ) : (
                    ""
                  )}
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
