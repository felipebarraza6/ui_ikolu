import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  EyeOutlined,
  WifiOutlined,
  CustomerServiceOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useIkoluToken } from "../../hooks/useIkoluToken";
import VoidCubeLogo from "../auth/components/VoidCubeLogo";

const NAV_ITEMS = [
  { key: "/admin/performance", icon: EyeOutlined, label: "Monitoreo" },
  { key: "/admin/points", icon: WifiOutlined, label: "IOT" },
  // center is special — Ikolu logo
  { key: "/control-center/telemetry", icon: null, label: "Ikolu", isCenter: true },
  { key: "/admin/support/tickets", icon: CustomerServiceOutlined, label: "Soporte" },
  { key: "/admin/performance", icon: MoreOutlined, label: "Admin" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useIkoluToken();

  const isActive = (key) => location.pathname.startsWith(key);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        paddingBottom: "env(safe-area-inset-bottom)",
        background: token.colorHeaderBg,
        borderTop: `1px solid ${token.colorHeaderBorder}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 1000,
        backdropFilter: "blur(12px)",
      }}
    >
      {NAV_ITEMS.map((item) => {
        if (item.isCenter) {
          return (
            <div
              key={item.key}
              onClick={() => navigate(item.key)}
              style={{
                position: "relative",
                top: -16,
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: token.colorHeaderBg,
                border: `2px solid ${token.colorPrimary}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: `0 4px 16px rgba(58,137,210,0.35), 0 0 24px rgba(58,137,210,0.15)`,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <VoidCubeLogo size={32} />
            </div>
          );
        }

        const active = isActive(item.key);
        const Icon = item.icon;

        return (
          <div
            key={item.key + item.label}
            onClick={() => navigate(item.key)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              cursor: "pointer",
              minWidth: 56,
              transition: "all 0.2s ease",
            }}
          >
            <Icon
              style={{
                fontSize: 22,
                color: active ? token.colorPrimary : "rgba(255,255,255,0.45)",
                transition: "color 0.2s ease",
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: active ? 600 : 400,
                color: active ? token.colorPrimary : "rgba(255,255,255,0.45)",
                lineHeight: 1,
                transition: "color 0.2s ease",
              }}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default BottomNav;
