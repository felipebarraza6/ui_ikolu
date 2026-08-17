import React from "react";
import { Result, Button, Typography } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

const { Text } = Typography;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] Caught rendering error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              padding: "40px 24px",
              background: "rgba(3, 12, 24, 0.4)",
              borderRadius: 16,
              border: "1px solid rgba(255, 255, 255, 0.06)",
              margin: "16px 0",
              textAlign: "center",
            }}
          >
            <Result
              status="error"
              title="Algo salió mal"
              subTitle={
                <Text style={{ color: "rgba(255, 255, 255, 0.65)" }}>
                  Ocurrió un error al cargar este componente. Por favor, reintenta o recarga la página.
                </Text>
              }
              extra={[
                <Button
                  type="primary"
                  key="retry"
                  icon={<ReloadOutlined />}
                  onClick={this.handleReset}
                  style={{
                    background: "linear-gradient(135deg, #3a68aa 0%, #1a2d52 100%)",
                    borderColor: "#3a68aa",
                  }}
                >
                  Reintentar
                </Button>,
                <Button
                  key="reload"
                  onClick={() => window.location.reload()}
                  style={{
                    background: "transparent",
                    color: "#fff",
                    borderColor: "rgba(255,255,255,0.25)",
                  }}
                >
                  Recargar Página
                </Button>,
              ]}
            />
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
