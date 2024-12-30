import React, { useContext, useState, useEffect } from "react";
import { Flex, Typography, Table, Card, Button } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import { AppContext } from "../../App";
import sh from "../../api/sh/endpoints";

const { Title } = Typography;

const Supp = () => {
  const { state } = useContext(AppContext);
  const [data, setData] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [dataProcessing, setDataProcessing] = useState([]);

  const numberFormatter = new Intl.NumberFormat("de-DE");

  const fetchData = async () => {
    let totalSum = 0;
    for (const profile of state.profile_client) {
      const data = await sh.get_data_sh(profile.id);
      console.log(data);
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
    const title = `Registros enviados a la DGA - ${formattedDate} `;
    const allData = [];
    const mergedData = [];
    const mergedMap = new Map();

    for (const profile of state.profile_client) {
      const data = await sh.get_data_sh(profile.id);
      for (const result of data.results) {
        const key = result.date_time_medition;
        if (mergedMap.has(key)) {
          mergedMap.set(key, mergedMap.get(key) + Number(result.total));
        } else {
          mergedMap.set(key, Number(result.total));
        }
      }
    }

    mergedMap.forEach((total, date) => {
      mergedData.push({
        date_time_medition: date,
        total: total,
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
        Resumen de captaciones superficiales (
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
              title: "Total (m³)",
              dataIndex: "total",
              render: (total) => numberFormatter.format(total),
            },
          ]}
        />
        <Card
          title={dataProcessing.title}
          style={{ width: "100%" }}
          hoverable
          extra={
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
                title: "Total (m³)",
                dataIndex: "total",
                render: (total) => numberFormatter.format(total),
              },
            ]}
          />
        </Card>
      </Flex>
    </Flex>
  );
};

export default Supp;
