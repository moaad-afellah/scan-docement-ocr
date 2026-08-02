import { Download } from "lucide-react";

interface SettingsExportPreferencesCardProps {
  defaultExportFormat: "csv" | "txt" | "pdf" | "docx" | "json";
  includeOriginal: boolean;
  onDefaultExportFormatChange: (value: "csv" | "txt" | "pdf" | "docx" | "json") => void;
  onIncludeOriginalChange: (value: boolean) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export function SettingsExportPreferencesCard({
  defaultExportFormat,
  includeOriginal,
  onDefaultExportFormatChange,
  onIncludeOriginalChange,
  onSave,
  isSaving,
}: SettingsExportPreferencesCardProps) {
  return (
    <section className="rounded-2xl border border-[#222334] bg-[#10111a] p-5">
      <div className="mb-4 flex items-center gap-3 text-white">
        <div className="rounded-lg bg-[#1a1a28] p-2 text-[#9ca3af]">
          <Download className="h-4 w-4" />
        </div>
        <div className="text-lg font-semibold">Export preferences</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b8494]">Default export format</div>
          <select
            value={defaultExportFormat}
            onChange={(event) => onDefaultExportFormatChange(event.target.value as "csv" | "txt" | "pdf" | "docx" | "json")}
            className="w-full rounded-xl border border-[#2a2a39] bg-[#171722] px-3 py-3 text-sm text-white outline-none"
          >
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
            <option value="txt">TXT</option>
            <option value="docx">DOCX</option>
            <option value="json">JSON</option>
          </select>
        </label>

        <div className="flex items-center justify-between rounded-xl border border-[#23283a] bg-[#111420] px-4 py-3">
          <div>
            <div className="text-sm font-medium text-white">Include original document reference in exports</div>
            <div className="text-xs text-[#7b8494]">Keep source documents attached to your export package</div>
          </div>
          <button
            type="button"
            onClick={() => onIncludeOriginalChange(!includeOriginal)}
            className={`relative h-6 w-11 rounded-full transition ${includeOriginal ? "bg-[#3b82f6]" : "bg-[#2a2a39]"}`}
          >
            <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${includeOriginal ? "left-6" : "left-1"}`} />
          </button>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40"
        >
          {isSaving ? "Saving…" : "Save export preferences"}
        </button>
      </div>
    </section>
  );
}
