import { Button, Flex, Affix, Modal, Row, Col, Typography } from "antd";
import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../../App";
import {
  OneToOneOutlined,
  DatabaseOutlined,
  CloudDownloadOutlined,
} from "@ant-design/icons";
import logo from "../../assets/images/logozivo.png";
import logo_dga from "../../assets/images/channels4_profile.jpg";
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
          <Flex
            vertical
            style={{
              minHeight: "100vh",
            }}
            justify="space-between"
            align="center"
          >
            <Flex
              vertical
              gap="large"
              style={{ marginTop: "10px" }}
              justify="center"
              align="center"
            >
              <Flex vertical style={{ marginBottom: "10px" }}>
                <img
                  src={logo}
                  width="50px"
                  alt="logo"
                  style={{ marginLeft: "10px" }}
                />{" "}
                <span style={{ color: "white", fontSize: "20px" }}>
                  Ikolu App
                </span>
              </Flex>
              <Flex vertical justify="center" align="center" gap="small">
                <Button
                  shape="round"
                  type={location.pathname === "/" ? "primary" : "default"}
                  block
                  onClick={() => {
                    navigate("/");
                  }}
                  children={
                    <Flex
                      justify="space-between"
                      align="center"
                      style={{ width: "100%" }}
                    >
                      {state.selected_profile.profile_ikolu.entry_by_form ? (
                        <>
                          <OneToOneOutlined style={{ marginRight: "10px" }} />
                          Formulario
                        </>
                      ) : (
                        <>
                          <OneToOneOutlined style={{ marginRight: "10px" }} />
                          Telemetría
                        </>
                      )}
                    </Flex>
                  }
                />

                {state.user.username === "arrocerospti" && (
                  <Button
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
                  <>
                    {state.selected_profile.dga.code_dga && (
                      <Button
                        block
                        shape="round"
                        type={
                          location.pathname === "/dga" ? "primary" : "default"
                        }
                        onClick={() => navigate("/dga")}
                      >
                        <Flex
                          justify="space-between"
                          align="center"
                          style={{ width: "100%" }}
                        >
                          {" "}
                          <Flex>
                            <div
                              style={{
                                backgroundColor: "#006FB3",
                                width: "20px",
                                height: "10px",
                                borderRadius: "3px 0px 0px 3px",
                              }}
                            ></div>
                            <div
                              style={{
                                backgroundColor: "#FE6565",
                                width: "20px",
                                height: "10px",
                                borderRadius: "0px 3px 3px 0px",
                              }}
                            ></div>
                          </Flex>
                          DGA
                        </Flex>
                      </Button>
                    )}
                    <Button
                      block
                      shape="round"
                      type={
                        location.pathname === "/extraction_data"
                          ? "primary"
                          : "default"
                      }
                      onClick={() => navigate("/extraction_data")}
                    >
                      <Flex
                        justify="space-between"
                        align="center"
                        style={{ width: "100%" }}
                      >
                        {" "}
                        <CloudDownloadOutlined
                          style={{ marginRight: "10px" }}
                        />
                        Reportes
                      </Flex>
                    </Button>
                  </>
                ) : (
                  ""
                )}
              </Flex>
            </Flex>

            <Flex
              vertical
              justify="center"
              align="center"
              style={{
                marginBottom: "10px",
              }}
            >
              <img src={minLogo} width={"100%"} alt="logo" />
            </Flex>
          </Flex>
        </Affix>
      </div>
    </QueueAnim>
  );
};

export default SiderLeft;
