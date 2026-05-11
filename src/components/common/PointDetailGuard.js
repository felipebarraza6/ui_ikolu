import React, { useContext } from 'react';
import { Flex, Spin, Empty, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { usePointDetail } from '../../hooks/usePointDetail';

/**
 * Wrapper que asegura que el detalle completo del punto esté cargado
 * antes de renderizar los children.
 * 
 * Usar en páginas que necesiten acceder a:
 * - selected_profile.modules
 * - selected_profile.config_data
 * - selected_profile.profile_ikolu
 * - selected_profile.dga
 */
const PointDetailGuard = ({ children, fallback = null }) => {
  const { loading, hasDetail, selectedProfile, refreshDetail } = usePointDetail();

  // Si no hay ningún punto seleccionado
  if (!selectedProfile) {
    return (
      fallback || (
        <Flex align="center" justify="center" style={{ height: '50vh' }}>
          <Empty description="Selecciona un punto de captación" />
        </Flex>
      )
    );
  }

  // Si está cargando el detalle
  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ height: '50vh' }} gap="middle" vertical>
        <Spin size="large" />
        <p>Cargando detalle del punto...</p>
      </Flex>
    );
  }

  // Si no tiene el detalle completo después de cargar
  if (!hasDetail) {
    return (
      <Flex align="center" justify="center" style={{ height: '50vh' }} gap="middle" vertical>
        <Empty description="No se pudo cargar el detalle del punto" />
        <Button icon={<ReloadOutlined />} onClick={refreshDetail}>
          Reintentar
        </Button>
      </Flex>
    );
  }

  return children;
};

export default PointDetailGuard;
