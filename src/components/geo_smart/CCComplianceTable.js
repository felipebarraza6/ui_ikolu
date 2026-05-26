import React, { useMemo } from "react";
import { Card, Flex, Typography, Table, Tag, Tooltip, theme } from "antd";
import { FaClipboardCheck, FaEye, FaPauseCircle } from "react-icons/fa";
import moment from "moment";
import { ikoluTokens } from "../../theme";
import { formatInteger } from "../../utils/numberFormatter";

const { Text } = Typography;
const { useToken } = theme;

const pointsColumns = (onViewVoucher, onStopCompliance, token) => [
  {
    title: "Punto / Código",
    key: "point_code",
    fixed: "left",
    width: 220,
    sorter: (a, b) => (a.title || "").localeCompare(b.title || ""),
    defaultSortOrder: "ascend",
    render: (_, record) => (
      <Flex align="center" gap={8} wrap="wrap">
        <Text strong style={{ fontSize: 13, color: ikoluTokens.colorCorporateBlue }}>
          {record.title || "—"}
        </Text>
        {record.code && (
          <Flex align="center" gap={4}>
            <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>—</Text>
            {record.compliance_type?.includes("DGA") ? (
              <a
                href={`https://snia.mop.gob.cl/cExtracciones2/#/consultaQR/${encodeURIComponent(record.code)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: token.colorPrimary, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}
                onClick={(e) => e.stopPropagation()}
              >
                {record.code}
              </a>
            ) : (
              <Text style={{ fontSize: 11, color: token.colorTextSecondary, whiteSpace: "nowrap" }}>
                {record.code}
              </Text>
            )}
            {record.compliance_type?.includes("DGA") && (
              <Flex gap={4} align="center" wrap="nowrap">
                <Tag style={{ fontSize: 10, margin: 0, padding: "1px 6px", lineHeight: "16px", background: token.colorPrimaryBg, border: "none", color: token.colorPrimary, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>
                  {record.standard}
                </Tag>
                <Tag style={{ fontSize: 10, margin: 0, padding: "1px 6px", lineHeight: "16px", background: token.colorBgLayout, border: "none", color: token.colorTextSecondary, whiteSpace: "nowrap", flexShrink: 0 }}>
                  {record.type_dga}
                </Tag>
              </Flex>
            )}
          </Flex>
        )}
      </Flex>
    ),
  },
  {
    title: "Limites / Estado",
    key: "limits",
    width: 220,
    responsive: ["md"],
    render: (_, record) => (
      <Flex vertical gap={8}>
        <Flex vertical gap={3}>
          <Flex justify="space-between" align="center">
            <Text strong style={{ fontSize: 11, color: token.colorText }}>Caudal</Text>
            {record.authorized_flow > 0 && record.flow_lps != null ? (
              <Text strong style={{ fontSize: 11, color: token.colorText }}>
                {Number(record.flow_lps).toFixed(1)} / {Number(record.authorized_flow).toFixed(1)} <span style={{ fontSize: 10, fontWeight: 400 }}>L/s</span>
              </Text>
            ) : (
              <Text strong style={{ fontSize: 11, color: token.colorError }}>?</Text>
            )}
          </Flex>
          {record.authorized_flow > 0 && record.flow_lps != null ? (
            <div style={{ position: "relative", height: 6, borderRadius: 3, background: token.colorBgLayout, overflow: "hidden" }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: `${Math.min((record.flow_lps / record.authorized_flow) * 100, 100)}%`,
                  borderRadius: 3,
                  background: record.flow_lps > record.authorized_flow ? token.colorError : token.colorSuccess,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          ) : (
            <div style={{ height: 6, borderRadius: 3, background: token.colorBgLayout }} />
          )}
        </Flex>

        <Flex vertical gap={3}>
          <Flex justify="space-between" align="center">
            <Text strong style={{ fontSize: 11, color: token.colorText }}>Anual</Text>
            {record.pct_consumed != null ? (
              <Text
                strong
                style={{
                  fontSize: 12,
                  color:
                    record.pct_consumed > 100
                      ? token.colorError
                      : record.pct_consumed > 80
                      ? token.colorWarning
                      : token.colorSuccess,
                }}
              >
                {Number(record.pct_consumed).toFixed(1)}%
              </Text>
            ) : (
              <Text strong style={{ fontSize: 11, color: token.colorError }}>?</Text>
            )}
          </Flex>
          {record.pct_consumed != null ? (
            <Tag
              style={{
                width: "100%",
                height: 6,
                borderRadius: 3,
                background: `linear-gradient(to right, ${
                  record.pct_consumed > 100
                    ? token.colorError
                    : record.pct_consumed > 80
                    ? token.colorWarning
                    : token.colorSuccess
                } ${Math.min(record.pct_consumed, 100)}%, ${token.colorBgLayout} ${Math.min(record.pct_consumed, 100)}%)`,
              }}
            />
          ) : (
            <div style={{ height: 6, borderRadius: 3, background: token.colorBgLayout }} />
          )}
          {record.authorized_total > 0 && record.annual_consumption != null ? (
            <Text style={{ fontSize: 10, color: token.colorTextSecondary }}>
              {formatInteger(record.annual_consumption)} / {formatInteger(record.authorized_total)} m³
            </Text>
          ) : (
            <Text style={{ fontSize: 10, color: token.colorTextSecondary }}>
              Sin datos de consumo anual
            </Text>
          )}
        </Flex>
      </Flex>
    ),
  },
  {
    title: "Ultimo envio",
    dataIndex: "last_sent_at",
    key: "last_sent_at",
    width: 100,
    align: "center",
    render: (date) =>
      date ? (
        <Text style={{ fontSize: 12, color: token.colorText, whiteSpace: "nowrap" }}>
          {moment(date).format("DD/MM HH:mm")}
        </Text>
      ) : (
        <span style={{ color: ikoluTokens.colorGreyTextLight }}>—</span>
      ),
  },
  {
    title: "Caudal",
    dataIndex: "flow_lps",
    key: "flow_lps",
    width: 90,
    align: "right",
    render: (v) =>
      v != null ? (
        <Text strong style={{ fontSize: 13, color: v > 0 ? token.colorSuccess : token.colorTextSecondary }}>
          {Number(v).toFixed(2)}
          <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 2 }}>L/s</span>
        </Text>
      ) : (
        "—"
      ),
  },
  {
    title: "Nivel",
    dataIndex: "water_table_m",
    key: "water_table_m",
    width: 85,
    align: "right",
    render: (v) =>
      v != null ? (
        <Text style={{ fontSize: 13, color: token.colorInfo }}>
          {Number(v).toFixed(2)}
          <span style={{ fontSize: 10, marginLeft: 2 }}>m</span>
        </Text>
      ) : (
        "—"
      ),
  },
  {
    title: "Totalizado",
    dataIndex: "total_m3",
    key: "total_m3",
    width: 110,
    align: "right",
    render: (v) =>
      v != null ? (
        <Text strong style={{ fontSize: 14, color: token.colorPrimary }}>
          {formatInteger(v)}
          <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 2 }}>m³</span>
        </Text>
      ) : (
        "—"
      ),
  },
  {
    title: "",
    dataIndex: "voucher",
    key: "voucher",
    width: 50,
    align: "center",
    fixed: "right",
    render: (v, record) =>
      v ? (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: `${token.colorPrimary}10`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = `${token.colorPrimary}20`)}
          onMouseLeave={(e) => (e.currentTarget.style.background = `${token.colorPrimary}10`)}
          onClick={(e) => {
            e.stopPropagation();
            onViewVoucher(record);
          }}
        >
          <FaEye style={{ fontSize: 12, color: token.colorPrimary }} />
        </div>
      ) : (
        <span style={{ color: ikoluTokens.colorGreyTextLight }}>—</span>
      ),
  },
  {
    title: "",
    key: "stop_compliance",
    width: 36,
    align: "center",
    fixed: "right",
    render: (_, record) => (
      <Tooltip title="Solicitar detencion de cumplimiento">
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s",
            border: `1px solid ${token.colorPrimary}40`,
            background: `${token.colorPrimary}08`,
            margin: "0 auto",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onStopCompliance(record);
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = `${token.colorPrimary}15`; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = `${token.colorPrimary}08`; }}
        >
          <FaPauseCircle style={{ fontSize: 11, color: token.colorPrimary }} />
        </div>
      </Tooltip>
    ),
  },
];

const CCComplianceTable = ({ points, onViewVoucher, onOpenStopCompliance, onSelectPoint }) => {
  const { token } = useToken();

  const columns = useMemo(() => pointsColumns(onViewVoucher, onOpenStopCompliance, token), [onViewVoucher, onOpenStopCompliance, token]);

  return (
    <Card
      size="small"
      style={{ borderRadius: token.borderRadiusLG, overflow: "hidden" }}
      bodyStyle={{ padding: 0 }}
    >
      <Table
        dataSource={points}
        columns={columns}
        rowKey="id"
        size="small"
        scroll={{ x: "max-content" }}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        locale={{ emptyText: "No hay puntos disponibles" }}
        onRow={(record) => ({
          onClick: () => onSelectPoint(record),
          style: {
            cursor: "pointer",
            background: "transparent",
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          },
          onMouseEnter: (e) => {
            e.currentTarget.style.background = token.colorBgTextHover || "#f5f5f5";
            e.currentTarget.style.transition = "background 0.15s ease";
          },
          onMouseLeave: (e) => {
            e.currentTarget.style.background = "transparent";
          },
        })}
      />
    </Card>
  );
};

export default React.memo(CCComplianceTable);
