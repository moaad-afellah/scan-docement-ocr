import { RefreshCw, AlertCircle } from "lucide-react";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { DashboardHeader } from "./components/DashboardHeader";
import { KpiMetricsGrid } from "./components/KpiMetricsGrid";
import { RecentActivityPanel } from "./components/RecentActivityPanel";
import { EngineLeaderboardPanel } from "./components/EngineLeaderboardPanel";
import { QuickActionsPanel } from "./components/QuickActionsPanel";

export function DashboardPage() {
  const { stats, isLoading, isError, refetch } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-[#181824] rounded-lg" />
            <div className="h-4 w-72 bg-[#14141f] rounded" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-36 bg-[#181824] rounded-lg" />
            <div className="h-10 w-40 bg-[#181824] rounded-lg" />
          </div>
        </div>

        {/* Top KPIs Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 bg-[#13131c] border border-[#21212e] rounded-xl p-5 space-y-3"
            >
              <div className="h-4 w-28 bg-[#1a1a28] rounded" />
              <div className="h-8 w-16 bg-[#1f1f30] rounded" />
            </div>
          ))}
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-[#13131c] border border-[#21212e] rounded-xl p-6" />
          <div className="h-96 bg-[#13131c] border border-[#21212e] rounded-xl p-6" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-[#13131c] border border-[#21212e] rounded-xl my-8">
        <AlertCircle size={44} className="text-rose-400 mb-3" />
        <h3 className="text-lg font-bold text-white">Failed to load dashboard data</h3>
        <p className="text-sm text-[#9ca3af] max-w-md mt-1 mb-6">
          There was an error retrieving your workspace analytics. Please ensure the backend API is running.
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1c1c2b] hover:bg-[#252538] text-white text-sm font-medium transition-colors border border-[#2d2d42]"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  const currentStats = stats ?? {
    total_evaluations: 0,
    average_accuracy: 0,
    engines_compared: 0,
    last_run: null,
    engine_leaderboard: [],
    recent_evaluations: [],
  };

  return (
    <div className="space-y-8">
      {/* Header & Quick Action Buttons */}
      <DashboardHeader />

      {/* Top 4 KPI Metrics */}
      <KpiMetricsGrid stats={currentStats} />

      {/* Main Grid: Recent Activity & Engine Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivityPanel evaluations={currentStats.recent_evaluations} />
        <EngineLeaderboardPanel leaderboard={currentStats.engine_leaderboard} />
      </div>

      {/* Bottom Panel: Quick actions */}
      <QuickActionsPanel />
    </div>
  );
}
