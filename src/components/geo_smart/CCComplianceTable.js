import React, { useMemo } from "react";
import { Flex, Typography, Table, Tag, Tooltip, theme } from "antd";
import { FaEye, FaPauseCircle, FaHeadset, FaInfoCircle, FaExternalLinkAlt, FaExclamationTriangle, FaChartLine, FaCheckCircle, FaShieldAlt, FaTint } from "react-icons/fa";
import moment from "moment";
import { formatInteger } from "../../utils/numberFormatter";

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
  safe: { color: "#52c41a", bg: "#f6ffed", border: "#b7eb8f", label: "Dentro de límites" },
  warning: { color: "#fa8c16", bg: "#fff7e6", border: "#ffd591", label: "Cerca de superar límite" },
  critical: { color: "#ff4d4f", bg: "#fff2f0", border: "#ffccc7", label: "Incumplimiento detectado" },
  unknown: { color: "#8c8c8c", bg: "#fafafa", border: "#d9d9d9", label: "Sin límites configurados" },
};

const pointsColumns = (onViewVoucher, onStopCompliance, onOpenSupport, onViewPointConfig, onViewComplianceDetail, last7, token) => [
  {
    title: "Punto",
    key: "point_name",
    width: 100,
    sorter: (a, b) => (a.title || "").localeCompare(b.title || ""),
    defaultSortOrder: "ascend",

    render: (_, record) => {
      const level = record.compliance_warning?.level || "safe";
      const levelCfg = levelColorMap[level] || levelColorMap.safe;
      
      return (
        <Flex vertical>
          <Flex justify="space-between" align="center">
            <Text strong style={{ fontSize: 13, color: token.colorText, lineHeight: 1.2 }}>
              {record.title?.slice(0,20) || "—"}
            </Text>
            <FaInfoCircle
              style={{ fontSize: 11, color: token.colorPrimary, cursor: "pointer", opacity: 0.7 }}
              onClick={(e) => {
                e.stopPropagation();
                onViewPointConfig(record.title || record.name);
              }}
            />
          </Flex>
          <Flex justify="space-between">
            {record.compliance_type?.includes("DGA") && (
              <Tag style={{ fontSize: 10, margin: 0, padding: "1px 5px", lineHeight: "15px", background: token.colorPrimaryBg, border: "none", color: token.colorPrimary, fontWeight: 600 }}>
                DGA
              </Tag>
            )}
            {record.compliance_type?.includes("SMA") && (
              <Tag style={{ fontSize: 10, margin: 0, padding: "1px 5px", lineHeight: "15px", background: "#f6ffed", border: "none", color: "#52c41a", fontWeight: 600 }}>
                SMA
              </Tag>
            )}
            {record.code && (
              record.compliance_type?.includes("DGA") ? (
                <a
                  href={`https://snia.mop.gob.cl/cExtracciones2/#/consultaQR/${encodeURIComponent(record.code)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: token.colorPrimary, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {record.code}
                  <FaExternalLinkAlt style={{ fontSize: 9, opacity: 0.7 }} />
                </a>
              ) : (
                <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>
                  {record.code}
                </Text>
              )
            )}
          </Flex>
        </Flex>
      );
    },
  },
  {
    title: "Tipo",
    key: "type",
    width: 100,
    align: "center",
    responsive: ["md"],
    render: (_, record) => (
      <Flex vertical gap={2} align="center">
        <Tag style={{ fontSize: 10, margin: 0, padding: "1px 6px", lineHeight: "15px", background: token.colorBgLayout, border: `1px solid ${token.colorBorder}`, color: token.colorTextSecondary }}>
          {typeDgaLabels[record.standard] || record.standard}
        </Tag>
        <Text style={{ fontSize: 10, color: token.colorTextSecondary }}>
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

    render: (_, record) => {
      const pct = record.pct_consumed;
      const pctNum = pct != null ? Number(pct) : null;
      const color = pctNum == null ? token.colorTextDisabled
        : pctNum > 100 ? token.colorError
        : pctNum > 80 ? token.colorWarning
        : token.colorSuccess;
      
      return (
        <Flex vertical gap={4} align="center">
          {pctNum != null ? (
            <>
              <Text strong style={{ fontSize: 14, color }}>
                {pctNum.toFixed(1)}%
              </Text>
              <div style={{ width: "100%", height: 6, borderRadius: 3, background: token.colorBgLayout, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(pctNum, 100)}%`,
                    borderRadius: 3,
                    background: color,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              {record.authorized_total > 0 && record.annual_consumption != null && (
                <Text style={{ fontSize: 9, color: token.colorTextSecondary }}>
                  {formatInteger(record.annual_consumption)} / {formatInteger(record.authorized_total)} m³
                </Text>
              )}
            </>
          ) : (
            <Text style={{ fontSize: 12, color: token.colorTextDisabled }}>—</Text>
          )}
        </Flex>
      );
    },
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
              <Text strong style={{ fontSize: 14, color: flowColor }}>
                {Number(currentFlow).toFixed(1)}
                <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 2 }}>L/s</span>
              </Text>
              <Text style={{ fontSize: 9, color: token.colorTextSecondary }}>
                / {Number(authorizedFlow).toFixed(1)} L/s
              </Text>
            </>
          ) : currentFlow != null ? (
            <Text strong style={{ fontSize: 13, color: token.colorText }}>
              {Number(currentFlow).toFixed(1)} L/s
            </Text>
          ) : (
            <Text style={{ fontSize: 12, color: token.colorTextDisabled }}>—</Text>
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
        <Text style={{ fontSize: 13, color: token.colorPrimary }}>
          {Number(v).toFixed(2)}
          <span style={{ fontSize: 10, marginLeft: 2 }}>m</span>
        </Text>
      ) : (
        <Text style={{ fontSize: 12, color: token.colorTextDisabled }}>—</Text>
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
                  background: "#fff2f0",
                  borderRadius: 4,
                  padding: "2px 6px",
                  border: "1px solid #ffccc7",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  minWidth: 40,
                  height: 24
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#ffe8e8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#fff2f0"; }}
              >
                <FaExclamationTriangle style={{ fontSize: 9, color: "#ff4d4f" }} />
                <Text style={{ fontSize: 10, color: "#ff4d4f", fontWeight: 600 }}>
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
                  background: "#fff7e6",
                  borderRadius: 4,
                  padding: "2px 6px",
                  border: "1px solid #ffd591",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  minWidth: 40,
                  height: 24
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#fff0d6"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#fff7e6"; }}
              >
                <FaChartLine style={{ fontSize: 9, color: "#fa8c16" }} />
                <Text style={{ fontSize: 10, color: "#fa8c16", fontWeight: 600 }}>
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
    title: "Estado",
    key: "compliance_status",
    width: 110,
    align: "center",
    sorter: (a, b) => {
      const levelOrder = { critical: 0, warning: 1, unknown: 2, safe: 3 };
      const va = levelOrder[a.compliance_warning?.level || "safe"] ?? 3;
      const vb = levelOrder[b.compliance_warning?.level || "safe"] ?? 3;
      return va - vb;
    },

    render: (_, record) => {
      const level = record.compliance_warning?.level || "safe";
      const status = record.compliance_warning?.status || levelColorMap[level]?.label || "—";
      const levelCfg = levelColorMap[level] || levelColorMap.safe;
      
      return (
        <Tooltip title={status}>
          <div
            role="button"
            tabIndex={0}
            aria-label={`Ver detalle de cumplimiento de ${record.title}`}
            onClick={(e) => {
              e.stopPropagation();
              onViewComplianceDetail?.(record, "detail");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onViewComplianceDetail?.(record, "detail");
              }
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              background: levelCfg.bg,
              borderRadius: 4,
              padding: "3px 8px",
              border: `1px solid ${levelCfg.border}`,
              cursor: "pointer",
              transition: "all 0.2s",
              minWidth: 80
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = 0.85; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = 1; }}
          >
            {level === "safe" && <FaCheckCircle style={{ fontSize: 10, color: levelCfg.color }} />}
            {level === "warning" && <FaExclamationTriangle style={{ fontSize: 10, color: levelCfg.color }} />}
            {level === "critical" && <FaExclamationTriangle style={{ fontSize: 10, color: levelCfg.color }} />}
            {level === "unknown" && <FaShieldAlt style={{ fontSize: 10, color: levelCfg.color }} />}
            <Text style={{ fontSize: 10, color: levelCfg.color, fontWeight: 600 }}>
              {level === "safe" ? "OK" : level === "warning" ? "Alerta" : level === "critical" ? "Crítico" : "N/A"}
            </Text>
          </div>
        </Tooltip>
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
      <Flex align="center" justify="center" gap={6} onClick={(e) => e.stopPropagation()}>
        {record.voucher ? (
          <Tooltip title="Ver voucher">
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background 0.2s",
                background: `${token.colorPrimary}10`,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = `${token.colorPrimary}20`)}
              onMouseLeave={(e) => (e.currentTarget.style.background = `${token.colorPrimary}10`)}
              onClick={(e) => {
                e.stopPropagation();
                onViewVoucher(record);
              }}
            >
              <FaEye style={{ fontSize: 11, color: token.colorPrimary }} />
            </div>
          </Tooltip>
        ) : (
          <div style={{ width: 24, height: 24 }} />
        )}
        <Tooltip title="Solicitar detención de cumplimiento">
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
            }}
            onClick={(e) => {
              e.stopPropagation();
              onStopCompliance(record);
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${token.colorPrimary}15`; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = `${token.colorPrimary}08`; }}
          >
            <FaPauseCircle style={{ fontSize: 10, color: token.colorPrimary }} />
          </div>
        </Tooltip>
        <Tooltip title="Solicitar soporte">
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
            }}
            onClick={(e) => {
              e.stopPropagation();
              onOpenSupport(record, "CUMPLIMIENTO");
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${token.colorPrimary}15`; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = `${token.colorPrimary}08`; }}
          >
            <FaHeadset style={{ fontSize: 10, color: token.colorPrimary }} />
          </div>
        </Tooltip>
      </Flex>
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
