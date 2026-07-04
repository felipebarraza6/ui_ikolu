import React from "react";
import { Layout, Menu, Drawer } from "antd";
import { DashboardOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useIkoluToken } from "../../hooks/useIkoluToken";
import { ADMIN_MENU } from "../admin/constants/adminMenu";
import VoidCubeLogo from "../auth/components/VoidCubeLogo";

const { Sider } = Layout;

const AppLogo = ({ collapsed }) => {
  const size = collapsed ? 36 : 50;
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <VoidCubeLogo size={size} brightness={1.45} glowSize={0.6} />
    </div>
  );
};

/**
 * Convierte la definición plana de ADMIN_MENU en items compatibles con Ant Menu.
 * Cada entry puede tener `icon` como componente React (ya instanciado) o como
 * constructor de icono; aquí lo instanciamos para que renderice correctamente.
 */
const mapMenuItem = (item) => ({
  key: item.key,
  icon: item.icon ? <item.icon /> : null,
  label: item.label,
  children: item.children ? item.children.map(mapMenuItem) : undefined,
});

const buildMenuItems = (isAdmin) => [
  {
    key: "/control-center/telemetry",
    icon: <DashboardOutlined />,
    label: "Centro de Control",
  },
  ...(isAdmin ? ADMIN_MENU.map(mapMenuItem) : []),
];

const SidebarContent = ({ collapsed, onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useIkoluToken();
  const { isAdmin } = useAuth();
  const menuItems = buildMenuItems(isAdmin);

  const handleClick = (e) => {
    navigate(e.key);
    if (onMenuClick) onMenuClick();
  };

  return (
    <div
      style={{
        background: token.colorHeaderBg,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <div
        style={{
          height: 58,
          minHeight: 58,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: collapsed ? 0 : 10,
          borderBottom: `1px solid ${token.colorHeaderBorder}`,
          padding: "6px 16px",
          flexShrink: 0,
        }}
      >
        <AppLogo collapsed={collapsed} />
        {!collapsed && (
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span
              style={{
                display: "block",
                color: "#f2f5fa",
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "1px",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              Ikolu
            </span>
            <span
              style={{
                display: "block",
                color: "#f2f5fa",
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                textShadow: "0 0 12px rgba(255,255,255,0.18)",
                lineHeight: 1,
                marginTop: 2,
              }}
            >
              Void
            </span>
          </div>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={isAdmin ? ["/admin/alerts", "/admin/support"] : []}
        items={menuItems}
        onClick={handleClick}
        style={{
          background: "transparent",
          borderRight: "none",
          marginTop: 16,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          padding: "16px",
          borderTop: `1px solid ${token.colorHeaderBorder}`,
          textAlign: "center",
        }}
      >
        <div style={{ opacity: 0.4, display: "inline-flex" }}>
          <VoidCubeLogo size={24} />
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ collapsed, setCollapsed, isMobile, mobileOpen, setMobileOpen }) => {
  const token = useIkoluToken();

  if (isMobile) {
    return (
      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        width={280}
        closable={false}
        styles={{ body: { padding: 0 } }}
        style={{ background: token.colorHeaderBg }}
      >
        <SidebarContent collapsed={false} onMenuClick={() => setMobileOpen(false)} />
      </Drawer>
    );
  }

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      theme="dark"
      style={{
        background: token.colorHeaderBg,
        borderRight: `1px solid ${token.colorHeaderBorder}`,
      }}
      width={240}
    >
      <SidebarContent collapsed={collapsed} />
    </Sider>
  );
};

export default Sidebar;
