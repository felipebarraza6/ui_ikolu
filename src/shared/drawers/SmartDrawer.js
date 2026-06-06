import React from "react";
import { Drawer, Flex, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";

/**
 * SmartDrawer — Drawer genérico reutilizable con header, footer de acciones y padding consistente.
 *
 * Props (además de las de Ant Design Drawer):
 * - title: ReactNode | string
 * - open: boolean
 * - onClose: function
 * - width: number | string (default 520)
 * - footer: ReactNode — si no se pasa, se muestra un botón Cerrar por defecto
 * - children: ReactNode
 * - destroyOnClose: boolean (default true)
 * - maskClosable: boolean (default true)
 * - zIndex: number
 * - styles: object
 */
const SmartDrawer = ({
  title,
  open,
  onClose,
  width = 520,
  footer,
  children,
  destroyOnClose = true,
  maskClosable = true,
  zIndex,
  styles,
  ...rest
}) => {
  const defaultFooter = (
    <Flex justify="flex-end">
      <Button icon={<CloseOutlined />} onClick={onClose}>
        Cerrar
      </Button>
    </Flex>
  );

  return (
    <Drawer
      title={title}
      open={open}
      onClose={onClose}
      width={width}
      destroyOnClose={destroyOnClose}
      maskClosable={maskClosable}
      zIndex={zIndex}
      styles={{
        body: { padding: 16 },
        ...styles,
      }}
      footer={footer !== undefined ? footer : defaultFooter}
      {...rest}
    >
      {children}
    </Drawer>
  );
};

export default React.memo(SmartDrawer);
