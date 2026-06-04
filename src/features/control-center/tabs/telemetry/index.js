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
      />
    </div>
  );
};

export default React.memo(TelemetryTab);
