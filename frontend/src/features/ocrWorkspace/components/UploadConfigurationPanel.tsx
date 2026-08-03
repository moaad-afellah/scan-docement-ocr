import { FileImage, ImageUp, X } from "lucide-react";
import type { DocumentType } from "../../../services/ocrWorkspaceService";
import type { OcrEngine } from "../../../services/settingsService";

interface UploadConfigurationPanelProps {
  documentTypes: DocumentType[];
  engines: OcrEngine[];
  selectedDocumentTypeId: number | "";
  selectedEngineId: number | "";
  selectedDocumentType: DocumentType | null;
  selectedEngine: OcrEngine | null;
  selectedFiles: File[];
  onDocumentTypeChange: (value: number) => void;
  onEngineChange: (value: number) => void;
  onFileSelect: (fileList: FileList | null) => void;
  onRemoveFile: (index: number) => void;
  onClearFiles: () => void;
  isLoading: boolean;
}

const fileTypeLabel = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "PDF";
  if (["png", "jpg", "jpeg", "webp"].includes(ext ?? "")) return "Image";
  return "File";
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function UploadConfigurationPanel({
  documentTypes,
  engines,
  selectedDocumentTypeId,
  selectedEngineId,
  selectedDocumentType,
  selectedEngine,
  selectedFiles,
  onDocumentTypeChange,
  onEngineChange,
  onFileSelect,
  onRemoveFile,
  onClearFiles,
  isLoading,
}: UploadConfigurationPanelProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#222334] bg-[#0f1119] p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#9ca3af]">
              Document type
            </label>
            <select
              value={selectedDocumentTypeId}
              onChange={(event) => onDocumentTypeChange(Number(event.target.value))}
              className="w-full rounded-lg border border-[#2a2a39] bg-[#171722] px-3 py-3 text-sm text-white outline-none"
              disabled={isLoading}
            >
              {documentTypes.map((docType) => (
                <option key={docType.id} value={docType.id}>
                  {docType.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-[#7b8494]">
              {selectedDocumentType?.fields.length ?? 0} fields will be extracted and compared.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#9ca3af]">
              OCR engine
            </label>
            <select
              value={selectedEngineId}
              onChange={(event) => onEngineChange(Number(event.target.value))}
              className="w-full rounded-lg border border-[#2a2a39] bg-[#171722] px-3 py-3 text-sm text-white outline-none"
              disabled={isLoading}
            >
              {engines.map((engine) => (
                <option key={engine.id} value={engine.id}>
                  {engine.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-[#7b8494]">
              {selectedEngine?.description ?? "Applied to every file in this batch"}
            </p>
          </div>
        </div>
      </div>

      {selectedDocumentType ? (
        <div className="rounded-2xl border border-[#222334] bg-[#11131a] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-white">Fields for {selectedDocumentType.name}</div>
            <div className="text-xs uppercase tracking-[0.24em] text-[#7b8494]">
              {selectedDocumentType.fields.length} fields
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedDocumentType.fields.map((field) => (
              <span
                key={field.id}
                className="rounded-full border border-[#2a2a39] bg-[#171722] px-3 py-1 text-xs text-[#d1d5db]"
              >
                {field.label}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-dashed border-[#353851] bg-[#0e1018] p-6">
        <label
          className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-[#222334] bg-[#12131b] text-center transition hover:border-[#3d4b74]"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            onFileSelect(event.dataTransfer.files);
          }}
        >
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#1e2a4a]">
            <ImageUp className="h-6 w-6 text-[#8b5cf6]" />
          </div>
          <div className="text-lg font-medium text-white">Drop files here or click to browse</div>
          <div className="mt-1 text-sm text-[#7b8494]">PNG, JPEG, WebP or PDF · up to 15 MB per file</div>
          <input
            hidden
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.pdf"
            onChange={(event) => onFileSelect(event.target.files)}
          />
        </label>
      </div>

      {selectedFiles.length > 0 ? (
        <div className="rounded-2xl border border-[#222334] bg-[#11131a] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold">Files ({selectedFiles.length})</div>
            <button type="button" className="text-sm text-rose-400 hover:text-rose-300" onClick={onClearFiles}>
              Clear all
            </button>
          </div>

          {selectedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-xl border border-[#232334] bg-[#161822] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1c2233]">
                  <FileImage className="h-4 w-4 text-[#9ca3af]" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{file.name}</div>
                  <div className="text-xs text-[#7b8494]">{fileTypeLabel(file.name)} · {formatBytes(file.size)}</div>
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 text-[#9ca3af] hover:bg-[#202130] hover:text-white"
                onClick={() => onRemoveFile(index)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
