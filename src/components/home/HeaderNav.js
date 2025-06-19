import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../App";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LogoutOutlined,
  WifiOutlined,
  ArrowLeftOutlined,
  MenuOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Typography, Button, Popconfirm, Flex, Drawer, Menu } from "antd";
import ListWells from "./ListWells";
import logo from "../../assets/images/logozivo.png";
import logoBlanco from "../../assets/images/SmartHydro-Logo.png";
import { Link } from "react-router-dom";
import {
  BarChartOutlined,
  FileTextOutlined,
  AlertOutlined,
  CustomerServiceOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const HeaderNav = () => {
  const { state, dispatch } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;

  // 📱 Detectar si es móvil
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile) {
    // 📱 HEADER MÓVIL: Fondo azul, solo select y logout
    return (
      <>
        <div
          style={{
            background: "#1F3461",
            padding: "16px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: "70px",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          {/* Burger menu + Logo */}
          <Flex vertical={isMobile} align="start">
            <img src={logo} alt="Logo" style={{ width: "35px" }} />
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
              style={{
                color: "white",
                height: "32px",
                marginLeft: "3px",
              }}
            />
          </Flex>

          {/* Select centrado */}
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              margin: "0 12px",
            }}
          >
            {pathname === "/formmultidata" ? (
              <Button
                icon={<ArrowLeftOutlined />}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "white",
                }}
                onClick={() => navigate("/")}
              >
                Volver
              </Button>
            ) : (
              <div style={{ width: "100%" }}>
                <ListWells />
              </div>
            )}
          </div>

          {/* Solo logout */}
          <Popconfirm
            cancelText="Volver"
            okText="SALIR"
            title="¿Estás seguro de querer cerrar la sesión?"
            onConfirm={() => {
              dispatch({ type: "LOGOUT" });
              window.location.assign("/");
            }}
          >
            <LogoutOutlined
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "white",
                fontSize: "16px",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "50%",
                padding: "8px",
                cursor: "pointer",
              }}
            />
          </Popconfirm>
        </div>

        {/* 📧 CAJA DE USUARIO MÓVIL - Debajo del header fijo */}
        <div
          style={{
            position: "fixed",
            top: "70px",
            left: "10px",
            right: "10px",
            zIndex: 999,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: "8px",
            padding: "8px 12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "1px solid rgba(31, 52, 97, 0.2)",
          }}
        >
          <Flex align="center" gap="small">
            <UserOutlined
              style={{
                color: "#1F3461",
                fontSize: "14px",
                backgroundColor: "#F0F2F5",
                padding: "4px",
                borderRadius: "50%",
              }}
            />
            <span
              style={{
                color: "#1F3461",
                fontSize: "12px",
                fontWeight: "500",
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {state.user && state.user.email
                ? state.user.email
                : "Usuario no identificado"}
            </span>
            <div
              style={{
                backgroundColor: "#52C41A",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                flexShrink: 0,
              }}
            />
          </Flex>
        </div>

        {/* 📱 DRAWER NAVEGACIÓN MÓVIL */}
        <Drawer
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src={logo} alt="Logo" style={{ height: 24 }} />
              <span style={{ color: "#1f3461", fontWeight: "bold" }}>
                Ikolu App
              </span>
            </div>
          }
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={280}
          height="100vh"
          bodyStyle={{
            padding: 0,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
          }}
        >
          {/* Área del menú - Flex: 1 para ocupar espacio disponible */}
          <div
            style={{
              flex: 1,
              padding: "20px 24px 0px 24px",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
          >
            <Menu
              mode="vertical"
              style={{
                border: "none",
                backgroundColor: "transparent",
              }}
              onClick={() => setDrawerVisible(false)}
            >
              <Menu.Item
                key="1"
                icon={<WifiOutlined />}
                style={{
                  margin: "8px 0",
                  borderRadius: "8px",
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Link to="/">Telemetría</Link>
              </Menu.Item>
              <Menu.Item
                key="2"
                icon={<BarChartOutlined />}
                style={{
                  margin: "8px 0",
                  borderRadius: "8px",
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Link to="/analisis">Smart Análisis</Link>
              </Menu.Item>
              <Menu.Item
                key="3"
                icon={<FileTextOutlined />}
                style={{
                  margin: "8px 0",
                  borderRadius: "8px",
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Link to="/dga">DGA - MEE</Link>
              </Menu.Item>
              <Menu.Item
                key="4"
                icon={<BarChartOutlined />}
                style={{
                  margin: "8px 0",
                  borderRadius: "8px",
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Link to="/dga-analisis">DGA Análisis</Link>
              </Menu.Item>
              <Menu.Item
                key="5"
                icon={<DownloadOutlined />}
                style={{
                  margin: "8px 0",
                  borderRadius: "8px",
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Link to="/descarga">Descarga</Link>
              </Menu.Item>
              <Menu.Item
                key="6"
                icon={<FileTextOutlined />}
                style={{
                  margin: "8px 0",
                  borderRadius: "8px",
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Link to="/documentos">Documentos</Link>
              </Menu.Item>
              <Menu.Item
                key="7"
                icon={<AlertOutlined />}
                style={{
                  margin: "8px 0",
                  borderRadius: "8px",
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Link to="/alertas">Alertas</Link>
              </Menu.Item>
              <Menu.Item
                key="8"
                icon={<CustomerServiceOutlined />}
                style={{
                  margin: "8px 0",
                  borderRadius: "8px",
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Link to="/soporte">Soporte</Link>
              </Menu.Item>
            </Menu>
          </div>

          {/* Footer fijo con logo Smart Hydro - Siempre visible */}
          <div
            style={{
              flexShrink: 0,
              padding: "25px 24px 35px 24px",
              borderTop: "2px solid #e8e8e8",
              textAlign: "center",
              backgroundColor: "#f8f9fa",
            }}
          >
            <img
              src={logoBlanco}
              alt="Smart Hydro"
              style={{
                maxWidth: "140px",
                height: "auto",
                opacity: 0.85,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              }}
            />
          </div>
        </Drawer>
      </>
    );
  }

  // 💻 HEADER DESKTOP: Mantener como estaba
  return (
    <Flex align="center" justify="space-between" style={{ width: "100%" }}>
      <Title level={3} style={{ color: "#1F3461", margin: 0 }}>
        {state.user && state.user.first_name
          ? state.user.first_name.toUpperCase()
          : ""}
      </Title>

      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        {pathname === "/formmultidata" ? (
          <Button
            icon={<ArrowLeftOutlined />}
            style={{ marginTop: "10px" }}
            onClick={() => navigate("/")}
          >
            Volver a telemetría
          </Button>
        ) : (
          <ListWells />
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          style={{ marginRight: "15px", fontSize: "14px", fontWeight: "700" }}
        >
          {state.user.email}
        </span>
        <Popconfirm
          cancelText="Volver"
          okText="SALIR"
          title="¿Estás seguro de querer cerrar la sesión?"
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
      </div>
    </Flex>
  );
};

export default HeaderNav;
