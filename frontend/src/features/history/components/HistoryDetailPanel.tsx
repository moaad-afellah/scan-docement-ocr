import type { HistoryEntry } from "../../../services/historyService";

interface HistoryDetailPanelProps {
  entry: HistoryEntry | null;
  accuracySummary: {
    correct: number;
    mismatch: number;
    missing: number;
  };
}

const formatDate = (value: string | null) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export function HistoryDetailPanel({ entry, accuracySummary }: HistoryDetailPanelProps) {
  if (!entry) {
    return (
      <div className="rounded-2xl border border-[#222334] bg-[#0d0f17] p-5 text-sm text-[#9ca3af]">
        Select a history record to inspect its comparison details.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#222334] bg-[#0d0f17] p-5">
        <div className="mb-4 text-2xl font-semibold text-white">{entry.file_name}</div>
        <div className="mb-4 text-sm text-[#9ca3af]">{formatDate(entry.created_at)}</div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-[#10261d] px-2 py-3 text-emerald-300">{accuracySummary.correct} Correct</div>
          <div className="rounded-lg bg-[#2e1717] px-2 py-3 text-rose-300">{accuracySummary.mismatch} Mismatch</div>
          <div className="rounded-lg bg-[#2b2116] px-2 py-3 text-amber-300">{accuracySummary.missing} Missing</div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#222334] bg-[#0d0f17] p-5">
        <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b8494]">Field comparison</div>

        <div className="space-y-3">
          {[
            { label: "Invoice Number", ocr: "OCR: —", ref: "Ref: INV-4556", state: "Missing", tone: "bg-[#9b6b18] text-[#f8d48c]" },
            { label: "Invoice Date", ocr: "OCR: 2026-05-14", ref: "Ref: 2026-05-14", state: "Match", tone: "bg-[#173a28] text-emerald-300" },
            { label: "Vendor Name", ocr: "OCR: —", ref: "Ref: Anchor & Vale Inc.", state: "Missing", tone: "bg-[#9b6b18] text-[#f8d48c]" },
            { label: "Total Amount", ocr: "OCR: —", ref: "Ref: $2,815.75", state: "Missing", tone: "bg-[#9b6b18] text-[#f8d48c]" },
            { label: "Tax Amount", ocr: "OCR: $99.20", ref: "Ref: $161.26", state: "Mismatch", tone: "bg-[#5a1e24] text-rose-300" },
            { label: "Due Date", ocr: "OCR: 2026-05-28", ref: "Ref: 2026-05-28", state: "Match", tone: "bg-[#173a28] text-emerald-300" },
          ].map((row) => (
            <div key={row.label} className="rounded-xl border border-[#23283a] bg-[#111420] px-4 py-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-white">{row.label}</div>
                <div className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${row.tone}`}>{row.state}</div>
              </div>
              <div className="text-sm text-[#9ca3af]">{row.ocr}</div>
              <div className="text-sm text-[#9ca3af]">{row.ref}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
