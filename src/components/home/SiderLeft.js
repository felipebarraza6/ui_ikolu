import { Button, Flex, Affix, Modal, Row, Col, Typography } from "antd";
import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../../App";
import {
  OneToOneOutlined,
  DatabaseOutlined,
  CloudDownloadOutlined,
  BarChartOutlined,
  FileDoneOutlined,
  AlertOutlined,
  AreaChartOutlined,
} from "@ant-design/icons";
import logo from "../../assets/images/logozivo.png";
import logo_dga from "../../assets/images/channels4_profile.jpg";
import minLogo from "../../assets/images/logo-blanco.png";
import QueueAnim from "rc-queue-anim";
import { BiSupport } from "react-icons/bi";
import { VscRadioTower } from "react-icons/vsc";

const { Title } = Typography;

const SiderLeft = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { state } = useContext(AppContext);

  return (
    <QueueAnim delay={200} duration={900} type="left">
      <div key="left">
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
                style={{
                  backgroundColor:
                    location.pathname === "/" ? "white" : "transparent",
                  color: location.pathname === "/" ? "#1f3461" : "white",
                  border: "none",
                }}
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
                        <OneToOneOutlined style={{ fontSize: "18px" }} />
                        Formulario
                      </>
                    ) : (
                      <>
                        <VscRadioTower style={{ fontSize: "18px" }} />
                        Telemetría
                      </>
                    )}
                  </Flex>
                }
              />

              {state.user.username === "arrocerospti" && (
                <Button
                  style={{
                    backgroundColor:
                      location.pathname === "/registers_pti"
                        ? "white"
                        : "transparent",
                    color:
                      location.pathname === "/registers_pti"
                        ? "#1f3461"
                        : "white",
                    border: "none",
                  }}
                  onClick={() => navigate("/registers_pti")}
                  icon={<DatabaseOutlined />}
                >
                  Registros
                </Button>
              )}

              {state.user.username !== "arrocerospti" &&
              state.user.username !== "lecheriavalleverde" ? (
                <>
                  <Button
                    block
                    style={{
                      backgroundColor:
                        location.pathname === "/sys_data"
                          ? "white"
                          : "transparent",
                      color:
                        location.pathname === "/sys_data" ? "#1f3461" : "white",
                      border: "none",
                    }}
                    onClick={() => navigate("/sys_data")}
                  >
                    <Flex
                      justify="space-between"
                      align="center"
                      gap={"small"}
                      style={{ width: "100%" }}
                    >
                      {" "}
                      <BarChartOutlined style={{ fontSize: "18px" }} />
                      Smart Análisis
                    </Flex>
                  </Button>
                  {state.selected_profile.dga.code_dga && (
                    <>
                      <Button
                        block
                        style={{
                          backgroundColor:
                            location.pathname === "/dga"
                              ? "white"
                              : "transparent",
                          color:
                            location.pathname === "/dga" ? "#1f3461" : "white",
                          border: "none",
                        }}
                        onClick={() => navigate("/dga")}
                      >
                        <Flex
                          justify="space-between"
                          align="center"
                          gap="small"
                          style={{ width: "100%" }}
                        >
                          {" "}
                          <Flex>
                            <div
                              style={{
                                backgroundColor: "#006FB3",
                                width: "15px",
                                height: "10px",
                                borderRadius: "3px 0px 0px 3px",
                              }}
                            ></div>
                            <div
                              style={{
                                backgroundColor: "#FE6565",
                                width: "15px",
                                height: "10px",
                                borderRadius: "0px 3px 3px 0px",
                              }}
                            ></div>
                          </Flex>
                          DGA - MEE
                        </Flex>
                      </Button>
                      <Button
                        block
                        style={{
                          backgroundColor:
                            location.pathname === "/sys_data_dga"
                              ? "white"
                              : "transparent",
                          color:
                            location.pathname === "/sys_data_dga"
                              ? "#1f3461"
                              : "white",
                          border: "none",
                        }}
                        onClick={() => navigate("/sys_data_dga")}
                      >
                        <Flex
                          justify="space-between"
                          align="center"
                          gap={"small"}
                          style={{ width: "100%" }}
                        >
                          {" "}
                          <AreaChartOutlined
                            style={{
                              fontSize: "18px",
                            }}
                          />
                          DGA Análisis
                        </Flex>
                      </Button>
                    </>
                  )}
                  <Button
                    block
                    style={{
                      height: "50px",
                      backgroundColor:
                        location.pathname === "/extraction_data"
                          ? "white"
                          : "transparent",
                      color:
                        location.pathname === "/extraction_data"
                          ? "#1f3461"
                          : "white",
                      border: "none",
                    }}
                    onClick={() => navigate("/extraction_data")}
                  >
                    <Flex
                      justify="space-between"
                      align="center"
                      style={{ width: "100%" }}
                    >
                      <CloudDownloadOutlined style={{ fontSize: "18px" }} />
                      Descarga
                    </Flex>
                  </Button>

                  <Button
                    block
                    style={{
                      backgroundColor:
                        location.pathname === "/sys_docs"
                          ? "white"
                          : "transparent",
                      color:
                        location.pathname === "/sys_docs" ? "#1f3461" : "white",
                      border: "none",
                    }}
                    onClick={() => navigate("/sys_docs")}
                  >
                    <Flex
                      justify="space-between"
                      align="center"
                      gap={"small"}
                      style={{ width: "100%" }}
                    >
                      {" "}
                      <FileDoneOutlined style={{ fontSize: "18px" }} />
                      Documentos
                    </Flex>
                  </Button>
                  <Button
                    block
                    style={{
                      backgroundColor:
                        location.pathname === "/sys_alerts"
                          ? "white"
                          : "transparent",
                      color:
                        location.pathname === "/sys_alerts"
                          ? "#1f3461"
                          : "white",
                      border: "none",
                    }}
                    onClick={() => navigate("/sys_alerts")}
                  >
                    <Flex
                      justify="space-between"
                      align="center"
                      gap={"small"}
                      style={{ width: "100%" }}
                    >
                      {" "}
                      <AlertOutlined style={{ fontSize: "18px" }} />
                      Alertas
                    </Flex>
                  </Button>
                  <Button
                    block
                    style={{
                      backgroundColor:
                        location.pathname === "/sys_support"
                          ? "white"
                          : "transparent",
                      color:
                        location.pathname === "/sys_support"
                          ? "#1f3461"
                          : "white",
                      border: "none",
                    }}
                    onClick={() => navigate("/sys_support")}
                  >
                    <Flex
                      justify="space-between"
                      align="center"
                      gap={"small"}
                      style={{ width: "100%" }}
                    >
                      {" "}
                      <BiSupport style={{ fontSize: "18px" }} />
                      Soporte
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
              marginTop: "210px",
            }}
          ></Flex>
        </Flex>
      </div>
    </QueueAnim>
  );
};

export default SiderLeft;
