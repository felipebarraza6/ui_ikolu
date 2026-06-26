import React from "react";
import CCComplianceTable from "./ComplianceTable";

const ComplianceTab = ({
  points,
  handleViewVoucher,
  handleOpenStopCompliance,
  handleOpenSupport,
  handleViewPointConfig,
  handleViewFlowAnalysis,
  handleViewFlowHistory,
  handleViewNearLimitHistory,
  onToggleCompliance,
  togglingCompliance,
  loading,
  page,
  setPage,
  pageSize,
  total,
  orderBy,
  setOrderBy,
  search,
  setSearch,
  standard,
  setStandard,
  nature,
  setNature,
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
        onViewFlowHistory={handleViewFlowHistory}
        onViewNearLimitHistory={handleViewNearLimitHistory}
        onToggleCompliance={onToggleCompliance}
        togglingCompliance={togglingCompliance}
        loading={loading}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        total={total}
        orderBy={orderBy}
        setOrderBy={setOrderBy}
        search={search}
        setSearch={setSearch}
        standard={standard}
        setStandard={setStandard}
        nature={nature}
        setNature={setNature}
      />
    </div>
  );
};

export default React.memo(ComplianceTab);
