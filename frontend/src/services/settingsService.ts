import { apiClient } from "./apiClient";

export interface UserSettings {
  user_id: number;
  default_engine_id: number | null;
  language: string;
  email_alerts: boolean;
  completion_alerts: boolean;
  weekly_summary: boolean;
  default_export_fmt: "csv" | "txt" | "pdf" | "docx" | "json";
  include_original: boolean;
}

export interface OcrEngine {
  id: number;
  code: string;
  name: string;
  description: string | null;
}

export const settingsService = {
  getSettings() {
    return apiClient.get<UserSettings>("/settings").then((r) => r.data);
  },

  updateSettings(payload: Partial<Omit<UserSettings, "user_id">>) {
    return apiClient.put<UserSettings>("/settings", payload).then((r) => r.data);
  },

  listEngines() {
    return apiClient.get<OcrEngine[]>("/ocr-engines").then((r) => r.data);
  },
};
