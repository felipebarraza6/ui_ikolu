import React from "react";
import { Drawer, Flex, Typography, Table, Button, theme } from "antd";
import { FaDownload, FaTimes } from "react-icons/fa";
import moment from "moment";

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
        moment(m.date).format("DD/MM/YYYY HH:mm"),
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
            <Title level={5} style={{ margin: 0 }}>{pointName}</Title>
            <Flex gap={8} align="center" style={{ marginTop: 4 }}>
              <Text strong style={{ fontSize: 13, color: token.colorPrimary }}>
                Autorizado: {authorizedFlow} L/s
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                • {measurements.length} mediciones
              </Text>
            </Flex>
          </div>
          <FaTimes 
            style={{ cursor: "pointer", fontSize: 16, color: "#999" }} 
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
        <Flex justify="center" align="center" style={{ height: 200 }} vertical gap={12}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(0, 180, 216, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaDownload style={{ fontSize: 20, color: 'rgba(0, 180, 216, 0.4)' }} />
          </div>
          <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 14 }}>No hay mediciones disponibles</Text>
        </Flex>
      ) : (
        <>
          <Flex justify="flex-end" style={{ marginBottom: 16 }}>
            <Button 
              type="primary"
              size="small" 
              icon={<FaDownload size={12} />} 
              onClick={handleExportCSV}
              style={{ 
                borderRadius: 6,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
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
                  <Text style={{ fontSize: 12 }}>
                    {moment(date).format("DD/MM/YYYY HH:mm")}
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
                      style={{ 
                        fontSize: 13, 
                        color: isExceeded ? token.colorError : token.colorSuccess 
                      }}
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
                  <Text strong style={{ fontSize: 12, color: token.colorPrimary }}>
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
                      style={{ 
                        fontSize: 13, 
                        color: isExceeded ? token.colorError : token.colorText 
                      }}
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
