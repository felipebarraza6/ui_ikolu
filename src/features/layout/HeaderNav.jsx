import React from "react";
import { Layout, Button, Dropdown, Avatar, Typography, Space, Tag } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useIkoluToken } from "../../hooks/useIkoluToken";

const { Header } = Layout;
const { Text } = Typography;

const getPageTitle = (pathname) => {
  if (pathname.startsWith("/admin/support/my-desk")) return "Mi Escritorio";
  if (pathname.startsWith("/admin/support/tickets")) return "Tickets";
  if (pathname.startsWith("/admin/support/indicators")) return "Indicadores";
  if (pathname.startsWith("/admin")) return "Administración";
  if (pathname.startsWith("/control-center")) return "Control Center";
  if (pathname.startsWith("/profile")) return "Mi Perfil";
  return "";
};

const HeaderNav = ({ collapsed, setCollapsed, isMobile, mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const token = useIkoluToken();
  const pageTitle = getPageTitle(pathname);

  // Mobile uses BottomNav instead — return null after hooks
  if (isMobile) return null;

  const handleLogout = () => {
    navigate("/login", { replace: true });
    logout();
  };

  const handleToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const menuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Mi Perfil",
      onClick: () => navigate("/profile"),
    },
    ...(isAdmin
      ? [
          {
            key: "admin",
            icon: <BarChartOutlined />,
            label: "Administración",
            onClick: () => navigate("/admin/performance"),
          },
        ]
      : []),
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Cerrar Sesión",
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        padding: "0 24px",
        background: token.colorHeaderBg,
        color: '#ffffff',
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        borderBottom: `1px solid ${token.colorHeaderBorder}`,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={handleToggle}
        style={{
          fontSize: "16px",
          width: 64,
          height: 64,
          color: 'rgba(255,255,255,0.85)',
        }}
      />

      {pageTitle && (
        <Text
          style={{
            marginLeft: 12,
            fontSize: 16,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.95)',
            letterSpacing: 0.3,
          }}
        >
          {pageTitle}
        </Text>
      )}

      <Space align="center" size="middle" style={{ marginLeft: "auto" }}>
        <Space size={8}>
          <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
            {user?.email || user?.first_name || user?.username || "Usuario"}
          </Text>
          {isAdmin && (
            <Tag color="gold" style={{ marginInlineEnd: 0 }}>
              Admin
            </Tag>
          )}
        </Space>

        <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow destroyPopupOnHide>
          <Avatar
            style={{
              background: token.colorPrimary,
              cursor: "pointer",
              border: `2px solid ${token.colorPrimaryHover}`,
            }}
            icon={<UserOutlined />}
          />
        </Dropdown>
      </Space>
    </Header>
  );
};

export default HeaderNav;
