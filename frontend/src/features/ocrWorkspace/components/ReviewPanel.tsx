import type { Evaluation } from "../../../services/ocrWorkspaceService";

interface ReviewPanelProps {
  evaluation: Evaluation;
  previewUrl: string | null;
  referenceDraft: Record<string, string>;
  customFields: Array<{ label: string; ocr_value: string; reference_value: string }>;
  onReferenceChange: (id: string, value: string) => void;
  onUseOcrAsReference: (id: string) => void;
  onAddField: () => void;
  onCustomFieldChange: (index: number, field: Partial<{ label: string; ocr_value: string; reference_value: string }>) => void;
  onSave: () => Promise<void>;
  onExport: () => Promise<void>;
  onBackToStart: () => void;
  showBackToStartButton: boolean;
  saving: boolean;
  accuracySummary: {
    correct: number;
    incorrect: number;
    missing: number;
    additional: number;
  } | null;
}

export function ReviewPanel({
  evaluation,
  previewUrl,
  referenceDraft,
  customFields,
  onReferenceChange,
  onUseOcrAsReference,
  onAddField,
  onCustomFieldChange,
  onSave,
  onExport,
  onBackToStart,
  showBackToStartButton,
  saving,
  accuracySummary,
}: ReviewPanelProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#222334] bg-[#11131a] p-4">
            <div className="mb-4 text-lg font-semibold">Document preview</div>
            {previewUrl ? (
              <img src={previewUrl} alt="Document preview" className="w-full rounded-xl border border-[#25263a] bg-[#12131a] object-contain" />
            ) : (
              <div className="flex h-[280px] items-center justify-center rounded-xl border border-[#25263a] bg-[#11131a] text-sm text-[#7b8494]">
                Document preview unavailable
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#222334] bg-[#11131a] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-lg font-semibold">Raw OCR output</div>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(evaluation.raw_text ?? "")}
                className="rounded-lg border border-[#2a2a39] px-3 py-1.5 text-xs text-[#9ca3af] hover:text-white"
              >
                Copy
              </button>
            </div>
            <div className="space-y-2">
              {evaluation.fields.map((field) => (
                <div key={field.id} className="flex items-start justify-between gap-3 rounded-lg border border-[#232334] bg-[#161822] px-3 py-2">
                  <div>
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b8494]">{field.label}</div>
                    <div className="text-sm text-white">{field.ocr_value ?? "-"}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUseOcrAsReference(String(field.id))}
                    className="rounded-lg border border-[#2a2a39] px-3 py-1.5 text-[11px] font-semibold text-[#b7c0d6] transition hover:border-indigo-400 hover:text-white"
                  >
                    Use as reference
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-[#222334] bg-[#11131a] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-lg font-semibold">Reference data</div>
              <button
                type="button"
                onClick={onAddField}
                className="rounded-lg border border-[#2a2a39] px-3 py-1.5 text-xs text-[#9ca3af] hover:text-white"
              >
                Add field
              </button>
            </div>

            <div className="space-y-3">
              {evaluation.fields.map((field) => (
                <div key={field.id} className="space-y-1">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b8494]">
                    {field.label}
                  </label>
                  <input
                    value={referenceDraft[String(field.id)] ?? field.reference_value ?? ""}
                    onChange={(event) => onReferenceChange(String(field.id), event.target.value)}
                    placeholder="Enter correct value"
                    className="w-full rounded-lg border border-[#2a2a39] bg-[#171722] px-3 py-2.5 text-sm text-white outline-none"
                  />
                </div>
              ))}

              {customFields.map((field, index) => (
                <div key={`${field.label}-${index}`} className="rounded-xl border border-[#2a2a39] bg-[#131420] p-3">
                  <input
                    value={field.label}
                    onChange={(event) => onCustomFieldChange(index, { label: event.target.value })}
                    className="mb-2 w-full rounded-lg border border-[#2a2a39] bg-[#171722] px-3 py-2 text-sm text-white outline-none"
                  />
                  <input
                    value={field.reference_value}
                    onChange={(event) => onCustomFieldChange(index, { reference_value: event.target.value })}
                    placeholder="Reference value"
                    className="w-full rounded-lg border border-[#2a2a39] bg-[#171722] px-3 py-2 text-sm text-white outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#222334] bg-[#11131a] p-4">
            <div className="mb-3 text-lg font-semibold">Accuracy</div>
            <div className="text-4xl font-semibold text-white">{evaluation.accuracy ?? 0}%</div>
            <div className="mt-2 text-sm text-[#7b8494]">overall field accuracy</div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-lg bg-[#10261d] px-2 py-3 text-emerald-300">{accuracySummary?.correct ?? 0} Correct</div>
              <div className="rounded-lg bg-[#2e1717] px-2 py-3 text-rose-300">{accuracySummary?.incorrect ?? 0} Incorrect</div>
              <div className="rounded-lg bg-[#2b2116] px-2 py-3 text-amber-300">{accuracySummary?.missing ?? 0} Missing</div>
              <div className="rounded-lg bg-[#1a1f31] px-2 py-3 text-sky-300">{accuracySummary?.additional ?? 0} Additional</div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#222334] bg-[#11131a] p-4">
            <div className="mb-3 text-lg font-semibold">Field comparison</div>
            <div className="space-y-2">
              {evaluation.fields.map((field) => (
                <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] items-center gap-3 rounded-lg border border-[#232334] bg-[#151821] px-3 py-3">
                  <div>
                    <div className="text-sm font-medium text-white">{field.label}</div>
                    <div className="text-xs text-[#7b8494]">{field.ocr_value ?? "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-white">{referenceDraft[String(field.id)] ?? field.reference_value ?? "-"}</div>
                  </div>
                  <div className="rounded-full bg-[#1b1f2d] px-2.5 py-1 text-[11px] text-[#9ca3af]">{field.status ?? "pending"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onExport}
          className="rounded-xl border border-[#2a2a39] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#161822]"
        >
          Export
        </button>
        {showBackToStartButton ? (
          <button
            type="button"
            onClick={onBackToStart}
            className="rounded-xl border border-[#2a2a39] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#161822]"
          >
            Back to step 1
          </button>
        ) : null}
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40"
        >
          {saving ? "Saving…" : "Save evaluation"}
        </button>
      </div>
    </div>
  );
}
