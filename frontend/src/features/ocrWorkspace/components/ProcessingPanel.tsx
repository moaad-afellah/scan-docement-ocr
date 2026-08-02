import { CheckCircle2, Inbox } from "lucide-react";

interface ProcessingPanelProps {
  engineName: string;
  fileName: string;
}

export function ProcessingPanel({ engineName, fileName }: ProcessingPanelProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#222334] bg-[#11131a] p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#171822] p-2 text-[#8b5cf6]">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-semibold">Processing with {engineName}</div>
              <div className="text-sm text-[#7b8494]">{fileName}</div>
            </div>
          </div>
          <div className="rounded-full bg-[#16211d] px-3 py-1 text-sm text-emerald-300">1/1 completed</div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#222334] bg-[#11131a] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1b1f2e] text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold">Extraction complete</div>
            <div className="text-sm text-[#7b8494]">The OCR results are ready for review.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
