import React, { useContext, useMemo, useState, useEffect } from "react";
import { AppContext } from "../../App";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LogoutOutlined,
  UserOutlined,
  BarChartOutlined,
  FileTextOutlined,
  AlertOutlined,
  CustomerServiceOutlined,
  DownloadOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  MenuOutlined,
  BellOutlined,
  WifiOutlined,
  RightOutlined,
  SettingOutlined,
  DesktopOutlined,
} from "@ant-design/icons";
import { Typography, Button, Popconfirm, Flex, Breadcrumb, Dropdown, Badge } from "antd";
import AlertPreview from "./AlertPreview";
import WellConfigDrawer from "../well/WellConfigDrawer";
import DgaConfigDrawer from "../well/DgaConfigDrawer";
import TourHelpButton from "../common/TourHelpButton";
import { useResponsive } from "../../hooks/useResponsive";
import sh from "../../api/sh/endpoints";
import logo from "../../assets/images/logozivo.png";

const { Text } = Typography;

// Estructura de menú con submenús
const MENU_ITEMS = [
  {
    key: "monitoreo",
    label: "Monitoreo",
    global: true,
    children: [
      { key: "0", label: "Centro de Control", to: "/" },
      { key: "1", label: "GEO Smart", to: "/geo" },
      { key: "2", label: "Telemetría", to: "/telemetry" },
    ],
  },
  {
    key: "analisis",
    label: "Análisis",
    children: [
      { key: "3", label: "Smart Análisis", to: "/analysis" },
      { key: "4", label: "DGA - MEE", to: "/dga" },
    ],
  },
  {
    key: "gestion",
    label: "Gestión",
    children: [
      { key: "5", label: "Descarga", to: "/download" },
      { key: "6", label: "Documentos", to: "/documents" },
      { key: "7", label: "Alertas", to: "/alerts" },
    ],
  },
  { key: "8", label: "Soporte", to: "/support" },
];

const flattenMenu = (items) => {
  const result = [];
  items.forEach((item) => {
    if (item.children) result.push(...item.children);
    else result.push(item);
  });
  return result;
};

const UserInfo = React.memo(({ state, onlyIcons, onClick }) => (
  <Flex
    align="center"
    gap="small"
    style={{ cursor: onClick ? "pointer" : "default" }}
    onClick={onClick}
  >
    <UserOutlined
      style={{
        color: "#1F3461",
        fontSize: "14px",
        backgroundColor: "#F0F2F5",
        padding: "4px",
        borderRadius: "50%",
      }}
    />
    {!onlyIcons && (
      <span style={{ color: "#1F3461", fontSize: "14px", fontWeight: "500" }}>
        @{state.user?.username || "Usuario"}
      </span>
    )}
  </Flex>
));

