import React, { useMemo } from "react";
import { Flex, Typography, Table, Tag, Tooltip, theme } from "antd";
import { FaEye, FaPauseCircle, FaHeadset, FaInfoCircle, FaExternalLinkAlt, FaExclamationTriangle, FaChartLine, FaCheckCircle, FaShieldAlt, FaTint } from "react-icons/fa";
import moment from "moment";
import { formatInteger } from "../../utils/numberFormatter";
import { PointHeader, ConsumptionCell, ActionButtons } from "../../features/geo-smart/components";
import { smarthydro } from "../../theme/smarthydro.tokens";

const { Text } = Typography;
const { useToken } = theme;

const typeDgaLabels = {
  "SUPERFICIAL": "Superficial",
  "SUBTERRANEO": "Subterráneo",
  "SUPERFICIAL_MAYOR": "Superficial Mayor",
  "SUBTERRANEO_MENOR": "Subterráneo Menor",
  "CAUDALES_MUY_PEQUENOS": "Caudales muy pequeños",
  "MEDIO": "Medio",
  "MAYOR": "Mayor",
  "MENOR": "Menor",
  "CAUDAL": "Caudal",
  "VOLUMEN": "Volumen",
};

const levelColorMap = {
  safe: { color: smarthydro.colors.semantic.success, bg: smarthydro.colors.semantic.successBg, border: smarthydro.colors.semantic.successBorder, label: "Dentro de límites" },
  warning: { color: smarthydro.colors.semantic.warning, bg: smarthydro.colors.semantic.warningBg, border: smarthydro.colors.semantic.warningBorder, label: "Cerca de superar límite" },
  critical: { color: smarthydro.colors.semantic.error, bg: smarthydro.colors.semantic.errorBg, border: smarthydro.colors.semantic.errorBorder, label: "Incumplimiento detectado" },
  unknown: { color: smarthydro.colors.neutral[500], bg: smarthydro.colors.neutral[100], border: smarthydro.colors.neutral[300], label: "Sin límites configurados" },
};

