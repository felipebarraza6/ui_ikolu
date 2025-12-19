import React from "react";
import { Tag } from "antd";
import {
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  DisconnectOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { parseSafeDate } from "../../utils/dateFormatter";

const StatusTag = ({ point }) => {
  const {
    isTelemetry,
    daysNotConnection,
    currentCaudal,
    flowGranted,
    lastMeasurement,
  } = point;

  if (!isTelemetry) {
    return (
      <Tag icon={<DisconnectOutlined />} color="default">
        Sin Telemetría
      </Tag>
    );
  }

  if (daysNotConnection > 3) {
    return (
      <Tag icon={<WarningOutlined />} color="error">
        Sin Conexión ({daysNotConnection} días)
      </Tag>
    );
  }

  if (flowGranted > 0 && currentCaudal > flowGranted * 1.1) {
    // 10% de tolerancia
    return (
      <Tag icon={<ExclamationCircleOutlined />} color="warning">
        Caudal Excedido
      </Tag>
    );
  }

  const hoursSinceLastMeasurement = moment().diff(
    parseSafeDate(lastMeasurement),
    "hours"
  );
  if (hoursSinceLastMeasurement > 24) {
    return (
      <Tag icon={<ClockCircleOutlined />} color="purple">
        Última vez hace {hoursSinceLastMeasurement}h
      </Tag>
    );
  }

  return (
    <Tag icon={<CheckCircleOutlined />} color="success">
      Activo
    </Tag>
  );
};

export default StatusTag;