const HeaderNav = ({ onMenuClick }) => {
  const { state, dispatch } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const [alertCount, setAlertCount] = useState(0);
  const [wellDrawerOpen, setWellDrawerOpen] = useState(false);
  const [dgaDrawerOpen, setDgaDrawerOpen] = useState(false);


  useEffect(() => {
    const fetchAlerts = async () => {
      if (!state.selected_profile?.id) return;
      try {
        const res = await sh.notifications.actives(state.selected_profile.id, 1, "ALERT");
        setAlertCount(res.count || res.results?.length || 0);
      } catch (e) {
        // silent
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, [state.selected_profile?.id]);

  const moduleName = useMemo(() => {
    const currentPath = location.pathname;
    const flat = flattenMenu(MENU_ITEMS).sort((a, b) => b.to.length - a.to.length);
    const menuItem = flat.find(
      (item) => currentPath === item.to || currentPath.startsWith(item.to + "/")
    );
    return menuItem ? menuItem.label : "Módulo";
  }, [location.pathname]);

  // Detectar si es módulo global (no depende del punto seleccionado)
  const isGlobalModule = useMemo(() => {
    const globalPaths = ["/", "/geo"];
    return globalPaths.includes(location.pathname);
  }, [location.pathname]);

  // Determinar si mostrar tuerca de configuración según la ruta
  const configFor = useMemo(() => {
    if (location.pathname === "/telemetry") return "well";
    if (location.pathname === "/dga") return "dga";
    return null;
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
  };

  // Breadcrumb coherente con el estilo de la app
  const breadcrumbContent = isGlobalModule ? (
    <span style={{ fontWeight: 700, color: "#1F3461", fontSize: 15, letterSpacing: 0.3 }}>
      {moduleName}
    </span>
  ) : (
    <Flex align="center" gap={10}>
      <span
        style={{
          background: "#f0f2f5",
          color: "#595959",
          fontSize: 12,
          fontWeight: 600,
          padding: "4px 12px",
          borderRadius: 12,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          maxWidth: 200,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          display: "inline-block",
        }}
      >
        {state.selected_profile?.title || "Punto"}
      </span>
      <RightOutlined style={{ color: "#bfbfbf", fontSize: 10 }} />
      <span style={{ fontWeight: 700, color: "#1F3461", fontSize: 15, letterSpacing: 0.3 }}>
        {moduleName}
      </span>
    </Flex>
  );

  // Estilos para mobile
  const headerMobileStyle = isMobile
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 100,
        background: "#1F3461",
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
        padding: "0 0 0 0",
        minHeight: 56,
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }
    : {};

  const breadcrumbMobileStyle = isMobile
    ? {
        flex: 1,
        textAlign: "center",
        color: "white",
        fontSize: 14,
        fontWeight: 500,
        background: "transparent",
        padding: "0 8px",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
      }
    : {};

  const content = isMobile ? (
    <div style={headerMobileStyle}>
      <Button
        type="text"
        icon={<MenuOutlined style={{ color: "white", fontSize: 18 }} />}
        onClick={onMenuClick}
        style={{ marginLeft: 4, marginRight: 8 }}
      />
      <img src={logo} alt="Logo" style={{ height: 32, marginRight: 8 }} />
      {alertCount > 0 && (
        <Badge
          count={alertCount}
          size="small"
          style={{ background: "#FF6B35", marginRight: 8 }}
        />
      )}
      <div style={breadcrumbMobileStyle}>
        <span style={{ color: "white", opacity: 0.85 }}>{moduleName}</span>
      </div>
      <TourHelpButton />
      <Popconfirm
        cancelText="Volver"
        okText="SALIR"
        title="¿Estás seguro de querer cerrar la sesión?"
        onConfirm={handleLogout}
      >
        <Button
          type="text"
          icon={<LogoutOutlined style={{ color: "white", fontSize: 20 }} />}
          style={{ marginRight: 8 }}
        />
      </Popconfirm>
    </div>
  ) : (
    <Flex align="center" justify="space-between" style={{ height: "100%" }}>
      <Flex align="center" gap={10}>
        {/* ── Toggle Operacional / Técnico para admin/staff ── */}
        {(state.user?.is_staff || state.user?.is_superuser) && (location.pathname === "/" || location.pathname === "/admin") && (
          <Flex
            align="center"
            gap={2}
            style={{
              background: "#f5f7fa",
              borderRadius: 20,
              padding: "2px 4px",
              border: "1px solid #e8e8e8",
            }}
          >
            <Button
              type={state.adminView === "operacional" ? "primary" : "text"}
              size="small"
              icon={<BarChartOutlined />}
              onClick={() => dispatch({ type: "SET_ADMIN_VIEW", payload: { view: "operacional" } })}
              style={{
                borderRadius: 16,
                fontSize: 12,
                background: state.adminView === "operacional" ? "#1F3461" : "transparent",
                borderColor: state.adminView === "operacional" ? "#1F3461" : "transparent",
                color: state.adminView === "operacional" ? "#fff" : "#595959",
              }}
            >
              Operacional
            </Button>
            <Button
              type={state.adminView === "tecnico" ? "primary" : "text"}
              size="small"
              icon={<DesktopOutlined />}
              onClick={() => dispatch({ type: "SET_ADMIN_VIEW", payload: { view: "tecnico" } })}
              style={{
                borderRadius: 16,
                fontSize: 12,
                background: state.adminView === "tecnico" ? "#1F3461" : "transparent",
                borderColor: state.adminView === "tecnico" ? "#1F3461" : "transparent",
                color: state.adminView === "tecnico" ? "#fff" : "#595959",
              }}
            >
              Técnico
            </Button>
          </Flex>
        )}
        {breadcrumbContent}
        {configFor && (
          <Button
            type="text"
            icon={<SettingOutlined style={{ fontSize: 18, color: "#1F3461" }} />}
            onClick={() => {
              if (configFor === "well") setWellDrawerOpen(true);
              if (configFor === "dga") setDgaDrawerOpen(true);
            }}
            title={configFor === "well" ? "Configuración del punto" : "Configuración DGA"}
            className="config-btn-modern"
            style={{
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 10,
              background: "linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%)",
              border: "1px solid rgba(24, 144, 255, 0.15)",
              boxShadow: "0 2px 6px rgba(24, 144, 255, 0.08)",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.08)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(24, 144, 255, 0.2)";
              e.currentTarget.style.background = "linear-gradient(135deg, #e6f0ff 0%, #d6e4ff 100%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(24, 144, 255, 0.08)";
              e.currentTarget.style.background = "linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%)";
            }}
          />
        )}
      </Flex>

      {/* ── Barra de acciones con más presencia ── */}
      <Flex align="center" gap={12}>
        {/* Pill de acciones principales */}
        <Flex
          align="center"
          gap={2}
          style={{
            background: "#f5f7fa",
            borderRadius: 28,
            padding: "3px 6px",
            border: "1px solid #e8e8e8",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <AlertPreview />

          <TourHelpButton />

          <Dropdown
            menu={{
              items: [
                {
                  key: "profile",
                  icon: <UserOutlined />,
                  label: "Mi Perfil",
                  onClick: () => navigate("/profile"),
                },
                ...(state.user?.is_staff
                  ? [
                      {
                        key: "admin",
                        icon: <BarChartOutlined />,
                        label: "Administrador",
                        onClick: () => navigate("/admin"),
                      },
                    ]
                  : []),
                {
                  type: "divider",
                },
                {
                  key: "logout",
                  icon: <LogoutOutlined />,
                  label: "Cerrar Sesión",
                  onClick: handleLogout,
                  danger: true,
                },
              ],
            }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <div
              style={{
                cursor: "pointer",
                padding: "4px 10px 4px 6px",
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(31,52,97,0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "#1F3461",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UserOutlined style={{ color: "#fff", fontSize: 14 }} />
              </div>
              <span style={{ color: "#1F3461", fontSize: 13, fontWeight: 600 }}>
                {state.user?.username || "Usuario"}
              </span>
            </div>
          </Dropdown>
        </Flex>
      </Flex>
    </Flex>
  );

  return (
    <>
      {content}
      <WellConfigDrawer visible={wellDrawerOpen} onClose={() => setWellDrawerOpen(false)} />
      <DgaConfigDrawer visible={dgaDrawerOpen} onClose={() => setDgaDrawerOpen(false)} />
    </>
  );
};

export default HeaderNav;
