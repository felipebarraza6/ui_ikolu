import React from "react";
import CCComplianceTable from "./ComplianceTable";

const ComplianceTab = ({
  points,
  handleViewVoucher,
  handleOpenStopCompliance,
  handleOpenSupport,
  handleViewPointConfig,
  handleViewFlowAnalysis,
  handleViewComplianceDetail,
  onToggleCompliance,
  togglingCompliance,
  loading,
  page,
  setPage,
  pageSize,
  setPageSize,
  total,
  orderBy,
  setOrderBy,
  search,
  setSearch,
}) => {
  return (
    <div>
      <CCComplianceTable
        points={points}
        onViewVoucher={handleViewVoucher}
        onOpenStopCompliance={handleOpenStopCompliance}
        onOpenSupport={handleOpenSupport}
        onViewPointConfig={handleViewPointConfig}
        onViewFlowAnalysis={handleViewFlowAnalysis}
        onViewComplianceDetail={handleViewComplianceDetail}
        onToggleCompliance={onToggleCompliance}
        togglingCompliance={togglingCompliance}
        loading={loading}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        total={total}
        orderBy={orderBy}
        setOrderBy={setOrderBy}
        search={search}
        setSearch={setSearch}
      />
    </div>
  );
};

export default React.memo(ComplianceTab);
