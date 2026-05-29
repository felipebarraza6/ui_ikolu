import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useData } from "../contexts/DataContext";
import {
  Table,
  Flex,
  Select,
  Statistic,
  Badge,
  DatePicker,
  Button,
  Typography,
  Row,
  Col,
  Spin,
  Skeleton,
  Tag,
  Space,
  Drawer,
  Form,
  Input,
  notification,
  theme,
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
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import sh from "../api/sh/endpoints";
import { useResponsive } from "../hooks/useResponsive";
import { ikoluTokens } from "../theme";
import { PageContainer, SectionCard } from "../components/common/LayoutPrimitives";

// Configurar dayjs correctamente
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");

// Forzar timezone de Chile
dayjs.tz.setDefault("America/Santiago");

const { Title, Text } = Typography;

const Sma = () => {
  const { selected_profile } = useData();
  const { isMobile, getSpacing, getColSpan, getTableScroll } = useResponsive();
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [dataSelected, setDataSelected] = useState(selected_profile);
  const [page, setPage] = useState(1);
  const [initialDate, setInitialDate] = useState(dayjs().subtract(3, 'day').startOf('day'));
  const [finishDate, setFinishDate] = useState(dayjs().endOf('day'));
  const [data, setData] = useState([]);
  const [countApi, setCountApi] = useState(0);
  const [editingRecord, setEditingRecord] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [editForm] = Form.useForm();

  const activate = selected_profile?.profile_ikolu?.m3;
  
  // Lógica de visibilidad corregida:
  // Se determina si es DGA revisando el prefijo "OB" en cualquier campo de código disponible
  const rawWorkCode = selected_profile?.dga?.code_dga || selected_profile?.code_dga_site || "";
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
          selected_profile.id,
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
    [initialDate, finishDate, selected_profile?.id]
  );

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  // Animación de entrada cuando los datos terminan de cargar
  useEffect(() => {
    if (!loading && data.length >= 0) {
      const timer = setTimeout(() => setDataReady(true), 100);
      return () => clearTimeout(timer);
    } else {
      setDataReady(false);
    }
  }, [loading, data.length]);

  const downloadDataToExcel = useCallback(async () => {
    if (!initialDate || !finishDate) return;
    setLoadingExcel(true);
    try {
      const format = (date) => new Date(date).toISOString().split("T")[0];
      await sh.get_data_sh_range_to_excel(
        selected_profile.id,
        format(initialDate),
        format(finishDate),
        selected_profile.title
      );
    } catch (error) {
      console.error("Failed to download Excel file:", error);
    } finally {
      setLoadingExcel(false);
    }
  }, [
    initialDate,
    finishDate,
    selected_profile?.id,
    selected_profile?.title,
    isDga,
  ]);

  useEffect(() => {
    if (selected_profile) {
      setDataSelected(selected_profile);
      setInitialDate(dayjs().subtract(3, 'day').startOf('day'));
      setFinishDate(dayjs().endOf('day'));
      setData([]);
      setCountApi(0);
      setPage(1);
    }
  }, [selected_profile?.id]);

  const primaryColor = "#002766";
  const accentColor = token.colorInfo;
  const successColor = "#096dd9"; 
  const waterColor = "#00b7ff";

  const miniCardStyle = {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(4px)",
    borderRadius: token.borderRadiusLG,
    padding: "8px 16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    position: "relative",
    overflow: "hidden",
    minWidth: isMobile ? "100%" : "auto",
    flex: 1
  };

  const columns = useMemo(() => {
    const vars = selected_profile?.config_data?.variables || [];
    
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
            <Text type="secondary" style={{ fontSize: ikoluTokens.fontSizeSmall }}>
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
                <div style={{ fontWeight: 700, color: waterColor, fontSize: token.fontSizeLG }}>
                  {parseFloat(value || 0).toFixed(2)} <span style={{ fontSize: 10, fontWeight: 400 }}>lt/s</span>
                </div>
                {variation !== null && Math.abs(variation) > 0.1 && (
                  <Flex align="center" gap={4}>
                    {variation > 0 ? 
                      <RiseOutlined style={{ color: token.colorSuccess, fontSize: 10 }} /> : 
                      <FallOutlined style={{ color: token.colorError, fontSize: 10 }} />
                    }
                    <Text style={{ 
                      fontSize: 10, 
                      fontWeight: 700, 
                      color: variation > 0 ? token.colorSuccess : token.colorError 
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
            <div style={{ fontWeight: 700, color: "#fa8c16", fontSize: token.fontSizeLG }}>
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
            <div style={{ fontWeight: 700, color: "#722ed1", fontSize: token.fontSizeLG }}>
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
            <div style={{ fontWeight: 700, color: successColor, fontSize: token.fontSizeLG }}>
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
            <Tag color="cyan" style={{ borderRadius: token.borderRadiusSM, fontWeight: 700, border: "none" }}>
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
              <div style={{ fontWeight: 700, color: waterColor, fontSize: token.fontSizeLG }}>
                {parseFloat(value || 0).toFixed(2)} <span style={{ fontSize: 10, fontWeight: 400 }}>lt/s</span>
              </div>
              {variation !== null && Math.abs(variation) > 0.1 && (
                <Flex align="center" gap={4}>
                  {variation > 0 ? 
                    <RiseOutlined style={{ color: token.colorSuccess, fontSize: 10 }} /> : 
                    <FallOutlined style={{ color: token.colorError, fontSize: 10 }} />
                  }
                  <Text style={{ 
                    fontSize: 10, 
                    fontWeight: 700, 
                    color: variation > 0 ? token.colorSuccess : token.colorError 
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
          <div style={{ fontWeight: 700, color: successColor, fontSize: token.fontSizeLG }}>
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
          <Tag color="cyan" style={{ borderRadius: token.borderRadiusSM, fontWeight: 700, border: "none" }}>
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
            <Tag color="#006d75" icon={<CheckCircleFilled />} style={{ padding: "4px 10px", borderRadius: token.borderRadius, border: "none" }}>
              {value}
            </Tag>
          ) : (
            <Text type="secondary" italic style={{ fontSize: token.fontSizeSM }}>Sin enviar</Text>
          ),
      };
    }

    // Columna de acciones (editar)
    slots.actions = {
      title: "",
      key: "actions",
      align: "center",
      width: 60,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          icon={<EditOutlined style={{ color: token.colorPrimary }} />}
          onClick={() => {
            setEditingRecord(record);
            editForm.setFieldsValue({
              flow: record.flow,
              nivel: record.nivel,
              water_table: record.water_table,
              total: record.total,
              total_diff: record.total_diff,
            });
            setDrawerVisible(true);
          }}
        />
      ),
    };

    // Orden específico de columnas
    const orderedKeys = ["date", "flow", "nivel", "water_table", "total", "total_diff", "voucher", "actions"];
    return orderedKeys.map(key => slots[key]).filter(col => col !== null);
  }, [isMobile, primaryColor, accentColor, successColor, waterColor, showSmaFeatures, selected_profile, data, token, editForm]);

  const handlePageChange = (newPage) => {
    fetchData(newPage);
  };

  const handleSaveEdit = async (values) => {
    if (!editingRecord) return;
    setSaving(true);
    try {
      await sh.update_data_sh(editingRecord.id, {
        ...editingRecord,
        flow: parseFloat(values.flow),
        nivel: parseFloat(values.nivel),
        water_table: parseFloat(values.water_table),
        total: parseFloat(values.total),
        total_diff: parseFloat(values.total_diff),
      });
      notification.success({
        message: "Registro actualizado",
        description: "Los datos han sido actualizados correctamente.",
      });
      setDrawerVisible(false);
      setEditingRecord(null);
      fetchData(page);
    } catch (error) {
      notification.error({
        message: "Error al guardar",
        description: "No se pudo actualizar el registro.",
      });
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const dateRangeIsSelected = initialDate && finishDate;

  return (
    <PageContainer>
      {/* HEADER CON GRADIENTE Y STATS */}
      <div style={{ 
        background: `linear-gradient(135deg, ${primaryColor} 0%, #001a35 100%)`, 
        padding: isMobile ? "16px" : "24px 32px", 
        position: "relative",
        overflow: "hidden",
        borderRadius: token.borderRadiusLG,
        marginBottom: 16,
      }}>
        <div className="water-wave" style={{ opacity: 0.15, top: -120 }}></div>
        <div className="water-wave wave-reverse" style={{ opacity: 0.1, top: -100, animationDuration: '25s' }}></div>
        
        <Flex justify="space-between" align="center" wrap="wrap" gap={24} style={{ position: "relative", zIndex: 1 }}>
          <Flex align="center" gap={16} style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              background: "rgba(255, 255, 255, 0.1)", 
              backdropFilter: "blur(10px)",
              padding: 14, 
              borderRadius: 20, 
              color: ikoluTokens.colorWhite,
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
            }}>
              <DatabaseFilled style={{ fontSize: ikoluTokens.fontSize4XL, color: "#10ebff" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Title level={isMobile ? 4 : 2} style={{ margin: 0, color: ikoluTokens.colorWhite, fontWeight: 800 }}>
                Captación Superficial
              </Title>
              <Flex align="center" gap={8} wrap="wrap">
                {showSmaFeatures && <Tag color="cyan" style={{ border: "none", borderRadius: token.borderRadiusXS, fontSize: 10, fontWeight: 700 }}>SMA</Tag>}
                {isDga && <Tag color="blue" style={{ border: "none", borderRadius: token.borderRadiusXS, fontSize: 10, fontWeight: 700 }}>DGA</Tag>}
                {workCode && (
                  <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: token.fontSizeSM, fontWeight: 500 }}>
                    Cód: <span style={{ color: ikoluTokens.colorWhite, fontWeight: 700 }}>{workCode}</span>
                  </Text>
                )}
                {selected_profile?.config_data?.variables?.map(v => (
                  <Tag 
                    key={v.id} 
                    color="blue" 
                    style={{ 
                      background: "rgba(24, 144, 255, 0.2)", 
                      border: "1px solid rgba(24, 144, 255, 0.3)", 
                      borderRadius: token.borderRadiusXS, 
                      fontSize: 9, 
                      color: ikoluTokens.colorWhite,
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
              <div style={{ fontSize: ikoluTokens.fontSize2XL, color: ikoluTokens.colorWhite, fontWeight: 900 }}>
                {dataSelected?.modules?.m1?.date_time_medition ? dayjs(dataSelected.modules.m1.date_time_medition).format("HH:mm") : "--:--"}
                <small style={{ fontSize: 10, marginLeft: 2, opacity: 0.7 }}>hrs</small>
              </div>
              <div className="water-wave wave-slow" style={{ opacity: 0.1, top: 15 }}></div>
              <div className="water-wave wave-reverse" style={{ opacity: 0.05, top: 25, animationDuration: '25s' }}></div>
            </div>

            <div style={miniCardStyle}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>HOY ({dayjs().format("DD/MM")})</div>
              <div style={{ fontSize: ikoluTokens.fontSize2XL, color: "#10ebff", fontWeight: 900 }}>
                {dataSelected?.modules?.total_consumed_today ? Math.round(dataSelected.modules.total_consumed_today * 1000).toLocaleString("es-ES") : 0}
                <small style={{ fontSize: 10, marginLeft: 2, opacity: 0.7 }}>lt</small>
              </div>
              <div className="water-wave" style={{ opacity: 0.1, top: 15 }}></div>
              <div className="water-wave wave-slow" style={{ opacity: 0.05, top: 25, left: '-30px' }}></div>
            </div>

            <div style={miniCardStyle}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>AYER</div>
              <div style={{ fontSize: ikoluTokens.fontSize2XL, color: ikoluTokens.colorWhite, fontWeight: 900 }}>
                {dataSelected?.modules?.total_consumed_yesterday ? Math.round(dataSelected.modules.total_consumed_yesterday * 1000).toLocaleString("es-ES") : 0}
                <small style={{ fontSize: 10, marginLeft: 2, opacity: 0.7 }}>lt</small>
              </div>
              <div className="water-wave wave-reverse" style={{ opacity: 0.1, top: 15 }}></div>
              <div className="water-wave" style={{ opacity: 0.05, top: 25, animationDuration: '18s' }}></div>
            </div>
          </Flex>
        </Flex>
      </div>

      {/* CONTROLS Y TABLA EN SECTIONCARD */}
      <SectionCard
        bodyStyle={{ padding: 0 }}
      >
        {/* CONTROLS SECTION */}
        <div style={{ padding: isMobile ? "12px" : "16px 24px", borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
             <Space.Compact style={{
                  boxShadow: token.boxShadowTertiary,
                  borderRadius: token.borderRadiusLG,
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
                    style={{ width: "130px", border: "none", background: token.colorBgLayout }}
                  />
                  <DatePicker
                    placeholder="Hasta"
                    value={finishDate}
                    onChange={setFinishDate}
                    disabled={!initialDate || !activate}
                    disabledDate={disabledFinishDate}
                    format="DD/MM/YYYY"
                    style={{ width: "130px", border: "none", background: token.colorBgLayout, borderLeft: `1px solid ${token.colorBorder}` }}
                  />
                </Space.Compact>
              
              {showSmaFeatures && (
                <Button
                  loading={loadingExcel}
                  type="primary"
                  disabled={!dateRangeIsSelected || !activate}
                  icon={<DownloadOutlined />}
                  onClick={downloadDataToExcel}
                  style={{ 
                    borderRadius: token.borderRadiusLG, 
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

        {loading ? (
          <div style={{ padding: isMobile ? "24px 12px" : "40px 24px" }}>
            <Skeleton active paragraph={{ rows: 8 }} className="skeleton-pulse" />
          </div>
        ) : (
          <div className={dataReady ? "fade-in" : ""}>
            <Table
              size={isMobile ? "small" : "middle"}
              bordered={false}
              scroll={getTableScroll()}
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
                    <SearchOutlined style={{ fontSize: 64, color: token.colorBorder, marginBottom: 20 }} />
                    <Title level={4} style={{ color: token.colorTextSecondary, margin: 0, fontWeight: 600 }}>
                      {dateRangeIsSelected ? "No hay datos para este período" : "Selecciona un rango de fechas"}
                    </Title>
                  </Flex>
                ),
              }}
            />
          </div>
        )}
      </SectionCard>

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
        .fade-in {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .skeleton-pulse .ant-skeleton-title,
        .skeleton-pulse .ant-skeleton-paragraph > li {
          background: linear-gradient(90deg, #f0f7ff 25%, #e6f7ff 50%, #f0f7ff 75%);
          background-size: 200% 100%;
          animation: skeletonPulse 1.5s infinite;
        }
        @keyframes skeletonPulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Drawer de edición */}
      <Drawer
        title={
          <span style={{ color: "#BDC00C", fontWeight: 700, fontSize: 17, letterSpacing: 0.5 }}>
            EDITAR REGISTRO
          </span>
        }
        placement="right"
        onClose={() => {
          setDrawerVisible(false);
          setEditingRecord(null);
        }}
        open={drawerVisible}
        width={isMobile ? "100%" : 480}
        styles={{
          body: { background: "#0a0e27", padding: "24px" },
          header: { background: "#0f152e", borderBottom: "1px solid rgba(255,107,53,0.25)" },
          mask: { background: "rgba(0,0,0,0.75)" },
        }}
        closeIcon={<span style={{ color: "#BDC00C", fontSize: ikoluTokens.fontSize2XL }}>✕</span>}
        extra={
          <Button
            icon={<CloseOutlined />}
            onClick={() => {
              setDrawerVisible(false);
              setEditingRecord(null);
            }}
            style={{
              background: "transparent",
              borderColor: "rgba(255,255,255,0.3)",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            Cerrar
          </Button>
        }
      >
        {editingRecord && (
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleSaveEdit}
            initialValues={{
              flow: editingRecord.flow,
              nivel: editingRecord.nivel,
              water_table: editingRecord.water_table,
              total: editingRecord.total,
              total_diff: editingRecord.total_diff,
            }}
          >
            <Form.Item
              name="flow"
              label={<span style={{ color: "rgba(255,255,255,0.7)" }}>Caudal (lt/s)</span>}
              rules={[{ required: true, message: "Ingresa el caudal" }]}
            >
              <Input type="number" step="0.01" style={{ background: "rgba(255,255,255,0.05)", color: ikoluTokens.colorWhite, borderColor: "rgba(255,255,255,0.2)" }} />
            </Form.Item>
            <Form.Item
              name="nivel"
              label={<span style={{ color: "rgba(255,255,255,0.7)" }}>Nivel (m)</span>}
            >
              <Input type="number" step="0.01" style={{ background: "rgba(255,255,255,0.05)", color: ikoluTokens.colorWhite, borderColor: "rgba(255,255,255,0.2)" }} />
            </Form.Item>
            <Form.Item
              name="water_table"
              label={<span style={{ color: "rgba(255,255,255,0.7)" }}>Nivel Freático (m)</span>}
            >
              <Input type="number" step="0.01" style={{ background: "rgba(255,255,255,0.05)", color: ikoluTokens.colorWhite, borderColor: "rgba(255,255,255,0.2)" }} />
            </Form.Item>
            <Form.Item
              name="total"
              label={<span style={{ color: "rgba(255,255,255,0.7)" }}>Acumulado (m³)</span>}
              rules={[{ required: true, message: "Ingresa el acumulado" }]}
            >
              <Input type="number" step="1" style={{ background: "rgba(255,255,255,0.05)", color: ikoluTokens.colorWhite, borderColor: "rgba(255,255,255,0.2)" }} />
            </Form.Item>
            <Form.Item
              name="total_diff"
              label={<span style={{ color: "rgba(255,255,255,0.7)" }}>Consumo (m³)</span>}
            >
              <Input type="number" step="0.01" style={{ background: "rgba(255,255,255,0.05)", color: ikoluTokens.colorWhite, borderColor: "rgba(255,255,255,0.2)" }} />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
                style={{
                  width: "100%",
                  background: token.colorPrimary,
                  borderColor: token.colorPrimary,
                  height: 44,
                  fontWeight: 600,
                }}
              >
                Guardar cambios
              </Button>
            </Form.Item>
          </Form>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default Sma;
