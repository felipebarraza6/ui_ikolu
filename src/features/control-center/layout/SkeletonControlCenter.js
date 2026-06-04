import React from "react";
import { Row, Col } from "antd";
import { SkeletonKPI } from "../../../shared/ui/SmartSkeleton";

const SkeletonControlCenter = () => {
  return (
    <Row id="cc-kpi-cards" gutter={[16, 24]} className="ocean-kpi-row">
      <Col xs={12} sm={6} md={6}>
        <SkeletonKPI />
      </Col>
      <Col xs={12} sm={6} md={6}>
        <SkeletonKPI />
      </Col>
      <Col xs={12} sm={6} md={6}>
        <SkeletonKPI />
      </Col>
      <Col xs={12} sm={6} md={6}>
        <SkeletonKPI />
      </Col>
    </Row>
  );
};

export default React.memo(SkeletonControlCenter);
