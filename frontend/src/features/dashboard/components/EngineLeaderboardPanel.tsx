import { BarChart3, Trophy } from "lucide-react";
import type { EngineLeaderboardEntry } from "../../../services/dashboardService";

interface EngineLeaderboardPanelProps {
  leaderboard: EngineLeaderboardEntry[];
}

export function EngineLeaderboardPanel({ leaderboard }: EngineLeaderboardPanelProps) {
  return (
    <div className="bg-[#12121a] border border-[#21212e] rounded-xl p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={18} className="text-indigo-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            Engine leaderboard
          </h2>
        </div>

        {leaderboard.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#6b7280]">
            No engine statistics registered.
          </div>
        ) : (
          <div className="space-y-5">
            {leaderboard.map((engine, index) => {
              const isTop = index === 0 && (engine.average_accuracy ?? 0) > 0;
              const accuracyVal = engine.average_accuracy ?? 0;

              return (
                <div key={engine.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-slate-200 font-semibold truncate">
                      {isTop ? (
                        <Trophy size={15} className="text-amber-400 shrink-0" />
                      ) : null}
                      <span className="truncate">{engine.name}</span>
                    </div>
                    <span className="font-bold text-[#9ca3af] shrink-0 ml-2">
                      {engine.average_accuracy !== null
                        ? `${engine.average_accuracy}%`
                        : "N/A"}
                    </span>
                  </div>

                  {/* Accuracy Bar */}
                  <div className="w-full bg-[#1b1b28] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, accuracyVal))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
