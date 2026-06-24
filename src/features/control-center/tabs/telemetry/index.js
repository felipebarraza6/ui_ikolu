import React from "react";
import CCWeekConsumption from "./WeekConsumption";

const TelemetryTab = ({
  last7,
  dailySummary,
  listData,
  listPage,
  setListPage,
  listOrderBy,
  setListOrderBy,
  selectedDate,
  setSelectedDate,
  handleViewMeasurements,
  handleOpenStopTelemetry,
  handleOpenSupport,
  handleWarningPointClick,
  handleViewPointConfig,
  warningsRaw,
  loading,
  listLoading,
}) => {
  return (
    <div>
      <CCWeekConsumption
        last7={last7}
        dailySummary={dailySummary}
        listData={listData}
        listPage={listPage}
        setListPage={setListPage}
        listOrderBy={listOrderBy}
        setListOrderBy={setListOrderBy}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        onViewMeasurements={handleViewMeasurements}
        onOpenStopTelemetry={handleOpenStopTelemetry}
        onOpenSupport={handleOpenSupport}
        onWarningPointClick={handleWarningPointClick}
        onViewPointConfig={handleViewPointConfig}
        warningsRaw={warningsRaw}
        loading={loading}
        listLoading={listLoading}
      />
    </div>
  );
};

export default React.memo(TelemetryTab);
