import React, { useMemo, useState } from "react";
import { Flex, Typography, Table, Tag, Tooltip, theme, Switch, Input } from "antd";
import { SearchOutlined, SafetyOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
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
};

const pointsColumns = ({
  onViewVoucher,
  onStopCompliance,
  onOpenSupport,
  onViewPointConfig,
  onViewComplianceDetail,
  onToggleCompliance,
  togglingCompliance,
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
    title: "Tipo",
    key: "type",
    width: 100,
    align: "center",
    responsive: ["md"],
    render: (_, record) => (
      <Flex vertical gap={2} align="center">
        <Tag style={{ fontSize: token.fontSizeSM }}>
          {typeDgaLabels[record.standard] || record.standard}
        </Tag>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
          {typeDgaLabels[record.type_dga] || record.type_dga}
        </Text>
      </Flex>
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
    sorter: true,
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
    sorter: true,
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
    sorter: true,
    render: (_, record) => {
      const flowHistory = record.flow_history;
      const nearLimitHistory = record.near_limit_history;
      const exceededCount = flowHistory?.count ?? record.flow_exceeded_count ?? 0;
      const nearLimitCount = nearLimitHistory?.count ?? record.flow_near_limit_count ?? 0;
      const exceededHasMore = flowHistory?.has_more ?? false;
      const nearLimitHasMore = nearLimitHistory?.has_more ?? false;
      const authorizedFlow = record.authorized_flow;
      const badgeBase = { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: token.borderRadius, cursor: "pointer", transition: "opacity 0.2s" };

      return (
        <Flex vertical gap={4} align="center">
          {exceededCount > 0 || exceededHasMore ? (
            <Tooltip title={`Superó ${exceededCount}${exceededHasMore ? "+" : ""} veces el límite de ${authorizedFlow} L/s`}>
              <div
                role="button"
                tabIndex={0}
                aria-label={`Ver excedencias de ${record.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewComplianceDetail?.(record, "exceeded");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onViewComplianceDetail?.(record, "exceeded");
                  }
                }}
                style={{ ...badgeBase, background: `${token.colorError}15`, border: `1px solid ${token.colorError}30` }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                <FaExclamationTriangle style={{ fontSize: token.fontSizeSM, color: token.colorError }} />
                <Text style={{ fontSize: token.fontSizeSM, fontWeight: 600, color: token.colorError }}>
                  {exceededHasMore ? "20+" : exceededCount}
                </Text>
              </div>
            </Tooltip>
          ) : null}

          {nearLimitCount > 0 || nearLimitHasMore ? (
            <Tooltip title={`Cercano al límite ${nearLimitCount}${nearLimitHasMore ? "+" : ""} veces`}>
              <div
                role="button"
                tabIndex={0}
                aria-label={`Ver cercanías de ${record.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewComplianceDetail?.(record, "near_limit");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onViewComplianceDetail?.(record, "near_limit");
                  }
                }}
                style={{ ...badgeBase, background: `${token.colorWarning}15`, border: `1px solid ${token.colorWarning}30` }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                <FaChartLine style={{ fontSize: token.fontSizeSM, color: token.colorWarning }} />
                <Text style={{ fontSize: token.fontSizeSM, fontWeight: 600, color: token.colorWarning }}>
                  {nearLimitHasMore ? "20+" : nearLimitCount}
                </Text>
              </div>
            </Tooltip>
          ) : null}
        </Flex>
      );
    },
  },
  ...(isSuperUser
    ? [
        {
          title: "Cumplimiento",
          key: "compliance_toggle",
          width: 110,
          align: "center",
          fixed: "right",
          render: (_, record) => (
            <Tooltip title={record.complianceActive ? "Cumplimiento activo" : "Cumplimiento pausado"}>
              <Switch
                size="small"
                checked={!!record.complianceActive}
                loading={!!togglingCompliance?.[record.id]}
                checkedChildren={<SafetyCertificateOutlined />}
                unCheckedChildren={<SafetyOutlined />}
                onChange={() => onToggleCompliance?.(record)}
                onClick={(e) => e.stopPropagation()}
              />
            </Tooltip>
          ),
        },
      ]
    : []),
  {
    title: "",
    key: "actions",
    width: 110,
    align: "center",
    fixed: "right",
    render: (_, record) => (
      <ActionButtons
        record={record}
        onViewVoucher={onViewVoucher}
        onOpenStopCompliance={onStopCompliance}
        onOpenSupport={onOpenSupport}
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
  onViewComplianceDetail,
  onToggleCompliance,
  togglingCompliance = {},
  loading = false,
  page = 1,
  setPage,
  pageSize = 10,
  setPageSize,
  total = 0,
  orderBy,
  setOrderBy,
  search = "",
  setSearch,
}) => {
  const { token } = useToken();
  const { isSuperUser } = useAuth();
  const [localSearch, setLocalSearch] = useState(search);
  const isServerPaginated = total > 0 && Array.isArray(points) && !!setPage && !!setPageSize;

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
        (p.title || "").toLowerCase().includes(q) ||
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
      onViewComplianceDetail,
      onToggleCompliance,
      togglingCompliance,
      token,
      isSuperUser,
    });
    return allColumns.filter(col => {
      if (col.key === "flow" && !activeVars.hasFlow) return false;
      if (col.key === "audit" && !activeVars.hasFlow) return false;
      if (col.key === "water_table" && !activeVars.hasLevel) return false;
      return true;
    });
  }, [onViewVoucher, onOpenStopCompliance, onOpenSupport, onViewPointConfig, onViewComplianceDetail, onToggleCompliance, togglingCompliance, token, isSuperUser, activeVars]);

  const handleTableChange = (_pagination, _filters, sorter) => {
    if (!setOrderBy) return;
    const sortState = Array.isArray(sorter) ? sorter[0] : sorter;
    const fieldMap = {
      point_name: "title",
      consumption: "pct_consumed",
      flow: "flow_lps",
      water_table: "water_table_m",
      audit: "flow_exceeded_count",
    };
    const field = fieldMap[sortState?.columnKey];
    if (!field || !sortState?.order) {
      setOrderBy(null);
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
        showSizeChanger: true,
        showTotal: (t) => `${t} punto${t !== 1 ? "s" : ""}`,
        pageSizeOptions: [10, 20, 50, 100],
        onChange: (p, ps) => {
          setPage(p);
          if (ps !== pageSize) setPageSize(ps);
        },
      }
    : {
        defaultPageSize: pageSize,
        showSizeChanger: true,
        pageSizeOptions: [10, 20, 50, 100],
        showTotal: (t) => `${t} punto${t !== 1 ? "s" : ""}`,
        onShowSizeChange: (_current, size) => setPageSize?.(size),
      };

  return (
    <div>
      <Flex justify="space-between" align="center" wrap="wrap" gap={8} style={{ marginBottom: 12 }}>
        <Text strong style={{ fontSize: token.fontSizeLG }}>
          Cumplimiento normativo
        </Text>
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
