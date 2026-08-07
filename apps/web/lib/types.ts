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
  accent_colour: string;
  surface_colour: string;
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
  | "accent_colour"
  | "surface_colour"
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

export interface MoodCheckin {
  id: string;
  user_id: string;
  mood_score: number;
  energy_level: number;
  stress_level: number;
  emotions: string[];
  note: string | null;
  created_at: string;
}

export interface MoodSummary {
  entries_today: number;
  total_entries: number;
  average_mood: number;
  average_energy: number;
  average_stress: number;
}

export interface Reflection {
  id: string;
  user_id: string;
  reflection_date: string;
  good_thing: string;
  challenge: string;
  accomplishment: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReflectionSummary {
  total_reflections: number;
  reflected_today: boolean;
  current_streak: number;
}

export type AnxietyExerciseType =
  | "box_breathing"
  | "four_seven_eight"
  | "grounding_54321"
  | "quick_calm";

export interface AnxietySession {
  id: string;
  user_id: string;
  exercise_type: AnxietyExerciseType;
  duration_seconds: number;
  completed: boolean;
  created_at: string;
}

export interface AnxietySummary {
  sessions_today: number;
  minutes_today: number;
  total_sessions: number;
  total_minutes: number;
  favourite_exercise: string | null;
}

export interface Subtask {
  id: string;
  user_id: string;
  task_id: string;
  title: string;
  description: string | null;
  position: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubtaskInput {
  task_id: string;
  title: string;
  description: string | null;
  position?: number | null;
}

export interface TaskProgress {
  task_id: string;
  total_subtasks: number;
  completed_subtasks: number;
  progress_percentage: number;
  is_completed: boolean;
}

export type RoutineCategory =
  | "morning"
  | "study"
  | "work"
  | "evening"
  | "custom";

export interface RoutineStep {
  id: string;
  routine_id: string;
  user_id: string;
  title: string;
  description: string | null;
  position: number;
  estimated_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface Routine {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: RoutineCategory;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  steps: RoutineStep[];
}

export interface RoutineRunStep {
  id: string;
  run_id: string;
  routine_step_id: string | null;
  user_id: string;
  title: string;
  position: number;
  is_completed: boolean;
  completed_at: string | null;
}

export interface RoutineRun {
  id: string;
  routine_id: string;
  user_id: string;
  run_date: string;
  status:
    | "in-progress"
    | "completed";
  started_at: string;
  completed_at: string | null;
  routine_title: string;
  progress_percentage: number;
  completed_steps: number;
  total_steps: number;
  steps: RoutineRunStep[];
}

export interface RoutineSummary {
  total_routines: number;
  active_runs_today: number;
  completed_runs_today: number;
  total_completed_runs: number;
}

export interface Reminder {
  id: string;
  user_id: string;
  task_id: string | null;
  routine_id: string | null;
  title: string;
  message: string | null;
  remind_at: string;
  is_enabled: boolean;
  is_dismissed: boolean;
  notified_at: string | null;
  created_at: string;
  updated_at: string;
  is_due_now: boolean;
  is_overdue: boolean;
}

export interface ReminderSummary {
  total_active: number;
  upcoming: number;
  overdue: number;
  due_today: number;
}

export type CompanionType =
  | "sprout"
  | "owl"
  | "cloud"
  | "fox";

export interface CompanionProfile {
  id: string;
  user_id: string;
  companion_type: CompanionType;
  companion_name: string;
  total_xp: number;
  current_level: number;
  completed_sessions: number;
  total_focus_minutes: number;
  xp_for_current_level: number;
  xp_for_next_level: number;
  level_progress_percentage: number;
  break_recommendation: string;
  created_at: string;
  updated_at: string;
}

export interface CompanionReward {
  id: string;
  focus_session_id: string;
  xp_awarded: number;
  focus_minutes: number;
  created_at: string;
}

export interface DailyInsightPoint {
  date: string;
  day_label: string;

  mood_average: number | null;
  energy_average: number | null;
  stress_average: number | null;

  mood_checkins: number;
  focus_minutes: number;
  focus_sessions: number;
  reflections: number;
}

export interface InsightSummary {
  period_start: string;
  period_end: string;

  total_focus_minutes: number;
  total_focus_sessions: number;
  total_mood_checkins: number;
  total_reflections: number;

  average_mood: number | null;
  average_energy: number | null;
  average_stress: number | null;

  most_focused_day: string | null;
  most_focused_minutes: number;
}

export interface ReflectionInsights {
  days: DailyInsightPoint[];
  summary: InsightSummary;
  suggestions: string[];
}

export type TextDirection =
  | "auto"
  | "ltr"
  | "rtl";

export type ReadingLetterSpacing =
  | "normal"
  | "relaxed"
  | "wide";

export interface LanguagePreference {
  id: string;
  user_id: string;
  locale: string;
  direction: TextDirection;
  letter_spacing: ReadingLetterSpacing;
  dyslexia_friendly: boolean;
  reading_guide: boolean;
  created_at: string;
  updated_at: string;
}


export interface SupportResource {
  id: string;
  title: string;
  category:
    | "anxiety"
    | "focus"
    | "sleep"
    | "stress"
    | "low-mood"
    | "sensory"
    | "crisis";
  summary: string;
  content: string[];
  professional_support_recommended:
    boolean;
}


export interface ExpertSupportEntry {
  id: string;
  title: string;
  profession: string;
  description: string;
  suitable_for: string[];
  route: string;
  urgent: boolean;
}


export interface SafeguardingGuide {
  title: string;
  principles: string[];
  urgent_message: string;
}


export interface PrivacyPreference {
  id: string;
  user_id: string;

  adaptive_personalisation:
    boolean;

  wellbeing_analytics:
    boolean;

  community_profile_visible:
    boolean;

  wearable_data_enabled:
    boolean;

  voice_processing_enabled:
    boolean;

  research_data_sharing:
    boolean;

  created_at: string;
  updated_at: string;
}


export interface PrivacyDataCategory {
  key: string;
  title: string;
  description: string;
  purpose: string;
}


export interface PrivacySummary {
  categories:
    PrivacyDataCategory[];

  storage_statement:
    string;

  personalisation_statement:
    string;

  sharing_statement:
    string;
}
