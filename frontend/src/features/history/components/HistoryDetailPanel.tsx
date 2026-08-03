import type { HistoryEntry } from "../../../services/historyService";
import type { Evaluation } from "../../../services/ocrWorkspaceService";

interface HistoryDetailPanelProps {
  entry: HistoryEntry | null;
  evaluation: Evaluation | null;
  accuracySummary: {
    correct: number;
    incorrect: number;
    missing: number;
    additional: number;
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

export function HistoryDetailPanel({ entry, evaluation, accuracySummary }: HistoryDetailPanelProps) {
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

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="rounded-lg bg-[#10261d] px-2 py-3 text-emerald-300">{accuracySummary.correct} Correct</div>
          <div className="rounded-lg bg-[#2e1717] px-2 py-3 text-rose-300">{accuracySummary.incorrect} Incorrect</div>
          <div className="rounded-lg bg-[#2b2116] px-2 py-3 text-amber-300">{accuracySummary.missing} Missing</div>
          <div className="rounded-lg bg-[#1a1f31] px-2 py-3 text-sky-300">{accuracySummary.additional} Additional</div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#222334] bg-[#0d0f17] p-5">
        <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b8494]">Field comparison</div>

        <div className="space-y-3">
          {evaluation?.fields.length ? (
            evaluation.fields.map((field) => {
              const tone =
                field.status === "match"
                  ? "bg-[#173a28] text-emerald-300"
                  : field.status === "mismatch"
                    ? "bg-[#5a1e24] text-rose-300"
                    : "bg-[#9b6b18] text-[#f8d48c]";

              return (
                <div key={field.id} className="rounded-xl border border-[#23283a] bg-[#111420] px-4 py-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-white">{field.label}</div>
                    <div className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone}`}>{field.status ?? "pending"}</div>
                  </div>
                  <div className="text-sm text-[#9ca3af]">OCR: {field.ocr_value ?? "—"}</div>
                  <div className="text-sm text-[#9ca3af]">Ref: {field.reference_value ?? "—"}</div>
                </div>
              );
            })
          ) : (
            <div className="rounded-xl border border-[#23283a] bg-[#111420] px-4 py-3 text-sm text-[#9ca3af]">
              No comparison fields are available for this evaluation yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
