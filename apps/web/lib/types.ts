export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegisterPayload {
  email: string;
  full_name: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ValidationError {
  loc: Array<string | number>;
  msg: string;
  type: string;
}

export interface ApiError {
  detail?: string | ValidationError[];
}

export type FontSize =
  | "small"
  | "medium"
  | "large"
  | "extra-large";

export interface AccessibilityPreferences {
  id: string;
  user_id: string;
  font_size: FontSize;
  high_contrast: boolean;
  reduced_motion: boolean;
  dyslexia_friendly_font: boolean;
  increased_spacing: boolean;
  simplified_interface: boolean;
  screen_reader_optimised: boolean;
  created_at: string;
  updated_at: string;
}

export type AccessibilityPreferenceUpdate = Pick<
  AccessibilityPreferences,
  | "font_size"
  | "high_contrast"
  | "reduced_motion"
  | "dyslexia_friendly_font"
  | "increased_spacing"
  | "simplified_interface"
  | "screen_reader_optimised"
>;

export type TaskPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent";

export type TaskStatus =
  | "pending"
  | "in-progress"
  | "completed";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskInput {
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
}

export interface TaskSummary {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  overdue: number;
}

export type FocusSessionStatus =
  | "completed"
  | "cancelled";

export interface FocusSession {
  id: string;
  user_id: string;
  task_id: string | null;
  intention: string;
  notes: string | null;
  planned_minutes: number;
  completed_minutes: number;
  status: FocusSessionStatus;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface FocusSummary {
  sessions_today: number;
  minutes_today: number;
  completed_sessions: number;
  total_minutes: number;
}
