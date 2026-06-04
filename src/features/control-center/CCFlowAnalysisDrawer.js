import React from "react";
import { Drawer, Flex, Typography, Table, Button, theme } from "antd";
import { FaDownload, FaTimes } from "react-icons/fa";
import { format, parseISO } from "date-fns";
import { smarthydro } from "../../theme/smarthydro.tokens";

const { Text, Title } = Typography;
const { useToken } = theme;

const CCFlowAnalysisDrawer = ({ 
  open, 
  onClose, 
  pointName, 
  authorizedFlow, 
  data 
}) => {
  const { token } = useToken();
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
            <Title level={5} style={{ margin: 0 }} className="ocean-text-xl ocean-text-primary">{pointName}</Title>
            <Flex gap={8} align="center" className="ocean-drawer-subtitle">
              <Text strong className="ocean-text-base ocean-text-cyan">
                Autorizado: {authorizedFlow} L/s
              </Text>
              <Text className="ocean-text-md ocean-text-secondary">
                • {measurements.length} mediciones
              </Text>
            </Flex>
          </div>
          <FaTimes 
            className="ocean-close-icon"
            onClick={onClose}
          />
        </Flex>
      }
      open={open}
      onClose={onClose}
      width={{ xs: "100%", md: 600 }}
      styles={{ body: { padding: 16 } }}
    >
      {measurements.length === 0 ? (
        <Flex justify="center" align="center" className="ocean-empty-state">
          <div className="ocean-empty-icon">
            <FaDownload style={{ fontSize: 20, color: smarthydro.colors.accent[200] }} />
          </div>
          <Text className="ocean-text-lg ocean-text-muted">No hay mediciones disponibles</Text>
        </Flex>
      ) : (
        <>
          <Flex justify="flex-end" className="ocean-drawer-actions">
            <Button 
              type="primary"
              size="small" 
              icon={<FaDownload size={12} />} 
              onClick={handleExportCSV}
              className="ocean-btn-export"
            >
              Descargar CSV
            </Button>
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
                  <Text className="ocean-text-md ocean-text-secondary">
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
                      className={isExceeded ? "ocean-text-base ocean-text-coral" : "ocean-text-base ocean-text-teal"}
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
                  <Text strong className="ocean-text-md ocean-text-cyan">
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
                      className={isExceeded ? "ocean-text-base ocean-text-coral" : "ocean-text-base ocean-text-primary"}
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
