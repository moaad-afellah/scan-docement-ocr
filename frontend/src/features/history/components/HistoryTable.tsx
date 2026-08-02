import { Eye, Trash2, Download } from "lucide-react";
import type { HistoryEntry } from "../../../services/historyService";

interface HistoryTableProps {
  entries: HistoryEntry[];
  selectedEntryId: number | null;
  onSelectEntry: (entryId: number) => void;
  onDelete: (entryId: number) => void;
}

const formatDate = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const accuracyTone = (value: number | null) => {
  if ((value ?? 0) >= 70) {
    return "bg-[#0e3f2d] text-emerald-300";
  }

  if ((value ?? 0) >= 40) {
    return "bg-[#312014] text-amber-300";
  }

  return "bg-[#34191d] text-rose-300";
};

export function HistoryTable({ entries, selectedEntryId, onSelectEntry, onDelete }: HistoryTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1e2130] bg-[#0d0f17]">
      <div className="grid grid-cols-[1.3fr_0.8fr_0.9fr_0.8fr_0.5fr] items-center gap-4 border-b border-[#1d2030] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b8494]">
        <span>Document</span>
        <span>Type</span>
        <span>Engine</span>
        <span>Date</span>
        <span>Accuracy</span>
      </div>

      <div>
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`grid grid-cols-[1.3fr_0.8fr_0.9fr_0.8fr_0.5fr] items-center gap-4 border-b border-[#1a1c2b] px-5 py-4 transition hover:bg-[#111420] ${
              selectedEntryId === entry.id ? "bg-[#121623]" : ""
            }`}
          >
            <button type="button" onClick={() => onSelectEntry(entry.id)} className="text-left text-sm font-medium text-white">
              {entry.file_name}
            </button>
            <div className="text-sm text-[#9ca3af]">{entry.document_type_name ?? "—"}</div>
            <div className="text-sm text-[#9ca3af]">{entry.engine_name ?? "—"}</div>
            <div className="text-sm text-[#9ca3af]">{formatDate(entry.created_at)}</div>
            <div className="flex items-center justify-between gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${accuracyTone(entry.accuracy)}`}>
                {entry.accuracy ?? 0}%
              </span>

              <div className="flex items-center gap-2 text-[#9ca3af]">
                <button type="button" className="rounded-md p-1 hover:bg-[#1a1d2a] hover:text-white" aria-label="View entry">
                  <Eye size={15} />
                </button>
                <button type="button" className="rounded-md p-1 hover:bg-[#1a1d2a] hover:text-white" aria-label="Download entry">
                  <Download size={15} />
                </button>
                <button
                  type="button"
                  className="rounded-md p-1 hover:bg-[#1a1d2a] hover:text-rose-300"
                  aria-label="Delete entry"
                  onClick={() => onDelete(entry.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
