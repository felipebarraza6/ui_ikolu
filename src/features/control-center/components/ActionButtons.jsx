import React from "react";
import { Flex, Tooltip, Grid } from "antd";
import { FaEye, FaPauseCircle, FaHeadset } from "react-icons/fa";
import { SafetyOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useIkoluToken } from "../../../hooks/useIkoluToken";

const btnBase = (color, size = 28) => ({
  width: size,
  height: size,
  borderRadius: "50%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  border: `1.5px solid ${color}35`,
  background: `${color}12`,
  color,
  transition: "all 0.2s ease",
  backdropFilter: "blur(4px)",
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
    e.currentTarget.style.transform = enter ? "scale(1.15)" : "scale(1)";
    e.currentTarget.style.background = enter ? `${color}22` : `${color}12`;
    e.currentTarget.style.boxShadow = enter ? `0 0 10px ${color}40` : "none";
  };

  const isToggling = !!togglingCompliance?.[record.id];
  const complianceColor = record.complianceActive ? token.colorSuccess : token.colorError;
  const btnSize = isMobile ? 24 : 28;

  return (
    <Flex align="center" justify="center" gap={isMobile ? 6 : 8} onClick={(e) => e.stopPropagation()}>
      {record.voucher ? (
        <Tooltip title="Ver voucher">
          <div
            role="button"
            tabIndex={0}
            style={btnBase(token.colorSuccess, btnSize)}
            onClick={() => onViewVoucher?.(record)}
            onMouseEnter={(e) => handleHover(e, true, token.colorSuccess)}
            onMouseLeave={(e) => handleHover(e, false, token.colorSuccess)}
          >
            <FaEye style={{ fontSize: isMobile ? 10 : 12 }} />
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
          <FaPauseCircle style={{ fontSize: isMobile ? 10 : 12 }} />
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
          <FaHeadset style={{ fontSize: isMobile ? 10 : 12 }} />
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
              <SafetyCertificateOutlined style={{ fontSize: isMobile ? 10 : 12 }} />
            ) : (
              <SafetyOutlined style={{ fontSize: isMobile ? 10 : 12 }} />
            )}
          </div>
        </Tooltip>
      )}
    </Flex>
  );
};

export default ActionButtons;
