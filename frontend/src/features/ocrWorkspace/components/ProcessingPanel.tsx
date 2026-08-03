import { CheckCircle2, Inbox } from "lucide-react";

interface ProcessingPanelProps {
  engineName: string;
  fileName: string;
  isProcessing: boolean;
}

export function ProcessingPanel({ engineName, fileName, isProcessing }: ProcessingPanelProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#222334] bg-[#11131a] p-5 transition-all duration-500">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#171822] p-2 text-[#8b5cf6]">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-semibold">{isProcessing ? "Processing with" : "Processing complete with"} {engineName}</div>
              <div className="text-sm text-[#7b8494]">{fileName}</div>
            </div>
          </div>
          <div className="rounded-full bg-[#16211d] px-3 py-1 text-sm text-emerald-300">
            {isProcessing ? "Running…" : "1/1 completed"}
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-[#7b8494]">
            <span>Progress</span>
            <span>{isProcessing ? "Analyzing document" : "Ready"}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#161822]">
            <div
              className={`h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 ${
                isProcessing ? "animate-pulse w-2/3" : "w-full"
              }`}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#222334] bg-[#11131a] p-5">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-full ${isProcessing ? "bg-[#181a29] text-violet-300" : "bg-[#1b1f2e] text-emerald-300"}`}>
            {isProcessing ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-300 border-t-transparent" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="text-lg font-semibold">{isProcessing ? "Extracting fields" : "Extraction complete"}</div>
            <div className="text-sm text-[#7b8494]">
              {isProcessing ? "Your document is being analyzed by the OCR engine." : "The OCR results are ready for review."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
