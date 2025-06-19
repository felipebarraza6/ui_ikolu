import React, { useState, useEffect } from "react";
import { Table, Flex, Typography } from "antd";
import {
  formatFlow,
  formatInteger,
  formatLevel,
} from "../../../../utils/numberFormatter";

const { Text } = Typography;

const TableData = ({ data }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const columns = [
    {
      title: "Hora",
      dataIndex: "date_time_medition",
      key: "date",
      align: "center",
      width: 80,
      fixed: isMobile ? "left" : false,
      render: (date_time_medition) => {
        return <div>{date_time_medition.slice(11, 16)}</div>;
      },
    },
    {
      title: "Caudal (L/s)",
      dataIndex: "flow",
      key: "flow",
      align: "center",
      width: 100,
      render: (flow) => {
        return <div>{formatFlow(flow)}</div>;
      },
    },
    {
      title: "Total (m³)",
      dataIndex: "total",
      key: "total",
      align: "center",
      width: 120,
      render: (total) => formatInteger(total),
    },
    {
      title: "Nivel freático (m)",
      dataIndex: "water_table",
      key: "water_table",
      align: "center",
      width: 130,
      render: (water_table) => formatLevel(water_table),
    },
    {
      title: "Comprobante MEE",
      width: 200,
      align: "center",
      render: (obj) => {
        if (obj.n_voucher) {
          return (
            <Flex vertical justify="center" align="center" gap="small">
              <Text
                copyable
                size="small"
                style={{
                  border: "1px solid #1F3461",
                  color: "#1F3461",
                  padding: isMobile ? "3px" : "5px",
                  textAlign: "center",
                  fontSize: isMobile ? "10px" : "12px",
                  width: "100%",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                {obj.n_voucher}
              </Text>
              <span
                style={{
                  backgroundColor: "#1F3461",
                  color: "white",
                  padding: isMobile ? "3px" : "5px",
                  width: "100%",
                  textAlign: "center",
                  fontSize: isMobile ? "10px" : "12px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                {obj.return_dga}
              </span>
            </Flex>
          );
        }
        return (
          <span style={{ color: "#999", fontSize: "12px" }}>
            Sin comprobante
          </span>
        );
      },
    },
  ];

  return (
    <>
      {/* CSS para ocultar scrollbar pero mantener funcionalidad */}
      <style>{`
        .ant-table-body::-webkit-scrollbar {
          display: none;
        }
        .ant-table-body {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <Table
        dataSource={data}
        columns={columns}
        bordered
        size="small"
        pagination={{
          pageSize: isMobile ? 5 : 10,
          showSizeChanger: false,
          showQuickJumper: false,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} registros`,
        }}
        scroll={
          isMobile
            ? {
                x: 630, // Solo scroll horizontal en móvil
                y: 300,
              }
            : {
                y: 400, // Solo scroll vertical en desktop
              }
        }
      />
    </>
  );
};

export default TableData;
