import React from "react";
import { Flex, Tooltip, theme } from "antd";
import { FaEye, FaPauseCircle, FaHeadset } from "react-icons/fa";

const { useToken } = theme;

const btnBase = (color) => ({
  width: 28,
  height: 28,
  borderRadius: "50%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  border: `1.5px solid ${color}30`,
  background: `${color}12`,
  color,
  transition: "all 0.2s ease",
});

const ActionButtons = ({
  record,
  onViewVoucher,
  onOpenStopCompliance,
  onOpenSupport,
}) => {
  const { token } = useToken();

  const handleHover = (e, enter, color) => {
    e.currentTarget.style.transform = enter ? "scale(1.15)" : "scale(1)";
    e.currentTarget.style.background = enter ? `${color}22` : `${color}12`;
    e.currentTarget.style.boxShadow = enter ? `0 0 10px ${color}40` : "none";
  };

  return (
    <Flex align="center" justify="center" gap={8} onClick={(e) => e.stopPropagation()}>
      {record.voucher ? (
        <Tooltip title="Ver voucher">
          <div
            role="button"
            tabIndex={0}
            style={btnBase(token.colorSuccess)}
            onClick={() => onViewVoucher?.(record)}
            onMouseEnter={(e) => handleHover(e, true, token.colorSuccess)}
            onMouseLeave={(e) => handleHover(e, false, token.colorSuccess)}
          >
            <FaEye style={{ fontSize: 12 }} />
          </div>
        </Tooltip>
      ) : (
        <div style={{ width: 28, height: 28 }} />
      )}
      <Tooltip title="Solicitar detencion">
        <div
          role="button"
          tabIndex={0}
          style={btnBase(token.colorError)}
          onClick={() => onOpenStopCompliance?.(record)}
          onMouseEnter={(e) => handleHover(e, true, token.colorError)}
          onMouseLeave={(e) => handleHover(e, false, token.colorError)}
        >
          <FaPauseCircle style={{ fontSize: 12 }} />
        </div>
      </Tooltip>
      <Tooltip title="Solicitar soporte">
        <div
          role="button"
          tabIndex={0}
          style={btnBase(token.colorWarning)}
          onClick={() => onOpenSupport?.(record, "CUMPLIMIENTO")}
          onMouseEnter={(e) => handleHover(e, true, token.colorWarning)}
          onMouseLeave={(e) => handleHover(e, false, token.colorWarning)}
        >
          <FaHeadset style={{ fontSize: 12 }} />
        </div>
      </Tooltip>
    </Flex>
  );
};

export default ActionButtons;
