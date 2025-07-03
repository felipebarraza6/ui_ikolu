import React from "react";
import { Modal, Form, Input, DatePicker } from "antd";
import { useTranslation } from "react-i18next";

const NewRecordModal = ({ visible, onCancel, onCreate }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onCreate(values.name, values.year.year());
        form.resetFields();
      })
      .catch(() => {});
  };

  return (
    <Modal
      open={visible}
      title={t("waterModule.newRecord")}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleOk}
      okText={t("waterModule.create")}
      cancelText={t("waterModule.cancel")}
      centered
      style={{ borderRadius: 16 }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label={t("waterModule.name")}
          name="name"
          rules={[{ required: true, message: t("waterModule.name") + "..." }]}
        >
          <Input placeholder={t("waterModule.name") + "..."} />
        </Form.Item>
        <Form.Item
          label={t("waterModule.year")}
          name="year"
          rules={[{ required: true, message: t("waterModule.year") + "..." }]}
        >
          <DatePicker picker="year" style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NewRecordModal;
