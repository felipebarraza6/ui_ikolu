import React, { useContext, useState, useEffect } from "react";
import {
  Flex,
  Typography,
  Table,
  Card,
  Button,
  Tag,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  LinkOutlined,
  CheckCircleFilled,
  CloudServerOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import sh from "../../api/sh/endpoints";

const { Title } = Typography;

const Supp = () => {
  const { state } = useContext(AppContext);
  const [data, setData] = useState(null);
  const [dataProcessing, setDataProcessing] = useState([]);

  const numberFormatter = new Intl.NumberFormat("de-DE");

  const fetchData = async () => {
    let totalSum = 0;
    for (const profile of state.profile_client) {
      const data = await sh.get_data_sh(profile.id);
      if (data.results.length > 0) {
        profile.total = +data.results[0].total; // Convertir a número
        totalSum += profile.total;
      }
    }

    const totalRow = { title: "Total", total: totalSum };
    const dataSource = [...state.profile_client, totalRow];
    setData(dataSource);
  };

  const fetchAllData = async () => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US");
    const title = `Telemetria - ${formattedDate} `;
    const mergedData = [];
    const mergedMap = new Map();

    for (const profile of state.profile_client) {
      const data = await sh.get_data_sh(profile.id);
      for (const result of data.results) {
        const key = result.date_time_medition;
        if (mergedMap.has(key)) {
          const existing = mergedMap.get(key);
          console.log(result);
          console.log(existing);
          mergedMap.set(key, {
            total: existing.total + Number(result.total),
            flow: existing.flow + Number(result.flow),
            n_voucher: existing.n_voucher,
            id: existing.id,
          });
        } else {
          mergedMap.set(key, {
            total: Number(result.total),
            flow: Number(result.flow),
            n_voucher: result.n_voucher,
            id: result.id,
          });
        }
      }
    }
    console.log(mergedMap);

    mergedMap.forEach((value, date) => {
      mergedData.push({
        date_time_medition: date,
        total: value.total,
        flow: value.flow,

        n_voucher: value.n_voucher ? (
          <Tooltip
            title={
              <>
                <b>COMPROBANTE DGA:</b> {value.n_voucher}
              </>
            }
            color={"green"}
            trigger={"click"}
          >
            <Tag color="green" icon={<CheckCircleFilled />}>
              Enviado correctamente
            </Tag>
          </Tooltip>
        ) : (
          <Tag color="volcano" icon={<CloudServerOutlined />}>
            ref: #{value.id}
          </Tag>
        ),
      });
    });

    setDataProcessing({ title, data: mergedData });
  };

  useEffect(() => {
    fetchData();
    fetchAllData();
  }, []);

  console.log(state);

  return (
    <Flex vertical gap={"large"} style={{ marginTop: "-30px" }}>
      <Title level={4}>
        Resumen de captaciones (
        {state.profile_client.map((rec) => rec.title).join(", ")})
      </Title>
      <Flex gap={"large"}>
        <Table
          bordered
          dataSource={data}
          pagination={false}
          columns={[
            { dataIndex: "title", title: "Nombre" },
            {
              dataIndex: "standard",
              title: "Estandar",
            },
            {
              width: "100%",
              title: "Total (m³)",
              dataIndex: "total",
              render: (total) => numberFormatter.format(total),
            },
          ]}
        />
        <Card
          title={dataProcessing.title}
          style={{
            width: "100%",
            border: "1px solid white",
            background:
              "linear-gradient(124deg, rgba(255,255,255,1) 0%, rgba(165,171,173,1) 100%)",
          }}
          hoverable
          extra={
            state.profile_client[0].code_dga_site ? (
              <Button
                color={"green-inverse"}
                type={"primary"}
                icon={<LinkOutlined />}
                onClick={() => {
                  window.open(
                    `https://snia.mop.gob.cl/cExtracciones2/#/consultaQR/${state.profile_client[0].code_dga_site}`
                  );
                }}
              >
                <strong>{state.profile_client[0].code_dga_site}</strong>
              </Button>
            ) : null
          }
        >
          <Table
            bordered
            dataSource={dataProcessing.data}
            pagination={false}
            size="small"
            columns={[
              {
                dataIndex: "date_time_medition",
                title: "Fecha",
                render: (date) => date.slice(0, 10),
              },
              {
                dataIndex: "date_time_medition",
                title: "Hora",
                render: (time) => time.slice(11, 16) + " hrs",
              },
              {
                title: "Cualdal (lt/s)",
                dataIndex: "flow",
                render: (number) => parseFloat(number).toFixed(2),
              },
              {
                title: "Total (m³)",
                dataIndex: "total",
                render: (total) => numberFormatter.format(total),
              },
              {
                hidden: !state.profile_client[0].code_dga_site,
                title: "DGA",
                dataIndex: "n_voucher",
              },
            ]}
          />
        </Card>
      </Flex>
    </Flex>
  );
};

export default Supp;
