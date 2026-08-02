import { SlidersHorizontal } from "lucide-react";
import type { OcrEngine } from "../../../services/settingsService";

interface SettingsWorkspacePreferencesCardProps {
  engines: OcrEngine[];
  defaultEngineId: number | null;
  language: string;
  defaultExportFormat: "csv" | "txt" | "pdf" | "docx" | "json";
  onDefaultEngineChange: (value: number | null) => void;
  onLanguageChange: (value: string) => void;
  onDefaultExportFormatChange: (value: "csv" | "txt" | "pdf" | "docx" | "json") => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export function SettingsWorkspacePreferencesCard({
  engines,
  defaultEngineId,
  language,
  defaultExportFormat,
  onDefaultEngineChange,
  onLanguageChange,
  onDefaultExportFormatChange,
  onSave,
  isSaving,
}: SettingsWorkspacePreferencesCardProps) {
  return (
    <section className="rounded-2xl border border-[#222334] bg-[#10111a] p-5">
      <div className="mb-4 flex items-center gap-3 text-white">
        <div className="rounded-lg bg-[#1a1a28] p-2 text-[#9ca3af]">
          <SlidersHorizontal className="h-4 w-4" />
        </div>
        <div className="text-lg font-semibold">Workspace preferences</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b8494]">Default OCR engine</div>
          <select
            value={defaultEngineId ?? ""}
            onChange={(event) => onDefaultEngineChange(event.target.value === "" ? null : Number(event.target.value))}
            className="w-full rounded-xl border border-[#2a2a39] bg-[#171722] px-3 py-3 text-sm text-white outline-none"
          >
            {engines.map((engine) => (
              <option key={engine.id} value={engine.id}>
                {engine.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b8494]">Language</div>
          <select
            value={language}
            onChange={(event) => onLanguageChange(event.target.value)}
            className="w-full rounded-xl border border-[#2a2a39] bg-[#171722] px-3 py-3 text-sm text-white outline-none"
          >
            <option value="English">English</option>
            <option value="French">French</option>
            <option value="Arabic">Arabic</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40"
        >
          {isSaving ? "Saving…" : "Save preferences"}
        </button>
      </div>
    </section>
  );
}
