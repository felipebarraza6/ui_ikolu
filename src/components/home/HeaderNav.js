import React, { useContext } from "react";
import { Row, Col, Typography, Button, Popconfirm, Affix } from "antd";
import wallpaper from "../../assets/images/wallssr.png";
import { useLocation, Link } from "react-router-dom";
import { AppContext } from "../../App";
import { LogoutOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import ListWells from "./ListWells";
import QueueAnim from "rc-queue-anim";

const { Title } = Typography;

const HeaderNav = () => {
  const location = useLocation();
  const { state, dispatch } = useContext(AppContext);

  return (
    <QueueAnim delay={100} duration={900} type="top">
      <div key="login">
        <Affix>
          <Row
            align={"middle"}
            justify={window.innerWidth > 900 ? "start" : "space-evenly"}
            style={{
              backgroundImage: `url(${wallpaper})`,
              minHeight: window.innerWidth > 900 ? "100px" : "160px",
              /* Create the parallax 
        scrolling effect */
              backgroundAttachment: "fixed",
              backgroundPosition: "center bottom",
              backgroundColor: "rgb(255,255,255,0,0.7)",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
          >
            <Col
              xl={6}
              lg={3}
              xs={8}
              style={{
                paddingTop: "0px",
                paddingLeft: "4px",
              }}
            >
              <Title
                level={window.innerWidth > 900 ? 3 : 4}
                style={{ color: "white", marginLeft: "10px" }}
              >
                {" "}
                {state.user.first_name.toUpperCase()}{" "}
              </Title>
            </Col>
            <Col
              style={{
                paddingTop: "0px",
              }}
              xs={9}
              xl={9}
              lg={12}
            ></Col>
            <Col
              style={{ paddingTop: window.innerWidth < 900 && "30px" }}
              span={1}
              offset={window.innerWidth > 900 ? 8 : 0}
            >
              <Popconfirm
                cancelText="Volver"
                okButtonProps
                okText="SALIR"
                title="¿Estas seguro de querer cerrar la sesión?"
                onConfirm={() => {
                  dispatch({ type: "LOGOUT" });
                  window.location.assign("/");
                }}
              >
                <LogoutOutlined
                  style={{
                    backgroundColor: "rgb(31, 52, 97)",
                    color: "white",
                    fontSize: "15px",
                    border: "1px solid white",
                    borderRadius: "100%",
                    padding: "10px",
                  }}
                />
              </Popconfirm>
            </Col>
            {window.innerWidth < 900 && (
              <Col span={24}>
                <Row justify={"space-around"}>
                  <Col>
                    {state.selected_profile.module_1 && (
                      <Link to="/">
                        <Button
                          disabled={state.selected_profile.module1}
                          type="primary"
                          style={{
                            backgroundColor: "rgb(31, 52, 97)",
                            borderColor: location.pathname === "/" && "white",
                          }}
                        >
                          Mi Pozo
                        </Button>
                      </Link>
                    )}
                  </Col>
                  <Col>
                    {state.selected_profile.module_2 && (
                      <Link to="/dga">
                        <Button
                          type="primary"
                          style={{
                            backgroundColor: "rgb(31, 52, 97)",
                            borderColor:
                              location.pathname === "/dga" && "white",
                          }}
                        >
                          DGA
                        </Button>
                      </Link>
                    )}
                  </Col>
                  <Col>
                    {state.selected_profile.module_3 && (
                      <Link to="/reportes">
                        <Button
                          type="primary"
                          style={{
                            backgroundColor: "rgb(31, 52, 97)",
                            borderColor:
                              location.pathname === "/reportes" && "white",
                          }}
                        >
                          Reportes
                        </Button>
                      </Link>
                    )}
                  </Col>
                  <Col>
                    {state.selected_profile.module_4 && (
                      <Link to="/graficos">
                        <Button
                          type="primary"
                          style={{
                            backgroundColor: "rgb(31, 52, 97)",
                            borderColor:
                              location.pathname === "/graficos" && "white",
                          }}
                        >
                          Gráficos
                        </Button>
                      </Link>
                    )}
                  </Col>
                </Row>
              </Col>
            )}
          </Row>
        </Affix>
      </div>
    </QueueAnim>
  );
};

export default HeaderNav;
