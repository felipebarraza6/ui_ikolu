import React, { useMemo, useState } from "react";
import { Flex, Typography, Table, Tag, Tooltip, theme, Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { FaExclamationTriangle, FaChartLine } from "react-icons/fa";
import { useAuth } from "../../../../contexts/AuthContext";
import { PointHeader, ConsumptionCell, ActionButtons } from "../../components";

const { Text } = Typography;
const { useToken } = theme;

const typeDgaLabels = {
  "SUPERFICIAL": "Superficial",
  "SUBTERRANEO": "Subterráneo",
  "SUPERFICIAL_MAYOR": "Superficial Mayor",
  "SUBTERRANEO_MENOR": "Subterráneo Menor",
  "CAUDALES_MUY_PEQUENOS": "Caudales muy pequeños",
  "MEDIO": "Medio",
  "MAYOR": "Mayor",
  "MENOR": "Menor",
  "CAUDAL": "Caudal",
  "VOLUMEN": "Volumen",
  "SIN_ESTANDAR": "Sin estandar",
};

const standardFilterOptions = [
  { text: "Caudales muy pequeños", value: "CAUDALES_MUY_PEQUENOS" },
  { text: "Medio", value: "MEDIO" },
  { text: "Mayor", value: "MAYOR" },
  { text: "Menor", value: "MENOR" },
  { text: "Sin estandar", value: "SIN_ESTANDAR" },
];

const natureFilterOptions = [
  { text: "Superficial", value: "SUPERFICIAL" },
  { text: "Subterráneo", value: "SUBTERRANEO" },
];

const orderByOptions = [
  { value: "default", label: "Default (activos primero)" },
  { value: "pct_consumed_desc", label: "% consumido ↓" },
  { value: "pct_consumed_asc", label: "% consumido ↑" },
  { value: "point_name_asc", label: "Nombre ↑" },
  { value: "point_name_desc", label: "Nombre ↓" },
  { value: "exceedances_desc", label: "Más excedencias" },
  { value: "near_limit_desc", label: "Más cercanías al límite" },
];

const getStandardLabel = (standard) => {
  const normalized = String(standard || "").trim().toUpperCase();
  if (!normalized || normalized === "SMA") return null;
  if (normalized === "SIN_ESTANDAR") return "Sin estandar";
  return typeDgaLabels[normalized] || standard;
};

const pointsColumns = ({
  onViewVoucher,
  onStopCompliance,
  onOpenSupport,
  onViewPointConfig,
  onViewFlowHistory,
  onViewNearLimitHistory,
  onToggleCompliance,
  togglingCompliance,
  standard,
  nature,
  token,
  isSuperUser,
}) => [
  {
    title: "Punto",
    key: "point_name",
    width: 100,
    sorter: true,
    defaultSortOrder: "ascend",
    render: (_, record) => (
      <PointHeader record={record} onViewPointConfig={onViewPointConfig} token={token} />
    ),
  },
  {
    title: "Estándar",
    key: "standard",
    width: 95,
    align: "center",
    responsive: ["md"],
    filters: standardFilterOptions,
    onFilter: () => true,
    filteredValue: standard ? standard.split(",") : null,
    render: (_, record) => {
      const standardLabel = getStandardLabel(record.standard);
      const complianceTypes = Array.isArray(record.compliance_type)
        ? record.compliance_type
        : record.compliance_type
        ? [record.compliance_type]
        : [];
      const isSma = complianceTypes.some((t) => String(t).trim().toUpperCase() === "SMA");
      if (!standardLabel || isSma) return <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextDisabled }}>—</Text>;
      return (
        <Tag style={{ fontSize: token.fontSizeSM }}>
          {standardLabel}
        </Tag>
      );
    },
  },
  {
    title: "Naturaleza",
    key: "nature",
    width: 95,
    align: "center",
    responsive: ["md"],
    filters: natureFilterOptions,
    onFilter: () => true,
    filteredValue: nature ? nature.split(",") : null,
    render: (_, record) => (
      <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
        {typeDgaLabels[record.type_dga] || record.type_dga}
      </Text>
    ),
  },
  {
    title: "Consumo",
    key: "consumption",
    width: 120,
    align: "center",
    sorter: true,
    render: (_, record) => (
      <ConsumptionCell record={record} token={token} />
    ),
  },
  {
    title: "Caudal",
    key: "flow",
    width: 120,
    align: "center",
    render: (_, record) => {
      const currentFlow = record.flow_lps;
      const authorizedFlow = record.authorized_flow;
      const isExceeded = currentFlow != null && authorizedFlow > 0 && currentFlow > authorizedFlow;
      const isNearLimit = currentFlow != null && authorizedFlow > 0 && currentFlow >= authorizedFlow * 0.9 && currentFlow <= authorizedFlow;
      const flowColor = isExceeded ? token.colorError : isNearLimit ? token.colorWarning : token.colorSuccess;

      return (
        <Flex vertical gap={2} align="center">
          {currentFlow != null && authorizedFlow > 0 ? (
            <>
              <Text strong style={{ fontSize: token.fontSizeLG, color: flowColor }}>
                {Number(currentFlow).toFixed(1)}
                <span style={{ fontSize: token.fontSizeSM, fontWeight: 400, marginLeft: 2 }}> L/s</span>
              </Text>
              <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
                / {Number(authorizedFlow).toFixed(1)} L/s
              </Text>
            </>
          ) : currentFlow != null ? (
            <Text strong style={{ fontSize: token.fontSize, color: token.colorText }}>
              {Number(currentFlow).toFixed(1)} L/s
            </Text>
          ) : (
            <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextDisabled }}>—</Text>
          )}
        </Flex>
      );
    },
  },
  {
    title: "Nivel F.",
    key: "water_table",
    width: 85,
    align: "right",
    responsive: ["md"],
    render: (_, record) => {
      const v = record.water_table_m;
      return v != null ? (
        <Text style={{ fontSize: token.fontSize, color: token.colorInfo }}>
          {Number(v).toFixed(2)}
          <span style={{ fontSize: token.fontSizeSM, marginLeft: 2 }}> m</span>
        </Text>
      ) : (
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextDisabled }}>—</Text>
      );
    },
  },
  {
    title: "Auditoría",
    key: "audit",
    width: 140,
    align: "center",
    responsive: ["md"],
    render: (_, record) => {
      const flowHistory = record.flow_history;
      const nearLimitHistory = record.near_limit_history;
      const exceededCount = flowHistory?.count ?? record.flow_exceeded_count ?? 0;
      const nearLimitCount = nearLimitHistory?.count ?? record.flow_near_limit_count ?? 0;
      const authorizedFlow = record.authorized_flow;
      const badgeBase = { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: token.borderRadius, cursor: "pointer", transition: "opacity 0.2s" };

      return (
        <Flex vertical gap={4} align="center">
          {exceededCount > 0 ? (
            <Tooltip title={`Superó ${exceededCount} veces el límite de ${authorizedFlow} L/s`}>
              <div
                role="button"
                tabIndex={0}
                aria-label={`Ver excedencias de ${record.title || record.point_name || record.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewFlowHistory?.(record);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onViewFlowHistory?.(record);
                  }
                }}
                style={{ ...badgeBase, background: `${token.colorError}15`, border: `1px solid ${token.colorError}30` }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                <FaExclamationTriangle style={{ fontSize: token.fontSizeSM, color: token.colorError }} />
                <Text style={{ fontSize: token.fontSizeSM, fontWeight: 600, color: token.colorError }}>
                  {exceededCount}
                </Text>
              </div>
            </Tooltip>
          ) : null}

          {nearLimitCount > 0 ? (
            <Tooltip title={`Cercano al límite ${nearLimitCount} veces`}>
              <div
                role="button"
                tabIndex={0}
                aria-label={`Ver cercanías de ${record.title || record.point_name || record.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewNearLimitHistory?.(record);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onViewNearLimitHistory?.(record);
                  }
                }}
                style={{ ...badgeBase, background: `${token.colorWarning}15`, border: `1px solid ${token.colorWarning}30` }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                <FaChartLine style={{ fontSize: token.fontSizeSM, color: token.colorWarning }} />
                <Text style={{ fontSize: token.fontSizeSM, fontWeight: 600, color: token.colorWarning }}>
                  {nearLimitCount}
                </Text>
              </div>
            </Tooltip>
          ) : null}
        </Flex>
      );
    },
  },
  {
    title: "",
    key: "actions",
    width: isSuperUser ? 180 : 120,
    align: "center",
    fixed: "right",
    render: (_, record) => (
      <ActionButtons
        record={record}
        onViewVoucher={onViewVoucher}
        onOpenStopCompliance={onStopCompliance}
        onOpenSupport={onOpenSupport}
        onToggleCompliance={onToggleCompliance}
        togglingCompliance={togglingCompliance}
        isSuperUser={isSuperUser}
      />
    ),
  },
];

