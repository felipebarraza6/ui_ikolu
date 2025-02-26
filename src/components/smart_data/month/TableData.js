import React, { useContext } from "react";
import { Table, Button, Flex } from "antd";
import { CloudDownloadOutlined } from "@ant-design/icons";
import sh from "../../../api/sh/endpoints";
import { AppContext } from "../../../App";

const TableData = ({ data, dateSelected }) => {
  const { state } = useContext(AppContext);
  const columns = [
    {
      title: "Hora",
      dataIndex: "date_time_medition",
      key: "date",
      align: "center",
      render: (date_time_medition) => {
        return <div>{date_time_medition.slice(5, 10)}</div>;
      },
    },
    {
      title: "Caudal(lt)",
      dataIndex: "flow",
      key: "flow",
      align: "end",
      render: (flow) => {
        return <div>{flow}</div>;
      },
    },
    {
      title: "Total(m³)",
      dataIndex: "total",
      key: "total",
      align: "end",
      render: (total) => total.toLocaleString("es-CL"),
    },
    {
      title: "Consumo promedio(m³/h)",
      dataIndex: "total_diff",
      key: "consumo",
      align: "end",
      render: (total_diff) => total_diff.toLocaleString("es-CL"),
    },
    {
      title: "Consumo(m³/d)",
      dataIndex: "total_today_diff",
      key: "total_today_diff",
      align: "end",
      render: (total_today_diff) => total_today_diff.toLocaleString("es-CL"),
    },
    {
      title: "Nivel freático(m)",
      dataIndex: "water_table",
      key: "water_table",
      align: "end",
    },
  ];
  const selected = state.selected_profile;
  console.log(selected.title);

  const downloadMonth = async () => {
    const response = await sh.downloadMonth(
      selected.id,
      dateSelected,
      dateSelected
    );
    console.log(response);
  };

  return (
    <Table
      title={() => (
        <Flex justify="end">
          <Button
            type={"primary"}
            icon={<CloudDownloadOutlined />}
            onClick={downloadMonth}
          >
            Descargar registros(.xlsx)
          </Button>
        </Flex>
      )}
      dataSource={data}
      columns={columns}
      bordered
      size="small"
      pagination={{ pageSize: 7 }}
    />
  );
};

export default TableData;
