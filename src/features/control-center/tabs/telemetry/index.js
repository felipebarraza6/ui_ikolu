import React from "react";
import CCWeekConsumption from "./WeekConsumption";

const TelemetryTab = ({
  last7,
  selectedDate,
  setSelectedDate,
  handleViewMeasurements,
  handleOpenStopTelemetry,
  handleOpenSupport,
  handleWarningPointClick,
  handleViewPointConfig,
  warningsRaw,
  loading,
  search,
}) => {
  return (
    <div>
      <CCWeekConsumption
        last7={last7}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        onViewMeasurements={handleViewMeasurements}
        onOpenStopTelemetry={handleOpenStopTelemetry}
        onOpenSupport={handleOpenSupport}
        onWarningPointClick={handleWarningPointClick}
        onViewPointConfig={handleViewPointConfig}
        warningsRaw={warningsRaw}
        loading={loading}
        search={search}
      />
    </div>
  );
};

export default React.memo(TelemetryTab);
