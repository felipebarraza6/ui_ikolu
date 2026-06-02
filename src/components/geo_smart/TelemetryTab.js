import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import CCWeekConsumption from "./CCWeekConsumption";
import SkeletonTelemetry from "./SkeletonTelemetry";

const TelemetryTab = () => {
  const {
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
  } = useOutletContext();

  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
      setShowContent(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (showSkeleton || (loading && !last7)) {
    return (
      <div className="skeleton-fade-out" style={{ padding: "16px 0" }}>
        <SkeletonTelemetry />
      </div>
    );
  }

  return (
    <div className={showContent ? "content-fade-in" : undefined}>
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
