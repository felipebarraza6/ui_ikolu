import React from "react";
import CCWeekConsumption from "./WeekConsumption";

const TelemetryTab = ({
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
  onToggleTelemetry,
  togglingTelemetry,
  warningsRaw,
  loading,
  listLoading,
}) => {
  return (
    <div>
      <CCWeekConsumption
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
        onToggleTelemetry={onToggleTelemetry}
        togglingTelemetry={togglingTelemetry}
        warningsRaw={warningsRaw}
        loading={loading}
        listLoading={listLoading}
      />
    </div>
  );
};

export default React.memo(TelemetryTab);
