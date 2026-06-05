import React from "react";
import { Row, Col, Flex, Typography, Spin, Tag, theme, Modal, Button, Input, Space, message } from "antd";
import { FaClipboardCheck, FaCopy, FaSearch, FaExclamationTriangle } from "react-icons/fa";


const { Text } = Typography;
const { useToken } = theme;

const VoucherModal = ({
  open,
  onCancel,
  selectedVoucher,
  dgaResult,
  dgaConsole,
  dgaVerifying,
  voucherCopied,
  setVoucherCopied,
  onVerifyDGA,
}) => {
  const { token } = useToken();

  return (
    <Modal
      title={
        <Flex align="center" gap={8} wrap="wrap">
          <FaClipboardCheck style={{ color: token.colorPrimary, fontSize: 16 }} />
          <Text strong style={{ fontSize: 14 }}>{selectedVoucher?.title || "Voucher DGA"}</Text>
          <Tag style={{ fontSize: 10, margin: 0, padding: "0 4px", lineHeight: "16px" }}>
            {selectedVoucher?.code || "—"}
          </Tag>
          <Tag style={{ fontSize: 10, margin: 0, padding: "0 4px", lineHeight: "16px" }}>
            {selectedVoucher?.type_dga || "SUPERFICIAL"}
          </Tag>
        </Flex>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width="800px"
      styles={{ body: { paddingBottom: 24, display: 'flex', flexDirection: 'column' } }}
    >
      <Flex vertical gap={12}>
        {selectedVoucher?.code && selectedVoucher?.voucher && (
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} md={16}>
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  value={selectedVoucher?.voucher || ""}
                  readOnly
                  style={{ fontSize: 13, fontFamily: "monospace" }}
                />
                <Button
                  type={voucherCopied ? "default" : "primary"}
                  icon={<FaCopy style={{ fontSize: 14 }} />}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(selectedVoucher?.voucher || "");
                      setVoucherCopied(true);
                      setTimeout(() => setVoucherCopied(false), 2000);
                    } catch (err) {
                      console.error("Error copiando voucher:", err);
                    }
                  }}
                />
              </Space.Compact>
            </Col>
            <Col xs={24} md={8}>
              <Button
                type="primary"
                loading={dgaVerifying}
                onClick={onVerifyDGA}
                icon={<FaSearch style={{ fontSize: 12 }} />}
                style={{ width: "100%" }}
              >
                {dgaVerifying ? "Validando..." : "Validar "}
              </Button>
            </Col>
          </Row>
        )}

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div
              style={{
                background: token.colorBgLayout,
                borderRadius: 8,
                padding: "12px 16px",
                fontFamily: "monospace",
                fontSize: 11,
                color: token.colorTextTertiary,
                height: 500,
                overflowY: "auto",
                lineHeight: 1.6,
              }}
            >
              {dgaConsole.length === 0 ? (
                <Flex align="center" justify="center" style={{ height: "100%" }}>
                  <Text style={{ color: token.colorTextDisabled, fontSize: 12 }}>Listo para validar...</Text>
                </Flex>
              ) : (
                dgaConsole.map((line, i) => (
                  <div key={i} style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                    {line.startsWith("> ERROR") ? (
                      <span style={{ color: token.colorError }}>{line}</span>
                    ) : line.startsWith("> Status: 2") ? (
                      <span style={{ color: token.colorSuccess }}>{line}</span>
                    ) : line.startsWith("> Status:") ? (
                      <span style={{ color: token.colorWarning }}>{line}</span>
                    ) : (
                      line
                    )}
                  </div>
                ))
              )}
              {dgaVerifying && (
                <div style={{ color: token.colorPrimary }}>
                  {"\u258B"}
                </div>
              )}
            </div>
          </Col>

          <Col xs={24} md={12} style={{ height: 500 }}>
            <Flex vertical gap={12} style={{ height: "100%" }}>
              {!dgaResult && !dgaVerifying && (
                <Flex vertical align="center" justify="center" style={{ height: "100%", textAlign: "center" }}>
                  <FaClipboardCheck style={{ fontSize: 32, color: token.colorTextDisabled, marginBottom: 12 }} />
                  <Text strong style={{ fontSize: 13, color: token.colorTextSecondary }}>
                    Sin validar
                  </Text>
                  <Text style={{ fontSize: 11, color: token.colorTextTertiary, marginTop: 4 }}>
                    Haz clic en <Text strong>Validar comprobante</Text> para verificar
                  </Text>
                </Flex>
              )}

              {dgaVerifying && !dgaResult && (
                <Flex vertical align="center" justify="center" style={{ height: "100%", textAlign: "center" }}>
                  <Spin size="large" style={{ marginBottom: 12 }} />
                  <Text strong style={{ fontSize: 13, color: token.colorPrimary }}>
                    Consultando DGA...
                  </Text>
                </Flex>
              )}

              {dgaResult && dgaResult.status === "00" && dgaResult.data && (
                <Flex vertical style={{ height: "100%" }} justify="space-between">
                  <Flex vertical gap={12}>
                    <Row gutter={[10, 10]}>
                      <Col span={12}>
                        <div style={{ background: token.colorBgLayout, borderRadius: 8, padding: "12px 14px", textAlign: "center" }}>
                          <Text type="secondary" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Caudal</Text>
                          <div><Text strong style={{ fontSize: 20, color: token.colorPrimary }}>{dgaResult.data.caudal}</Text> <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>L/s</Text></div>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ background: token.colorBgLayout, borderRadius: 8, padding: "12px 14px", textAlign: "center" }}>
                          <Text type="secondary" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Totalizador</Text>
                          <div><Text strong style={{ fontSize: 20, color: token.colorPrimary }}>{dgaResult.data.totalizador}</Text> <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>m³</Text></div>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ background: token.colorBgLayout, borderRadius: 8, padding: "12px 14px", textAlign: "center" }}>
                          <Text type="secondary" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Fecha</Text>
                          <div><Text strong style={{ fontSize: 15 }}>{dgaResult.data.fechaMedicion}</Text></div>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ background: token.colorBgLayout, borderRadius: 8, padding: "12px 14px", textAlign: "center" }}>
                          <Text type="secondary" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Hora</Text>
                          <div><Text strong style={{ fontSize: 15 }}>{dgaResult.data.horaMedicion}</Text></div>
                        </div>
                      </Col>
                    </Row>

                    {dgaResult.meta && (
                      <Flex gap={8} wrap="wrap">
                        <div style={{ background: token.colorBgLayout, borderRadius: 6, padding: "8px 12px", flex: 1, minWidth: 120 }}>
                          <Text type="secondary" style={{ fontSize: 9, textTransform: "uppercase" }}>Punto</Text>
                          <div><Text style={{ fontSize: 12 }}>{dgaResult.meta.punto}</Text></div>
                        </div>
                        <div style={{ background: token.colorBgLayout, borderRadius: 6, padding: "8px 12px", flex: 1, minWidth: 120 }}>
                          <Text type="secondary" style={{ fontSize: 9, textTransform: "uppercase" }}>Código</Text>
                          <div><Text style={{ fontSize: 12, fontFamily: "monospace" }}>{dgaResult.meta.codigo_obra}</Text></div>
                        </div>
                        <div style={{ background: token.colorBgLayout, borderRadius: 6, padding: "8px 12px", flex: 1, minWidth: 100 }}>
                          <Text type="secondary" style={{ fontSize: 9, textTransform: "uppercase" }}>Tipo</Text>
                          <div><Text style={{ fontSize: 12 }}>{dgaResult.meta.tipo_dga}</Text></div>
                        </div>
                        <div style={{ background: dgaResult.meta.enviado_dga ? token.colorSuccessBg : token.colorErrorBg, borderRadius: 6, padding: "8px 12px", flex: 1, minWidth: 100 }}>
                          <Text type="secondary" style={{ fontSize: 9, textTransform: "uppercase" }}>Enviado</Text>
                          <div><Text style={{ fontSize: 12, color: dgaResult.meta.enviado_dga ? token.colorSuccess : token.colorError }}>{dgaResult.meta.enviado_dga ? "Sí" : "No"}</Text></div>
                        </div>
                      </Flex>
                    )}

                    {dgaResult.meta?.return_dga && (
                      <div style={{ background: token.colorSuccessBg, borderRadius: 6, padding: "8px 12px" }}>
                        <Text style={{ fontSize: 11, color: token.colorSuccess }}>{dgaResult.meta.return_dga}</Text>
                      </div>
                    )}
                  </Flex>

                  <Button
                    size="small"
                    block
                    icon={<FaCopy style={{ fontSize: 11 }} />}
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(dgaResult, null, 2));
                      message.success("Respuesta copiada");
                    }}
                  >
                    Copiar JSON
                  </Button>
                </Flex>
              )}

              {dgaResult && dgaResult.status === "01" && (
                <Flex vertical align="center" justify="center" style={{ height: "100%", textAlign: "center" }}>
                  <FaExclamationTriangle style={{ fontSize: 32, color: token.colorWarning, marginBottom: 12 }} />
                  <Text strong style={{ fontSize: 13, color: token.colorTextSecondary }}>
                    Comprobante no encontrado
                  </Text>
                  <Text style={{ fontSize: 11, color: token.colorTextTertiary, marginTop: 4 }}>
                    Verifica el código y número de comprobante
                  </Text>
                </Flex>
              )}

              {dgaResult && !dgaResult.status && (
                <Flex vertical align="center" justify="center" style={{ height: "100%", textAlign: "center" }}>
                  <FaExclamationTriangle style={{ fontSize: 32, color: token.colorError, marginBottom: 12 }} />
                  <Text strong style={{ fontSize: 13, color: token.colorTextSecondary }}>
                    Error de conexión
                  </Text>
                  <Text style={{ fontSize: 11, color: token.colorTextTertiary, marginTop: 4 }}>
                    Revisa la consola para más detalles
                  </Text>
                </Flex>
              )}
            </Flex>
          </Col>
        </Row>
      </Flex>
    </Modal>
  );
};

export default React.memo(VoucherModal);
