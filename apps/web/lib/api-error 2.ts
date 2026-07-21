import type { ApiError } from "@/lib/types";

export function getApiErrorMessage(
  data: ApiError | null,
  fallback: string,
): string {
  if (!data?.detail) {
    return fallback;
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data.detail)) {
    return data.detail.map((error) => error.msg).join(" ");
  }

  return fallback;
}
