import React from "react";
import { Drawer, Flex, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useIkoluToken } from "../../hooks/useIkoluToken";

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
 * - variant: "default" | "void" — aplica estilo glassmorphism Void al drawer
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
  variant = "default",
  ...rest
}) => {
  const token = useIkoluToken();
  const isVoid = variant === "void";

  const voidStyles = isVoid
    ? {
        body: {
          padding: 16,
          background: token.voidBg,
        },
        header: {
          background: token.voidSurface,
          borderBottom: `1px solid ${token.voidBorder}`,
          color: token.voidTextHeading,
        },
        footer: {
          background: token.voidSurface,
          borderTop: `1px solid ${token.voidBorder}`,
        },
        mask: {
          background: "rgba(0, 0, 0, 0.65)",
        },
        content: {
          background: token.voidBg,
          boxShadow: token.voidShadow,
        },
      }
    : {
        body: { padding: 16 },
      };

  const defaultFooter = (
    <Flex justify="flex-end">
      <Button
        icon={<CloseOutlined />}
        onClick={onClose}
        style={isVoid ? { background: token.voidSurface, borderColor: token.voidBorder, color: token.voidText } : {}}
      >
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
        ...voidStyles,
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
