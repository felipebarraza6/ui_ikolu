import React from "react";
import { Drawer, Flex, Typography, Table, Button, Tag, Divider, theme } from "antd";
import { FaDownload, FaTimes, FaExclamationTriangle, FaCheckCircle, FaChartLine, FaShieldAlt, FaPaperPlane } from "react-icons/fa";
import { format, parseISO } from "date-fns";

const { Text, Title } = Typography;
const { useToken } = theme;

const levelColorMap = {
  safe: { color: "#2A9D8F", bg: "rgba(42, 157, 143, 0.1)", border: "rgba(42, 157, 143, 0.3)", icon: FaCheckCircle, label: "Dentro de límites" },
  warning: { color: "#F4A261", bg: "rgba(244, 162, 97, 0.1)", border: "rgba(244, 162, 97, 0.3)", icon: FaExclamationTriangle, label: "Cerca de superar límite" },
  critical: { color: "#E76F51", bg: "rgba(231, 111, 81, 0.1)", border: "rgba(231, 111, 81, 0.3)", icon: FaExclamationTriangle, label: "Incumplimiento detectado" },
  unknown: { color: "rgba(255, 255, 255, 0.4)", bg: "rgba(255, 255, 255, 0.05)", border: "rgba(255, 255, 255, 0.1)", icon: FaShieldAlt, label: "Sin límites configurados" },
};

