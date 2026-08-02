import { format, parseISO } from "date-fns";
import { FileText, TrendingUp, SlidersHorizontal, Clock } from "lucide-react";
import type { DashboardStats } from "../../../services/dashboardService";

function formatDateString(isoString: string | null | undefined): string {
  if (!isoString) return "No evaluations yet";
  try {
    return format(parseISO(isoString), "d MMM yyyy");
  } catch {
    return isoString;
  }
}

interface KpiMetricsGridProps {
  stats: DashboardStats;
}

export function KpiMetricsGrid({ stats }: KpiMetricsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Total Evaluations */}
      <div className="bg-[#12121a] border border-[#21212e] rounded-xl p-5 hover:border-[#2d2d40] transition-colors">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
          <FileText size={15} className="text-indigo-400" />
          <span>TOTAL EVALUATIONS</span>
        </div>
        <div className="text-3xl font-black text-white mt-3 tracking-tight">
          {stats.total_evaluations}
        </div>
      </div>

      {/* KPI 2: Average Accuracy */}
      <div className="bg-[#12121a] border border-[#21212e] rounded-xl p-5 hover:border-[#2d2d40] transition-colors">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
          <TrendingUp size={15} className="text-emerald-400" />
          <span>AVERAGE ACCURACY</span>
        </div>
        <div className="text-3xl font-black text-white mt-3 tracking-tight">
          {stats.average_accuracy}%
        </div>
      </div>

      {/* KPI 3: Engines Compared */}
      <div className="bg-[#12121a] border border-[#21212e] rounded-xl p-5 hover:border-[#2d2d40] transition-colors">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
          <SlidersHorizontal size={15} className="text-indigo-400" />
          <span>ENGINES COMPARED</span>
        </div>
        <div className="text-3xl font-black text-white mt-3 tracking-tight">
          {stats.engines_compared}
        </div>
      </div>

      {/* KPI 4: Last Run */}
      <div className="bg-[#12121a] border border-[#21212e] rounded-xl p-5 hover:border-[#2d2d40] transition-colors">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
          <Clock size={15} className="text-violet-400" />
          <span>LAST RUN</span>
        </div>
        <div className="text-2xl font-bold text-white mt-3 tracking-tight truncate">
          {formatDateString(stats.last_run)}
        </div>
      </div>
    </div>
  );
}
