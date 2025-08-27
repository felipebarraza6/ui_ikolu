import { Flex, Typography, Button, Avatar, Breadcrumb, Modal } from "antd";
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useUserProfilesContext } from "../../contexts/UserProfilesContext";
import logo from "../../assets/images/logozivo.png";
import {
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

/**
 * 🧭 COMPONENTE HEADERNAV COMPLETO
 *
 * Logo + Breadcrumb + Usuario + Logout
 * El breadcrumb va en el header global como debe ser
 */
const HeaderNav = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { selectedProfile, loading: profilesLoading } =
    useUserProfilesContext();

  // Estado para el modal de confirmación de logout
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Debug logs para selectedProfile
  console.log("🔍 HeaderNav - selectedProfile:", selectedProfile);
  console.log("🔍 HeaderNav - profilesLoading:", profilesLoading);

  // Función para obtener el nombre del módulo
  const getModuleName = () => {
    const path = location.pathname;
    if (path === "/") return "Centro de Control";
    if (path === "/geo") return "GEO Smart";
    if (path === "/telemetria") return "Telemetría";
    if (path === "/analisis") return "Smart Análisis";
    if (path === "/dga") return "DGA - MEE";
    if (path === "/dga_analisis") return "DGA Análisis";
    if (path === "/descarga") return "Descarga";
    if (path === "/documentos") return "Documentos";
    if (path === "/alertas") return "Alertas";
    if (path === "/soporte") return "Soporte";
    if (path === "/registers_pti") return "Registros";
    return "Módulo";
  };

  // Función para mostrar modal de confirmación de logout
  const showLogoutModal = () => {
    setLogoutModalVisible(true);
  };

  // Función para confirmar logout
  const handleLogoutConfirm = () => {
    setLogoutModalVisible(false);
    logout();
    navigate("/login");
  };

  // Función para cancelar logout
  const handleLogoutCancel = () => {
    setLogoutModalVisible(false);
  };

  // Items del breadcrumb
  const breadcrumbItems = [
    {
      title: profilesLoading
        ? "Cargando..."
        : selectedProfile?.title || "Punto de Captación",
      path: "/",
      onClick: () => navigate("/"),
    },
    {
      title: getModuleName(),
    },
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "64px",
        background: "white",
        borderBottom: "1px solid #f0f0f0",
        zIndex: 1000,
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      {/* Logo y título */}
      <Flex align="center" gap="16px">
        <img
          src={logo}
          alt="Ikolu App"
          style={{ height: "32px", width: "auto" }}
        />
        <Title
          level={4}
          style={{ margin: 0, color: "#1F3461", fontWeight: "600" }}
        >
          Ikolu App
        </Title>
      </Flex>

      {/* BREADCRUMB EN EL CENTRO */}
      <Flex align="center" style={{ flex: 1, justifyContent: "center" }}>
        <Breadcrumb
          separator=">"
          style={{ fontSize: "16px", fontWeight: "500" }}
          items={breadcrumbItems}
        />
      </Flex>

      {/* Usuario y acciones */}
      <Flex align="center" gap="16px">
        {/* Botón de menú para móvil */}
        <Button
          type="text"
          icon={<SettingOutlined />}
          onClick={onMenuClick}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            border: "1px solid #d9d9d9",
          }}
        />

        {/* Usuario */}
        <Flex align="center" gap="8px">
          <Avatar
            icon={<UserOutlined />}
            style={{
              backgroundColor: "#1F3461",
              color: "white",
            }}
          />
          <span style={{ color: "#666", fontWeight: "500" }}>
            @{user?.username || "usuario"}
          </span>
        </Flex>

        {/* Botón de logout */}
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={showLogoutModal}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            border: "1px solid #d9d9d9",
          }}
        />
      </Flex>

      {/* Modal de confirmación de logout */}
      <Modal
        title="Cerrar Sesión"
        open={logoutModalVisible}
        onOk={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        okText="Sí, Cerrar Sesión"
        cancelText="Cancelar"
        okButtonProps={{
          danger: true,
          style: { backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" },
        }}
        cancelButtonProps={{
          style: { borderColor: "#d9d9d9" },
        }}
        centered
        width={400}
      >
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <LogoutOutlined
            style={{
              fontSize: "48px",
              color: "#ff4d4f",
              marginBottom: "16px",
            }}
          />
          <p style={{ fontSize: "16px", margin: "8px 0", color: "#666" }}>
            ¿Estás seguro de que quieres cerrar tu sesión?
          </p>
          <p style={{ fontSize: "14px", margin: "8px 0", color: "#999" }}>
            Serás redirigido a la página de inicio de sesión.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default HeaderNav;
