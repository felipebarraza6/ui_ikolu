import React, { useContext, useState, useMemo, useEffect } from "react";
import { Button, Drawer, Tag, Table, Typography, Flex, Skeleton, Card, Statistic } from "antd";
import {
  TableOutlined,
  CloseCircleFilled,
  ClockCircleOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import { useResponsive } from "../../hooks/useResponsive";

const { Text } = Typography;
const numberForMiles = new Intl.NumberFormat("de-DE");

// Helper para formatear variaciones de forma razonable
// absDiff = diferencia absoluta (valor actual - anterior), para mostrar cuando el % es exagerado
// unit = unidad de medida para mostrar junto a la diferencia absoluta
const formatVariation = (variation, absDiff = null, unit = null) => {
  if (variation === null || variation === undefined) return null;
  const abs = Math.abs(variation);
  const suffix = unit ? ` ${unit}` : "";
  if (abs > 500 && absDiff !== null) {
    // Variación extrema: mostrar diferencia absoluta en vez de porcentaje ridículo
    return { text: `${absDiff > 0 ? "+" : ""}${absDiff.toFixed(1)}${suffix}`, extreme: true, positive: variation > 0 };
  }
  if (abs > 100) {
    return { text: variation > 0 ? ">+100%" : "<-100%", extreme: false, positive: variation > 0 };
  }
  return { text: `${variation > 0 ? "+" : ""}${variation.toFixed(1)}%`, extreme: false, positive: variation > 0 };
};

const MyLastRegisters = () => {
  const { state } = useContext(AppContext);
  const { isMobile } = useResponsive();
  const [visible, setVisible] = useState(false);
  
  // Escuchar eventos del tour de telemetría para abrir/cerrar el drawer
  useEffect(() => {
    const handleTourStep = (e) => {
      const { tourKey, step } = e.detail || {};
      if (tourKey === "tour-telemetry") {
        if (step?.opensDrawer) {
          // Abrir drawer inmediatamente. El ModuleTour maneja el delay
          // visual para que el tooltip aparezca cuando el drawer ya esté abierto.
          setVisible(true);
        } else if (step?.drawerStep) {
          // Mantener drawer abierto durante los pasos de stats y columnas
          setVisible(true);
        } else if (step?.closesDrawer) {
          // Paso "Ficha Técnica" — cerrar drawer
          setVisible(false);
        } else {
          // Cualquier otro paso fuera del drawer (botón, métricas, etc.)
          setVisible(false);
        }
      }
    };
    const handleTourClosed = (e) => {
      if (e.detail?.tourKey === "tour-telemetry") {
        setVisible(false);
      }
    };
    const handleTourFinished = (e) => {
      if (e.detail?.tourKey === "tour-telemetry") {
        setVisible(false);
      }
    };
    window.addEventListener("tour-step-change", handleTourStep);
    window.addEventListener("tour-closed", handleTourClosed);
    window.addEventListener("tour-finished", handleTourFinished);
    return () => {
      window.removeEventListener("tour-step-change", handleTourStep);
      window.removeEventListener("tour-closed", handleTourClosed);
      window.removeEventListener("tour-finished", handleTourFinished);
    };
  }, []);
  
  const vars = state.selected_profile?.config_data?.variables || [];
  const todayData = state.selected_profile?.modules?.today || [];
  const loadingData = !todayData || todayData.length === 0;
  
  // Calcular estadísticas para el resumen
  // ⚠️ todayData viene ordenado del MÁS RECIENTE al MÁS ANTIGUO
  const stats = useMemo(() => {
    if (!todayData || todayData.length === 0) return null;
    const lastRecord = todayData[0];           // más reciente
    const firstRecord = todayData[todayData.length - 1]; // primer registro del día
    const totalDiff = (lastRecord?.total || 0) - (firstRecord?.total || 0);
    return {
      totalRegistros: todayData.length,
      consumoTotal: totalDiff,
      primerRegistro: firstRecord?.date_time_medition?.slice(11, 16) || "N/A",
      ultimoRegistro: lastRecord?.date_time_medition?.slice(11, 16) || "N/A",
    };
  }, [todayData]);
  
  const columns = useMemo(() => {
    const cols = [
      {
        title: (
          <span id="drawer-col-hora">
            <ClockCircleOutlined /> Hora
          </span>
        ),
        render: (a) => a.date_time_medition.slice(11, 16) + " hrs",
        width: 100,
      }
    ];

    // Mapeo dinámico de variables basado en la configuración
    const configVariables = vars || [];
    
    configVariables.forEach(v => {
      const type = v.type_variable;
      const label = v.label || v.str_variable;
      const unit = v.unit_measurement || (type?.includes("CAUDAL") ? "lt/s" : type?.includes("NIVEL") ? "m" : "m³");
      const dataIndex = type?.includes("CAUDAL") ? "flow" : type?.includes("NIVEL") ? "water_table" : "total";
      
      // Si es variable de NIVEL, generamos dos columnas: Nivel de Agua y Profundidad Freática
      if (type?.includes("NIVEL")) {
        // Columna 1: Nivel de Agua
        cols.push({
          title: <span id="drawer-col-nivel-agua">Nivel de Agua (m)</span>,
          dataIndex: "nivel",
          align: "right",
          render: (value, record, index) => {
            const nextRecord = todayData[index + 1];
            const prevValue = nextRecord?.["nivel"];
            let variation = null;
            if (prevValue && prevValue > 0 && typeof value === 'number') {
              variation = ((value - prevValue) / prevValue) * 100;
            }
            const varInfo = formatVariation(variation, null, "m");
            return (
              <Flex vertical align="end">
                <Text strong style={{ color: "#fa8c16" }}>
                   {typeof value === 'number' ? value.toFixed(2) : value || "0"}
                </Text>
                {varInfo && (
                  <Flex align="center" gap={2}>
                    {varInfo.positive ? <RiseOutlined style={{ color: "#52c41a", fontSize: 10 }} /> : <FallOutlined style={{ color: "#ff4d4f", fontSize: 10 }} />}
                    {varInfo.text ? (
                      <Text style={{ fontSize: 10, color: varInfo.positive ? "#52c41a" : "#ff4d4f", fontWeight: 700 }}>
                        {varInfo.text}
                      </Text>
                    ) : null}
                  </Flex>
                )}
              </Flex>
            );
          }
        });

        // Columna 2: Nivel Freático
        cols.push({
          title: <span id="drawer-col-nivel-freatico">Nivel Freático (m)</span>,
          dataIndex: "water_table",
          align: "right",
          render: (value, record, index) => {
            const nextRecord = todayData[index + 1];
            const prevValue = nextRecord?.["water_table"];
            let variation = null;
            if (prevValue && prevValue > 0 && typeof value === 'number') {
              variation = ((value - prevValue) / prevValue) * 100;
            }
            const varInfo = formatVariation(variation, null, "m");
            return (
              <Flex vertical align="end">
                <Text strong style={{ color: "#1F3461" }}>
                   {typeof value === 'number' ? value.toFixed(2) : value || "0"}
                </Text>
                {varInfo && (
                  <Flex align="center" gap={2}>
                    {varInfo.positive ? <RiseOutlined style={{ color: "#52c41a", fontSize: 10 }} /> : <FallOutlined style={{ color: "#ff4d4f", fontSize: 10 }} />}
                    {varInfo.text ? (
                      <Text style={{ fontSize: 10, color: varInfo.positive ? "#52c41a" : "#ff4d4f", fontWeight: 700 }}>
                        {varInfo.text}
                      </Text>
                    ) : null}
                  </Flex>
                )}
              </Flex>
            );
          }
        });
      } else {
        // Lógica estándar para otras variables (Caudal, Totalizado, etc.)
        
        const colId = type?.includes("CAUDAL") ? "drawer-col-caudal" : type?.includes("TOTALIZADO") ? "drawer-col-acumulado" : null;
        const col = {
          title: colId ? <span id={colId}>{label} ({unit})</span> : `${label} (${unit})`,
          dataIndex: dataIndex,
          align: "right",
          render: (value, record, index) => {
            const nextRecord = todayData[index + 1];
            const prevValue = nextRecord?.[dataIndex];
            let variation = null;
            let absDiff = null;
            
            if (prevValue && prevValue > 0 && typeof value === 'number') {
              variation = ((value - prevValue) / prevValue) * 100;
              absDiff = value - prevValue;
            }

            const color = type?.includes("CAUDAL") ? "#1890ff" : "#1F3461";
            // Para acumulado (TOTALIZADO) mostrar el consumo (total_diff) como variación
            const varInfo = type?.includes("TOTALIZADO")
              ? (record?.total_diff ? { text: `+${numberForMiles.format(Math.round(record.total_diff))} m³`, positive: true } : null)
              : formatVariation(variation, absDiff, "lt/s");

            return (
              <Flex vertical align="end">
                <Text strong style={{ color: color }}>
                  {typeof value === 'number' ? 
                    (type === "TOTALIZADO" ? numberForMiles.format(value) : value.toFixed(2)) 
                    : value || "0"}
                </Text>
                {varInfo && (
                  <Flex align="center" gap={2}>
                    {varInfo.positive ? <RiseOutlined style={{ color: "#52c41a", fontSize: 10 }} /> : <FallOutlined style={{ color: "#ff4d4f", fontSize: 10 }} />}
                    {varInfo.text ? (
                      <Text style={{ fontSize: 10, color: varInfo.positive ? "#52c41a" : "#ff4d4f", fontWeight: 700 }}>
                        {varInfo.text}
                      </Text>
                    ) : null}
                  </Flex>
                )}
              </Flex>
            );
          }
        };
        
        cols.push(col);
      }
    });

    // Modificación: Solo mostrar Consumo si existe la variable TOTALIZADO (ya que se deriva de ella) 
    // y no está explícitamente configurada como variable CONSUMO
    if (configVariables.some(v => v.type_variable?.includes("TOTALIZADO")) && !configVariables.some(v => v.type_variable === "CONSUMO")) {
      cols.push({
        title: <span id="drawer-col-consumo">Consumo (m³)</span>,
        dataIndex: "total_diff",
        align: "right",
        render: (value) => (
          <Tag color="cyan" style={{ borderRadius: 4, fontWeight: 700, border: "none", margin: 0 }}>
            +{numberForMiles.format(value || 0)}
          </Tag>
        ),
      });
    }

    return cols;
  }, [vars, todayData]);

  return (
    <>
      <Drawer
        open={visible}
        afterOpenChange={(isOpen) => {
          if (isOpen) {
            window.dispatchEvent(new CustomEvent("tour-drawer-opened", { detail: { tourKey: "tour-telemetry" } }));
          }
        }}
        styles={{
          body: {
            background: "#f8fafc",
            padding: 0,
          },
          header: {
            background: "#ffffff",
            borderBottom: "1px solid #f0f0f0",
            padding: "16px 24px",
          },
          close: {
            color: "#8c8c8c",
          }
        }}
        width={isMobile ? "100%" : 900}
        onClose={() => setVisible(false)}
        title={
          <Flex align="center" gap={12}>
            <div style={{ 
              background: "linear-gradient(135deg, #1F3461 0%, #1890ff 100%)", 
              padding: "8px", 
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              boxShadow: "0 2px 8px rgba(24, 144, 255, 0.25)",
            }}>
              <TableOutlined style={{ fontSize: 18, color: "white" }} />
            </div>
            <Flex vertical gap={0}>
              <Text style={{ color: "#1F3461", fontSize: 17, fontWeight: 800, lineHeight: 1.2 }}>
                Registros del Día
              </Text>
              <Text style={{ color: "#8c8c8c", fontSize: 12 }}>
                {todayData.length} mediciones registradas
              </Text>
            </Flex>
          </Flex>
        }
      >
        {/* Resumen de estadísticas */}
        {stats && (
          <div style={{ padding: "20px 24px", background: "#ffffff", borderBottom: "1px solid #f0f0f0" }}>
            <Flex gap={16} wrap="wrap">
              <div id="drawer-stat-total" style={{ flex: 1, minWidth: 140 }}>
                <Card size="small" style={{ borderRadius: 10, border: "1px solid #f0f0f0" }} bodyStyle={{ padding: "12px 16px" }}>
                  <Statistic title="Total Registros" value={stats.totalRegistros} suffix="regs" valueStyle={{ color: "#1F3461", fontSize: 20, fontWeight: 800 }} titleStyle={{ fontSize: 11, color: "#8c8c8c" }} />
                </Card>
              </div>
              <div id="drawer-stat-consumo" style={{ flex: 1, minWidth: 140 }}>
                <Card size="small" style={{ borderRadius: 10, border: "1px solid #f0f0f0" }} bodyStyle={{ padding: "12px 16px" }}>
                  <Statistic title="Consumo Acum." value={numberForMiles.format(Math.round(stats.consumoTotal))} suffix="m³" valueStyle={{ color: "#52c41a", fontSize: 20, fontWeight: 800 }} titleStyle={{ fontSize: 11, color: "#8c8c8c" }} />
                </Card>
              </div>
              <div id="drawer-stat-primero" style={{ flex: 1, minWidth: 140 }}>
                <Card size="small" style={{ borderRadius: 10, border: "1px solid #f0f0f0" }} bodyStyle={{ padding: "12px 16px" }}>
                  <Statistic title="Primer Registro" value={stats.primerRegistro} valueStyle={{ color: "#1F3461", fontSize: 20, fontWeight: 800 }} titleStyle={{ fontSize: 11, color: "#8c8c8c" }} />
                </Card>
              </div>
              <div id="drawer-stat-ultimo" style={{ flex: 1, minWidth: 140 }}>
                <Card size="small" style={{ borderRadius: 10, border: "1px solid #f0f0f0" }} bodyStyle={{ padding: "12px 16px" }}>
                  <Statistic title="Último Registro" value={stats.ultimoRegistro} valueStyle={{ color: "#1F3461", fontSize: 20, fontWeight: 800 }} titleStyle={{ fontSize: 11, color: "#8c8c8c" }} />
                </Card>
              </div>
            </Flex>
          </div>
        )}

        <div style={{ padding: "20px 24px" }}>
          {loadingData ? (
            <Flex vertical gap={16}>
              <Skeleton active paragraph={{ rows: 1 }} title={{ width: "40%" }} />
              <Skeleton active paragraph={{ rows: 6 }} title={false} />
            </Flex>
          ) : (
            <Table
              dataSource={todayData}
              columns={columns}
              rowKey="id"
              scroll={{ x: 600 }}
              size="small"
              style={{ 
                borderRadius: "12px", 
                overflow: "hidden", 
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                border: "1px solid #f0f0f0",
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                position: ["bottomCenter"]
              }}
            />
          )}
        </div>
      </Drawer>
      <Button
        size={"small"}
        type={"primary"}
        shape={"round"}
        icon={<TableOutlined />}
        onClick={() => setVisible(true)}
        style={{ fontWeight: 600, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
      >
        Mediciones ({todayData.length})
      </Button>
    </>
  );
};

export default MyLastRegisters;
