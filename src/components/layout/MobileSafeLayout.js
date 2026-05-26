import React, { useState } from "react";
import { Layout, Drawer, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { useResponsive } from "../../hooks/useResponsive";

const { Header, Sider, Content } = Layout;

/**
 * Layout seguro que oculta completamente el sidebar en móvil
 * y usa toda la pantalla disponible sin comprimir contenido
 */
const MobileSafeLayout = ({
  children,
  siderContent,
  headerContent,
  headerHeight = 64,
  siderWidth = 240,
  collapsedWidth = 0, // IMPORTANTE: 0 en móvil para ocultar completamente
  ...props
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [drawerVisible, setDrawerVisible] = useState(false);

  // En móvil, FORZAR que no haya sidebar
  const shouldShowSider = !isMobile; // Solo mostrar en desktop/tablet
  const actualSiderWidth = isMobile ? 0 : siderWidth;
  const actualCollapsedWidth = isMobile ? 0 : collapsedWidth;

  // Estilos para móvil
  const layoutStyle = {
    minHeight: "100vh",
    width: "100%",
    // CRÍTICO: En móvil, asegurar que use toda la pantalla
    ...(isMobile && {
      marginLeft: 0,
      paddingLeft: 0,
      left: 0,
      right: 0,
      position: "relative",
    }),
  };

  const contentStyle = {
    // CRÍTICO: En móvil, usar todo el ancho disponible
    width: isMobile ? "100%" : "auto",
    marginLeft: isMobile ? 0 : undefined,
    padding: isMobile ? 0 : "16px",
    minHeight: isMobile ? "100vh" : "calc(100vh - 64px)",
    // Evitar que el contenido se comprima
    flex: 1,
    overflow: "hidden",
  };

  const headerStyle = {
    // En móvil, header con botón hamburger
    padding: isMobile ? "0 16px" : "0 24px",
    background: "#fff",
    borderBottom: "1px solid #f0f0f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1000,
    ...(isMobile && {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      width: "100%",
    }),
  };

  const mobileContentStyle = {
    // En móvil, añadir margen superior por header fijo
    marginTop: isMobile ? headerHeight : 0,
    width: "100%",
    minHeight: isMobile ? `calc(100vh - ${headerHeight}px)` : "auto",
  };

  return (
    <Layout style={layoutStyle} {...props}>
      {/* Header */}
      <Header style={headerStyle}>
        {/* Botón hamburger solo en móvil */}
        {isMobile && siderContent && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerVisible(true)}
            style={{ fontSize: 18 }}
          />
        )}

        {/* Contenido del header */}
        <div style={{ flex: 1 }}>{headerContent}</div>
      </Header>

      {/* Layout principal */}
      <Layout style={{ background: "#fff" }}>
        {/* Sidebar - SOLO en desktop/tablet */}
        {shouldShowSider && siderContent && (
          <Sider
            width={actualSiderWidth}
            collapsedWidth={actualCollapsedWidth}
            breakpoint="lg"
            style={{
              background: "#fff",
              borderRight: "1px solid #f0f0f0",
            }}
          >
            {siderContent}
          </Sider>
        )}

        {/* Contenido principal */}
        <Content style={contentStyle}>
          <div style={mobileContentStyle}>{children}</div>
        </Content>
      </Layout>

      {/* Drawer para móvil - reemplaza el sidebar */}
      {isMobile && siderContent && (
        <Drawer
          title="Menú"
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          bodyStyle={{ padding: 0 }}
          width={320}
        >
          {siderContent}
        </Drawer>
      )}
    </Layout>
  );
};

/**
 * Wrapper para layout existente que tiene problemas de sidebar
 */
export const FixSidebarLayout = ({ children, ...props }) => {
  const { isMobile } = useResponsive();

  // En móvil, renderizar solo el contenido sin layout complejo
  if (isMobile) {
    return (
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          padding: 0,
          margin: 0,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {children}
      </div>
    );
  }

  // En desktop, mantener comportamiento normal
  return children;
};

/**
 * HOC para componentes que tienen problemas de sidebar
 */
export const withMobileSafeLayout = (Component) => {
  return (props) => {
    const { isMobile } = useResponsive();

    if (isMobile) {
      return (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            overflow: "auto",
            zIndex: 1,
            background: "#fff",
          }}
        >
          <Component {...props} />
        </div>
      );
    }

    return <Component {...props} />;
  };
};

export default MobileSafeLayout;
