import React, { useState, useEffect, useContext } from "react";
import { Table, Button, Flex } from "antd";
import { CloudDownloadOutlined } from "@ant-design/icons";
import DataSummary from "./DataSummary";
import sh from "../../api/sh/endpoints";
import { AppContext } from "../../App";
import {
  formatFlow,
  formatInteger,
  formatLevel,
} from "../../utils/numberFormatter";

/**
 * COMPONENTE DE TABLA DE DATOS UNIFICADO
 *
 * Muestra una tabla de datos y un resumen inteligente.
 * Es reutilizable para vistas diarias y mensuales.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {Array} props.data - Los datos a mostrar.
 * @param {string} props.periodType - 'day' o 'month'.
 * @param {boolean} props.isToday - Si los datos son del día actual.
 * @param {any} props.dateSelected - La fecha seleccionada (para descargas mensuales).
 */
const TableData = ({ data, periodType, isToday, dateSelected }) => {
  const { state } = useContext(AppContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDownload = async () => {
    if (periodType === "month" && dateSelected) {
      await sh.downloadMonth(
        state.selected_profile.id,
        dateSelected,
        dateSelected
      );
    }
  };

  const columns = [
    {
      title: periodType === "day" ? "Hora" : "Fecha",
      dataIndex: "date_time_medition",
      key: "date",
      align: "center",
      width: 80,
      fixed: isMobile ? "left" : false,
      render: (text) => (
        <div>
          {text.slice(
            periodType === "day" ? 11 : 5,
            periodType === "day" ? 16 : 10
          )}
        </div>
      ),
    },
    {
      title: "Caudal (L/s)",
      dataIndex: "flow",
      key: "flow",
      align: "center",
      width: 100,
      render: (flow) => <div>{formatFlow(flow)}</div>,
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
      <style>{`
        .ant-table-body::-webkit-scrollbar { display: none; }
        .ant-table-body { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <DataSummary
        data={data}
        periodType={periodType}
        title={`Resumen Inteligente ${
          isToday ? "de Hoy" : periodType === "day" ? "del Día" : "del Período"
        }`}
        isToday={isToday}
      />

      <Table
        title={() =>
          periodType === "month" ? (
            <Flex justify="end">
              <Button
                type="primary"
                icon={<CloudDownloadOutlined />}
                onClick={handleDownload}
              >
                Descargar registros (.xlsx)
              </Button>
            </Flex>
          ) : null
        }
        dataSource={data}
        columns={columns}
        bordered
        size="small"
        pagination={{
          pageSize: isMobile ? 5 : 10,
          showSizeChanger: false,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} registros`,
        }}
        scroll={isMobile ? { x: 700, y: 300 } : { y: 400 }}
      />
    </>
  );
};

export default TableData;
