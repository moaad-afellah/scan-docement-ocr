import { useNavigate } from "react-router-dom";
import { Upload, History, Settings } from "lucide-react";

export function QuickActionsPanel() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#12121a] border border-[#21212e] rounded-xl p-6">
      <h2 className="text-lg font-bold text-white tracking-tight mb-4">
        Quick actions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Action 1: Start new evaluation */}
        <div
          onClick={() => navigate("/ocr-workspace")}
          className="p-4 rounded-xl bg-[#171724]/70 hover:bg-[#1d1d2e] border border-[#202030] hover:border-[#2e2e46] transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Upload size={18} />
          </div>
          <h3 className="text-sm font-semibold text-white mt-3">
            Start new evaluation
          </h3>
          <p className="text-xs text-[#8e8ea0] mt-1">
            Upload documents and run OCR
          </p>
        </div>

        {/* Action 2: Review past results */}
        <div
          onClick={() => navigate("/history")}
          className="p-4 rounded-xl bg-[#171724]/70 hover:bg-[#1d1d2e] border border-[#202030] hover:border-[#2e2e46] transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <History size={18} />
          </div>
          <h3 className="text-sm font-semibold text-white mt-3">
            Review past results
          </h3>
          <p className="text-xs text-[#8e8ea0] mt-1">
            Search and export saved evaluations
          </p>
        </div>

        {/* Action 3: Set default engine */}
        <div
          onClick={() => navigate("/settings")}
          className="p-4 rounded-xl bg-[#171724]/70 hover:bg-[#1d1d2e] border border-[#202030] hover:border-[#2e2e46] transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Settings size={18} />
          </div>
          <h3 className="text-sm font-semibold text-white mt-3">
            Set default engine
          </h3>
          <p className="text-xs text-[#8e8ea0] mt-1">
            Configure workspace preferences
          </p>
        </div>
      </div>
    </div>
  );
}