const pointsColumns = (onViewVoucher, onStopCompliance, onOpenSupport, onViewPointConfig, onViewComplianceDetail, last7, token) => [
  {
    title: "Punto",
    key: "point_name",
    width: 100,
    sorter: (a, b) => (a.title || "").localeCompare(b.title || ""),
    defaultSortOrder: "ascend",
    render: (_, record) => (
      <PointHeader record={record} onViewPointConfig={onViewPointConfig} token={token} />
    ),
  },
  {
    title: "Tipo",
    key: "type",
    width: 100,
    align: "center",
    responsive: ["md"],
    render: (_, record) => (
      <Flex vertical gap={2} align="center">
        <Tag style={{ fontSize: 10, margin: 0, padding: "1px 6px", lineHeight: "15px", background: token.colorBgLayout, border: `1px solid ${token.colorBorder}`, color: token.colorTextSecondary, fontFamily: smarthydro.typography.body }}>
          {typeDgaLabels[record.standard] || record.standard}
        </Tag>
        <Text style={{ fontSize: 10, color: token.colorTextSecondary, fontFamily: smarthydro.typography.body }}>
          {typeDgaLabels[record.type_dga] || record.type_dga}
        </Text>
      </Flex>
    ),
  },
  {
    title: "Consumo",
    key: "consumption",
    width: 120,
    align: "center",
    sorter: (a, b) => {
      const va = a.pct_consumed ?? -Infinity;
      const vb = b.pct_consumed ?? -Infinity;
      return va - vb;
    },
    render: (_, record) => (
      <ConsumptionCell record={record} token={token} />
    ),
  },
  {
    title: "Caudal",
    key: "flow",
    width: 120,
    align: "center",
    sorter: (a, b) => {
      const va = a.flow_lps ?? -Infinity;
      const vb = b.flow_lps ?? -Infinity;
      return va - vb;
    },
    render: (_, record) => {
      const currentFlow = record.flow_lps;
      const authorizedFlow = record.authorized_flow;
      const isExceeded = currentFlow != null && authorizedFlow > 0 && currentFlow > authorizedFlow;
      const isNearLimit = currentFlow != null && authorizedFlow > 0 && currentFlow >= authorizedFlow * 0.9 && currentFlow <= authorizedFlow;
      const flowColor = isExceeded ? token.colorError : isNearLimit ? token.colorWarning : token.colorSuccess;
      
      return (
        <Flex vertical gap={2} align="center">
          {currentFlow != null && authorizedFlow > 0 ? (
            <>
              <Text strong style={{ fontSize: 14, color: flowColor, fontFamily: smarthydro.typography.heading }}>
                {Number(currentFlow).toFixed(1)}
                <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 2, fontFamily: smarthydro.typography.body }}>L/s</span>
              </Text>
              <Text style={{ fontSize: 9, color: token.colorTextSecondary, fontFamily: smarthydro.typography.body }}>
                / {Number(authorizedFlow).toFixed(1)} L/s
              </Text>
            </>
          ) : currentFlow != null ? (
            <Text strong style={{ fontSize: 13, color: token.colorText, fontFamily: smarthydro.typography.heading }}>
              {Number(currentFlow).toFixed(1)} L/s
            </Text>
          ) : (
            <Text style={{ fontSize: 12, color: token.colorTextDisabled, fontFamily: smarthydro.typography.body }}>—</Text>
          )}
        </Flex>
      );
    },
  },
  {
    title: "Nivel F.",
    key: "water_table",
    width: 85,
    align: "right",
    sorter: (a, b) => {
      const va = a.water_table_m ?? -Infinity;
      const vb = b.water_table_m ?? -Infinity;
      return va - vb;
    },
    render: (_, record) => {
      const v = record.water_table_m;
      return v != null ? (
        <Text style={{ fontSize: 13, color: smarthydro.colors.supporting.blue, fontFamily: smarthydro.typography.heading }}>
          {Number(v).toFixed(2)}
          <span style={{ fontSize: 10, marginLeft: 2, fontFamily: smarthydro.typography.body }}>m</span>
        </Text>
      ) : (
        <Text style={{ fontSize: 12, color: token.colorTextDisabled, fontFamily: smarthydro.typography.body }}>—</Text>
      );
    },
  },
  {
    title: "Auditoría",
    key: "audit",
    width: 140,
    align: "center",
    sorter: (a, b) => {
      const va = (a.flow_history?.count ?? a.flow_exceeded_count ?? 0) + (a.near_limit_history?.count ?? a.flow_near_limit_count ?? 0);
      const vb = (b.flow_history?.count ?? b.flow_exceeded_count ?? 0) + (b.near_limit_history?.count ?? b.flow_near_limit_count ?? 0);
      return va - vb;
    },
    render: (_, record) => {
      const flowHistory = record.flow_history;
      const nearLimitHistory = record.near_limit_history;
      const exceededCount = flowHistory?.count ?? record.flow_exceeded_count ?? 0;
      const nearLimitCount = nearLimitHistory?.count ?? record.flow_near_limit_count ?? 0;
      const exceededHasMore = flowHistory?.has_more ?? false;
      const nearLimitHasMore = nearLimitHistory?.has_more ?? false;
      const authorizedFlow = record.authorized_flow;
      
      return (
        <Flex vertical gap={4} align="center">
          {exceededCount > 0 || exceededHasMore ? (
            <Tooltip title={`Superó ${exceededCount}${exceededHasMore ? "+" : ""} veces el límite de ${authorizedFlow} L/s`}>
              <div
                role="button"
                tabIndex={0}
                aria-label={`Ver excedencias de ${record.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewComplianceDetail?.(record, "exceeded");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onViewComplianceDetail?.(record, "exceeded");
                  }
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  background: smarthydro.colors.semantic.errorBg,
                  borderRadius: smarthydro.radii.sm,
                  padding: "2px 6px",
                  border: `1px solid ${smarthydro.colors.semantic.errorBorder}`,
                  cursor: "pointer",
                  transition: smarthydro.transitions.base,
                  minWidth: 40,
                  height: 24
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = smarthydro.colors.semantic.errorBg; e.currentTarget.style.opacity = 0.85; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = smarthydro.colors.semantic.errorBg; e.currentTarget.style.opacity = 1; }}
              >
                <FaExclamationTriangle style={{ fontSize: 9, color: smarthydro.colors.semantic.error }} />
                <Text style={{ fontSize: 10, color: smarthydro.colors.semantic.error, fontWeight: smarthydro.typography.weights.semibold, fontFamily: smarthydro.typography.body }}>
                  {exceededHasMore ? "20+" : exceededCount}
                </Text>
              </div>
            </Tooltip>
          ) : null}
          
          {nearLimitCount > 0 || nearLimitHasMore ? (
            <Tooltip title={`Cercano al límite ${nearLimitCount}${nearLimitHasMore ? "+" : ""} veces`}>
              <div
                role="button"
                tabIndex={0}
                aria-label={`Ver cercanías de ${record.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewComplianceDetail?.(record, "near_limit");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onViewComplianceDetail?.(record, "near_limit");
                  }
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  background: smarthydro.colors.semantic.warningBg,
                  borderRadius: smarthydro.radii.sm,
                  padding: "2px 6px",
                  border: `1px solid ${smarthydro.colors.semantic.warningBorder}`,
                  cursor: "pointer",
                  transition: smarthydro.transitions.base,
                  minWidth: 40,
                  height: 24
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = smarthydro.colors.semantic.warningBg; e.currentTarget.style.opacity = 0.85; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = smarthydro.colors.semantic.warningBg; e.currentTarget.style.opacity = 1; }}
              >
                <FaChartLine style={{ fontSize: 9, color: smarthydro.colors.semantic.warning }} />
                <Text style={{ fontSize: 10, color: smarthydro.colors.semantic.warning, fontWeight: smarthydro.typography.weights.semibold, fontFamily: smarthydro.typography.body }}>
                  {nearLimitHasMore ? "20+" : nearLimitCount}
                </Text>
              </div>
            </Tooltip>
          ) : null}
        </Flex>
      );
    },
  },
  {
    title: "",
    key: "actions",
    width: 110,
    align: "center",
    fixed: "right",
    render: (_, record) => (
      <ActionButtons
        record={record}
        onViewVoucher={onViewVoucher}
        onOpenStopCompliance={onStopCompliance}
        onOpenSupport={onOpenSupport}
      />
    ),
  },
];

