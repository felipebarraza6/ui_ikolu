import React, { useState } from "react";
import { Typography, Spin, Button } from "antd";
import {
  TeamOutlined,
  DeploymentUnitOutlined,
  DashboardOutlined,
  AimOutlined,
  WifiOutlined,
  LineChartOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  FacebookOutlined,
  InstagramOutlined,
  GlobalOutlined,
  LoginOutlined,
  ArrowDownOutlined,
  SafetyOutlined,
  FileTextOutlined,
  BellOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import logoBlanco from "../../../assets/images/logo-blanco.png";
import ikoluImg from "../../../assets/images/ikolu.png";
import WaterBackground from "./WaterBackground";
import useResponsive from "../../../hooks/useResponsive";

const { Text, Title } = Typography;

const ICONS = {
  TeamOutlined: <TeamOutlined />,
  DeploymentUnitOutlined: <DeploymentUnitOutlined />,
  DashboardOutlined: <DashboardOutlined />,
  AimOutlined: <AimOutlined />,
  WifiOutlined: <WifiOutlined />,
  LineChartOutlined: <LineChartOutlined />,
  SafetyCertificateOutlined: <SafetyCertificateOutlined />,
  SafetyOutlined: <SafetyOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  BellOutlined: <BellOutlined />,
};

const landingStyles = `
  @keyframes lp-fade-in {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .lp-animate-1 { animation: lp-fade-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .lp-animate-2 { animation: lp-fade-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards; opacity: 0; }
  .lp-animate-3 { animation: lp-fade-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; opacity: 0; }
  
  .lp-nav-link {
    color: rgba(200, 214, 240, 0.75);
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.2s ease;
    cursor: pointer;
  }
  .lp-nav-link:hover {
    color: #ffffff;
  }

  .lp-feature-card {
    background: rgba(8, 24, 48, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 28px 24px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .lp-feature-card:hover {
    transform: translateY(-6px);
    background: rgba(14, 38, 72, 0.7);
    border-color: rgba(201, 217, 54, 0.3);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  }

  .lp-btn-primary {
    background: linear-gradient(135deg, #ffffff 0%, #d5e3f5 100%) !important;
    color: #030c18 !important;
    border: none !important;
    font-weight: 700 !important;
    height: 48px !important;
    padding: 0 28px !important;
    border-radius: 24px !important;
    box-shadow: 0 8px 24px rgba(255, 255, 255, 0.2) !important;
    transition: all 0.25s ease !important;
  }
  .lp-btn-primary:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 12px 32px rgba(255, 255, 255, 0.35) !important;
  }

  .lp-btn-secondary {
    background: rgba(255, 255, 255, 0.08) !important;
    color: #f2f5fa !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    font-weight: 600 !important;
    height: 48px !important;
    padding: 0 24px !important;
    border-radius: 24px !important;
    backdrop-filter: blur(10px) !important;
    transition: all 0.25s ease !important;
  }
  .lp-btn-secondary:hover {
    background: rgba(255, 255, 255, 0.15) !important;
    border-color: rgba(255, 255, 255, 0.4) !important;
    color: #ffffff !important;
  }

  @keyframes lp-menu-slide {
    from { opacity: 0; transform: translateY(-12px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const BrandPanel = ({ data, loading, onOpenLogin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isMobile } = useResponsive();

  const scrollToFeatures = () => {
    const el = document.getElementById("ikolu-features-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  if (loading || !data) {
    return (
      <div style={{
        minHeight: "100vh", width: "100%", background: "#030c18",
        position: "relative", display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <WaterBackground />
        <Spin size="large" style={{ color: "#c9d936", position: "relative", zIndex: 10 }} />
      </div>
    );
  }

  const { company } = data;
  const { dga, sma, social, services, stats, sectors } = company;

  const allFeatures = [
    ...(services || []),
    {
      id: "dga_sma",
      icon: "SafetyOutlined",
      title: "Cumplimiento Regulatorio DGA/SMA",
      description: "Generación automática y transmisión de archivos de extracción según normativa Resolución 1238.",
    },
    {
      id: "alerts",
      icon: "BellOutlined",
      title: "Reglas de Alerta & Notificaciones",
      description: "Alertas automáticas por correo y SMS ante desvíos de caudal, excesos de nivel o desconexiones.",
    },
    {
      id: "docs",
      icon: "FileTextOutlined",
      title: "Drive & Reportes XLSX",
      description: "Repositorio centralizado de expedientes legales, derechos de agua y reportes consolidados.",
    },
  ];

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#030c18", position: "relative", overflowX: "hidden" }}>
      <style>{landingStyles}</style>
      <WaterBackground />

      {/* NAVBAR SUPERIOR */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(3, 12, 24, 0.75)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        padding: isMobile ? "12px 16px" : "16px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* LEFT: Logo + IKOLU */}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 20 }}>
          <img src={logoBlanco} alt={company.name} style={{ height: isMobile ? 30 : 38, width: "auto" }} />
          {!isMobile && <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.15)" }} />}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src={ikoluImg} alt="Ikolu" style={{ height: isMobile ? 20 : 26, width: "auto" }} />
            <Text style={{
              color: "#ffffff", fontFamily: "'Inter', sans-serif",
              fontWeight: 800, fontSize: isMobile ? 15 : 18, letterSpacing: "2px", textTransform: "uppercase"
            }}>
              IKOLU
            </Text>
          </div>
        </div>

        {/* DESKTOP NAV */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <a
              href="#ikolu-features-section"
              onClick={(e) => { e.preventDefault(); scrollToFeatures(); }}
              className="lp-nav-link"
            >
              Funcionalidades
            </a>
            <a href={company.website} target="_blank" rel="noopener noreferrer" className="lp-nav-link" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <GlobalOutlined /> smarthydro.cl
            </a>

            <div style={{ display: "flex", gap: 8 }}>
              <a href={social.facebook} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}>
                <FacebookOutlined />
              </a>
              <a href={social.instagram} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}>
                <InstagramOutlined />
              </a>
            </div>

            <Button
              type="primary"
              icon={<LoginOutlined />}
              className="lp-btn-primary"
              onClick={onOpenLogin}
            >
              Iniciar Sesión
            </Button>
          </div>
        )}

        {/* MOBILE HAMBURGER */}
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: 10,
              width: 44, height: 44,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#ffffff", fontSize: 20,
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        )}
      </header>

      {/* MOBILE MENU DROPDOWN */}
      {isMobile && mobileMenuOpen && (
        <div style={{
          position: "sticky", top: isMobile ? 54 : 64, zIndex: 49,
          background: "rgba(3, 12, 24, 0.95)",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "20px 20px 24px",
          display: "flex", flexDirection: "column", gap: 4,
          animation: "lp-menu-slide 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}>
          <a
            href="#ikolu-features-section"
            onClick={(e) => { e.preventDefault(); scrollToFeatures(); }}
            style={{
              display: "block", padding: "14px 16px", borderRadius: 12,
              color: "rgba(200, 214, 240, 0.85)", fontSize: 15, fontWeight: 600,
              textDecoration: "none",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            Funcionalidades
          </a>

          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "14px 16px", borderRadius: 12,
              color: "rgba(200, 214, 240, 0.85)", fontSize: 15, fontWeight: 600,
              textDecoration: "none",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <GlobalOutlined /> smarthydro.cl
          </a>

          {/* Social row */}
          <div style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "14px 16px",
          }}>
            <a href={social.facebook} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.6)", fontSize: 18 }}>
              <FacebookOutlined />
            </a>
            <a href={social.instagram} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.6)", fontSize: 18 }}>
              <InstagramOutlined />
            </a>
          </div>

          {/* Login button */}
          <div style={{ padding: "4px 16px 0" }}>
            <Button
              type="primary"
              icon={<LoginOutlined />}
              className="lp-btn-primary"
              onClick={() => { setMobileMenuOpen(false); onOpenLogin(); }}
              block
              style={{ height: 48, fontSize: 15 }}
            >
              Iniciar Sesión
            </Button>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section style={{
        position: "relative", zIndex: 10,
        maxWidth: 1200, margin: "0 auto",
        padding: isMobile ? "50px 20px 40px" : "80px 32px 60px 32px",
        textAlign: "center",
        display: "flex", flexDirection: "column", alignItems: "center"
      }}>
        {/* BADGES REGULATORIOS */}
        <div className="lp-animate-1" style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", justifyContent: "center" }}>
          <a
            href={dga.url} target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(201, 217, 54, 0.12)", border: "1px solid rgba(201, 217, 54, 0.35)",
              borderRadius: 20, padding: "8px 16px", textDecoration: "none"
            }}
          >
            <SafetyCertificateOutlined style={{ color: "#c9d936", fontSize: 16 }} />
            <Text style={{ color: "#eef3b3", fontSize: 12, fontWeight: 700, letterSpacing: "1px", fontFamily: "'JetBrains Mono', monospace" }}>
              {dga.badge}
            </Text>
          </a>
          <a
            href={sma.url} target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(58, 137, 210, 0.12)", border: "1px solid rgba(58, 137, 210, 0.35)",
              borderRadius: 20, padding: "8px 16px", textDecoration: "none"
            }}
          >
            <CheckCircleOutlined style={{ color: "#3a89d2", fontSize: 16 }} />
            <Text style={{ color: "#d6e8fb", fontSize: 12, fontWeight: 700, letterSpacing: "1px", fontFamily: "'JetBrains Mono', monospace" }}>
              {sma.badge}
            </Text>
          </a>
        </div>

        {/* TITULAR Y SUBTITULAR */}
        <Title className="lp-animate-1" level={1} style={{
          color: "#ffffff",
          fontSize: "clamp(1.8rem, 5vw, 4.2rem)",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 900,
          letterSpacing: "-0.03em",
          lineHeight: 1.08,
          marginBottom: 20,
          maxWidth: 900,
        }}>
          Inteligencia y Monitoreo Hídrico en Tiempo Real
        </Title>

        <Text className="lp-animate-2" style={{
          color: "rgba(200, 214, 240, 0.85)",
          fontSize: "clamp(0.95rem, 1.8vw, 1.4rem)",
          fontFamily: "'Lato', sans-serif",
          fontWeight: 400,
          maxWidth: 760,
          lineHeight: 1.5,
          marginBottom: 36,
          display: "block",
        }}>
          Gestiona tus recursos hídricos con telemetría IoT avanzada, dashboards analíticos y cumplimiento automático ante la DGA y SMA.
        </Text>

        {/* BOTONES HERO */}
        <div className="lp-animate-3" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
          <Button
            type="primary"
            icon={<LoginOutlined />}
            size="large"
            className="lp-btn-primary"
            onClick={onOpenLogin}
            style={{ height: 52, fontSize: 16 }}
          >
            Acceder a la Plataforma
          </Button>
          <Button
            icon={<ArrowDownOutlined />}
            size="large"
            className="lp-btn-secondary"
            onClick={scrollToFeatures}
            style={{ height: 52, fontSize: 15 }}
          >
            Ver Funcionalidades
          </Button>
        </div>

        {/* ETIQUETAS SECTORES */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <Text style={{ color: "rgba(200, 214, 240, 0.4)", fontSize: 12, textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600 }}>
            Sectores Atendidos:
          </Text>
          {sectors.map((sector) => (
            <span
              key={sector}
              style={{
                padding: "5px 14px", background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 20,
                color: "rgba(240, 244, 250, 0.8)", fontSize: 11, fontWeight: 600,
                fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.8px"
              }}
            >
              {sector}
            </span>
          ))}
        </div>
      </section>

      {/* METRICS BANNER */}
      <section style={{
        position: "relative", zIndex: 10,
        background: "rgba(6, 24, 48, 0.6)",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        padding: isMobile ? "32px 20px" : "40px 32px",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 24, textAlign: "center"
        }}>
          {stats.map((stat) => (
            <div key={stat.key} style={{ padding: 12 }}>
              <Text style={{
                color: "#ffffff", fontSize: "clamp(1.6rem, 3vw, 2.8rem)",
                fontFamily: "'Inter', sans-serif", fontWeight: 900,
                display: "block", lineHeight: 1, marginBottom: 8,
              }}>
                {stat.value}
              </Text>
              <Text style={{
                color: "rgba(200, 214, 240, 0.6)", fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "1.2px",
              }}>
                {stat.label}
              </Text>
            </div>
          ))}
        </div>
      </section>

      {/* FUNCIONALIDADES GRID SECTION */}
      <section id="ikolu-features-section" style={{
        position: "relative", zIndex: 10,
        maxWidth: 1200, margin: "0 auto",
        padding: isMobile ? "60px 20px 70px" : "90px 32px 100px 32px",
      }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <Text style={{
            color: "#c9d936", fontSize: 13, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "2px",
            fontFamily: "'JetBrains Mono', monospace", display: "block", marginBottom: 8
          }}>
            PLATAFORMA IKOLU
          </Text>
          <Title level={2} style={{
            color: "#ffffff", fontSize: "clamp(1.5rem, 3vw, 2.6rem)",
            fontFamily: "'Inter', sans-serif", fontWeight: 800, margin: 0
          }}>
            Todo lo que necesitas para tu gestión hídrica
          </Title>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: 24,
        }}>
          {allFeatures.map((item) => (
            <div key={item.id} className="lp-feature-card">
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: "linear-gradient(135deg, #c9d936 0%, #3a89d2 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#041126", fontSize: 22, marginBottom: 20,
                boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
              }}>
                {ICONS[item.icon] || <CheckCircleOutlined />}
              </div>

              <Title level={4} style={{
                color: "#ffffff", fontSize: 18, fontWeight: 700,
                fontFamily: "'Inter', sans-serif", marginTop: 0, marginBottom: 10
              }}>
                {item.title}
              </Title>

              <Text style={{
                color: "rgba(200, 214, 240, 0.65)", fontSize: 14,
                fontFamily: "'Lato', sans-serif", lineHeight: 1.6, display: "block"
              }}>
                {item.description}
              </Text>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        position: "relative", zIndex: 10,
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        background: "rgba(2, 8, 16, 0.9)",
        padding: isMobile ? "28px 20px" : "36px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 20
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={logoBlanco} alt={company.name} style={{ height: 28 }} />
          <Text style={{ color: "rgba(200,214,240,0.4)", fontSize: 13 }}>
            © {new Date().getFullYear()} SmartHydro & Ikolu. Todos los derechos reservados.
          </Text>
        </div>

        <Button
          type="primary"
          icon={<LoginOutlined />}
          className="lp-btn-primary"
          onClick={onOpenLogin}
          style={{ height: 42, fontSize: 14 }}
        >
          Iniciar Sesión
        </Button>
      </footer>
    </div>
  );
};

export default BrandPanel;
