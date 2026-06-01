import React from "react";
import { Drawer, Flex, Typography, Table, Tag } from "antd";
import { FaExclamationTriangle, FaTimes } from "react-icons/fa";
import moment from "moment";

const { Text, Title } = Typography;

const CCFlowAnalysisDrawer = ({ 
  open, 
  onClose, 
  pointName, 
  authorizedFlow, 
  data 
}) => {
  const measurements = Array.isArray(data) ? data : [];
  
  return (
    <Drawer
      title={
        <Flex justify="space-between" align="center">
          <div>
            <Title level={5} style={{ margin: 0 }}>{pointName}</Title>
            <Flex gap={8} align="center">
              <Text type="secondary" style={{ fontSize: 12 }}>
                Autorizado: <Text strong style={{ color: "#1890ff" }}>{authorizedFlow} L/s</Text>
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
      width={500}
      styles={{ body: { padding: 16 } }}
    >
      {measurements.length === 0 ? (
        <Flex justify="center" align="center" style={{ height: 200 }}>
          <Text type="secondary">No hay mediciones disponibles</Text>
        </Flex>
      ) : (
        <Table
          size="small"
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
              width: 120,
              render: (_, record) => {
                const flow = record.flow;
                const pct = authorizedFlow > 0 ? (flow / authorizedFlow) * 100 : 0;
                const isExceeded = authorizedFlow > 0 && flow > authorizedFlow;
                const excessPct = isExceeded ? Math.round(pct - 100) : 0;
                return (
                  <Flex vertical align="end" gap={2}>
                    <Text 
                      strong 
                      style={{ 
                        fontSize: 13, 
                        color: isExceeded ? "#ff4d4f" : "#52c41a" 
                      }}
                    >
                      {Math.round(pct)}%
                    </Text>
                    {isExceeded && (
                      <Text style={{ fontSize: 10, color: "#ff4d4f" }}>
                        (+{excessPct}%)
                      </Text>
                    )}
                  </Flex>
                );
              },
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
                      color: isExceeded ? "#ff4d4f" : "#1890ff" 
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
      )}
    </Drawer>
  );
};

export default React.memo(CCFlowAnalysisDrawer);
