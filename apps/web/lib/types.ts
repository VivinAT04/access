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
