import { useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppContext } from "@/App";
import { fetchDashboardStats, fetchMyPoints, fetchPointsSummary } from "@/api/nereus/endpoints";
import { countStatus, mergeCatalog } from "@/lib/hydro";

type CatalogState = { branchId?: string | null };

export function usePointsCatalog() {
  const { state } = useContext(AppContext) as { state: CatalogState };
  const branchKey = state.branchId || "default";

  const pointsQuery = useQuery({
    queryKey: ["my_points", branchKey],
    queryFn: fetchMyPoints,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const summaryQuery = useQuery({
    queryKey: ["points_summary", branchKey],
    queryFn: fetchPointsSummary,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const statsQuery = useQuery({
    queryKey: ["dashboard_stats", branchKey],
    queryFn: fetchDashboardStats,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const points = useMemo(
    () => mergeCatalog(pointsQuery.data, summaryQuery.data),
    [pointsQuery.data, summaryQuery.data]
  );
  const counts = useMemo(() => countStatus(points), [points]);

  return { branchKey, points, counts, pointsQuery, summaryQuery, statsQuery };
}