const CCComplianceTable = ({ points, last7, onViewVoucher, onOpenStopCompliance, onOpenSupport = () => {}, onViewPointConfig, onViewComplianceDetail, loading = false }) => {
  const { token } = useToken();

  const activeVars = useMemo(() => {
    const allVars = Object.values(last7 || {}).flatMap(w => w.variables || []);
    return {
      hasFlow: allVars.some(v => v.includes("CAUDAL")),
      hasLevel: allVars.some(v => v === "NIVEL" || v === "NIVEL_FREATICO"),
      hasTotal: allVars.some(v => v === "TOTALIZADO"),
    };
  }, [last7]);

  const columns = useMemo(() => {
    const allColumns = pointsColumns(onViewVoucher, onOpenStopCompliance, onOpenSupport, onViewPointConfig, onViewComplianceDetail, last7, token);
    return allColumns.filter(col => {
      if (col.key === "flow" && !activeVars.hasFlow) return false;
      if (col.key === "audit" && !activeVars.hasFlow) return false;
      if (col.key === "water_table" && !activeVars.hasLevel) return false;
      return true;
    });
  }, [onViewVoucher, onOpenStopCompliance, onOpenSupport, onViewPointConfig, onViewComplianceDetail, last7, token, activeVars]);

  return (
      <Table
        loading={loading}
        dataSource={points}
        columns={columns}
        rowKey="id"
        bordered
        size="small"
        scroll={{ x: "max-content" }}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        locale={{ emptyText: "No hay puntos disponibles" }}
      onRow={(record) => ({
        style: {
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          borderLeft: `4px solid ${levelColorMap[record.compliance_warning?.level || "safe"]?.color || levelColorMap.safe.color}`,
        },
      })}
    />
  );
};

export default React.memo(CCComplianceTable);
