import { ArrowRight } from "lucide-react";
import { StepIndicator } from "./components/StepIndicator";
import { UploadConfigurationPanel } from "./components/UploadConfigurationPanel";
import { ProcessingPanel } from "./components/ProcessingPanel";
import { ReviewPanel } from "./components/ReviewPanel";
import { useOcrWorkspaceWorkflow } from "./hooks/useOcrWorkspaceWorkflow";

export function OcrWorkspacePage() {
  const {
    documentTypes,
    engines,
    selectedDocumentTypeId,
    selectedEngineId,
    setSelectedDocumentTypeId,
    setSelectedEngineId,
    selectedDocumentType,
    selectedEngine,
    selectedFiles,
    currentEvaluation,
    currentFilePreviewUrl,
    activeStep,
    isLoading,
    isProcessing,
    saving,
    error,
    referenceDraft,
    customFields,
    accuracySummary,
    handleFiles,
    removeFile,
    clearFiles,
    processFiles,
    continueToReview,
    updateReferenceField,
    useOcrValueAsReference,
    addCustomField,
    saveEvaluation,
    exportEvaluation,
    resetWorkflow,
    hasSavedEvaluation,
    setCustomFields,
  } = useOcrWorkspaceWorkflow();

  const goToReview = () => {
    continueToReview();
  };

  return (
    <div className="space-y-6 text-white">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">OCR Workspace</h1>
          <p className="mt-1 text-sm text-[#9ca3af]">
            Upload, process, and evaluate documents against manually entered reference data
          </p>
        </div>
      </div>

      <StepIndicator activeStep={activeStep} />

      {error ? (
        <div className="rounded-xl border border-[#442436] bg-[#26121d] px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {activeStep === 1 ? (
        <div className="space-y-6">
          <UploadConfigurationPanel
            documentTypes={documentTypes}
            engines={engines}
            selectedDocumentTypeId={selectedDocumentTypeId}
            selectedEngineId={selectedEngineId}
            selectedDocumentType={selectedDocumentType}
            selectedEngine={selectedEngine}
            selectedFiles={selectedFiles}
            onDocumentTypeChange={(value) => setSelectedDocumentTypeId(value)}
            onEngineChange={(value) => setSelectedEngineId(value)}
            onFileSelect={handleFiles}
            onRemoveFile={removeFile}
            onClearFiles={clearFiles}
            isLoading={isLoading}
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={processFiles}
              disabled={isProcessing || !selectedFiles.length || isLoading}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? "Processing…" : "Start processing"}
            </button>
          </div>
        </div>
      ) : null}

      {activeStep === 2 ? (
        <div className="space-y-5">
          <ProcessingPanel
            engineName={selectedEngine?.name ?? "OCR engine"}
            fileName={selectedFiles[0]?.name ?? currentEvaluation?.file_name ?? "Queued file"}
            isProcessing={isProcessing || !currentEvaluation}
          />

          <div className="flex justify-end">
            {currentEvaluation ? (
              <button
                type="button"
                onClick={goToReview}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40"
              >
                Continue to review
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="rounded-xl border border-[#2a2a39] bg-[#11131a] px-4 py-3 text-sm text-[#9ca3af]">
                Waiting for OCR engine to finish…
              </div>
            )}
          </div>
        </div>
      ) : null}

      {activeStep === 3 && currentEvaluation ? (
        <ReviewPanel
          evaluation={currentEvaluation}
          previewUrl={currentFilePreviewUrl}
          referenceDraft={referenceDraft}
          customFields={customFields}
          onReferenceChange={updateReferenceField}
          onUseOcrAsReference={useOcrValueAsReference}
          onAddField={addCustomField}
          onCustomFieldChange={(index, field) => {
            const next = [...customFields];
            next[index] = { ...next[index], ...field };
            setCustomFields(next);
          }}
          onSave={saveEvaluation}
          onExport={exportEvaluation}
          onBackToStart={resetWorkflow}
          showBackToStartButton={hasSavedEvaluation}
          saving={saving}
          accuracySummary={accuracySummary}
        />
      ) : null}
    </div>
  );
}