const CCComplianceTable = ({
  points,
  onViewVoucher,
  onOpenStopCompliance,
  onOpenSupport = () => {},
  onViewPointConfig,
  onViewFlowHistory,
  onViewNearLimitHistory,
  onToggleCompliance,
  togglingCompliance = {},
  loading = false,
  page = 1,
  setPage,
  pageSize = 10,
  total = 0,
  orderBy,
  setOrderBy,
  search = "",
  setSearch,
  standard = "",
  setStandard,
  nature = "",
  setNature,
}) => {
  const { token } = useToken();
  const { isSuperUser } = useAuth();
  const [localSearch, setLocalSearch] = useState(search);
  const isServerPaginated = total > 0 && Array.isArray(points) && !!setPage;

  const levelColorMap = {
    safe: { color: token.colorSuccess, label: "Dentro de límites" },
    warning: { color: token.colorWarning, label: "Cerca de superar límite" },
    critical: { color: token.colorError, label: "Incumplimiento detectado" },
    unknown: { color: token.colorTextDisabled, label: "Sin límites configurados" },
  };

  const filteredPoints = useMemo(() => {
    // Si hay paginación backend, el servidor ya filtró; no filtrar localmente.
    if (isServerPaginated) return points;
    if (!search.trim()) return points;
    const q = search.toLowerCase();
    return (points || []).filter(
      (p) =>
        (p.title || p.point_name || "").toLowerCase().includes(q) ||
        (p.code || "").toLowerCase().includes(q)
    );
  }, [points, search, isServerPaginated]);

  const activeVars = useMemo(() => {
    return {
      hasFlow: (points || []).some(p => p.flow_lps != null || p.authorized_flow != null),
      hasLevel: (points || []).some(p => p.water_table_m != null),
      hasTotal: (points || []).some(p => p.total_m3 != null || p.pct_consumed != null),
    };
  }, [points]);

  const columns = useMemo(() => {
    const allColumns = pointsColumns({
      onViewVoucher,
      onStopCompliance: onOpenStopCompliance,
      onOpenSupport,
      onViewPointConfig,
      onViewFlowHistory,
      onViewNearLimitHistory,
      onToggleCompliance,
      togglingCompliance,
      standard,
      nature,
      token,
      isSuperUser,
    });
    return allColumns.filter(col => {
      if (col.key === "flow" && !activeVars.hasFlow) return false;
      if (col.key === "audit" && !activeVars.hasFlow) return false;
      if (col.key === "water_table" && !activeVars.hasLevel) return false;
      return true;
    });
  }, [onViewVoucher, onOpenStopCompliance, onOpenSupport, onViewPointConfig, onViewFlowHistory, onViewNearLimitHistory, onToggleCompliance, togglingCompliance, standard, nature, token, isSuperUser, activeVars]);

  const handleTableChange = (_pagination, filters, sorter) => {
    // Filtros de estándar y naturaleza (backend).
    if (setStandard) {
      const standardFilters = filters?.standard;
      const nextStandard = standardFilters?.length ? standardFilters.join(",") : "";
      if (nextStandard !== standard) {
        setStandard(nextStandard);
        setPage?.(1);
      }
    }
    if (setNature) {
      const natureFilters = filters?.nature;
      const nextNature = natureFilters?.length ? natureFilters.join(",") : "";
      if (nextNature !== nature) {
        setNature(nextNature);
        setPage?.(1);
      }
    }

    if (!setOrderBy) return;
    const sortState = Array.isArray(sorter) ? sorter[0] : sorter;
    // Solo los campos soportados por el backend.
    const fieldMap = {
      point_name: "point_name",
      consumption: "pct_consumed",
    };
    const field = fieldMap[sortState?.columnKey];
    if (!field || !sortState?.order) {
      setOrderBy("default");
      return;
    }
    const direction = sortState.order === "ascend" ? "asc" : "desc";
    setOrderBy(`${field}_${direction}`);
  };

  const handleSearchSubmit = () => {
    setSearch?.(localSearch);
    setPage?.(1);
  };

  const paginationConfig = isServerPaginated
    ? {
        current: page,
        pageSize,
        total,
        showSizeChanger: false,
        showTotal: (t) => `${t} punto${t !== 1 ? "s" : ""}`,
        onChange: (p) => setPage(p),
      }
    : {
        defaultPageSize: pageSize,
        showSizeChanger: false,
        showTotal: (t) => `${t} punto${t !== 1 ? "s" : ""}`,
      };

  return (
    <div>
      <Flex justify="space-between" align="center" wrap="wrap" gap={8} style={{ marginBottom: 12 }}>
        <Text strong style={{ fontSize: token.fontSizeLG }}>
          Cumplimiento normativo
        </Text>
        <Flex gap={8} wrap="wrap">
          <Select
            size="small"
            placeholder="Ordenar por"
            value={orderBy || "default"}
            onChange={(value) => {
              setOrderBy?.(value);
              setPage?.(1);
            }}
            options={orderByOptions}
            style={{ minWidth: 180 }}
          />
          <Input
            prefix={<SearchOutlined />}
            placeholder="Buscar punto o código..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onPressEnter={handleSearchSubmit}
            style={{ width: 260 }}
            allowClear
            size="small"
          />
        </Flex>
      </Flex>
      <Table
        loading={loading}
        dataSource={filteredPoints}
        columns={columns}
        rowKey="id"
        size="small"
        scroll={{ x: "max-content" }}
        pagination={paginationConfig}
        locale={{ emptyText: "No hay puntos disponibles" }}
        onChange={handleTableChange}
        onRow={(record) => ({
          style: {
            borderLeft: `4px solid ${levelColorMap[record.compliance_warning?.level || "safe"]?.color || levelColorMap.safe.color}`,
          },
        })}
      />
    </div>
  );
};

export default React.memo(CCComplianceTable);
