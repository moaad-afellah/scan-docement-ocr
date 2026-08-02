import { useNavigate } from "react-router-dom";
import { ArrowRight, PlusCircle } from "lucide-react";

export function DashboardHeader() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-[#9ca3af] mt-1">
          Overview of your OCR evaluation activity
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/ocr-workspace")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#14141f] hover:bg-[#1c1c2b] text-sm font-semibold text-slate-200 border border-[#262638] transition-all shadow-sm"
        >
          <span>Resume evaluation</span>
          <ArrowRight size={16} />
        </button>

        <button
          onClick={() => navigate("/ocr-workspace")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-sm font-semibold text-white transition-all shadow-md shadow-indigo-500/20 active:scale-[0.98]"
        >
          <PlusCircle size={17} />
          <span>New evaluation</span>
        </button>
      </div>
    </div>
  );
}
