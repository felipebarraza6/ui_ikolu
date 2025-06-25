import React, { useState, useEffect } from "react";
import { Table } from "antd";
import {
  formatFlow,
  formatInteger,
  formatLevel,
} from "../../../../utils/numberFormatter";
import DataSummary from "../../DataSummary";

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
      title: "Consumo (m³/h)",
      dataIndex: "total_diff",
      key: "consumo",
      align: "center",
      width: 130,
      render: (total_diff) => formatInteger(total_diff),
    },
    {
      title: "Consumo (m³/d)",
      dataIndex: "total_today_diff",
      key: "total_today_diff",
      align: "center",
      width: 130,
      render: (total_today_diff) => formatInteger(total_today_diff),
    },
    {
      title: "Nivel freático (m)",
      dataIndex: "water_table",
      key: "water_table",
      align: "center",
      width: 140,
      render: (water_table) => formatLevel(water_table),
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

      {/* Componente reutilizable de resumen inteligente para DGA */}
      <DataSummary
        data={data}
        periodType="day"
        title="Resumen Inteligente DGA del Día"
        config={{
          // Configuración específica para DGA si es necesario
          flowUnit: "L/s",
          consumptionUnit: "m³/h",
          levelUnit: "m",
        }}
      />

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
                x: 700,
                y: 300,
              }
            : {
                y: 400,
              }
        }
      />
    </>
  );
};

export default TableData;
