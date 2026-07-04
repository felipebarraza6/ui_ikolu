import React from "react";
import { Drawer, Flex, Typography, Table } from "antd";
import { FaDownload, FaTimes } from "react-icons/fa";
import { format, parseISO } from "date-fns";
import { SmartButton } from "../../../shared/ui";
import { useIkoluToken } from "../../../hooks/useIkoluToken";


const { Text, Title } = Typography;

const CCFlowAnalysisDrawer = ({ 
  open, 
  onClose, 
  pointName, 
  authorizedFlow, 
  data 
}) => {
  const token = useIkoluToken();
  const measurements = Array.isArray(data) ? data : [];
  
  const handleExportCSV = () => {
    const headers = ["Fecha/Hora", "% del limite", "Autorizado (L/s)", "Caudal (L/s)"];
    const rows = measurements.map(m => {
      const flow = m.flow;
      const pct = authorizedFlow > 0 ? (flow / authorizedFlow) * 100 : 0;
      return [
        format(parseISO(m.date), "dd/MM/yyyy HH:mm"),
        Math.round(pct) + "%",
        authorizedFlow,
        flow
      ];
    });
    
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${pointName}_caudal.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <Drawer
      title={
        <Flex justify="space-between" align="center">
          <div>
            <Title level={5} style={{ margin: 0, color: token.voidTextHeading }}>{pointName}</Title>
            <Flex gap={8} align="center" style={{ marginTop: 4 }}>
              <Text strong style={{ fontSize: 14, color: token.voidTextHeading }}>
                Autorizado: {authorizedFlow} L/s
              </Text>
              <Text style={{ fontSize: 12, color: token.voidTextMuted }}>
                • {measurements.length} mediciones
              </Text>
            </Flex>
          </div>
          <FaTimes 
            style={{ cursor: "pointer", fontSize: 16, color: token.voidTextMuted }}
            onClick={onClose}
          />
        </Flex>
      }
      open={open}
      onClose={onClose}
      width={{ xs: "100%", md: 600 }}
      styles={{ body: { padding: 16, background: "transparent" } }}
    >
      {measurements.length === 0 ? (
        <Flex justify="center" align="center" className="ocean-empty-state">
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${token.colorWarning}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FaDownload style={{ fontSize: 20, color: token.colorWarning }} />
          </div>
          <Text style={{ fontSize: 14, color: token.voidTextMuted }}>No hay mediciones disponibles</Text>
        </Flex>
      ) : (
        <>
          <Flex justify="flex-end" className="ocean-drawer-actions">
            <SmartButton
              variant="void"
              size="sm"
              icon={<FaDownload size={12} />}
              onClick={handleExportCSV}
            >
              Descargar CSV
            </SmartButton>
          </Flex>
          <Table
            size="small"
            bordered
            dataSource={measurements.map((m, i) => ({ ...m, key: i }))}
            columns={[
              {
                title: "Fecha/Hora",
                dataIndex: "date",
                render: (date) => (
                  <Text style={{ fontSize: 12, color: token.voidTextMuted }}>
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
                  const pct = authorizedFlow > 0 ? (flow / authorizedFlow) * 100 : 0;
                  const isExceeded = authorizedFlow > 0 && flow > authorizedFlow;
                  return (
                    <Text 
                      strong 
                      style={{ fontSize: 13, color: isExceeded ? token.colorError : token.colorSuccess }}
                    >
                      {Math.round(pct)}%
                    </Text>
                  );
                },
              },
              {
                title: "Autorizado",
                align: "right",
                width: 100,
                render: () => (
                  <Text strong style={{ fontSize: 12, color: token.voidTextMuted }}>
                    {Number(authorizedFlow).toFixed(1)} L/s
                  </Text>
                ),
              },
              {
                title: "Caudal",
                dataIndex: "flow",
                align: "right",
                render: (flow) => {
                  const isExceeded = authorizedFlow > 0 && flow > authorizedFlow;
                  return (
                    <Text 
                      strong 
                      style={{ fontSize: 13, color: isExceeded ? token.colorError : token.voidTextHeading }}
                    >
                      {Number(flow).toFixed(1)} L/s
                    </Text>
                  );
                },
              },
            ]}
            pagination={{ pageSize: 10, size: "small" }}
          />
        </>
      )}
    </Drawer>
  );
};

export default React.memo(CCFlowAnalysisDrawer);