const exportToCSV = (headers, rows, filename) => {
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const CCComplianceDetailDrawer = ({ open, onClose, point }) => {
  const { token } = useToken();
  
  if (!point) return null;

  // Normalizar campos: el backend usa snake_case (point_name, flow, water_table)
  // y el frontend transformado usa title, flow_lps, water_table_m.
  const pointName = point.title || point.point_name || point.name || "—";
  const flow = point.flow_lps ?? point.flow ?? null;
  const waterTable = point.water_table_m ?? point.water_table ?? null;
  const totalM3 = point.total_m3 ?? point.total ?? null;
  const annualConsumption = point.annual_consumption ?? null;
  const authorizedFlow = point.authorized_flow ?? 0;
  const authorizedTotal = point.authorized_total ?? 0;
  const lastSentAt = point.last_sent_at ?? null;
  const voucher = point.voucher ?? null;

  const level = point.compliance_warning?.level || "safe";
  const levelCfg = levelColorMap[level] || levelColorMap.safe;
  const LevelIcon = levelCfg.icon;

  const flowHistory = point.flow_history || { count: 0, measurements: [] };
  const nearLimitHistory = point.near_limit_history || { count: 0, measurements: [] };
  const warning = point.compliance_warning || {};

  const handleExportExceededCSV = () => {
    const headers = ["Fecha/Hora", "Caudal (L/s)", "% del limite", "Autorizado (L/s)"];
    const rows = (flowHistory.measurements || []).map(m => {
      const mFlow = m.flow;
      const pct = authorizedFlow > 0 ? (mFlow / authorizedFlow) * 100 : 0;
      return [
        format(parseISO(m.date), "dd/MM/yyyy HH:mm"),
        mFlow,
        Math.round(pct) + "%",
        authorizedFlow
      ];
    });
    exportToCSV(headers, rows, `${pointName}_excedencias.csv`);
  };

  const handleExportNearLimitCSV = () => {
    const headers = ["Fecha/Hora", "Caudal (L/s)", "% del limite", "Autorizado (L/s)"];
    const rows = (nearLimitHistory.measurements || []).map(m => {
      const mFlow = m.flow;
      const pct = authorizedFlow > 0 ? (mFlow / authorizedFlow) * 100 : 0;
      return [
        format(parseISO(m.date), "dd/MM/yyyy HH:mm"),
        mFlow,
        Math.round(pct) + "%",
        authorizedFlow
      ];
    });
    exportToCSV(headers, rows, `${pointName}_cercanias.csv`);
  };
  
  return (
    <Drawer
      title={
        <Flex justify="space-between" align="center">
          <Flex vertical gap={4}>
            <Flex align="center" gap={8}>
              <LevelIcon style={{ fontSize: 18, color: levelCfg.color }} />
              <Title level={5} style={{ margin: 0 }}>{pointName}</Title>
            </Flex>
            <Flex gap={8} align="center">
              {point.compliance_type?.includes("DGA") && (
                <Tag style={{ fontSize: 10, margin: 0, padding: "1px 5px", background: "rgba(58, 104, 170, 0.15)", border: "none", color: "#85A2D1", fontWeight: 600 }}>
                  DGA
                </Tag>
              )}
              {point.compliance_type?.includes("SMA") && (
                <Tag style={{ fontSize: 10, margin: 0, padding: "1px 5px", background: "rgba(42, 157, 143, 0.15)", border: "none", color: "#2A9D8F", fontWeight: 600 }}>
                  SMA
                </Tag>
              )}
              {point.code && (
                <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>{point.code}</Text>
              )}
            </Flex>
          </Flex>
          <FaTimes style={{ cursor: "pointer", fontSize: 16, color: "#999" }} onClick={onClose} />
        </Flex>
      }
      open={open}
      onClose={onClose}
      width={{ xs: "100%", md: 720 }}
      styles={{ body: { padding: "16px 24px" } }}
    >
      <Flex vertical gap={24}>
        {/* Sección 1: Warning Actual */}
        <div>
          <Flex align="center" gap={8} style={{ marginBottom: 12 }}>
            <LevelIcon style={{ fontSize: 16, color: levelCfg.color }} />
            <Text strong style={{ fontSize: 14, color: levelCfg.color }}>
              {warning.status || levelCfg.label}
            </Text>
          </Flex>
          
          <div style={{ background: levelCfg.bg, border: `1px solid ${levelCfg.border}` }} className="ocean-panel">
            {warning.messages && warning.messages.length > 0 && (
              <Flex vertical gap={8} style={{ marginBottom: 12 }}>
                {warning.messages.map((msg, i) => (
                  <Flex key={i} align="flex-start" gap={8}>
                    <Text style={{ fontSize: 12, color: token.colorText, lineHeight: 1.5 }}>→ {msg}</Text>
                  </Flex>
                ))}
              </Flex>
            )}
            
            <Divider style={{ margin: "12px 0" }} />
            
            <Flex gap={24}>
              {warning.flow_pct != null && (
                <Flex vertical>
                  <Text style={{ fontSize: 10, color: token.colorTextSecondary, textTransform: "uppercase" }}>Caudal al % del límite</Text>
                  <Text strong style={{ fontSize: 16, color: warning.flow_pct > 100 ? token.colorError : warning.flow_pct > 90 ? token.colorWarning : token.colorSuccess }}>
                    {warning.flow_pct.toFixed(1)}%
                  </Text>
                  <Text style={{ fontSize: 10, color: token.colorTextSecondary }}>
                    {flow != null && authorizedFlow > 0 ? `${Number(flow).toFixed(1)} / ${Number(authorizedFlow).toFixed(1)} L/s` : "umbral: 90%"}
                  </Text>
                </Flex>
              )}
              
              <Flex vertical>
                <Text style={{ fontSize: 10, color: token.colorTextSecondary, textTransform: "uppercase" }}>Consumo acumulado</Text>
                <Text strong style={{ fontSize: 16, color: warning.pct_consumed > 100 ? token.colorError : warning.pct_consumed > 80 ? token.colorWarning : token.colorSuccess }}>
                  {warning.pct_consumed?.toFixed(1) ?? "—"}%
                </Text>
                <Text style={{ fontSize: 10, color: token.colorTextSecondary }}>
                  umbral: {warning.threshold_pct ?? 80}%
                </Text>
              </Flex>
              
              {authorizedTotal > 0 && annualConsumption != null && (
                <Flex vertical>
                  <Text style={{ fontSize: 10, color: token.colorTextSecondary, textTransform: "uppercase" }}>Volumen anual</Text>
                  <Text strong style={{ fontSize: 16, color: token.colorText }}>
                    {Math.round(annualConsumption).toLocaleString()} m³
                  </Text>
                  <Text style={{ fontSize: 10, color: token.colorTextSecondary }}>
                    autorizado: {Math.round(authorizedTotal).toLocaleString()} m³
                  </Text>
                </Flex>
              )}
            </Flex>
          </div>
        </div>
        
        {/* Sección 2: Histórico de Excedencias */}
        <div style={{ padding: 16, background: token.colorBgContainer, borderRadius: token.borderRadiusLG, border: `1px solid ${token.colorBorder}` }}>
          <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
            <Flex align="center" gap={10}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255, 77, 79, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FaExclamationTriangle style={{ fontSize: 14, color: "#ff4d4f" }} />
              </div>
              <Flex vertical gap={2}>
                <Text strong style={{ fontSize: 14 }}>Excedencias de caudal</Text>
                <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>{flowHistory.count} eventos en {format(new Date(), 'yyyy')}</Text>
              </Flex>
            </Flex>
            {flowHistory.count > 0 && (
              <Button
                size="small"
                icon={<FaDownload size={11} />}
                onClick={handleExportExceededCSV}
                style={{ borderRadius: 6, fontWeight: 600 }}
              >
                Exportar CSV
              </Button>
            )}
          </Flex>

          {flowHistory.count === 0 ? (
            <div style={{ padding: "28px 24px", textAlign: "center", background: "rgba(42, 157, 143, 0.08)", borderRadius: token.borderRadius, border: "1px solid rgba(42, 157, 143, 0.2)" }}>
              <FaCheckCircle style={{ fontSize: 28, color: "#2A9D8F", marginBottom: 10 }} />
              <Text strong style={{ fontSize: 14, color: "#2A9D8F", display: "block" }}>Sin excedencias registradas</Text>
              <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>El caudal no ha superado el límite autorizado</Text>
            </div>
          ) : (
            <Table
              size="small"
              bordered
              dataSource={(flowHistory.measurements || []).map((m, i) => ({ ...m, key: i }))}
              columns={[
                {
                  title: "Fecha/Hora",
                  dataIndex: "date",
                  width: 160,
                  render: (date) => (
                    <Text style={{ fontSize: 12 }}>
                      {format(parseISO(date), "dd/MM/yyyy HH:mm")}
                    </Text>
                  ),
                },
                {
                  title: "% del límite",
                  align: "right",
                  width: 100,
                  render: (_, record) => {
                    const mFlow = record.flow;
                    const pct = authorizedFlow > 0 ? (mFlow / authorizedFlow) * 100 : 0;
                    return (
                      <Text strong style={{ fontSize: 13, color: token.colorError }}>
                        {Math.round(pct)}%
                      </Text>
                    );
                  },
                },
                {
                  title: "Autorizado",
                  align: "right",
                  width: 110,
                  render: () => (
                    <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
                      {Number(authorizedFlow).toFixed(1)} L/s
                    </Text>
                  ),
                },
                {
                  title: "Caudal",
                  dataIndex: "flow",
                  align: "right",
                  render: (flow) => (
                    <Text strong style={{ fontSize: 13, color: token.colorError }}>
                      {Number(flow).toFixed(1)} L/s
                    </Text>
                  ),
                },
              ]}
              pagination={{ pageSize: 10, size: "small" }}
            />
          )}
        </div>

        {/* Sección 3: Histórico de Cercanías */}
        <div style={{ padding: 16, background: token.colorBgContainer, borderRadius: token.borderRadiusLG, border: `1px solid ${token.colorBorder}` }}>
          <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
            <Flex align="center" gap={10}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(250, 140, 22, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FaChartLine style={{ fontSize: 14, color: "#fa8c16" }} />
              </div>
              <Flex vertical gap={2}>
                <Text strong style={{ fontSize: 14 }}>Cercanías al límite</Text>
                <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>{nearLimitHistory.count} eventos en {format(new Date(), 'yyyy')}</Text>
              </Flex>
            </Flex>
            {nearLimitHistory.count > 0 && (
              <Button
                size="small"
                icon={<FaDownload size={11} />}
                onClick={handleExportNearLimitCSV}
                style={{ borderRadius: 6, fontWeight: 600 }}
              >
                Exportar CSV
              </Button>
            )}
          </Flex>

          {nearLimitHistory.count === 0 ? (
            <div style={{ padding: "28px 24px", textAlign: "center", background: "rgba(250, 140, 22, 0.06)", borderRadius: token.borderRadius, border: "1px solid rgba(250, 140, 22, 0.2)" }}>
              <FaChartLine style={{ fontSize: 28, color: "#fa8c16", marginBottom: 10 }} />
              <Text strong style={{ fontSize: 14, color: "#fa8c16", display: "block" }}>Sin cercanías registradas</Text>
              <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>El caudal no ha estado cerca del límite autorizado</Text>
            </div>
          ) : (
            <Table
              size="small"
              bordered
              dataSource={(nearLimitHistory.measurements || []).map((m, i) => ({ ...m, key: i }))}
              columns={[
                {
                  title: "Fecha/Hora",
                  dataIndex: "date",
                  width: 160,
                  render: (date) => (
                    <Text style={{ fontSize: 12 }}>
                      {format(parseISO(date), "dd/MM/yyyy HH:mm")}
                    </Text>
                  ),
                },
                {
                  title: "% del límite",
                  align: "right",
                  width: 100,
                  render: (_, record) => {
                    const mFlow = record.flow;
                    const pct = authorizedFlow > 0 ? (mFlow / authorizedFlow) * 100 : 0;
                    return (
                      <Text strong style={{ fontSize: 13, color: token.colorWarning }}>
                        {Math.round(pct)}%
                      </Text>
                    );
                  },
                },
                {
                  title: "Autorizado",
                  align: "right",
                  width: 110,
                  render: () => (
                    <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
                      {Number(authorizedFlow).toFixed(1)} L/s
                    </Text>
                  ),
                },
                {
                  title: "Caudal",
                  dataIndex: "flow",
                  align: "right",
                  render: (flow) => (
                    <Text strong style={{ fontSize: 13, color: token.colorWarning }}>
                      {Number(flow).toFixed(1)} L/s
                    </Text>
                  ),
                },
              ]}
              pagination={{ pageSize: 10, size: "small" }}
            />
          )}
        </div>
        
        {/* Sección 4: Último Envío DGA */}
        {lastSentAt && (
          <div>
            <Flex align="center" gap={8} style={{ marginBottom: 12 }}>
              <FaPaperPlane style={{ fontSize: 14, color: token.colorPrimary }} />
              <Text strong style={{ fontSize: 14 }}>Último envío a DGA/SMA</Text>
            </Flex>
            
            <div className="ocean-panel" style={{ padding: 16 }}>
              <Flex gap={24} wrap="wrap">
                <Flex vertical>
                  <Text style={{ fontSize: 10, color: token.colorTextSecondary, textTransform: "uppercase" }}>Fecha</Text>
                  <Text strong style={{ fontSize: 14 }}>
                    {format(parseISO(lastSentAt), "dd/MM/yyyy HH:mm")}
                  </Text>
                </Flex>
                
                {voucher && (
                  <Flex vertical>
                    <Text style={{ fontSize: 10, color: token.colorTextSecondary, textTransform: "uppercase" }}>Voucher</Text>
                    <Text strong style={{ fontSize: 14, fontFamily: "monospace", color: token.colorPrimary }}>
                      {voucher}
                    </Text>
                  </Flex>
                )}

                {flow != null && (
                  <Flex vertical>
                    <Text style={{ fontSize: 10, color: token.colorTextSecondary, textTransform: "uppercase" }}>Caudal enviado</Text>
                    <Text strong style={{ fontSize: 14 }}>
                      {Number(flow).toFixed(1)} L/s
                    </Text>
                  </Flex>
                )}

                {totalM3 != null && (
                  <Flex vertical>
                    <Text style={{ fontSize: 10, color: token.colorTextSecondary, textTransform: "uppercase" }}>Total enviado</Text>
                    <Text strong style={{ fontSize: 14 }}>
                      {Math.round(totalM3).toLocaleString()} m³
                    </Text>
                  </Flex>
                )}
              </Flex>
            </div>
          </div>
        )}
      </Flex>
    </Drawer>
  );
};

export default React.memo(CCComplianceDetailDrawer);
