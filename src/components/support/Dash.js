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
        maxWidth: "1600px",
        margin: "24px auto",
        padding: isMobile ? "10px" : "24px",
        backgroundColor: "#f5f5f5",
        minHeight: "90vh",
      }}
    >
      {/* Header del módulo */}
      <div
        style={{
          marginBottom: "24px",
          borderRadius: "12px",
          background: "#1F3461",
          border: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          padding: isMobile ? "16px" : "24px",
        }}
      >
        <Flex align="center" gap="middle" style={{ marginBottom: "16px" }}>
          <PlusCircleFilled style={{ fontSize: 32, color: "white" }} />
          <h2
            style={{
              margin: 0,
              color: "white",
              fontSize: "24px",
              fontWeight: "600",
            }}
          >
            Centro de Soporte
          </h2>
        </Flex>

        {/* Navegación */}
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
                    selectedMenu === "1" ? "#40a9ff" : "rgba(255,255,255,0.1)",
                  borderColor:
                    selectedMenu === "1" ? "#40a9ff" : "rgba(255,255,255,0.3)",
                  color: "white",
                  borderRadius: "8px",
                  fontWeight: "500",
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
                    selectedMenu === "2" ? "#40a9ff" : "rgba(255,255,255,0.1)",
                  borderColor:
                    selectedMenu === "2" ? "#40a9ff" : "rgba(255,255,255,0.3)",
                  color: "white",
                  borderRadius: "8px",
                  fontWeight: "500",
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
                  selectedMenu === "1" ? "#40a9ff" : "rgba(255,255,255,0.1)",
                borderRadius: "8px",
                margin: "0 8px",
                color: "white",
                fontWeight: "500",
              }}
            >
              Nuevo Ticket
            </Menu.Item>
            <Menu.Item
              key="2"
              icon={<OrderedListOutlined />}
              style={{
                backgroundColor:
                  selectedMenu === "2" ? "#40a9ff" : "rgba(255,255,255,0.1)",
                borderRadius: "8px",
                margin: "0 8px",
                color: "white",
                fontWeight: "500",
              }}
            >
              Tickets Completados
            </Menu.Item>
          </Menu>
        )}
      </div>

      {/* Contenido principal */}
      {selectedMenu === "1" ? (
        <Row gutter={[24, 24]}>
          {/* Formulario de crear ticket */}
          <Col xs={24} sm={24} md={10} lg={8} xl={8}>
            <Card
              style={{
                borderRadius: "12px",
                background: "white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                border: "none",
                height: "fit-content",
              }}
              bodyStyle={{ padding: isMobile ? "20px" : "24px" }}
            >
              <div
                style={{
                  marginBottom: "20px",
                  borderBottom: "3px solid #FF6B35",
                  paddingBottom: "16px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    color: "#1F3461",
                    fontSize: isMobile ? "18px" : "20px",
                    fontWeight: "600",
                  }}
                >
                  Crear Ticket
                </h3>
                <p
                  style={{
                    margin: "8px 0 0 0",
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
                  marginBottom: "20px",
                  borderColor: "#FF6B35",
                  backgroundColor: "#FFF8F0",
                  borderRadius: "8px",
                }}
              />

              <FormSupport update={update} setUpdate={setUpdate} />
            </Card>
          </Col>

          {/* Tickets activos */}
          <Col xs={24} sm={24} md={14} lg={16} xl={16}>
            <Card
              style={{
                borderRadius: "12px",
                background: "white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                border: "none",
              }}
              bodyStyle={{ padding: isMobile ? "20px" : "24px" }}
            >
              <div
                style={{
                  marginBottom: "20px",
                  borderBottom: "3px solid #1F3461",
                  paddingBottom: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    color: "#1F3461",
                    fontSize: isMobile ? "18px" : "20px",
                    fontWeight: "600",
                  }}
                >
                  Tickets Activos
                </h3>
                <Tag
                  color="#FF6B35"
                  style={{
                    fontWeight: "600",
                    fontSize: "14px",
                    padding: "6px 16px",
                    borderRadius: "8px",
                  }}
                >
                  {ticketsActives.length} activos
                </Tag>
              </div>

              <ActiveTickets data={ticketsActives} />
            </Card>
          </Col>
        </Row>
      ) : (
        <Row>
          <Col span={24}>
            <Card
              style={{
                borderRadius: "12px",
                background: "white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                border: "none",
              }}
              bodyStyle={{ padding: isMobile ? "20px" : "24px" }}
            >
              <div
                style={{
                  marginBottom: "20px",
                  borderBottom: "3px solid #1F3461",
                  paddingBottom: "16px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    color: "#1F3461",
                    fontSize: isMobile ? "18px" : "20px",
                    fontWeight: "600",
                  }}
                >
                  Historial de Tickets
                </h3>
                <p
                  style={{
                    margin: "8px 0 0 0",
                    color: "#666",
                    fontSize: "14px",
                  }}
                >
                  En esta sección visualizará los tickets completados y su
                  historial
                </p>
              </div>

              <TableSupport data={tickets} />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Dash;
