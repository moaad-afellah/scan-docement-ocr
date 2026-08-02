import { apiClient } from "./apiClient";

export interface UserSettingsSummary {
  language: string;
  email_alerts: boolean;
  completion_alerts: boolean;
  weekly_summary: boolean;
  default_export_fmt: string;
  include_original: boolean;
  default_engine_id: number | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
}

export interface RegisterResponse extends User {
  settings: UserSettingsSummary;
}

export interface LoginResponse {
  access_token: string;
  id: number;
  name: string;
  email: string;
  role: string;
}

export const authService = {
  register(payload: { name: string; email: string; password: string }) {
    return apiClient.post<RegisterResponse>("/register", payload).then((r) => r.data);
  },

  login(payload: { email: string; password: string }) {
    return apiClient.post<LoginResponse>("/login", payload).then((r) => r.data);
  },

  me() {
    return apiClient.get<User>("/me").then((r) => r.data);
  },

  updateProfile(userId: number, payload: { name?: string; email?: string }) {
    return apiClient.put<User>(`/users/${userId}`, payload).then((r) => r.data);
  },

  changePassword(
    userId: number,
    payload: { current_password: string; new_password: string }
  ) {
    return apiClient
      .put<{ message: string }>(`/users/${userId}/password`, payload)
      .then((r) => r.data);
  },
};
