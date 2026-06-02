import React from "react";
import { Flex, Tooltip } from "antd";
import { FaEye, FaPauseCircle, FaHeadset } from "react-icons/fa";
import { SmartIconButton } from "../../../shared/ui";
import { smarthydro } from "../../../theme/smarthydro.tokens";

const ActionButtons = ({
  record,
  onViewVoucher,
  onOpenStopCompliance,
  onOpenSupport,
}) => {
  return (
    <Flex align="center" justify="center" gap={smarthydro.spacing.xs} onClick={(e) => e.stopPropagation()}>
      {record.voucher ? (
        <SmartIconButton
          variant="primary"
          size="sm"
          icon={<FaEye style={{ fontSize: 11 }} />}
          tooltip="Ver voucher"
          onClick={() => onViewVoucher?.(record)}
        />
      ) : (
        <div style={{ width: 24, height: 24 }} />
      )}
      <SmartIconButton
        variant="primary"
        size="sm"
        icon={<FaPauseCircle style={{ fontSize: 10 }} />}
        tooltip="Solicitar detención de cumplimiento"
        onClick={() => onOpenStopCompliance?.(record)}
      />
      <SmartIconButton
        variant="primary"
        size="sm"
        icon={<FaHeadset style={{ fontSize: 10 }} />}
        tooltip="Solicitar soporte"
        onClick={() => onOpenSupport?.(record, "CUMPLIMIENTO")}
      />
    </Flex>
  );
};

export default ActionButtons;
