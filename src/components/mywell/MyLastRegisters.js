import React, { useContext, useState } from "react";
import { Button, Drawer, Tag, Table } from "antd";
import {
  TableOutlined,
  CloseCircleFilled,
  ClockCircleOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";

const numberForMiles = new Intl.NumberFormat("de-DE");

const MyLastRegisters = () => {
  const { state } = useContext(AppContext);
  const [visible, setVisible] = useState(false);
  console.log(state.selected_profile.modules.today);
  return (
    <>
      <Drawer
        open={visible}
        style={{
          background:
            "radial-gradient(circle, rgba(31,52,97,1) 0%, rgba(31,52,97,0.8267900910364145) 100%)",
        }}
        width={700}
        onClose={() => setVisible(false)}
        closeIcon={<CloseCircleFilled style={{ color: "white" }} />}
        title={
          <span style={{ color: "white" }}>
            Telemetría {new Date().toLocaleDateString()}
          </span>
        }
        children={
          <Table
            dataSource={state.selected_profile.modules.today}
            key={"id"}
            bordered
            pagination={{
              pageSize: 10,
              nextIcon: <ArrowRightOutlined style={{ color: "white" }} />,
              prevIcon: <ArrowLeftOutlined style={{ color: "white" }} />,
              style: {
                color: "white",
                padding: "5px",
                borderRadius: "5px",
                justifyContent: "center",
              },
            }}
            columns={[
              {
                title: (
                  <span style={{ color: "black" }}>
                    <ClockCircleOutlined /> Hora
                  </span>
                ),
                render: (a) => a.date_time_medition.slice(11, 16) + " hrs",
              },
              {
                title: "Caudal(lt/s)",
                dataIndex: "flow",
              },

              {
                title: "Nivel Freático(m)",
                dataIndex: "water_table",
              },
              {
                title: "Total(m³)",
                render: (a) => {
                  return numberForMiles.format(a.total);
                },
              },

              {
                title: "Consumo(m³)",
                dataIndex: "total_diff",
                render: (a) => {
                  return numberForMiles.format(a);
                },
              },
            ]}
          />
        }
      />
      <Button
        size={"small"}
        type={"primary"}
        shape={"round"}
        icon={<TableOutlined />}
        onClick={() => setVisible(true)}
      >
        Mediciones ({state.selected_profile.modules.today.length})
      </Button>
    </>
  );
};

export default MyLastRegisters;
