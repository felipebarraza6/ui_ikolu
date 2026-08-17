import React from "react";
import { Flex, Tooltip, Grid } from "antd";
import { FaExternalLinkAlt, FaPauseCircle, FaHeadset } from "react-icons/fa";
import { SafetyOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useIkoluToken } from "../../../hooks/useIkoluToken";

const btnBase = (color, size = 32) => ({
  width: size,
  height: size,
  borderRadius: "50%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  border: `1.5px solid ${color}50`,
  background: `${color}18`,
  color,
  transition: "all 0.2s ease",
});

const ActionButtons = ({
  record,
  onViewVoucher,
  onOpenStopCompliance,
  onOpenSupport,
  onToggleCompliance,
  togglingCompliance,
  isSuperUser,
}) => {
  const token = useIkoluToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const handleHover = (e, enter, color) => {
    e.currentTarget.style.transform = enter ? "scale(1.12)" : "scale(1)";
    e.currentTarget.style.background = enter ? `${color}30` : `${color}18`;
    e.currentTarget.style.boxShadow = enter ? `0 2px 8px ${color}50` : "none";
  };

  const isToggling = !!togglingCompliance?.[record.id];
  const complianceColor = record.complianceActive ? token.colorSuccess : token.colorError;
  const btnSize = isMobile ? 28 : 32;

  return (
    <Flex align="center" justify="center" gap={isMobile ? 6 : 8} onClick={(e) => e.stopPropagation()}>
      {record.voucher ? (
        <Tooltip title="Abrir comprobante DGA">
          <div
            role="button"
            tabIndex={0}
            style={btnBase(token.colorSuccess, btnSize)}
            onClick={() => onViewVoucher?.(record)}
            onMouseEnter={(e) => handleHover(e, true, token.colorSuccess)}
            onMouseLeave={(e) => handleHover(e, false, token.colorSuccess)}
          >
            <FaExternalLinkAlt style={{ fontSize: isMobile ? 11 : 13 }} />
          </div>
        </Tooltip>
      ) : (
        <div style={{ width: btnSize, height: btnSize }} />
      )}
      <Tooltip title="Solicitar detencion">
        <div
          role="button"
          tabIndex={0}
          style={btnBase(token.colorError, btnSize)}
          onClick={() => onOpenStopCompliance?.(record)}
          onMouseEnter={(e) => handleHover(e, true, token.colorError)}
          onMouseLeave={(e) => handleHover(e, false, token.colorError)}
        >
          <FaPauseCircle style={{ fontSize: isMobile ? 11 : 13 }} />
        </div>
      </Tooltip>
      <Tooltip title="Solicitar soporte">
        <div
          role="button"
          tabIndex={0}
          style={btnBase(token.colorWarning, btnSize)}
          onClick={() => onOpenSupport?.(record, "CUMPLIMIENTO")}
          onMouseEnter={(e) => handleHover(e, true, token.colorWarning)}
          onMouseLeave={(e) => handleHover(e, false, token.colorWarning)}
        >
          <FaHeadset style={{ fontSize: isMobile ? 11 : 13 }} />
        </div>
      </Tooltip>
      {isSuperUser && (
        <Tooltip title={record.complianceActive ? "Desactivar cumplimiento" : "Activar cumplimiento"}>
          <div
            role="button"
            tabIndex={0}
            style={{
              ...btnBase(complianceColor, btnSize),
              opacity: isToggling ? 0.5 : 1,
              cursor: isToggling ? "not-allowed" : "pointer",
              pointerEvents: isToggling ? "none" : "auto",
            }}
            onClick={() => onToggleCompliance?.(record)}
            onMouseEnter={(e) => !isToggling && handleHover(e, true, complianceColor)}
            onMouseLeave={(e) => !isToggling && handleHover(e, false, complianceColor)}
          >
            {record.complianceActive ? (
              <SafetyCertificateOutlined style={{ fontSize: isMobile ? 11 : 13 }} />
            ) : (
              <SafetyOutlined style={{ fontSize: isMobile ? 11 : 13 }} />
            )}
          </div>
        </Tooltip>
      )}
    </Flex>
  );
};

export default ActionButtons;
