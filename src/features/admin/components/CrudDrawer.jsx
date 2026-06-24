import React, { memo, useEffect } from "react";
import { Drawer, Flex, Button, Form, Spin } from "antd";
import { CloseOutlined, SaveOutlined } from "@ant-design/icons";
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
        <Button icon={<CloseOutlined />} onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSubmit}
          style={{ background: token.colorPrimary }}
        >
          Guardar
        </Button>
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
        styles={{ body: { padding: 16 } }}
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
