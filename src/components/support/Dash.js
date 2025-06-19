import React, { useState, useEffect, useContext } from "react";
import { Menu, Flex, Card, Tag, Alert, Row, Col, Button } from "antd";
import FormSupport from "./FormSupport";
import TableSupport from "./TableSupport";
import { PlusCircleFilled, OrderedListOutlined } from "@ant-design/icons";
import ActiveTickets from "./ActiveTickets";
import sh from "../../api/sh/endpoints";
import { AppContext } from "../../App";

const Dash = () => {
  const { state } = useContext(AppContext);
  const [update, setUpdate] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const selected_id = state.selected_profile.id;
  const [selectedMenu, setSelectedMenu] = useState("1");
  const [pageActive, setPageActve] = useState(1);
  const [pageOld, setPageOld] = useState(1);
  const [tickets, setTickets] = useState([]);
  const [ticketsActives, setTicketsActives] = useState([]);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getTickets = async () => {
    const rq = await sh.notifications
      .get(selected_id, pageOld, "SUPPORT")
      .then((res) => {
        setTickets(res.results);
      });
  };

  const getActiveTickets = async () => {
    const rq = await sh.notifications
      .actives(selected_id, pageActive, "SUPPORT")
      .then((res) => {
        setTicketsActives(res.results);
      });
  };

  const handleMenuClick = (e) => {
    setSelectedMenu(e.key);
  };

  useEffect(() => {
    getActiveTickets();
    getTickets();
  }, [update]);

  return (
    <div
      style={{
        minHeight: "90vh",
        padding: isMobile ? "10px" : "20px",
      }}
    >
      {/* Header con navegación */}
      <div
        style={{
          marginBottom: "20px",
          backgroundColor: "#1F3461",
          borderRadius: "10px",
          padding: isMobile ? "10px" : "15px",
        }}
      >
        {isMobile ? (
          <Row gutter={8}>
            <Col span={12}>
              <Button
                type={selectedMenu === "1" ? "primary" : "default"}
                icon={<PlusCircleFilled />}
                onClick={() => setSelectedMenu("1")}
                style={{
                  width: "100%",
                  backgroundColor:
                    selectedMenu === "1" ? "#FF6B35" : "transparent",
                  borderColor: selectedMenu === "1" ? "#FF6B35" : "white",
                  color: selectedMenu === "1" ? "white" : "white",
                }}
                size="small"
              >
                Nuevo
              </Button>
            </Col>
            <Col span={12}>
              <Button
                type={selectedMenu === "2" ? "primary" : "default"}
                icon={<OrderedListOutlined />}
                onClick={() => setSelectedMenu("2")}
                style={{
                  width: "100%",
                  backgroundColor:
                    selectedMenu === "2" ? "#FF6B35" : "transparent",
                  borderColor: selectedMenu === "2" ? "#FF6B35" : "white",
                  color: selectedMenu === "2" ? "white" : "white",
                }}
                size="small"
              >
                Historial
              </Button>
            </Col>
          </Row>
        ) : (
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[selectedMenu]}
            style={{
              backgroundColor: "transparent",
              borderBottom: "none",
            }}
            onClick={handleMenuClick}
          >
            <Menu.Item
              icon={<PlusCircleFilled />}
              key="1"
              style={{
                backgroundColor:
                  selectedMenu === "1" ? "#FF6B35" : "transparent",
                borderRadius: "6px",
                margin: "0 5px",
              }}
            >
              Nuevo Ticket
            </Menu.Item>
            <Menu.Item
              key="2"
              icon={<OrderedListOutlined />}
              style={{
                backgroundColor:
                  selectedMenu === "2" ? "#FF6B35" : "transparent",
                borderRadius: "6px",
                margin: "0 5px",
              }}
            >
              Tickets Completados
            </Menu.Item>
          </Menu>
        )}
      </div>

      {/* Contenido principal */}
      {selectedMenu === "1" ? (
        <Row gutter={[16, 16]}>
          {/* Formulario de crear ticket */}
          <Col xs={24} sm={24} md={10} lg={8} xl={8}>
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "10px",
                padding: isMobile ? "16px" : "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                height: "fit-content",
              }}
            >
              <div
                style={{
                  marginBottom: "16px",
                  borderBottom: "2px solid #FF6B35",
                  paddingBottom: "12px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    color: "#1F3461",
                    fontSize: isMobile ? "16px" : "18px",
                    fontWeight: "600",
                  }}
                >
                  Crear Ticket
                </h3>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    color: "#666",
                    fontSize: "14px",
                  }}
                >
                  soporte@smarthydro.cl
                </p>
              </div>

              <Alert
                description="Nuestro equipo evaluará su caso en menos de 24 horas para planificar una solución."
                type="info"
                showIcon
                style={{
                  marginBottom: "16px",
                  borderColor: "#FF6B35",
                  backgroundColor: "#FFF8F0",
                }}
              />

              <FormSupport update={update} setUpdate={setUpdate} />
            </div>
          </Col>

          {/* Tickets activos */}
          <Col xs={24} sm={24} md={14} lg={16} xl={16}>
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "10px",
                padding: isMobile ? "16px" : "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  marginBottom: "16px",
                  borderBottom: "2px solid #1F3461",
                  paddingBottom: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    color: "#1F3461",
                    fontSize: isMobile ? "16px" : "18px",
                    fontWeight: "600",
                  }}
                >
                  Tickets Activos
                </h3>
                <Tag color="#FF6B35" style={{ fontWeight: "500" }}>
                  {ticketsActives.length} activos
                </Tag>
              </div>

              <ActiveTickets data={ticketsActives} />
            </div>
          </Col>
        </Row>
      ) : (
        <Row>
          <Col span={24}>
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "10px",
                padding: isMobile ? "16px" : "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  marginBottom: "16px",
                  borderBottom: "2px solid #1F3461",
                  paddingBottom: "12px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    color: "#1F3461",
                    fontSize: isMobile ? "16px" : "18px",
                    fontWeight: "600",
                  }}
                >
                  Historial de Tickets
                </h3>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    color: "#666",
                    fontSize: "14px",
                  }}
                >
                  En esta sección visualizará los tickets completados y su
                  historial
                </p>
              </div>

              <TableSupport data={tickets} />
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Dash;
