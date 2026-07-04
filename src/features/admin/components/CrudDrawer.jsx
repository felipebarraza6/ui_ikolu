import React, { memo, useEffect } from "react";
import { Drawer, Flex, Form, Spin } from "antd";
import { CloseOutlined, SaveOutlined } from "@ant-design/icons";
import { SmartButton } from "../../../shared/ui";
import { useIkoluToken } from "../../../hooks/useIkoluToken";

/**
 * Drawer genérico para crear/editar registros en CRUDs administrativos.
 *
 * Props:
 * - title: string | ReactNode
 * - open: boolean
 * - onClose: function
 * - onSubmit: function(values)
 * - loading: boolean (spinner de carga inicial)
 * - saving: boolean (estado del botón guardar)
 * - initialValues: object
 * - children: campos del formulario
 */
const CrudDrawer = memo(
  ({
    title,
    open,
    onClose,
    onSubmit,
    loading = false,
    saving = false,
    initialValues = {},
    children,
    form: externalForm,
  }) => {
    const token = useIkoluToken();
    const internalForm = Form.useForm()[0];
    const form = externalForm || internalForm;

    useEffect(() => {
      if (open) {
        form.resetFields();
        form.setFieldsValue(initialValues);
      }
    }, [open, initialValues, form]);

    const handleSubmit = async () => {
      try {
        const values = await form.validateFields();
        await onSubmit(values);
      } catch (err) {
        // Errores de validación del formulario; no requieren mensaje extra.
      }
    };

    const footer = (
      <Flex justify="flex-end" gap={8}>
        <SmartButton
          variant="voidGhost"
          size="sm"
          icon={<CloseOutlined />}
          onClick={onClose}
          disabled={saving}
        >
          Cancelar
        </SmartButton>
        <SmartButton
          variant="void"
          size="sm"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSubmit}
        >
          Guardar
        </SmartButton>
      </Flex>
    );

    return (
      <Drawer
        title={title}
        open={open}
        onClose={onClose}
        width={520}
        destroyOnClose
        maskClosable={!saving}
        footer={footer}
        styles={{
          body: { padding: 16, background: token.voidBg },
          header: {
            background: token.voidSurface,
            borderBottom: `1px solid ${token.voidBorder}`,
            color: token.voidTextHeading,
          },
          footer: {
            background: token.voidSurface,
            borderTop: `1px solid ${token.voidBorder}`,
          },
          mask: { background: "rgba(0, 0, 0, 0.65)" },
          content: { background: token.voidBg, boxShadow: token.voidShadow },
        }}
      >
        {loading ? (
          <Flex justify="center" align="center" style={{ minHeight: 200 }}>
            <Spin />
          </Flex>
        ) : (
          <Form form={form} layout="vertical" autoComplete="off">
            {children}
          </Form>
        )}
      </Drawer>
    );
  }
);

CrudDrawer.displayName = "CrudDrawer";

export default CrudDrawer;
