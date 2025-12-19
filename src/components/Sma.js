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
  Row,
  Col,
  ConfigProvider,
  Spin,
  Tag,
  Space,
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
  CheckCircleFilled,
} from "@ant-design/icons";
import sh from "../api/sh/endpoints";
import { useResponsive } from "../hooks/useResponsive";

// Configurar dayjs correctamente
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");

// Forzar timezone de Chile
dayjs.tz.setDefault("America/Santiago");

const { Title, Text } = Typography;

const Sma = () => {
  const { state } = useContext(AppContext);
  const { isMobile, getSpacing, getColSpan, getTableScroll } = useResponsive();
  const [selected, setSelect] = useState(state.user.catchment_points[0]?.id);
  const [loading, setLoading] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [dataSelected, setDataSelected] = useState(state.selected_profile);
  const [page, setPage] = useState(1);
  const [initialDate, setInitialDate] = useState(dayjs().subtract(3, 'day').startOf('day'));
  const [finishDate, setFinishDate] = useState(dayjs().endOf('day'));
  const [data, setData] = useState([]);
  const [countApi, setCountApi] = useState(0);

  const activate = state.selected_profile?.profile_ikolu?.m3;
  
  // Lógica de visibilidad corregida:
  // Se determina si es DGA revisando el prefijo "OB" en cualquier campo de código disponible
  const rawWorkCode = state.selected_profile?.dga?.code_dga || state.selected_profile?.code_dga_site || "";
  const isDga = rawWorkCode.toUpperCase().startsWith("OB");
  const showSmaFeatures = !isDga;
  const workCode = rawWorkCode || null;

  const disabledStartDate = (current) => {
    return current && current > dayjs().endOf('day');
  };

  const disabledFinishDate = (current) => {
    if (!initialDate) return current && current > dayjs().endOf('day');
    const tooLate = current && current > dayjs().endOf('day');
    const tooEarly = current && current < initialDate.startOf('day');
    const tooFar = current && current > initialDate.add(4, 'day').endOf('day');
    return tooLate || tooEarly || tooFar;
  };

  const fetchData = useCallback(
    async (currentPage = 1) => {
      if (!initialDate || !finishDate) {
        setData([]);
        setCountApi(0);
        return;
      }

      setLoading(true);
      setPage(currentPage);
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
        setData([]);
        setCountApi(0);
      } finally {
        setLoading(false);
      }
    },
    [initialDate, finishDate, state.selected_profile?.id]
  );

  useEffect(() => {
    fetchData(1);
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
  }, [
    initialDate,
    finishDate,
    state.selected_profile?.id,
    state.selected_profile?.title,
    isDga,
  ]);

  useEffect(() => {
    if (state.selected_profile) {
      setDataSelected(state.selected_profile);
      setInitialDate(dayjs().subtract(3, 'day').startOf('day'));
      setFinishDate(dayjs().endOf('day'));
      setData([]);
      setCountApi(0);
      setPage(1);
    }
  }, [state.selected_profile]);

  const primaryColor = "#002766";
  const accentColor = "#1890ff";
  const successColor = "#096dd9"; 
  const waterColor = "#00b7ff";

  const miniCardStyle = {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(4px)",
    borderRadius: 12,
    padding: "8px 16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    position: "relative",
    overflow: "hidden",
    minWidth: isMobile ? "100%" : "auto",
    flex: 1
  };

  const columns = useMemo(() => {
    const vars = state.selected_profile?.config_data?.variables || [];
    
    // Slotted columns to ensure specific order
    const slots = {
      date: {
        title: "FECHA Y HORA",
        dataIndex: "date_time_medition",
        fixed: isMobile ? "left" : false,
        width: isMobile ? 120 : 180,
        render: (date) => (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text strong style={{ color: primaryColor }}>
              {dayjs(date).format("DD MMM, YYYY")}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              <WifiOutlined style={{ marginRight: 4 }} />
              {dayjs(date).format("HH:mm")} hrs
            </Text>
          </div>
        ),
      },
      flow: null,
      nivel: null,
      water_table: null,
      total: null,
      total_diff: null,
      voucher: null
    };

    // Mapeo dinámico de variables según la API
    vars.forEach(v => {
      const type = v.type_variable?.toUpperCase();
      const label = v.label?.toUpperCase() || "MEDICIÓN";

      if (type === "CAUDAL_PROMEDIO" || type === "CAUDAL_INSTANTANEO" || type === "CAUDAL" || type === "CAUDAL_INSTANTÁNEO") {
        slots.flow = {
          title: label,
          dataIndex: "flow",
          align: "right",
          width: isMobile ? 120 : 160,
          render: (value, record, index) => {
            const nextRecord = data[index + 1];
            const prevValue = nextRecord?.flow;
            let variation = null;
            
            if (prevValue && prevValue > 0) {
              variation = ((value - prevValue) / prevValue) * 100;
            }

            return (
              <Flex vertical align="end" gap={2}>
                <div style={{ fontWeight: 700, color: waterColor, fontSize: 16 }}>
                  {parseFloat(value || 0).toFixed(2)} <span style={{ fontSize: 10, fontWeight: 400 }}>lt/s</span>
                </div>
                {variation !== null && Math.abs(variation) > 0.1 && (
                  <Flex align="center" gap={4}>
                    {variation > 0 ? 
                      <RiseOutlined style={{ color: "#52c41a", fontSize: 10 }} /> : 
                      <FallOutlined style={{ color: "#ff4d4f", fontSize: 10 }} />
                    }
                    <Text style={{ 
                      fontSize: 10, 
                      fontWeight: 700, 
                      color: variation > 0 ? "#52c41a" : "#ff4d4f" 
                    }}>
                      {variation > 0 ? "+" : ""}{variation.toFixed(1)}%
                    </Text>
                  </Flex>
                )}
              </Flex>
            );
          }
        };
      } else if (type === "NIVEL") {
        slots.nivel = {
          title: label,
          dataIndex: "nivel",
          align: "right",
          width: isMobile ? 90 : 110,
          render: (value) => (
            <div style={{ fontWeight: 700, color: "#fa8c16", fontSize: 16 }}>
              {parseFloat(value || 0).toFixed(2)} <span style={{ fontSize: 10, fontWeight: 400 }}>m</span>
            </div>
          ),
        };
      } else if (type === "NIVEL_FREATICO" || type === "NIVEL_FREÁTICO") {
        slots.water_table = {
          title: label,
          dataIndex: "water_table",
          align: "right",
          width: isMobile ? 90 : 110,
          render: (value) => (
            <div style={{ fontWeight: 700, color: "#722ed1", fontSize: 16 }}>
              {parseFloat(value || 0).toFixed(2)} <span style={{ fontSize: 10, fontWeight: 400 }}>m</span>
            </div>
          ),
        };
      } else if (type === "TOTALIZADO") {
        slots.total = {
          title: label,
          dataIndex: "total",
          align: "right",
          width: isMobile ? 120 : 160,
          render: (value) => (
            <div style={{ fontWeight: 700, color: successColor, fontSize: 16 }}>
              {parseInt(value || 0).toLocaleString("es-CL")} <span style={{ fontSize: 10, fontWeight: 400 }}>m³</span>
            </div>
          ),
        };
        
        slots.total_diff = {
          title: "CONSUMO",
          dataIndex: "total_diff",
          align: "right",
          width: isMobile ? 90 : 110,
          render: (value) => (
            <Tag color="cyan" style={{ borderRadius: 6, fontWeight: 700, border: "none" }}>
              +{value}
            </Tag>
          ),
        };
      }
    });

    // Fallback si no hay variables configuradas: mostrar Caudal y Total por defecto
    if (vars.length === 0) {
      slots.flow = {
        title: "CAUDAL",
        dataIndex: "flow",
        align: "right",
        width: isMobile ? 120 : 160,
        render: (value, record, index) => {
          const nextRecord = data[index + 1];
          const prevValue = nextRecord?.flow;
          let variation = null;
          
          if (prevValue && prevValue > 0) {
            variation = ((value - prevValue) / prevValue) * 100;
          }

          return (
            <Flex vertical align="end" gap={2}>
              <div style={{ fontWeight: 700, color: waterColor, fontSize: 16 }}>
                {parseFloat(value || 0).toFixed(2)} <span style={{ fontSize: 10, fontWeight: 400 }}>lt/s</span>
              </div>
              {variation !== null && Math.abs(variation) > 0.1 && (
                <Flex align="center" gap={4}>
                  {variation > 0 ? 
                    <RiseOutlined style={{ color: "#52c41a", fontSize: 10 }} /> : 
                    <FallOutlined style={{ color: "#ff4d4f", fontSize: 10 }} />
                  }
                  <Text style={{ 
                    fontSize: 10, 
                    fontWeight: 700, 
                    color: variation > 0 ? "#52c41a" : "#ff4d4f" 
                  }}>
                    {variation > 0 ? "+" : ""}{variation.toFixed(1)}%
                  </Text>
                </Flex>
              )}
            </Flex>
          );
        }
      };
      slots.total = {
        title: "VOL. ACUMULADO",
        dataIndex: "total",
        align: "right",
        width: isMobile ? 120 : 160,
        render: (value) => (
          <div style={{ fontWeight: 700, color: successColor, fontSize: 16 }}>
            {parseInt(value || 0).toLocaleString("es-CL")} <span style={{ fontSize: 10, fontWeight: 400 }}>m³</span>
          </div>
        ),
      };
      slots.total_diff = {
        title: "CONSUMO",
        dataIndex: "total_diff",
        align: "right",
        width: isMobile ? 90 : 110,
        render: (value) => (
          <Tag color="cyan" style={{ borderRadius: 6, fontWeight: 700, border: "none" }}>
            +{value}
          </Tag>
        ),
      };
    }

    if (showSmaFeatures) {
      slots.voucher = {
        title: "VOUCHER",
        dataIndex: "n_voucher",
        align: "center",
        width: isMobile ? 120 : 160,
        render: (value) =>
          value && value !== "-" ? (
            <Tag color="#006d75" icon={<CheckCircleFilled />} style={{ padding: "4px 10px", borderRadius: 8, border: "none" }}>
              {value}
            </Tag>
          ) : (
            <Text type="secondary" italic style={{ fontSize: 12 }}>Sin enviar</Text>
          ),
      };
    }

    // Orden específico de columnas
    const orderedKeys = ["date", "flow", "nivel", "water_table", "total", "total_diff", "voucher"];
    return orderedKeys.map(key => slots[key]).filter(col => col !== null);
  }, [isMobile, primaryColor, accentColor, successColor, waterColor, showSmaFeatures, state.selected_profile, data]);

  const handlePageChange = (newPage) => {
    fetchData(newPage);
  };

  const dateRangeIsSelected = initialDate && finishDate;

  return (
    <div style={{ padding: isMobile ? "0" : "0 24px" }}>
      <Card 
        style={{ borderRadius: 32, overflow: "hidden", border: "none", boxShadow: "0 20px 50px rgba(0, 50, 150, 0.12)" }} 
        bodyStyle={{ padding: 0 }}
      >
        {/* COMPACT DYNAMIC HEADER WITH STATS */}
        <div style={{ 
          background: `linear-gradient(135deg, ${primaryColor} 0%, #001a35 100%)`, 
          padding: "24px 32px", 
          position: "relative",
          overflow: "hidden" 
        }}>
          <div className="water-wave" style={{ opacity: 0.15, top: -120 }}></div>
          <div className="water-wave wave-reverse" style={{ opacity: 0.1, top: -100, animationDuration: '25s' }}></div>
          
          <Flex justify="space-between" align="center" wrap="wrap" gap={24} style={{ position: "relative", zIndex: 1 }}>
            <Flex align="center" gap={16}>
              <div style={{ 
                background: "rgba(255, 255, 255, 0.1)", 
                backdropFilter: "blur(10px)",
                padding: 14, 
                borderRadius: 20, 
                color: "#fff",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
              }}>
                <DatabaseFilled style={{ fontSize: 24, color: "#10ebff" }} />
              </div>
              <div>
                <Title level={isMobile ? 4 : 2} style={{ margin: 0, color: "#fff", fontWeight: 800 }}>
                  Captación Superficial
                </Title>
                <Flex align="center" gap={8} wrap="wrap">
                  {showSmaFeatures && <Tag color="cyan" style={{ border: "none", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>SMA</Tag>}
                  {isDga && <Tag color="blue" style={{ border: "none", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>DGA</Tag>}
                  {workCode && (
                    <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 500 }}>
                      Cód: <span style={{ color: "#fff", fontWeight: 700 }}>{workCode}</span>
                    </Text>
                  )}
                  {state.selected_profile?.config_data?.variables?.map(v => (
                    <Tag 
                      key={v.id} 
                      color="blue" 
                      style={{ 
                        background: "rgba(24, 144, 255, 0.2)", 
                        border: "1px solid rgba(24, 144, 255, 0.3)", 
                        borderRadius: 4, 
                        fontSize: 9, 
                        color: "#fff",
                        textTransform: "uppercase"
                      }}
                    >
                      {v.label}
                    </Tag>
                  ))}
                  <Badge 
                    status="processing" 
                    color="#10ebff" 
                    text={<span style={{ color: "#10ebff", fontWeight: 700, fontSize: 10, letterSpacing: 0.5 }}>ONLINE</span>} 
                    className="pulse-badge"
                  />
                </Flex>
              </div>
            </Flex>

            {/* HORIZONTAL QUICK STATS BAR */}
            <Flex gap={16} wrap={isMobile ? "wrap" : "nowrap"} flex={isMobile ? "100%" : "auto"}>
              <div style={miniCardStyle}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>CONEXIÓN</div>
                <div style={{ fontSize: 18, color: "#fff", fontWeight: 900 }}>
                  {dataSelected?.modules?.m1?.date_time_medition ? dayjs(dataSelected.modules.m1.date_time_medition).format("HH:mm") : "--:--"}
                  <small style={{ fontSize: 10, marginLeft: 2, opacity: 0.7 }}>hrs</small>
                </div>
                <div className="water-wave wave-slow" style={{ opacity: 0.1, top: 15 }}></div>
                <div className="water-wave wave-reverse" style={{ opacity: 0.05, top: 25, animationDuration: '25s' }}></div>
              </div>

              <div style={miniCardStyle}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>HOY ({dayjs().format("DD/MM")})</div>
                <div style={{ fontSize: 18, color: "#10ebff", fontWeight: 900 }}>
                  {dataSelected?.modules?.total_consumed_today ? Math.round(dataSelected.modules.total_consumed_today * 1000).toLocaleString("es-ES") : 0}
                  <small style={{ fontSize: 10, marginLeft: 2, opacity: 0.7 }}>lt</small>
                </div>
                <div className="water-wave" style={{ opacity: 0.1, top: 15 }}></div>
                <div className="water-wave wave-slow" style={{ opacity: 0.05, top: 25, left: '-30px' }}></div>
              </div>

              <div style={miniCardStyle}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>AYER</div>
                <div style={{ fontSize: 18, color: "#fff", fontWeight: 900 }}>
                  {dataSelected?.modules?.total_consumed_yesterday ? Math.round(dataSelected.modules.total_consumed_yesterday * 1000).toLocaleString("es-ES") : 0}
                  <small style={{ fontSize: 10, marginLeft: 2, opacity: 0.7 }}>lt</small>
                </div>
                <div className="water-wave wave-reverse" style={{ opacity: 0.1, top: 15 }}></div>
                <div className="water-wave" style={{ opacity: 0.05, top: 25, animationDuration: '18s' }}></div>
              </div>
            </Flex>
          </Flex>
        </div>

        {/* CONTROLS SECTION */}
        <div style={{ padding: "16px 32px", borderBottom: "1px solid #f0f7ff", background: "#fff" }}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
             <ConfigProvider locale={locale}>
                <Space.Compact style={{ 
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  borderRadius: 12,
                  overflow: "hidden"
                }}>
                  <DatePicker
                    placeholder="Desde"
                    value={initialDate}
                    disabledDate={disabledStartDate}
                    onChange={(date) => {
                      setInitialDate(date);
                      if (date && finishDate) {
                        const diff = Math.abs(finishDate.diff(date, 'days'));
                        if (diff > 4 || finishDate.isBefore(date)) {
                          setFinishDate(null);
                        }
                      }
                    }}
                    disabled={!activate}
                    format="DD/MM/YYYY"
                    style={{ width: "130px", border: "none", background: "#f9fcff" }}
                  />
                  <DatePicker
                    placeholder="Hasta"
                    value={finishDate}
                    onChange={setFinishDate}
                    disabled={!initialDate || !activate}
                    disabledDate={disabledFinishDate}
                    format="DD/MM/YYYY"
                    style={{ width: "130px", border: "none", background: "#f9fcff", borderLeft: "1px solid #eee" }}
                  />
                </Space.Compact>
              </ConfigProvider>
              
              {showSmaFeatures && (
                <Button
                  loading={loadingExcel}
                  type="primary"
                  disabled={!dateRangeIsSelected || !activate}
                  icon={<DownloadOutlined />}
                  onClick={downloadDataToExcel}
                  style={{ 
                    borderRadius: 12, 
                    fontWeight: 700,
                    height: 40,
                    padding: "0 24px",
                    background: primaryColor,
                    boxShadow: "0 4px 12px rgba(0, 39, 102, 0.2)",
                    border: "none"
                  }}
                >
                  Exportar Excel
                </Button>
              )}
          </Flex>
        </div>

        <Table
          size={isMobile ? "small" : "middle"}
          bordered={false}
          scroll={getTableScroll()}
          loading={loading}
          dataSource={data}
          columns={columns}
          rowKey="date_time_medition"
          className="water-table"
          pagination={{
            onChange: handlePageChange,
            total: countApi,
            current: page,
            pageSize: isMobile ? 8 : 10,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} registros`,
            position: ["bottomCenter"],
            style: { padding: "20px 0" }
          }}
          locale={{
            emptyText: (
              <Flex vertical align="center" style={{ padding: "80px 0" }}>
                <SearchOutlined style={{ fontSize: 64, color: "#e6f7ff", marginBottom: 20 }} />
                <Title level={4} style={{ color: "#bfbfbf", margin: 0, fontWeight: 600 }}>
                  {dateRangeIsSelected ? "No hay datos para este período" : "Selecciona un rango de fechas"}
                </Title>
              </Flex>
            ),
          }}
        />
      </Card>

      <style>{`
        .water-wave {
          position: absolute;
          top: 35%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(180deg, 
            rgba(255, 255, 255, 0) 0%, 
            rgba(255, 255, 255, 0.05) 45%, 
            rgba(255, 255, 255, 0.12) 55%, 
            rgba(255, 255, 255, 0.2) 100%
          );
          border-radius: 38%;
          animation: wave 15s infinite linear;
          z-index: 0;
          pointer-events: none;
          transform-origin: center center;
          filter: blur(1px);
        }
        .wave-slow { animation-duration: 25s; top: 40%; opacity: 0.15; }
        .wave-reverse { animation-direction: reverse; animation-duration: 20s; top: 30%; opacity: 0.1; }
        
        @keyframes wave {
          from { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          to { transform: rotate(360deg) scale(1); }
        }
        
        .pulse-badge .ant-badge-status-dot {
          animation: pulse 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 235, 255, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(16, 235, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 235, 255, 0); }
        }
        .water-table .ant-table-thead > tr > th {
          background: #f0f7ff;
          color: #4b7ea9;
          font-weight: 800;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          border-bottom: 2px solid #e1f0ff;
        }
        .water-table .ant-table-tbody > tr:hover > td {
          background: #f0faff !important;
        }
        .water-table .ant-table-cell {
          border-bottom: 1px solid #f0f7ff;
        }
      `}</style>
    </div>
  );
};

export default Sma;
