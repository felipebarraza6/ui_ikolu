import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { AppContext } from "../App";
import {
  Table,
  Flex,
  Select,
  Card,
  Statistic,
  Badge,
  DatePicker,
  Button,
  Typography,
  Form,
  Row,
  Col,
} from "antd";
import moment from "moment";
import {
  DatabaseFilled,
  FilterFilled,
  DownloadOutlined,
  RiseOutlined,
  FallOutlined,
  SearchOutlined,
  CalendarFilled,
  CalendarOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import sh from "../api/sh/endpoints";
import { useResponsive } from "../hooks/useResponsive";

const { Title } = Typography;

const Sma = () => {
  const { state } = useContext(AppContext);
  const { isMobile, getSpacing, getColSpan, getTableScroll } = useResponsive();
  const [selected, setSelect] = useState(state.user.catchment_points[0].id);
  const [loading, setLoading] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [dataSelected, setDataSelected] = useState(state.selected_profile);
  const [page, setPage] = useState(1);
  const [initialDate, setInitialDate] = useState(null);
  const [finishDate, setFinishDate] = useState(null);
  const [data, setData] = useState(state.selected_profile.modules.today);
  const [countApi, setCountApi] = useState(0);
  const activate = state.selected_profile.profile_ikolu.m3;

  const fetchData = useCallback(
    async (currentPage) => {
      if (!initialDate || !finishDate) return;
      setLoading(true);

      const format = (date) => (date ? date.format("YYYY-MM-DD") : null);

      try {
        const rq = await sh.get_data_sh_range(
          state.selected_profile.id,
          format(initialDate),
          format(finishDate),
          currentPage
        );
        setData(rq.results);
        setCountApi(rq.count);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        // Aquí podrías mostrar una notificación de error al usuario
      } finally {
        setLoading(false);
      }
    },
    [initialDate, finishDate, state.selected_profile.id]
  );

  useEffect(() => {
    // Cargar datos iniciales o cuando las fechas cambian
    fetchData(1); // Siempre empezar en la página 1 al cambiar fechas
    setPage(1);
  }, [fetchData]);

  const downloadDataToExcel = useCallback(async () => {
    if (!initialDate || !finishDate) return;
    setLoadingExcel(true);
    try {
      const format = (date) => new Date(date).toISOString().split("T")[0];
      await sh.get_data_sh_range_to_excel(
        state.selected_profile.id,
        format(initialDate),
        format(finishDate),
        state.selected_profile.title
      );
    } catch (error) {
      console.error("Failed to download Excel file:", error);
    } finally {
      setLoadingExcel(false);
    }
  }, [initialDate, finishDate, state.selected_profile.id]);

  useEffect(() => {
    if (state.selected_profile) {
      setDataSelected(state.selected_profile);
      setData(state.selected_profile.modules.today);
    }
  }, [state.selected_profile]);

  // Configuración de estilos responsivos
  const primaryColor = "#1f3461";
  const successColor = "#52c41a";
  const errorColor = "#f5222d";

  const cardStyle = useMemo(
    () => ({
      borderRadius: 16,
      border: "none",
      background: "#ffffff",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
      transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
      "&:hover": {
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
      },
    }),
    []
  );

  // Columnas de la Tabla
  const columns = useMemo(
    () => [
      {
        title: "Fecha de Medición",
        dataIndex: "date_time_medition",
        fixed: isMobile ? "left" : false,
        width: isMobile ? 140 : 180,
        render: (date) => (
          <div style={{ fontWeight: 500, color: primaryColor }}>
            <div>{moment(date).format("DD-MM")}</div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {moment(date).format("HH:mm")} hrs
            </div>
          </div>
        ),
      },
      {
        title: "Caudal (lt/s)",
        dataIndex: "flow",
        align: "center",
        width: isMobile ? 80 : 120,
        render: (value) => (
          <div style={{ fontWeight: 600, color: primaryColor }}>{value}</div>
        ),
      },
      {
        title: "Total (m³)",
        dataIndex: "total",
        align: "center",
        width: isMobile ? 100 : 140,
        render: (value) => (
          <div style={{ fontWeight: 600, color: successColor }}>
            {parseInt(value).toLocaleString("es-CL")}
          </div>
        ),
      },
      {
        title: "Consumo (m³)",
        dataIndex: "total_diff",
        align: "center",
        width: isMobile ? 100 : 120,
        render: (value) => (
          <div style={{ fontWeight: 600, color: "#1890ff" }}>{value}</div>
        ),
      },
      {
        title: "Acumulado Diario (m³)",
        align: "center",
        dataIndex: "total_today_diff",
        width: isMobile ? 120 : 150,
        render: (value) => (
          <div style={{ fontWeight: 600, color: "#722ed1" }}>{value}</div>
        ),
      },
    ],
    [isMobile, primaryColor, successColor]
  );

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchData(newPage);
  };

  return (
    <div>
      <Row
        gutter={[getSpacing(12, 16), getSpacing(12, 16)]}
        style={{ marginBottom: 24 }}
      >
        <Col span={getColSpan(24, 12, 8)}>
          <Card hoverable style={cardStyle}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                  color: "white",
                  padding: "12px",
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                  fontSize: 24,
                }}
              >
                <CalendarFilled />
              </div>
              <Title
                level={5}
                style={{ margin: "0 0 8px 0", color: primaryColor }}
              >
                Última Conexión
              </Title>
              <Statistic
                value={
                  dataSelected
                    ? `${dataSelected.modules.m1.date_time_medition.slice(
                        5,
                        10
                      )} / ${dataSelected.modules.m1.date_time_medition.slice(
                        11,
                        16
                      )}`
                    : "---"
                }
                suffix="hrs"
                valueStyle={{
                  fontSize: isMobile ? 18 : 20,
                  fontWeight: 600,
                  color: primaryColor,
                }}
              />
              <Badge
                status="processing"
                text="En línea"
                style={{ color: successColor, fontWeight: 500 }}
              />
            </div>
          </Card>
        </Col>

        <Col span={getColSpan(24, 12, 8)}>
          <Card
            hoverable
            style={cardStyle}
            bodyStyle={{ padding: getSpacing(16, 20) }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  background:
                    dataSelected &&
                    dataSelected.modules.total_consumed_today * 1000 >
                      dataSelected.modules.total_consumed_yesterday * 1000
                      ? successColor
                      : errorColor,
                  color: "white",
                  padding: "12px",
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                  fontSize: 24,
                }}
              >
                {dataSelected &&
                dataSelected.modules.total_consumed_today * 1000 >
                  dataSelected.modules.total_consumed_yesterday * 1000 ? (
                  <RiseOutlined />
                ) : (
                  <FallOutlined />
                )}
              </div>
              <Title
                level={5}
                style={{ margin: "0 0 8px 0", color: primaryColor }}
              >
                Hoy -{" "}
                {new Date().toLocaleDateString("es-ES", {
                  month: "short",
                  day: "numeric",
                })}
              </Title>
              <Statistic
                value={
                  dataSelected
                    ? (
                        dataSelected.modules.total_consumed_today * 1000
                      ).toLocaleString("es-ES")
                    : 0
                }
                suffix="lt/d"
                valueStyle={{
                  fontSize: isMobile ? 18 : 22,
                  fontWeight: 600,
                  color:
                    dataSelected &&
                    dataSelected.modules.total_consumed_today * 1000 >
                      dataSelected.modules.total_consumed_yesterday * 1000
                      ? successColor
                      : errorColor,
                }}
              />
            </div>
          </Card>
        </Col>

        <Col span={getColSpan(24, 12, 8)}>
          <Card
            hoverable
            style={cardStyle}
            bodyStyle={{ padding: getSpacing(16, 20) }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  background:
                    dataSelected &&
                    dataSelected.modules.total_consumed_yesterday * 1000 >=
                      dataSelected.modules.total_consumed_today * 1000
                      ? successColor
                      : errorColor,
                  color: "white",
                  padding: "12px",
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                  fontSize: 24,
                }}
              >
                {dataSelected &&
                dataSelected.modules.total_consumed_yesterday * 1000 >=
                  dataSelected.modules.total_consumed_today * 1000 ? (
                  <RiseOutlined />
                ) : (
                  <FallOutlined />
                )}
              </div>
              <Title
                level={5}
                style={{ margin: "0 0 8px 0", color: primaryColor }}
              >
                Ayer -{" "}
                {new Date(Date.now() - 86400000).toLocaleDateString("es-ES", {
                  month: "short",
                  day: "numeric",
                })}
              </Title>
              <Statistic
                value={
                  dataSelected
                    ? (
                        dataSelected.modules.total_consumed_yesterday * 1000
                      ).toLocaleString("es-ES")
                    : 0
                }
                suffix="lt/d"
                valueStyle={{
                  fontSize: isMobile ? 18 : 22,
                  fontWeight: 600,
                  color:
                    dataSelected &&
                    dataSelected.modules.total_consumed_yesterday * 1000 >=
                      dataSelected.modules.total_consumed_today * 1000
                      ? successColor
                      : errorColor,
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tabla de registros */}
      <Card
        style={{
          ...cardStyle,
          borderRadius: "0 0 16px 16px",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          size={isMobile ? "small" : "middle"}
          loading={loading}
          title={() => (
            <div
              style={{
                padding: getSpacing(16, 24),
                background: "#fafafa",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <Flex
                justify="space-between"
                align="center"
                wrap={isMobile ? "wrap" : "nowrap"}
                gap={isMobile ? 16 : 24}
              >
                <Title
                  level={isMobile ? 4 : 3}
                  style={{
                    margin: 0,
                    color: primaryColor,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <DatabaseFilled />
                  Registros de Medición
                </Title>

                <Flex
                  gap={12}
                  align="center"
                  wrap={isMobile ? "wrap" : "nowrap"}
                  style={{ width: isMobile ? "100%" : "auto" }}
                  justify="flex-end"
                >
                  <DatePicker
                    placeholder="Desde"
                    onChange={(date) => setInitialDate(date)}
                    disabled={!activate}
                    style={{
                      flex: isMobile ? "1 1 calc(50% - 6px)" : "0 1 auto",
                    }}
                    size={isMobile ? "large" : "middle"}
                  />
                  <DatePicker
                    placeholder="Hasta"
                    onChange={(date) => setFinishDate(date)}
                    disabled={!activate}
                    style={{
                      flex: isMobile ? "1 1 calc(50% - 6px)" : "0 1 auto",
                    }}
                    size={isMobile ? "large" : "middle"}
                  />
                  <Button
                    loading={loadingExcel}
                    type="default"
                    disabled={!initialDate || !finishDate || !activate}
                    icon={<DownloadOutlined />}
                    onClick={downloadDataToExcel}
                    style={{
                      width: isMobile ? "100%" : "auto",
                      marginTop: isMobile ? 8 : 0,
                      height: isMobile ? 44 : 32,
                      borderRadius: 8,
                      borderColor: primaryColor,
                      color: primaryColor,
                      fontWeight: 600,
                    }}
                  >
                    {isMobile ? "Excel" : "Descarga"}
                  </Button>
                </Flex>
              </Flex>
            </div>
          )}
          style={{
            borderRadius: "0 0 16px 16px",
            overflow: "hidden",
          }}
          bordered={false}
          scroll={getTableScroll()}
          columns={columns}
          dataSource={data}
          rowKey="date_time_medition"
          pagination={{
            onChange: handlePageChange,
            total: countApi,
            current: page,
            showSizeChanger: false,
            pageSize: isMobile ? 8 : 10,
            showQuickJumper: false,
            simple: isMobile,
            size: isMobile ? "small" : "default",
            showTotal: (total, range) =>
              isMobile
                ? `${range[0]}-${range[1]} de ${total}`
                : `Mostrando ${range[0]}-${range[1]} de ${total} registros`,
          }}
        />
      </Card>
    </div>
  );
};

export default Sma;
