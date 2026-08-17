import React, { useState } from "react";
import { Menu, Drawer } from "antd";
import { DashboardOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useIkoluToken } from "../../hooks/useIkoluToken";
import { ADMIN_MENU } from "../admin/constants/adminMenu";
import VoidCubeLogo from "../auth/components/VoidCubeLogo";

const AppLogo = ({ collapsed }) => {
  const size = collapsed ? 24 : 28;
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

  const [internalOpenKeys, setInternalOpenKeys] = useState(isAdmin ? ["/admin/iot"] : []);
  const openKeys = collapsed ? [] : internalOpenKeys;

  const submenuKeys = ["/admin/monitoreo", "/admin/crm", "/admin/iot", "/admin/support", "/admin/administracion"];

  const handleOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => internalOpenKeys.indexOf(key) === -1);
    if (submenuKeys.indexOf(latestOpenKey) === -1) {
      setInternalOpenKeys(keys);
    } else {
      setInternalOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
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
          <span
            style={{
              display: "block",
              color: "#f2f5fa",
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: 23,
              fontWeight: 700,
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              lineHeight: 1,
              textShadow: "0 0 16px rgba(255,255,255,0.12)",
            }}
          >
            Ikolu
          </span>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        inlineCollapsed={collapsed}
        openKeys={openKeys}
        onOpenChange={collapsed ? undefined : handleOpenChange}
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

  return <SidebarContent collapsed={collapsed} />;
};

export default Sidebar;
