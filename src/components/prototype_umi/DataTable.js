import React, { useContext } from "react";
import { Table, Flex, Tag } from "antd";
import { AppContext } from "../../App";

const DataTable = () => {
  const { state } = useContext(AppContext);
  console.log(state.selected_profile);

  const today_data = state.selected_profile.modules.today;
  console.log(today_data);
  const sumByHour = today_data.reduce((acc, data) => {
    const hour = data.date_time_medition.slice(11, 13);
    const nivel = parseFloat(data.nivel);
    acc[hour] = (acc[hour] || 0) + Math.max(0, nivel);
    return acc;
  }, {});

  console.log(sumByHour);
  const total = (nivel) => {
    if (nivel <= 0) return "0";

    const vel_medium = 0.45;
    const area = 4.74;
    const rest_area = 0.53;

    var total_m3 = vel_medium * (area * nivel - rest_area) * 1000;
    total_m3 = Math.max(0, total_m3); // Ensure no negative values

    total_m3 = parseInt(total_m3).toLocaleString("de-DE");

    return total_m3;
  };

  return (
    <Flex
      justify="center"
      align="center"
      style={{
        paddingTop: "30px",
        background:
          "linear-gradient(31deg, rgba(146,146,146,1) 0%, rgba(31,52,97,1) 100%)",
        minHeight: "87vh",
        borderRadius: "10px",
      }}
    >
      <Table
        dataSource={today_data}
        pagination={{
          showSizeChanger: false,
        }}
        size={"small"}
        title={() => (
          <Flex justify="space-between">
            <Flex>Telemetría {new Date().toLocaleDateString()}</Flex>
            <Flex>
              <Tag color={"rgb(31, 52, 97)"}>
                {today_data.length} Mediciones
              </Tag>
            </Flex>
          </Flex>
        )}
        style={{ width: "700px" }}
        bordered
        columns={[
          {
            title: "Hora",
            dataIndex: "date_time_medition",
            align: "center",
            render: (date) => {
              var str_d = date.slice(11, 16) + " hrs";
              return str_d;
            },
          },
          {
            title: "Caudal(m³)",
            align: "end",
            dataIndex: "nivel",
            render: (nivel) => total(nivel),
          },
          {
            title: "Nivel(m)",
            align: "end",
            dataIndex: "nivel",
          },
        ]}
      ></Table>
    </Flex>
  );
};

export default DataTable;
