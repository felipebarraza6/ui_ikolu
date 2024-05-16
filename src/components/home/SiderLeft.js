import { Button, Card, Affix, Modal } from "antd";
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
      <Card
        style={{
          backgroundColor: "#1F3461",
          borderRadius: "20px",
          minHeight: "85vh",
        }}
      >
        <center>
          <img src={logo} width="50px" style={{ marginBottom: "40px" }} />
        </center>
        <div
          style={{
            textAlign: "center",
            backgroundColor: "white",
            marginLeft: "-24px",
            marginRight: "-24px",
            marginBottom: "15px",
            backgroundColor: location.pathname == "/" ? "#1F3461" : "white",
          }}
        >
          <Link to="/">
            <Button
              type="link"
              style={{ color: location.pathname !== "/" ? "#1F3461" : "white" }}
              prefix={<>a</>}
            >
              {location.pathname === "/" && <ArrowRightOutlined />} Mi Pozo
            </Button>
          </Link>
        </div>
        {state.selected_profile.module_2 && (
          <div
            style={{
              textAlign: "center",
              backgroundColor: "white",
              marginLeft: "-24px",
              marginRight: "-24px",
              marginBottom: state.selected_profile.module_3 ? "15px" : "200px",
              backgroundColor:
                location.pathname == "/dga" ? "#1F3461" : "white",
            }}
          >
            <Link to="/dga">
              <Button
                disabled={!state.selected_profile.module_2}
                type="link"
                style={{
                  color: location.pathname !== "/dga" ? "#1F3461" : "white",
                }}
              >
                {location.pathname === "/dga" && <ArrowRightOutlined />} DGA
              </Button>
            </Link>
          </div>
        )}

        <>
          {state.selected_profile.module_3 && (
            <div
              style={{
                textAlign: "center",
                backgroundColor: "white",
                marginLeft: "-24px",
                marginRight: "-24px",
                marginBottom: state.selected_profile.module_4
                  ? "15px"
                  : "300px",
                backgroundColor:
                  location.pathname == "/reportes" ? "#1F3461" : "white",
              }}
            >
              <Link to="/reportes">
                <Button
                  disabled={!state.selected_profile.module_3}
                  type="link"
                  style={{
                    color:
                      location.pathname !== "/reportes" ? "#1F3461" : "white",
                  }}
                >
                  {location.pathname === "/reportes" && <ArrowRightOutlined />}{" "}
                  Datos y Reportes
                </Button>
              </Link>
            </div>
          )}
          {state.selected_profile.module_4 && (
            <div
              style={{
                textAlign: "center",
                backgroundColor: "white",
                marginLeft: "-24px",
                marginRight: "-24px",
                marginBottom: state.selected_profile.module_4
                  ? "15px"
                  : "200px",
                backgroundColor:
                  location.pathname == "/graficos" ? "#1F3461" : "white",
              }}
            >
              <Link to="/graficos">
                <Button
                  disabled={state.user.username == "gcastro" ? true : false}
                  type="link"
                  style={{
                    color:
                      location.pathname !== "/graficos" ? "#1F3461" : "white",
                  }}
                >
                  {location.pathname === "/graficos" && <ArrowRightOutlined />}{" "}
                  Gráficos
                </Button>
              </Link>
            </div>
          )}

          <div
            style={{
              textAlign: "center",
              marginLeft: "-24px",
              marginRight: "-24px",
              marginBottom: "220px",
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
          </div>
        </>

        <div style={{ marginTop: "50px" }}>
          <img src={minLogo} width={"130px"} />
        </div>
      </Card>
    </Affix>
  );
};

export default SiderRight;
