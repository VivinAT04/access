export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active?: boolean;
  created_at?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority?: string;
  status?: string;
  is_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WearableDashboard {
  privacy_enabled: boolean;

  baseline: {
    baseline_bpm: number | null;
    sample_count: number;
    ready: boolean;
  };

  recent_samples: {
    id: string;
    bpm: number;
    measured_at: string;
  }[];

  recent_signals: {
    id: string;
    observed_bpm: number;
    severity: string;
    percentage_above_baseline: number;
  }[];
}
