import React, { useContext, useState, useEffect } from "react";
import { Flex, Typography, Table, Card, Button, Tag, Tooltip, Row, Col } from "antd";
import {
  LinkOutlined,
  CheckCircleFilled,
  CloudServerOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import optimizedSh from "../../api/sh/optimizedEndpoints";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const Supp = () => {
  const { state } = useContext(AppContext);
  const [data, setData] = useState(null);
  const [dataProcessing, setDataProcessing] = useState([]);
  const [loading, setLoading] = useState(false);

  const numberFormatter = new Intl.NumberFormat("de-DE");
  const primaryColor = "#001529";
  const accentColor = "#1890ff";

  // Identificar si es SMA o DGA basado en el primer perfil
  const firstProfile = state.profile_client[0];
  const rawWorkCode = firstProfile?.dga?.code_dga || firstProfile?.code_dga_site || "";
  const isDga = rawWorkCode.toUpperCase().startsWith("OB");
  const showSmaFeatures = !isDga;
  const workCode = rawWorkCode || "";

  const fetchData = async () => {
    setLoading(true);
    try {
      const profileIds = state.profile_client.map(p => p.id);
      const batchResults = await optimizedSh.get_batch_telemetry(profileIds);
      
      let totalSum = 0;
      const updatedProfiles = state.profile_client.map(profile => {
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

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const formattedDate = today.toLocaleDateString("es-ES", { day: 'numeric', month: 'long' });
      const title = `Monitoreo del ${formattedDate}`;
      const mergedMap = new Map();

      const profileIds = state.profile_client.map(p => p.id);
      const batchResults = await optimizedSh.get_batch_telemetry(profileIds);

      Object.values(batchResults).forEach(data => {
        if (data?.results) {
          data.results.forEach(result => {
            const key = result.date_time_medition;
            if (mergedMap.has(key)) {
              const existing = mergedMap.get(key);
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
          });
        }
      });

      const mergedData = Array.from(mergedMap.entries()).map(([date, value]) => ({
        date_time_medition: date,
        total: value.total,
        flow: value.flow,
        n_voucher: value.n_voucher ? (
          <Tooltip title={<b>COMPROBANTE {showSmaFeatures ? 'SMA' : 'DGA'}: {value.n_voucher}</b>} color={showSmaFeatures ? "purple" : "green"}>
            <Tag color={showSmaFeatures ? "purple" : "green"} icon={<CheckCircleFilled />}>
              {value.n_voucher}
            </Tag>
          </Tooltip>
        ) : (
          <Tag color="default" icon={<CloudServerOutlined />}>
            Ref: #{value.id}
          </Tag>
        ),
      }));

      setDataProcessing({ title, data: mergedData.sort((a,b) => b.date_time_medition.localeCompare(a.date_time_medition)) });
    } catch (error) {
      console.error("Error fetching all data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchData(), fetchAllData()]);
  }, [state.profile_client]);

  return (
    <Flex vertical gap="xl" style={{ marginTop: "-20px" }}>
      <div style={{ background: "#fff", padding: "20px 24px", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <Title level={4} style={{ margin: 0, color: primaryColor, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 4, height: 24, background: accentColor, borderRadius: 2 }} />
          Resumen General: {state.profile_client.map((rec) => rec.title).join(" + ")}
        </Title>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={24} lg={10}>
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

        <Col span={24} lg={14}>
          <Card
            title={<Text strong style={{ color: "#fff" }}>{dataProcessing.title}</Text>}
            bordered={false}
            style={{ 
              borderRadius: 16, 
              boxShadow: "0 8px 25px rgba(24, 144, 255, 0.15)",
              background: `linear-gradient(135deg, ${primaryColor} 0%, #003a8c 100%)`
            }}
            headStyle={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
            extra={
              isDga && (
                <Button
                  type="primary"
                  icon={<LinkOutlined />}
                  onClick={() => window.open(`https://snia.mop.gob.cl/cExtracciones2/#/consultaQR/${workCode}`)}
                  style={{ borderRadius: 8, background: "#52c41a", borderColor: "#52c41a" }}
                >
                  <strong>QR DGA: {workCode}</strong>
                </Button>
              )
            }
          >
            <div style={{ background: "#fff", borderRadius: 12, padding: 8 }}>
              <Table
                dataSource={dataProcessing.data}
                pagination={{ pageSize: 5, size: "small" }}
                size="small"
                loading={loading}
                columns={[
                  {
                    title: "FECHA",
                    dataIndex: "date_time_medition",
                    render: (date) => (
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <Text strong>{dayjs(date).format("DD/MM")}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>{dayjs(date).format("HH:mm")} hrs</Text>
                      </div>
                    ),
                  },
                  {
                    title: "CAUDAL",
                    dataIndex: "flow",
                    align: "right",
                    render: (val) => <Text style={{ color: accentColor, fontWeight: 600 }}>{parseFloat(val).toFixed(2)} <small>lt/s</small></Text>,
                  },
                  {
                    title: "TOTAL",
                    dataIndex: "total",
                    align: "right",
                    render: (total) => <Text strong>{numberFormatter.format(total)} <small>m³</small></Text>,
                  },
                  {
                    title: showSmaFeatures ? "SMA" : "DGA",
                    dataIndex: "n_voucher",
                    align: "center",
                  },
                ]}
              />
            </div>
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
