import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { FileText } from "lucide-react";
import type { RecentEvaluation } from "../../../services/dashboardService";

function formatDateTimeString(isoString: string | null | undefined): string {
  if (!isoString) return "";
  try {
    return format(parseISO(isoString), "d MMM yyyy · HH:mm");
  } catch {
    return isoString;
  }
}

function getAccuracyBadgeColor(accuracy: number | null) {
  if (accuracy === null || accuracy === undefined) {
    return "text-[#9ca3af] bg-[#1f1f2e] border-[#2b2b3d]";
  }
  if (accuracy >= 80) {
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  }
  if (accuracy >= 50) {
    return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  }
  return "text-rose-400 bg-rose-500/10 border-rose-500/20";
}

interface RecentActivityPanelProps {
  evaluations: RecentEvaluation[];
}

export function RecentActivityPanel({ evaluations }: RecentActivityPanelProps) {
  const navigate = useNavigate();

  return (
    <div className="lg:col-span-2 bg-[#12121a] border border-[#21212e] rounded-xl p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Recent activity
          </h2>
          <button
            onClick={() => navigate("/history")}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View all
          </button>
        </div>

        {evaluations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-[#232332] rounded-lg">
            <FileText size={36} className="text-[#525266] mb-2" />
            <p className="text-sm font-medium text-[#9ca3af]">No recent activity yet</p>
            <p className="text-xs text-[#6b7280] mt-1 mb-4">
              Run your first OCR document evaluation to see live performance here.
            </p>
            <button
              onClick={() => navigate("/ocr-workspace")}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
            >
              Start Evaluation
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {evaluations.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate("/history")}
                className="flex items-center justify-between p-3.5 rounded-lg bg-[#171724]/70 hover:bg-[#1c1c2e] border border-[#202030] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#222234] group-hover:bg-[#2a2a40] flex items-center justify-center text-[#9ca3af] group-hover:text-white transition-colors shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {item.file_name}
                    </div>
                    <div className="text-xs text-[#78788c] truncate mt-0.5">
                      {item.engine_name} · {formatDateTimeString(item.created_at)}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 ml-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getAccuracyBadgeColor(
                      item.accuracy
                    )}`}
                  >
                    {item.accuracy !== null ? `${item.accuracy}%` : item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
