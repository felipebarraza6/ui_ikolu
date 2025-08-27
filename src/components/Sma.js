import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Row,
  Col,
  ConfigProvider,
  Spin,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/es";
import locale from "antd/locale/es_ES";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
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
import { useUserProfilesContext } from "../contexts/UserProfilesContext";
import { useTelemetryData } from "../hooks/useTelemetryData";

// Configurar dayjs correctamente
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");

// Forzar timezone de Chile
dayjs.tz.setDefault("America/Santiago");

const { Title } = Typography;

const Sma = () => {
  // Usar los nuevos hooks en lugar de AppContext
  const { selectedProfile } = useUserProfilesContext();
  const { data: telemetryData } = useTelemetryData(selectedProfile?.id);

  const { isMobile, getSpacing, getColSpan, getTableScroll } = useResponsive();
  const [selected, setSelect] = useState(selectedProfile?.id || null);
  const [loading, setLoading] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [dataSelected, setDataSelected] = useState(selectedProfile);
  const [page, setPage] = useState(1);
  const [initialDate, setInitialDate] = useState(null);
  const [finishDate, setFinishDate] = useState(null);
  const [data, setData] = useState([]);
  const [countApi, setCountApi] = useState(0);

  // Verificar si el módulo M3 está activo
  const activate = selectedProfile?.profile_ikolu?.m3 || false;

  // Función para obtener datos de la API
  const fetchData = useCallback(
    async (currentPage = 1) => {
      if (!initialDate || !finishDate || !selectedProfile?.id) {
        setData([]);
        setCountApi(0);
        return;
      }

      setLoading(true);
      setPage(currentPage);
      const format = (date) => (date ? date.format("YYYY-MM-DD") : null);

      try {
        const rq = await sh.get_data_sh_range(
          selectedProfile.id,
          format(initialDate),
          format(finishDate),
          currentPage
        );
        setData(rq.results);
        setCountApi(rq.count);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setData([]);
        setCountApi(0);
      } finally {
        setLoading(false);
      }
    },
    [initialDate, finishDate, selectedProfile?.id]
  );

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const downloadDataToExcel = useCallback(async () => {
    if (!initialDate || !finishDate || !selectedProfile?.id) return;
    setLoadingExcel(true);
    try {
      const format = (date) => new Date(date).toISOString().split("T")[0];
      await sh.get_data_sh_range_to_excel(
        selectedProfile.id,
        format(initialDate),
        format(finishDate),
        selectedProfile.title
      );
    } catch (error) {
      console.error("Failed to download Excel file:", error);
    } finally {
      setLoadingExcel(false);
    }
  }, [initialDate, finishDate, selectedProfile?.id, selectedProfile?.title]);

  // Actualizar datos cuando cambie el perfil seleccionado
  useEffect(() => {
    if (selectedProfile) {
      setDataSelected(selectedProfile);
      // setSelected(selectedProfile.id); // ← ELIMINADO: NO SE USA
      setInitialDate(null);
      setFinishDate(null);
      setData([]);
      setCountApi(0);
      setPage(1);
    }
  }, [selectedProfile]);

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
            <div>{dayjs(date).format("DD-MM")}</div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {dayjs(date).format("HH:mm")} hrs
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
      {
        title: "Comprobante SMA",
        dataIndex: "n_voucher",
        align: "center",
        width: isMobile ? 120 : 150,
        render: (value) => (
          <div style={{ fontWeight: 600, color: "#722ed1" }}>{value}</div>
        ),
      },
    ],
    [isMobile, primaryColor, successColor]
  );

  const handlePageChange = (newPage) => {
    // Llamar a fetchData con la nueva página para obtener los datos correspondientes
    fetchData(newPage);
  };

  // Variable para verificar si se ha seleccionado un rango completo de fechas
  const dateRangeIsSelected = initialDate && finishDate;

  const hasData = data && data.length > 0;

  // Si no hay perfil seleccionado, mostrar loading
  if (!selectedProfile) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px" }}>Cargando perfil...</div>
      </div>
    );
  }

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
                  dataSelected?.modules?.m1?.date_time_medition
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
                    dataSelected?.modules?.total_consumed_today &&
                    dataSelected?.modules?.total_consumed_yesterday &&
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
                {dataSelected?.modules?.total_consumed_today &&
                dataSelected?.modules?.total_consumed_yesterday &&
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
                  dataSelected?.modules?.total_consumed_today
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
                    dataSelected?.modules?.total_consumed_today &&
                    dataSelected?.modules?.total_consumed_yesterday &&
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
                    dataSelected?.modules?.total_consumed_today &&
                    dataSelected?.modules?.total_consumed_yesterday &&
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
                {dataSelected?.modules?.total_consumed_today &&
                dataSelected?.modules?.total_consumed_yesterday &&
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
                  dataSelected?.modules?.total_consumed_yesterday
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
                    dataSelected?.modules?.total_consumed_today &&
                    dataSelected?.modules?.total_consumed_yesterday &&
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
                wrap="wrap"
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
                  <ConfigProvider locale={locale}>
                    <DatePicker
                      key="initial-date"
                      placeholder="Desde"
                      value={initialDate}
                      onChange={(date) => {
                        setInitialDate(date);
                        if (date && finishDate && date.isAfter(finishDate)) {
                          setFinishDate(null);
                        }
                      }}
                      disabled={!activate}
                      style={{
                        flex: isMobile ? "1 1 calc(50% - 6px)" : "0 1 auto",
                      }}
                      size={isMobile ? "large" : "middle"}
                      format="DD/MM/YYYY"
                      disabledDate={(current) =>
                        current && current > dayjs().endOf("day")
                      }
                    />
                    <DatePicker
                      key="finish-date"
                      placeholder="Hasta"
                      value={finishDate}
                      onChange={setFinishDate}
                      disabled={!initialDate || !activate}
                      style={{
                        flex: isMobile ? "1 1 calc(50% - 6px)" : "0 1 auto",
                      }}
                      size={isMobile ? "large" : "middle"}
                      format="DD/MM/YYYY"
                      disabledDate={(current) =>
                        current &&
                        (current > dayjs().endOf("day") ||
                          current < initialDate)
                      }
                    />
                  </ConfigProvider>
                  <Button
                    loading={loadingExcel}
                    type="default"
                    disabled={!dateRangeIsSelected || !activate}
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
          style={{ borderRadius: "0 0 16px 16px", overflow: "hidden" }}
          bordered={false}
          scroll={getTableScroll()}
          loading={loading}
          dataSource={data}
          columns={columns}
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
          locale={{
            emptyText: (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <CalendarFilled
                  style={{ fontSize: "48px", color: "#d9d9d9" }}
                />
                <Title
                  level={4}
                  style={{ color: "#bfbfbf", marginTop: "16px" }}
                >
                  {dateRangeIsSelected && !loading
                    ? "No se encontraron datos para el rango seleccionado."
                    : "Por favor, selecciona un rango de fechas para comenzar."}
                </Title>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default Sma;
