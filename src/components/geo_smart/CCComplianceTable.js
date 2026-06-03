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
        <Tag className="ocean-tag ocean-tag-default ocean-font-body">
          {typeDgaLabels[record.standard] || record.standard}
        </Tag>
        <Text className="ocean-text-xs ocean-text-secondary ocean-font-body">
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
              <Text strong className="ocean-text-lg ocean-font-heading" style={{ color: flowColor }}>
                {Number(currentFlow).toFixed(1)}
                <span className="ocean-text-xs ocean-font-normal ocean-ml-xs ocean-font-body">L/s</span>
              </Text>
              <Text className="ocean-text-xs ocean-text-secondary ocean-font-body">
                / {Number(authorizedFlow).toFixed(1)} L/s
              </Text>
            </>
          ) : currentFlow != null ? (
            <Text strong className="ocean-text-base ocean-text-primary ocean-font-heading">
              {Number(currentFlow).toFixed(1)} L/s
            </Text>
          ) : (
            <Text className="ocean-text-sm ocean-text-disabled ocean-font-body">—</Text>
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
        <Text className="ocean-text-base ocean-text-blue ocean-font-heading">
          {Number(v).toFixed(2)}
          <span className="ocean-text-xs ocean-ml-xs ocean-font-body">m</span>
        </Text>
      ) : (
        <Text className="ocean-text-sm ocean-text-disabled ocean-font-body">—</Text>
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
                className="ocean-audit-badge ocean-audit-badge-error"
                onMouseEnter={(e) => { e.currentTarget.style.opacity = 0.85; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = 1; }}
              >
                <FaExclamationTriangle className="ocean-audit-icon-error" />
                <Text className="ocean-text-xs ocean-font-semibold ocean-text-coral ocean-font-body">
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
                className="ocean-audit-badge ocean-audit-badge-warning"
                onMouseEnter={(e) => { e.currentTarget.style.opacity = 0.85; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = 1; }}
              >
                <FaChartLine className="ocean-audit-icon-warning" />
                <Text className="ocean-text-xs ocean-font-semibold ocean-text-orange ocean-font-body">
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
        size="small"
        scroll={{ x: "max-content" }}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        locale={{ emptyText: "No hay puntos disponibles" }}
        className="ocean-table ocean-table-transparent"
      onRow={(record) => ({
        className: "ocean-table-row",
        style: {
          borderLeft: `4px solid ${levelColorMap[record.compliance_warning?.level || "safe"]?.color || levelColorMap.safe.color}`,
        },
      })}
    />
  );
};

export default React.memo(CCComplianceTable);
