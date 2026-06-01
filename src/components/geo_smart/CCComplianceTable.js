import React, { useMemo } from "react";
import { Flex, Typography, Table, Tag, Tooltip, theme } from "antd";
import { FaClipboardCheck, FaEye, FaPauseCircle, FaHeadset, FaInfoCircle, FaExternalLinkAlt, FaExclamationTriangle, FaChartLine, FaCheckCircle } from "react-icons/fa";
import moment from "moment";
import { formatInteger } from "../../utils/numberFormatter";

const { Text } = Typography;
const { useToken } = theme;

const pointsColumns = (onViewVoucher, onStopCompliance, onOpenSupport, onViewPointConfig, onViewFlowAnalysis, last7, token) => [
  {
    title: "Punto",
    key: "point_code",
    width: 220,
    sorter: (a, b) => (a.title || "").localeCompare(b.title || ""),
    defaultSortOrder: "ascend",
    onHeaderCell: () => ({
      style: { background: token.colorPrimary, color: "#fff" },
    }),
    render: (_, record) => {
      return (
        <Flex vertical gap={2}>
          <Flex align="center" gap={6}>
            <Text strong style={{ fontSize: 13, color: token.colorText, lineHeight: 1.2 }}>
              {record.title || "—"}
            </Text>
            <FaInfoCircle
              style={{ fontSize: 11, color: token.colorPrimary, cursor: "pointer", opacity: 0.7 }}
              onClick={(e) => {
                e.stopPropagation();
                onViewPointConfig(record.title || record.name);
              }}
            />
          </Flex>
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
          {record.compliance_type?.includes("DGA") && (
            <Flex align="center" gap={4}>
              <Tag style={{ fontSize: 10, margin: 0, padding: "1px 5px", lineHeight: "15px", background: token.colorPrimaryBg, border: "none", color: token.colorPrimary, fontWeight: 600 }}>
                {record.standard}
              </Tag>
              <Tag style={{ fontSize: 10, margin: 0, padding: "1px 5px", lineHeight: "15px", background: token.colorBgLayout, border: "none", color: token.colorTextSecondary }}>
                {record.type_dga}
              </Tag>
            </Flex>
          )}
        </Flex>
      );
    },
  },
  {
    title: "Limites / Estado",
    key: "limits",
    width: 220,
    responsive: ["md"],
    onHeaderCell: () => ({
      style: { background: token.colorPrimary, color: "#fff" },
    }),
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
    onHeaderCell: () => ({
      style: { background: token.colorPrimary, color: "#fff" },
    }),
    render: (date) =>
      date ? (
        <Text style={{ fontSize: 12, color: token.colorText, whiteSpace: "nowrap" }}>
          {moment(date).format("DD/MM HH:mm")}
        </Text>
      ) : (
        <span style={{ color: token.colorTextDisabled }}>—</span>
      ),
  },
  {
    title: "Estado Caudal",
    key: "flow_status",
    width: 140,
    align: "center",
    onHeaderCell: () => ({
      style: { background: token.colorPrimary, color: "#fff" },
    }),
    render: (v, record) => {
      // 🆕 Usar datos del endpoint de compliance (histórico anual)
      const flowHistory = record.flow_history;
      const complianceWarning = record.compliance_warning;
      
      // Si hay datos del endpoint compliance, usarlos. Si no, fallback a MVP (last_7)
      const exceededCount = flowHistory?.count ?? record.flow_exceeded_count ?? 0;
      const nearLimitCount = record.flow_near_limit_count ?? 0;
      const isComplianceWarning = complianceWarning?.triggered ?? false;
      const pctConsumed = complianceWarning?.pct_consumed ?? record.pct_consumed ?? 0;
      const thresholdPct = complianceWarning?.threshold_pct ?? 80;
      
      const hasFlowHistory = !!flowHistory;
      
      // Color del valor actual: basado en valor ACTUAL vs autorizado (NO histórico)
      const currentFlow = record.flow_lps;
      const authorizedFlow = record.authorized_flow;
      const isCurrentExceeded = currentFlow != null && authorizedFlow > 0 && currentFlow > authorizedFlow;
      const isCurrentNearLimit = currentFlow != null && authorizedFlow > 0 && currentFlow >= authorizedFlow * 0.8 && currentFlow <= authorizedFlow;
      
      const flowColor = isCurrentExceeded 
        ? token.colorError 
        : isCurrentNearLimit 
          ? token.colorWarning 
          : token.colorSuccess;
      
      return (
        <Flex vertical align="center" gap={5} style={{ padding: "4px 0" }}>
          {/* Valor actual - color según estado ACTUAL */}
          {currentFlow != null ? (
            <Text strong style={{ fontSize: 14, color: flowColor }}>
              {Number(currentFlow).toFixed(1)}
              <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 2 }}>L/s</span>
            </Text>
          ) : (
            <Text style={{ fontSize: 13 }}>—</Text>
          )}
          
          {/* Métricas de caudal - HISTÓRICO */}
          <Flex vertical gap={2} style={{ width: "100%" }}>
            {exceededCount > 0 && (
              <Tooltip title={`Superó ${exceededCount} veces el límite de ${authorizedFlow} L/s`}>
                <Flex 
                  align="center" 
                  justify="center" 
                  gap={4} 
                  style={{ 
                    background: "#fff2f0", 
                    borderRadius: 4, 
                    padding: "2px 6px",
                    border: "1px solid #ffccc7",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewFlowAnalysis?.(record.title, authorizedFlow, flowHistory?.measurements || []);
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#ffe8e8"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#fff2f0"; }}
                >
                  <FaExclamationTriangle style={{ fontSize: 9, color: "#ff4d4f" }} />
                  <Text style={{ fontSize: 10, color: "#ff4d4f", fontWeight: 600 }}>
                    {exceededCount}
                  </Text>
                </Flex>
              </Tooltip>
            )}
            
            {nearLimitCount > 0 && (
              <Tooltip title={`Cercano al límite ${nearLimitCount} veces`}>
                <Flex 
                  align="center" 
                  justify="center" 
                  gap={4} 
                  style={{ 
                    background: "#fff7e6", 
                    borderRadius: 4, 
                    padding: "2px 6px",
                    border: "1px solid #ffd591",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onClick={() => onViewFlowAnalysis?.(record.title, null, authorizedFlow, "near")}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#fff0d6"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#fff7e6"; }}
                >
                  <FaChartLine style={{ fontSize: 9, color: "#fa8c16" }} />
                  <Text style={{ fontSize: 10, color: "#fa8c16", fontWeight: 600 }}>
                    {nearLimitCount}
                  </Text>
                </Flex>
              </Tooltip>
            )}
            
            {exceededCount === 0 && nearLimitCount === 0 && (
              <Flex align="center" justify="center" gap={4} style={{ 
                background: "#f6ffed", 
                borderRadius: 4, 
                padding: "2px 6px",
                border: "1px solid #b7eb8f"
              }}>
                <FaCheckCircle style={{ fontSize: 9, color: "#52c41a" }} />
              </Flex>
            )}
          </Flex>
          
          {/* Alerta de cumplimiento (pct_consumed >= threshold) */}
          {isComplianceWarning && (
            <Tooltip title={`Consumo: ${Math.round(pctConsumed)}% del ${thresholdPct}% permitido`}>
              <Flex align="center" justify="center" gap={4} style={{ 
                background: "#fffbe6", 
                borderRadius: 4, 
                padding: "2px 6px",
                border: "1px solid #ffe58f"
              }}>
                <FaExclamationTriangle style={{ fontSize: 9, color: "#d48806" }} />
              </Flex>
            </Tooltip>
          )}
          
          {/* Nota indicando fuente de datos */}
          <Text style={{ fontSize: 9, color: token.colorTextSecondary }}>
            {hasFlowHistory ? "(resumen anual)" : "(últimos 7 días)"}
          </Text>
        </Flex>
      );
    },
  },
  {
    title: "Nivel",
    dataIndex: "water_table_m",
    key: "water_table_m",
    width: 85,
    align: "right",
    onHeaderCell: () => ({
      style: { background: token.colorPrimary, color: "#fff" },
    }),
    render: (v) =>
      v != null ? (
          <Text style={{ fontSize: 13, color: token.colorPrimary }}>
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
    onHeaderCell: () => ({
      style: { background: token.colorPrimary, color: "#fff" },
    }),
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

const CCComplianceTable = ({ points, last7, onViewVoucher, onOpenStopCompliance, onOpenSupport = () => {}, onViewPointConfig, onViewFlowAnalysis, onSelectPoint, loading = false }) => {
  console.log("[CCComplianceTable] onViewFlowAnalysis:", typeof onViewFlowAnalysis, onViewFlowAnalysis?.toString().substring(0, 50));
  const { token } = useToken();

  // Misma lógica que CCWeekConsumption: usar variables del backend
  const activeVars = useMemo(() => {
    const allVars = Object.values(last7 || {}).flatMap(w => w.variables || []);
    return {
      hasFlow: allVars.some(v => v.includes("CAUDAL")),
      hasLevel: allVars.some(v => v === "NIVEL" || v === "NIVEL_FREATICO"),
      hasTotal: allVars.some(v => v === "TOTALIZADO"),
    };
  }, [last7]);

  const columns = useMemo(() => {
    const allColumns = pointsColumns(onViewVoucher, onOpenStopCompliance, onOpenSupport, onViewPointConfig, onViewFlowAnalysis, last7, token);
    return allColumns.filter(col => {
      if (col.key === "flow_status" && !activeVars.hasFlow) return false;
      if (col.key === "water_table_m" && !activeVars.hasLevel) return false;
      if (col.key === "total_m3" && !activeVars.hasTotal) return false;
      return true;
    });
  }, [onViewVoucher, onOpenStopCompliance, onOpenSupport, onViewPointConfig, onViewFlowAnalysis, last7, token, activeVars]);

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
        },
        onMouseEnter: (e) => {
          e.currentTarget.style.background = token.colorBgTextHover;
          e.currentTarget.style.transition = "background 0.15s ease";
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.background = "transparent";
        },
      })}
    />
  );
};

export default React.memo(CCComplianceTable);
