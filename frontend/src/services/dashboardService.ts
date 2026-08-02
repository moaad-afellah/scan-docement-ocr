import { apiClient } from "./apiClient";

export interface EngineLeaderboardEntry {
  id: number;
  code: string;
  name: string;
  average_accuracy: number | null;
  evaluation_count: number;
}

export interface RecentEvaluation {
  id: number;
  file_name: string;
  engine_name: string;
  status: string;
  accuracy: number | null;
  created_at: string;
}

export interface DashboardStats {
  total_evaluations: number;
  average_accuracy: number;
  engines_compared: number;
  last_run: string | null;
  engine_leaderboard: EngineLeaderboardEntry[];
  recent_evaluations: RecentEvaluation[];
}

export const dashboardService = {
  getStats() {
    return apiClient.get<DashboardStats>("/dashboard/stats").then((r) => r.data);
  },
};
