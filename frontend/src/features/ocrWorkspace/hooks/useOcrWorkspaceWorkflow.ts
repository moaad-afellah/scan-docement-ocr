import { useEffect, useMemo, useState } from "react";
import { ocrWorkspaceService, type DocumentType, type Evaluation } from "../../../services/ocrWorkspaceService";
import { settingsService, type OcrEngine } from "../../../services/settingsService";

export function useOcrWorkspaceWorkflow() {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [engines, setEngines] = useState<OcrEngine[]>([]);
  const [selectedDocumentTypeId, setSelectedDocumentTypeId] = useState<number | "">("");
  const [selectedEngineId, setSelectedEngineId] = useState<number | "">("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentEvaluation, setCurrentEvaluation] = useState<Evaluation | null>(null);
  const [currentFilePreviewUrl, setCurrentFilePreviewUrl] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referenceDraft, setReferenceDraft] = useState<Record<string, string>>({});
  const [customFields, setCustomFields] = useState<Array<{ label: string; ocr_value: string; reference_value: string }>>([]);

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      setIsLoading(true);
      setError(null);

      try {
        const [docTypes, ocrEngines] = await Promise.all([
          ocrWorkspaceService.listDocumentTypes(),
          settingsService.listEngines(),
        ]);

        if (!active) return;

        setDocumentTypes(docTypes);
        setEngines(ocrEngines);
        setSelectedDocumentTypeId(docTypes[0]?.id ?? "");
        setSelectedEngineId(ocrEngines[0]?.id ?? "");
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load OCR options.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadOptions();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (currentFilePreviewUrl) {
        window.URL.revokeObjectURL(currentFilePreviewUrl);
      }
    };
  }, [currentFilePreviewUrl]);

  const selectedDocumentType = useMemo(
    () => documentTypes.find((docType) => docType.id === selectedDocumentTypeId) ?? null,
    [documentTypes, selectedDocumentTypeId]
  );

  const selectedEngine = useMemo(
    () => engines.find((engine) => engine.id === selectedEngineId) ?? null,
    [engines, selectedEngineId]
  );

  const accuracySummary = useMemo(() => {
    if (!currentEvaluation) return null;
    return {
      correct: currentEvaluation.correct_count ?? 0,
      incorrect: currentEvaluation.incorrect_count ?? 0,
      missing: currentEvaluation.missing_count ?? 0,
      additional: currentEvaluation.additional_count ?? 0,
    };
  }, [currentEvaluation]);

  const handleFiles = (incomingFiles: FileList | null) => {
    if (!incomingFiles?.length) return;
    setSelectedFiles(Array.from(incomingFiles).slice(0, 1));
    setError(null);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((files) => files.filter((_, fileIndex) => fileIndex !== index));
  };

  const clearFiles = () => setSelectedFiles([]);

  const processFiles = async () => {
    const file = selectedFiles[0];
    const engineId = Number(selectedEngineId);
    const documentTypeId = Number(selectedDocumentTypeId);

    if (!file || !engineId || !documentTypeId) {
      setError("Please choose a document type, engine, and upload a file first.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const evaluation = await ocrWorkspaceService.createEvaluation(file, engineId, documentTypeId);
      setCurrentEvaluation(evaluation);
      setActiveStep(2);

      const previewUrl = await ocrWorkspaceService.getEvaluationFileUrl(evaluation.id);
      setCurrentFilePreviewUrl(previewUrl);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "OCR processing failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const continueToReview = () => {
    if (currentEvaluation) {
      setActiveStep(3);
    }
  };

  const updateReferenceField = (id: string, value: string) => {
    setReferenceDraft((draft) => ({
      ...draft,
      [id]: value,
    }));
  };

  const addCustomField = () => {
    setCustomFields((fields) => [
      ...fields,
      { label: `Custom Field ${fields.length + 1}`, ocr_value: "", reference_value: "" },
    ]);
  };

  const saveEvaluation = async () => {
    if (!currentEvaluation) return;

    setSaving(true);
    setError(null);

    try {
      const fieldsPayload: Record<string, { label?: string; reference_value?: string; status?: string; ocr_value?: string }> = {};

      currentEvaluation.fields.forEach((field) => {
        fieldsPayload[String(field.id)] = {
          label: field.label,
          reference_value: referenceDraft[String(field.id)] ?? field.reference_value ?? "",
          status: field.status,
          ocr_value: field.ocr_value ?? "",
        };
      });

      const updated = await ocrWorkspaceService.submitReferenceValues(currentEvaluation.id, {
        fields: fieldsPayload,
        new_fields: customFields.map((field) => ({
          label: field.label,
          ocr_value: field.ocr_value,
          reference_value: field.reference_value,
          status: "pending",
        })),
      });

      setCurrentEvaluation(updated);
      setReferenceDraft({});
      setCustomFields([]);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save evaluation.");
    } finally {
      setSaving(false);
    }
  };

  const exportEvaluation = async () => {
    if (!currentEvaluation) return;
    await ocrWorkspaceService.exportEvaluation(
      currentEvaluation.id,
      "json",
      currentEvaluation.file_name ?? "evaluation"
    );
  };

  return {
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
    addCustomField,
    saveEvaluation,
    exportEvaluation,
    setCurrentFilePreviewUrl,
    setCustomFields,
  };
}
