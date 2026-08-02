import { apiClient } from "./apiClient";

export interface HistoryEntry {
  id: number;
  file_name: string;
  document_type_name: string | null;
  engine_name: string | null;
  status: string;
  accuracy: number | null;
  created_at: string | null;
}

export type HistorySort = "date_desc" | "date_asc" | "accuracy_desc" | "accuracy_asc";

export interface HistoryFilters {
  search?: string;
  engine_id?: number;
  sort?: HistorySort;
}

export const historyService = {
  list(filters: HistoryFilters = {}) {
    return apiClient
      .get<HistoryEntry[]>("/history", { params: filters })
      .then((r) => r.data);
  },

  remove(evaluationId: number) {
    return apiClient
      .delete<{ message: string }>(`/history/${evaluationId}`)
      .then((r) => r.data);
  },
};
