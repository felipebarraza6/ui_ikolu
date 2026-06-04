import React from "react";
import { Row, Col, theme } from "antd";
import { SkeletonKPI } from "../../../shared/ui/SmartSkeleton";

const { useToken } = theme;

const SkeletonControlCenter = () => {
  const { token } = useToken();

  return (
    <Row id="cc-kpi-cards" gutter={[16, 24]} className="ocean-kpi-row">
      <Col xs={12} sm={6} md={6}>
        <SkeletonKPI gradient={`linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimary}dd 100%)`} />
      </Col>
      <Col xs={12} sm={6} md={6}>
        <SkeletonKPI gradient={`linear-gradient(135deg, ${token.colorInfo} 0%, ${token.colorInfo}dd 100%)`} />
      </Col>
      <Col xs={12} sm={6} md={6}>
        <SkeletonKPI gradient={`linear-gradient(135deg, ${token.colorSuccess} 0%, ${token.colorSuccess}dd 100%)`} />
      </Col>
      <Col xs={12} sm={6} md={6}>
        <SkeletonKPI gradient={`linear-gradient(135deg, ${token.colorWarning} 0%, ${token.colorError} 100%)`} />
      </Col>
    </Row>
  );
};

export default React.memo(SkeletonControlCenter);
