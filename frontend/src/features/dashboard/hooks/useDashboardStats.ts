import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../../../services/dashboardService";

export const DASHBOARD_STATS_QUERY_KEY = ["dashboard-stats"] as const;

export function useDashboardStats() {
  const query = useQuery({
    queryKey: DASHBOARD_STATS_QUERY_KEY,
    queryFn: dashboardService.getStats,
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
