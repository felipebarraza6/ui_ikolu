import React from "react";
import CCComplianceTable from "./ComplianceTable";

const ComplianceTab = ({
  points,
  last7,
  handleViewVoucher,
  handleOpenStopCompliance,
  handleOpenSupport,
  handleViewPointConfig,
  handleViewFlowAnalysis,
  handleViewComplianceDetail,
  loading,
}) => {
  return (
    <div>
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
