import React, { useState } from "react";
import { Collapse, Typography, Alert, Tag, Flex } from "antd";
import { useIkoluToken } from "../../../hooks/useIkoluToken";

const { Text } = Typography;
const { Panel } = Collapse;

const DebugPanel = ({ debug }) => {
  const token = useIkoluToken();
  const [activeKey, setActiveKey] = useState([]);

  if (!debug) return null;

  const { responses = {}, errors = {} } = debug;
  const hasErrors = Object.keys(errors).length > 0;
  const hasResponses = Object.keys(responses).length > 0;

  if (!hasErrors && !hasResponses) return null;

  return (
    <Collapse
      activeKey={activeKey}
      onChange={setActiveKey}
      style={{ marginBottom: 24, background: token.colorBgContainer }}
    >
      <Panel
        header={
          <Flex align="center" gap={8}>
            <Text strong>Debug de endpoints</Text>
            {hasErrors && <Tag color="error">{Object.keys(errors).length} errores</Tag>}
            {hasResponses && <Tag color="success">{Object.keys(responses).length} ok</Tag>}
          </Flex>
        }
        key="debug"
      >
        {hasErrors && (
          <Alert
            message="Errores detectados"
            description={
              <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
                {JSON.stringify(errors, null, 2)}
              </pre>
            }
            type="error"
            style={{ marginBottom: 16 }}
          />
        )}
        {hasResponses && (
          <Alert
            message="Respuestas crudas"
            description={
              <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
                {JSON.stringify(responses, null, 2)}
              </pre>
            }
            type="info"
          />
        )}
      </Panel>
    </Collapse>
  );
};

export default DebugPanel;
