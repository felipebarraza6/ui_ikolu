import React from "react";
import { theme } from "antd";
import { useResponsive } from "../../hooks/useResponsive";

export const PageContainer = ({ children, style, ...props }) => {
  const { token } = theme.useToken();
  const { isMobile } = useResponsive();

  return (
    <div
      style={{
        padding: isMobile ? 8 : 16,
        maxWidth: 1600,
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export const SectionCard = ({
  children,
  title,
  extra,
  style,
  bodyStyle,
  variant = "default",
  ...props
}) => {
  const { token } = theme.useToken();
  const { isMobile } = useResponsive();

  const variants = {
    default: {
      background: token.colorBgContainer,
      border: `1px solid ${token.colorBorderSecondary}`,
    },
    elevated: {
      background: token.colorBgContainer,
      border: "none",
      boxShadow: token.boxShadow,
    },
    subtle: {
      background: token.colorBgLayout,
      border: `1px solid ${token.colorBorderSecondary}`,
    },
  };

  const currentVariant = variants[variant] || variants.default;

  return (
    <div
      style={{
        borderRadius: token.borderRadiusLG,
        padding: isMobile ? 12 : 16,
        ...currentVariant,
        ...style,
      }}
      {...props}
    >
      {(title || extra) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {title && (
            <h3
              style={{
                margin: 0,
                fontSize: isMobile ? 16 : 18,
                fontWeight: 600,
                color: token.colorTextHeading,
              }}
            >
              {title}
            </h3>
          )}
          {extra && <div style={{ flexShrink: 0 }}>{extra}</div>}
        </div>
      )}
      <div style={{ ...bodyStyle }}>{children}</div>
    </div>
  );
};

export const PageHeader = ({
  title,
  subtitle,
  extra,
  breadcrumb,
  style,
  ...props
}) => {
  const { token } = theme.useToken();
  const { isMobile } = useResponsive();

  return (
    <div
      style={{
        marginBottom: isMobile ? 12 : 16,
        ...style,
      }}
      {...props}
    >
      <div
        style={{
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: subtitle ? 4 : 0,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          {breadcrumb && <div style={{ marginBottom: 8 }}>{breadcrumb}</div>}
          <h1
            style={{
              margin: 0,
              fontSize: isMobile ? 20 : 24,
              fontWeight: 700,
              color: token.colorTextHeading,
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: 14,
                color: token.colorTextSecondary,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {extra && <div style={{ flexShrink: 0 }}>{extra}</div>}
      </div>
    </div>
  );
};
