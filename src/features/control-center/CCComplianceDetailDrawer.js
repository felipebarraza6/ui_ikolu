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
  
  const level = point.compliance_warning?.level || "safe";
  const levelCfg = levelColorMap[level] || levelColorMap.safe;
  const LevelIcon = levelCfg.icon;
  
  const flowHistory = point.flow_history || { count: 0, measurements: [] };
  const nearLimitHistory = point.near_limit_history || { count: 0, measurements: [] };
  const warning = point.compliance_warning || {};
  
  const handleExportExceededCSV = () => {
    const headers = ["Fecha/Hora", "Caudal (L/s)", "% del limite", "Autorizado (L/s)"];
    const rows = (flowHistory.measurements || []).map(m => {
      const flow = m.flow;
      const pct = point.authorized_flow > 0 ? (flow / point.authorized_flow) * 100 : 0;
      return [
        format(parseISO(m.date), "dd/MM/yyyy HH:mm"),
        flow,
        Math.round(pct) + "%",
        point.authorized_flow
      ];
    });
    exportToCSV(headers, rows, `${point.title}_excedencias.csv`);
  };
  
  const handleExportNearLimitCSV = () => {
    const headers = ["Fecha/Hora", "Caudal (L/s)", "% del limite", "Autorizado (L/s)"];
    const rows = (nearLimitHistory.measurements || []).map(m => {
      const flow = m.flow;
      const pct = point.authorized_flow > 0 ? (flow / point.authorized_flow) * 100 : 0;
      return [
        format(parseISO(m.date), "dd/MM/yyyy HH:mm"),
        flow,
        Math.round(pct) + "%",
        point.authorized_flow
      ];
    });
    exportToCSV(headers, rows, `${point.title}_cercanias.csv`);
  };
  
  return (
    <Drawer
      title={
        <Flex justify="space-between" align="center">
          <Flex vertical gap={4}>
            <Flex align="center" gap={8}>
              <LevelIcon style={{ fontSize: 18, color: levelCfg.color }} />
              <Title level={5} style={{ margin: 0 }}>{point.title}</Title>
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
                    {point.flow_lps != null && point.authorized_flow > 0 ? `${point.flow_lps.toFixed(1)} / ${point.authorized_flow.toFixed(1)} L/s` : "umbral: 90%"}
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
              
              {point.authorized_total > 0 && point.annual_consumption != null && (
                <Flex vertical>
                  <Text style={{ fontSize: 10, color: token.colorTextSecondary, textTransform: "uppercase" }}>Volumen anual</Text>
                  <Text strong style={{ fontSize: 16, color: token.colorText }}>
                    {Math.round(point.annual_consumption).toLocaleString()} m³
                  </Text>
                  <Text style={{ fontSize: 10, color: token.colorTextSecondary }}>
                    autorizado: {Math.round(point.authorized_total).toLocaleString()} m³
                  </Text>
                </Flex>
              )}
            </Flex>
          </div>
        </div>
        
        {/* Sección 2: Histórico de Excedencias */}
        <div>
          <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
            <Flex align="center" gap={8}>
              <FaExclamationTriangle style={{ fontSize: 14, color: "#ff4d4f" }} />
              <Text strong style={{ fontSize: 14 }}>
                Excedencias de caudal
              </Text>
              <Tag color="red" style={{ margin: 0 }}>{flowHistory.has_more ? "20+" : flowHistory.count} en {format(new Date(), 'yyyy')}</Tag>
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
            <div className="ocean-panel ocean-success-card ocean-text-center" style={{ padding: 24 }}>
              <FaCheckCircle style={{ fontSize: 24, color: "#2A9D8F", marginBottom: 8 }} />
              <Text className="ocean-text-base ocean-text-teal">Sin excedencias registradas este año</Text>
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
                    const flow = record.flow;
                    const pct = point.authorized_flow > 0 ? (flow / point.authorized_flow) * 100 : 0;
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
                      {Number(point.authorized_flow).toFixed(1)} L/s
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
        <div>
          <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
            <Flex align="center" gap={8}>
              <FaChartLine style={{ fontSize: 14, color: "#fa8c16" }} />
              <Text strong style={{ fontSize: 14 }}>
                Veces cerca del límite
              </Text>
              <Tag color="orange" style={{ margin: 0 }}>{nearLimitHistory.has_more ? "20+" : nearLimitHistory.count} en {format(new Date(), 'yyyy')}</Tag>
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
            <div className="ocean-panel ocean-text-center" style={{ padding: 24 }}>
              <Text className="ocean-text-base ocean-text-muted">Sin eventos cercanos al límite este año</Text>
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
                    const flow = record.flow;
                    const pct = point.authorized_flow > 0 ? (flow / point.authorized_flow) * 100 : 0;
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
                      {Number(point.authorized_flow).toFixed(1)} L/s
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
        {point.last_sent_at && (
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
                    {format(parseISO(point.last_sent_at), "dd/MM/yyyy HH:mm")}
                  </Text>
                </Flex>
                
                {point.voucher && (
                  <Flex vertical>
                    <Text style={{ fontSize: 10, color: token.colorTextSecondary, textTransform: "uppercase" }}>Voucher</Text>
                    <Text strong style={{ fontSize: 14, fontFamily: "monospace", color: token.colorPrimary }}>
                      {point.voucher}
                    </Text>
                  </Flex>
                )}
                
                {point.flow_lps != null && (
                  <Flex vertical>
                    <Text style={{ fontSize: 10, color: token.colorTextSecondary, textTransform: "uppercase" }}>Caudal enviado</Text>
                    <Text strong style={{ fontSize: 14 }}>
                      {point.flow_lps.toFixed(1)} L/s
                    </Text>
                  </Flex>
                )}
                
                {point.total_m3 != null && (
                  <Flex vertical>
                    <Text style={{ fontSize: 10, color: token.colorTextSecondary, textTransform: "uppercase" }}>Total enviado</Text>
                    <Text strong style={{ fontSize: 14 }}>
                      {Math.round(point.total_m3).toLocaleString()} m³
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
