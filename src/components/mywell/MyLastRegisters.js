import React, { useContext, useState, useMemo } from "react";
import { Button, Drawer, Tag, Table, Typography, Flex } from "antd";
import {
  TableOutlined,
  CloseCircleFilled,
  ClockCircleOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import { useResponsive } from "../../hooks/useResponsive";

const { Text } = Typography;
const numberForMiles = new Intl.NumberFormat("de-DE");

const MyLastRegisters = () => {
  const { state } = useContext(AppContext);
  const { isMobile } = useResponsive();
  const [visible, setVisible] = useState(false);
  
  const vars = state.selected_profile?.config_data?.variables || [];
  const todayData = state.selected_profile?.modules?.today || [];
  
  const columns = useMemo(() => {
    const cols = [
      {
        title: (
          <span>
            <ClockCircleOutlined /> Hora
          </span>
        ),
        render: (a) => a.date_time_medition.slice(11, 16) + " hrs",
        width: 100,
      }
    ];

    // Mapeo dinámico de variables basado en la configuración
    const configVariables = vars || [];
    
    configVariables.forEach(v => {
      const type = v.type_variable;
      const label = v.label || v.str_variable;
      const unit = v.unit_measurement || (type?.includes("CAUDAL") ? "lt/s" : type?.includes("NIVEL") ? "m" : "m³");
      const dataIndex = type?.includes("CAUDAL") ? "flow" : type?.includes("NIVEL") ? "water_table" : "total";
      
      const col = {
        title: `${label} (${unit})`,
        dataIndex: dataIndex,
        align: "right",
        render: (value, record, index) => {
          const nextRecord = todayData[index + 1];
          const prevValue = nextRecord?.[dataIndex];
          let variation = null;
          
          if (prevValue && prevValue > 0 && typeof value === 'number') {
            variation = ((value - prevValue) / prevValue) * 100;
          }

          const color = type?.includes("CAUDAL") ? "#1890ff" : type?.includes("NIVEL") ? "#fa8c16" : "#1F3461";

          return (
            <Flex vertical align="end">
              <Text strong style={{ color: color }}>
                {typeof value === 'number' ? 
                  (type === "TOTALIZADO" ? numberForMiles.format(value) : value.toFixed(2)) 
                  : value || "0"}
              </Text>
              {variation !== null && Math.abs(variation) > 0.1 && (
                <Flex align="center" gap={2}>
                  {variation > 0 ? <RiseOutlined style={{ color: "#52c41a", fontSize: 10 }} /> : <FallOutlined style={{ color: "#ff4d4f", fontSize: 10 }} />}
                  <Text style={{ fontSize: 10, color: variation > 0 ? "#52c41a" : "#ff4d4f", fontWeight: 700 }}>
                    {variation > 0 ? "+" : ""}{variation.toFixed(1)}%
                  </Text>
                </Flex>
              )}
            </Flex>
          );
        }
      };
      
      cols.push(col);
    });

    // Siempre agregar la columna de Consumo (Diferencia) si no está explícitamente en vars
    if (!configVariables.some(v => v.type_variable === "CONSUMO")) {
      cols.push({
        title: "Consumo (m³)",
        dataIndex: "total_diff",
        align: "right",
        render: (value) => (
          <Tag color="cyan" style={{ borderRadius: 4, fontWeight: 700, border: "none", margin: 0 }}>
            +{numberForMiles.format(value || 0)}
          </Tag>
        ),
      });
    }

    return cols;
  }, [vars, todayData]);

  return (
    <>
      <Drawer
        open={visible}
        styles={{
          body: {
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(20px)",
            padding: "16px"
          },
          header: {
            background: "linear-gradient(90deg, #1F3461 0%, #1890ff 100%)",
            borderBottom: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          },
          close: {
            color: "white"
          }
        }}
        width={isMobile ? "100%" : 850} // Aumentado para acomodar más columnas dinámicas
        onClose={() => setVisible(false)}
        title={
          <Flex align="center" gap={12}>
            <div style={{ 
              background: "rgba(255,255,255,0.2)", 
              padding: "6px", 
              borderRadius: "8px",
              display: "flex",
              alignItems: "center"
            }}>
              <TableOutlined style={{ fontSize: 20, color: "white" }} />
            </div>
            <Text style={{ color: "white", fontSize: 18, fontWeight: 800 }}>
              Registros Históricos
            </Text>
          </Flex>
        }
      >
        <Table
          dataSource={todayData}
          columns={columns}
          rowKey="id"
          scroll={{ x: 600 }}
          bordered
          size="middle"
          style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
          pagination={{
            pageSize: 15,
            showSizeChanger: false,
            position: ["bottomCenter"]
          }}
        />
      </Drawer>
      <Button
        size={"small"}
        type={"primary"}
        shape={"round"}
        icon={<TableOutlined />}
        onClick={() => setVisible(true)}
        style={{ fontWeight: 600, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
      >
        Mediciones ({todayData.length})
      </Button>
    </>
  );
};

export default MyLastRegisters;
