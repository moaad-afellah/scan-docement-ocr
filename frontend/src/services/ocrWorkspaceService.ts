import { apiClient, getApiErrorMessage } from "./apiClient";

// --- Document types ---------------------------------------------------

export interface DocumentTypeField {
  id: number;
  label: string;
  position: number;
}

export interface DocumentType {
  id: number;
  code: string;
  name: string;
  fields: DocumentTypeField[];
}

// --- Evaluations ---------------------------------------------------

export type EvaluationStatus = "pending" | "done" | "error";
export type FieldStatus = "pending" | "match" | "mismatch" | "missing" | "additional";

export interface EvaluationField {
  id: number;
  label: string;
  ocr_value: string | null;
  reference_value?: string | null;
  status: FieldStatus | string;
  position: number;
}

export interface Evaluation {
  id: number;
  file_name?: string | null;
  status: EvaluationStatus;
  raw_text?: string | null;
  error_message?: string | null;
  accuracy?: number | null;
  correct_count?: number;
  incorrect_count?: number;
  missing_count?: number;
  additional_count?: number;
  total_count?: number;
  fields: EvaluationField[];
}

// --- Batch jobs ---------------------------------------------------

export type BatchJobStatus = "pending" | "processing" | "completed";
export type BatchFileStatus = "pending" | "processing" | "done" | "error";

export interface BatchJobFileStatus {
  id: number;
  file_name: string;
  status: BatchFileStatus;
  evaluation_id: number | null;
  error_message: string | null;
}

export interface BatchJobResponse {
  job_id: string;
  status: BatchJobStatus;
  total_files: number;
  completed_files: number;
  created_at?: string | null;
  completed_at?: string | null;
  files?: BatchJobFileStatus[];
}

export type ExportFormat = "csv" | "txt" | "pdf" | "docx" | "json";

export const ocrWorkspaceService = {
  // Document types
  listDocumentTypes() {
    return apiClient.get<DocumentType[]>("/document-types").then((r) => r.data);
  },

  // Single-file evaluation (Workspace flow with 1 file)
  createEvaluation(file: File, engineId: number, documentTypeId: number) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("engine_id", String(engineId));
    formData.append("document_type_id", String(documentTypeId));

    return apiClient.post<Evaluation>("/evaluations", formData).then((r) => r.data);
  },

  getEvaluation(evaluationId: number) {
    return apiClient.get<Evaluation>(`/evaluations/${evaluationId}`).then((r) => r.data);
  },

  submitReferenceValues(
    evaluationId: number,
    payload: {
      fields: Record<string, { label?: string; reference_value?: string; status?: string; ocr_value?: string }>;
      new_fields?: { label: string; ocr_value?: string | null; reference_value?: string; status?: string }[];
    }
  ) {
    return apiClient
      .put<Evaluation>(`/evaluations/${evaluationId}/fields`, payload)
      .then((r) => r.data);
  },

  async getEvaluationFileUrl(evaluationId: number) {
    // Fetch the protected file through the authenticated API client so the
    // JWT is attached correctly, then expose it as a browser blob URL.
    const response = await apiClient.get(`/evaluations/${evaluationId}/file`, {
      responseType: "blob",
    });

    return window.URL.createObjectURL(response.data);
  },

  async downloadEvaluationFile(evaluationId: number, suggestedFileName: string) {
    const response = await apiClient.get(`/evaluations/${evaluationId}/file`, {
      responseType: "blob",
    });

    const blobUrl = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = suggestedFileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  },

  // Batch upload (multi-file Workspace flow) -- fire-and-poll
  createBatch(files: File[], engineId: number, documentTypeId: number) {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("engine_id", String(engineId));
    formData.append("document_type_id", String(documentTypeId));

    return apiClient.post<BatchJobResponse>("/evaluations/batch", formData).then((r) => r.data);
  },

  getBatchStatus(jobId: string) {
    return apiClient
      .get<BatchJobResponse>(`/evaluations/batch/${jobId}`)
      .then((r) => r.data);
  },

  // Export -- returns a blob; caller triggers the browser download
  async exportEvaluation(evaluationId: number, format: ExportFormat, suggestedFileName: string) {
    const response = await apiClient.get(`/evaluations/${evaluationId}/export`, {
      params: { format },
      responseType: "blob",
    });

    const blobUrl = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${suggestedFileName}.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  },
};
