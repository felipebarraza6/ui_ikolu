import React, { useCallback, useMemo, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import { useUI } from "../../contexts/UIContext";
import { Badge, Select, Flex, Button, Tooltip, Tag } from "antd";
import { useNavigate, useLocation } from "react-router";
import { FaEye } from "react-icons/fa";
import { MdSensorOccupied } from "react-icons/md";
import "../../styles/yellow-select.css";

const ListWells = () => {
  const { dispatch, user } = useAuth();
  const { selected_profile, points_list } = useData();
  const { isLoading } = useUI();
  const navigate = useNavigate();
  const location = useLocation();

  const pointsSource = useMemo(() => {
    return points_list || [];
  }, [points_list]);

  const hasValidData = useMemo(() => {
    return (
      pointsSource &&
      Array.isArray(pointsSource) &&
      pointsSource.length > 0
    );
  }, [pointsSource]);

  useEffect(() => {
    if (hasValidData && selected_profile && !selected_profile.id) {
      const firstProfile = pointsSource[0];
      if (firstProfile) {
        dispatch({
          type: "CHANGE_SELECTED_PROFILE",
          payload: {
            selected_profile: { ...firstProfile, key: firstProfile.id },
          },
        });
      }
    }
  }, [hasValidData, selected_profile, pointsSource, dispatch]);

  const disabledWell = useCallback((well) => {
    if (!well) return true;
    // 🆕 Soportar datos simples de my_points (is_telemetry directo) y datos completos (config_data)
    const hasTelemetry = well.is_telemetry ?? well.config_data?.is_telemetry ?? false;
    if (hasTelemetry) return false;
    if (!well.config_data) return false; // Datos simples sin config_data = permitido
    return !(
      well.standard === "CAUDALES_MUY_PEQUENOS" ||
      well.standard === "MENOR"
    );
  }, []);

  const onSelectWell = useCallback(
    async (key) => {
      // Bloquear cambio si está cargando datos
      if (isLoading) {
        console.warn("No se puede cambiar de pozo mientras se cargan datos");
        return;
      }

      if (key === "clear") {
        dispatch({
          type: "CHANGE_SELECTED_PROFILE",
          payload: { selected_profile: null },
        });
        return;
      }

      if (key === "admin") {
        navigate("/supp");
        return;
      }

      if (!hasValidData) {
        console.warn("No hay datos de perfil disponibles");
        return;
      }

      const selectedProfile = pointsSource.find(
        (profile) => profile.id === key
      );

      if (selectedProfile) {
        // Actualizar el seleccionado con la data mínima
        dispatch({
          type: "CHANGE_SELECTED_PROFILE",
          payload: {
            selected_profile: { ...selectedProfile, key },
          },
        });

        // 🆕 Navegar a telemetría automáticamente si no está ya ahí
        // El detalle completo se carga en PointDetailGuard (usePointDetail)
        // para evitar llamadas duplicadas a getPointDetail()
        if (location.pathname !== "/telemetry") {
          navigate("/telemetry");
        }
      }
    },
    [navigate, pointsSource, dispatch, hasValidData, isLoading]
  );

  const selectStyle = useMemo(
    () => ({
      width: "100%",
      zIndex: 1000,
      color: "black",
    }),
    []
  );

  const options = useMemo(() => {
    if (!hasValidData) {
      return [
        <Select.Option disabled value="no-data" key="no-data">
          No hay puntos de captación disponibles
        </Select.Option>,
      ];
    }

    // 🆕 Agrupar puntos por project_name para usar OptGroup
    const grouped = pointsSource.reduce((acc, point) => {
      if (!point || !point.id) {
        console.warn("Perfil con datos incompletos:", point);
        return acc;
      }
      const project = point.project_name || "Sin proyecto";
      if (!acc[project]) acc[project] = [];
      acc[project].push(point);
      return acc;
    }, {});

    const clearOption = (
      <Select.Option key="clear" value="clear" label="— Sin selección —">
        <Flex
          align="center"
          gap="small"
          style={{ width: "100%", minWidth: 0, padding: "6px 0" }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#d9d9d9",
              flexShrink: 0,
            }}
          />
          <span style={{ fontWeight: 500, fontSize: 13, color: "#8c8c8c" }}>
            — Sin selección —
          </span>
        </Flex>
      </Select.Option>
    );

    const renderOption = (e) => {
      const isTelemetry = e.is_telemetry ?? e.config_data?.is_telemetry ?? false;
      const isOwner = e.is_owner ?? false;
      const isViewer = e.is_viewer ?? false;
      const isDgaCompliance = e.is_dga_compliance ?? (e.dga?.send_dga ?? false);
      const codeDga = e.code_dga || e.dga?.code_dga || "";
      const title = e.title || `Perfil ${e.id}`;

      return (
        <Select.Option
          key={e.id}
          value={e.id}
          label={title + (codeDga ? " " + codeDga : "")}
        >
          <Flex
            align="center"
            gap="small"
            style={{
              width: "100%",
              minWidth: 0,
              padding: "6px 0",
            }}
          >
            {/* Telemetría: puntito */}
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: isTelemetry ? "#1F3461" : "#bfbfbf",
                flexShrink: 0,
              }}
            />

            {/* Título */}
            <span
              style={{
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                flex: 1,
                fontSize: 13,
                color: "#1a1a1a",
              }}
            >
              {title}
            </span>

            {/* Código DGA: tag sutil con estado integrado */}
            {codeDga && (
              <Tooltip title={isDgaCompliance ? "Enviando datos DGA" : "Sin envío DGA"}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: isDgaCompliance ? 600 : 400,
                    color: isDgaCompliance ? "#1a1a1a" : "#8c8c8c",
                    background: isDgaCompliance ? "rgba(189, 192, 12, 0.15)" : "#f5f5f5",
                    border: `1px solid ${isDgaCompliance ? "rgba(189, 192, 12, 0.5)" : "#d9d9d9"}`,
                    borderRadius: 4,
                    padding: "1px 6px",
                    lineHeight: "14px",
                    flexShrink: 0,
                    letterSpacing: 0.3,
                  }}
                >
                  {codeDga}
                </span>
              </Tooltip>
            )}

            {/* Owner / Viewer */}
            {isOwner && (
              <Tooltip title="Propietario">
                <MdSensorOccupied style={{ color: "#1F3461", fontSize: 15, flexShrink: 0 }} />
              </Tooltip>
            )}
            {isViewer && (
              <Tooltip title="Observador">
                <FaEye style={{ color: "#d46b08", fontSize: 13, flexShrink: 0 }} />
              </Tooltip>
            )}
          </Flex>
        </Select.Option>
      );
    };

    // 🆕 Construir OptGroups por proyecto
    const groups = Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([project, points]) => (
        <Select.OptGroup key={project} label={project}>
          {points.map(renderOption)}
        </Select.OptGroup>
      ));

    // Opción admin (solo si aplica)
    if (user?.is_admin_view) {
      const firstProfile = pointsSource[0];
      if (firstProfile?.code_dga_site) {
        groups.push(
          <Select.OptGroup key="admin-group" label="Administración">
            <Select.Option key="admin" value="admin" label="Total">
              <Flex align="center" gap="small">
                <Badge status="success" />
                <span style={{ fontWeight: 500 }}>Total</span>
                <Tag size="small" color="green-inverse">{firstProfile.code_dga_site}</Tag>
              </Flex>
            </Select.Option>
          </Select.OptGroup>
        );
      }
    }

    if (groups.length === 0) {
      return [
        <Select.Option disabled value="no-data" key="no-data">
          No hay puntos de captación disponibles
        </Select.Option>,
      ];
    }

    return [clearOption, ...groups];
  }, [pointsSource, user, hasValidData]);

  // Obtener el valor actual del select de forma segura
  const currentValue = useMemo(() => {
    if (!hasValidData || !selected_profile) return undefined;
    return selected_profile.id || undefined;
  }, [selected_profile, hasValidData]);

  return (
    <Flex align="bottom" justify="end" gap="small" wrap="wrap">
      <Select
        className="yellow-select"
        style={{
          ...selectStyle,
          opacity: isLoading ? 0.6 : 1,
          pointerEvents: isLoading ? "none" : "auto",
        }}
        placeholder={
          isLoading
            ? "Cargando datos..."
            : "Seleccione punto de captación"
        }
        value={currentValue}
        onSelect={onSelectWell}
        dropdownClassName="yellow-select-dropdown"
        dropdownStyle={{ zIndex: 1001, background: "#fff" }}
        listHeight={280}
        getPopupContainer={() => document.body}
        loading={!hasValidData || isLoading}
        showSearch
        optionFilterProp="label"
        filterOption={(input, option) => {
          if (!option) return false;
          const label = option.label || "";
          return label.toLowerCase().includes(input.toLowerCase());
        }}
        disabled={isLoading}
      >
        {options}
      </Select>
      {isLoading && (
        <Tooltip title="Cargando datos del pozo actual...">
          <Button
            type="text"
            loading
            size="small"
            style={{
              color: "#1F3461",
              border: "none",
              boxShadow: "none",
            }}
          />
        </Tooltip>
      )}
    </Flex>
  );
};

export default React.memo(ListWells);
