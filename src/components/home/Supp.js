import React, { useContext, useState, useEffect } from "react";
import { Flex, Typography, Table, Card, Row, Col } from "antd";
import { AppContext } from "../../App";
import optimizedSh from "../../api/sh/optimizedEndpoints";


const { Title, Text } = Typography;

const Supp = () => {
  const { state } = useContext(AppContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const numberFormatter = new Intl.NumberFormat("de-DE");
  const primaryColor = "#001529";
  const accentColor = "#1890ff";

  // Identificar si es SMA o DGA basado en el primer punto disponible
  const pointsList = state.points_list || [];
  const firstProfile = pointsList[0];
  const rawWorkCode = firstProfile?.dga?.code_dga || firstProfile?.code_dga_site || "";
  const isDga = rawWorkCode.toUpperCase().startsWith("OB");
  const showSmaFeatures = !isDga;
  const workCode = rawWorkCode || "";

  const fetchData = async () => {
    setLoading(true);
    try {
      const profileIds = pointsList.map(p => p.id).filter(Boolean);
      if (profileIds.length === 0) {
        setData([]);
        return;
      }
      const batchResults = await optimizedSh.get_batch_telemetry(profileIds);
      
      let totalSum = 0;
      const updatedProfiles = pointsList.map(profile => {
        const data = batchResults[profile.id];
        if (data?.results?.length > 0) {
          const total = +data.results[0].total;
          totalSum += total;
          return { ...profile, total };
        }
        return { ...profile, total: 0 };
      });

      const totalRow = { title: "TOTAL ACUMULADO", total: totalSum, isTotal: true };
      const dataSource = [...updatedProfiles, totalRow];
      setData(dataSource);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 fetchAllData eliminado: evita cargar TODA la telemetría de TODOS los puntos

  useEffect(() => {
    fetchData();
  }, [state.points_list]);

  return (
    <Flex vertical gap="xl" style={{ marginTop: "-20px" }}>
      <div style={{ background: "#fff", padding: "20px 24px", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <Title level={4} style={{ margin: 0, color: primaryColor, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 4, height: 24, background: accentColor, borderRadius: 2 }} />
          Resumen General: {pointsList.map((rec) => rec.title).join(" + ")}
        </Title>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card 
            title={<Text strong style={{ color: "#595959" }}>RESUMEN POR PUNTO</Text>}
            bordered={false}
            style={{ borderRadius: 16, boxShadow: "0 4px 15px rgba(0,0,0,0.04)" }}
          >
            <Table
              dataSource={data}
              pagination={false}
              size="middle"
              loading={loading}
              rowClassName={(record) => record.isTotal ? "table-row-total" : ""}
              columns={[
                { 
                  title: "PUNTO DE CAPTACIÓN", 
                  dataIndex: "title",
                  render: (text, record) => <Text strong={record.isTotal}>{text}</Text>
                },
                {
                  title: "VOL. TOTAL (m³)",
                  dataIndex: "total",
                  align: "right",
                  render: (total, record) => (
                    <Text strong={record.isTotal} style={{ color: record.isTotal ? accentColor : "#595959" }}>
                      {numberFormatter.format(total)}
                    </Text>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <style>{`
        .table-row-total {
          background-color: #fafafa;
          font-weight: bold;
        }
        .ant-table-thead > tr > th {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #8c8c8c !important;
        }
      `}</style>
    </Flex>
  );
};

export default Supp;
