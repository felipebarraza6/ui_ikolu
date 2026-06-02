import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import CCComplianceTable from "./CCComplianceTable";
import SkeletonCompliance from "./SkeletonCompliance";

const ComplianceTab = () => {
  const {
    points,
    last7,
    handleViewVoucher,
    handleOpenStopCompliance,
    handleOpenSupport,
    handleViewPointConfig,
    handleViewFlowAnalysis,
    handleViewComplianceDetail,
    loading,
  } = useOutletContext();

  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSkeleton(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (showSkeleton || (loading && !points?.length)) {
    return (
      <div style={{ padding: "16px 0" }}>
        <SkeletonCompliance />
      </div>
    );
  }

  return (
    <div className="tab-content-fade">
      <CCComplianceTable
        points={points}
        last7={last7}
        onViewVoucher={handleViewVoucher}
        onOpenStopCompliance={handleOpenStopCompliance}
        onOpenSupport={handleOpenSupport}
        onViewPointConfig={handleViewPointConfig}
        onViewFlowAnalysis={handleViewFlowAnalysis}
        onViewComplianceDetail={handleViewComplianceDetail}
        loading={loading}
      />
    </div>
  );
};

export default React.memo(ComplianceTab);
