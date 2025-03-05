import React, { useContext, useState } from "react";
import {
  Table,
  Tooltip,
  Flex,
  Button,
  Typography,
  Alert,
  DatePicker,
  Form,
} from "antd";
import QueueAnim from "rc-queue-anim";
import {
  WarningFilled,
  CheckCircleFilled,
  FileExcelFilled,
  LoadingOutlined,
  CopyOutlined,
  CloudDownloadOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import sh from "../../api/sh/endpoints";
const { Text } = Typography;
const Registers = ({ dataDga }) => {
  const { state } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  const selected = state.selected_profile.id;
  const profile_ikolu = state.selected_profile.profile_ikolu;
  const profile_dga = state.selected_profile.dga;
  console.log(profile_ikolu);

  const columns = [
    {
      title: "Fecha/hora medición",
      dataIndex: "date_time_medition",
      key: "date",
      align: "center",
    },
    {
      title: (
        <Flex vertical justify="center">
          <Flex justify="space-between">
            <Flex>Caudal (lt/s)</Flex>
          </Flex>
        </Flex>
      ),
      dataIndex: "flow",
      key: "flow",
      align: "end",
      render: (flow) => {
        return (
          <Flex gap={"small"} justify="space-between" align="center">
            <Text> {flow}</Text>
          </Flex>
        );
      },
    },
    {
      title: "Total(m³)",
      dataIndex: "total",
      key: "total",
      align: "end",
      render: (total) => parseInt(total).toLocaleString("es-CL"),
    },
    {
      title: "Nivel Freático(m)",
      dataIndex: "water_table",
      key: "water_table",
      align: "end",
    },

    {
      title: "Cumplimiento MEE",
      align: "end",
      key: "proof",
      render: (obj) => {
        if (obj.n_voucher) {
          return (
            <div
              hoverable
              size="small"
              style={{
                backgroundColor: "rgb(0, 111, 179)",
                color: "white",
                padding: "5px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              <Tooltip
                title={obj.return_dga}
                color={"green"}
                trigger={["click"]}
                style={{ width: "100%" }}
                overlayStyle={{ width: "100%" }}
                placement="left"
              >
                <Flex justify="space-between" align="center" gap={"small"}>
                  <CheckCircleFilled style={{ fontSize: "12px" }} />
                  <Text
                    style={{ fontSize: "12px", color: "white" }}
                    copyable={{
                      text: obj.n_voucher,
                      icon: [
                        <CopyOutlined
                          key="copy-icon"
                          style={{ color: "white" }}
                        />,
                        <CheckCircleFilled
                          key="copied-icon"
                          style={{ color: "white" }}
                        />,
                      ],
                    }}
                  >
                    {obj.n_voucher.slice(0, 10)}...
                  </Text>
                </Flex>
              </Tooltip>
            </div>
          );
        } else {
          return (
            <Flex gap={"small"}>
              <LoadingOutlined style={{ color: "rgb(31, 52, 97), " }} /> En cola
              de envío a DGA
              <Tooltip
                popupVisible={true}
                title={<span style={{ color: "black" }}>{obj.return_dga}</span>}
                color="rgb(254, 101, 101)"
              >
                <Button
                  size="small"
                  type="primary"
                  icon={<WarningFilled />}
                  style={{
                    backgroundColor: "rgb(254, 101, 101)",
                    borderColor: "rgb(254, 101, 101)",
                  }}
                >
                  estado
                </Button>
              </Tooltip>
            </Flex>
          );
        }
      },
    },
  ];

  const getReport = async (values) => {
    var datei = new Date(values.initialDate);
    var datef = new Date(values.finishDate);
    values = {
      ...values,
      initialDate: datei.toISOString().split("T")[0],
      finishDate: datef.toISOString().split("T")[0],
    };
    setLoading(true);

    const getReport = await sh
      .get_data_sh_range_to_excel_dga(
        selected,
        values.initialDate,
        values.finishDate,
        profile_dga.code_dga
      )
      .then((res) => {
        console.log(res);
        setLoading(false);
      })
      .then(() => {
        setLoading(false);
      });
  };

  return (
    <QueueAnim delay={500} type={["top", "bottom"]}>
      <div key={"registers"} style={{ width: "100%" }}>
        <Table
          style={{ width: "800px", borderRadius: "0px" }}
          title={() => (
            <Flex
              justify="center"
              align="center"
              style={{ width: "100%", height: "100%" }}
              gap="small"
            >
              <Alert
                size="small"
                style={{ padding: "5px", width: "50%" }}
                closable
                description={
                  <span style={{ fontSize: "12px" }}>
                    Las extracciones MEE deben ser registradas por un datalogger
                    según la normativa, por lo que se ignorará cualquier consumo
                    previo a nuestra instalación.
                  </span>
                }
                type="warning"
                icon={
                  <WarningFilled
                    style={{ color: "rgb(254, 101, 101)", fontSize: "15px" }}
                  />
                }
                showIcon
              />
              <Form
                layout="inline"
                style={{ width: "100%" }}
                onFinish={getReport}
              >
                <Form.Item
                  name={"initialDate"}
                  rules={[{ required: true, message: "" }]}
                >
                  <DatePicker
                    placeholder="Desde"
                    disabled={!profile_ikolu.m2}
                  />
                </Form.Item>
                <Form.Item
                  name={"finishDate"}
                  rules={[{ required: true, message: "" }]}
                >
                  <DatePicker
                    placeholder="Hasta"
                    disabled={!profile_ikolu.m2}
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    htmlType="submit"
                    type="primary"
                    shape="round"
                    icon={<CloudDownloadOutlined />}
                    loading={loading}
                    disabled={!profile_ikolu.m2}
                  >
                    {profile_dga.code_dga}.xlsx
                  </Button>
                </Form.Item>
              </Form>
            </Flex>
          )}
          bordered
          size="small"
          dataSource={dataDga}
          columns={columns}
          pagination={{
            defaultPageSize: 10,
            position: ["bottomLeft"],
          }}
        />
      </div>
    </QueueAnim>
  );
};

export default Registers;
