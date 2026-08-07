import {
  API_V1,
} from "./config";

import {
  getStoredToken,
} from "../storage/auth-storage";

interface ApiOptions
  extends RequestInit {
  authenticated?: boolean;
}

export class ApiError extends Error {
  status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const headers:
    Record<string, string> = {
      Accept: "application/json",
    };

  if (
    options.body
    && !(options.body instanceof FormData)
  ) {
    headers[
      "Content-Type"
    ] = "application/json";
  }

  if (
    options.authenticated
    !== false
  ) {
    const token =
      await getStoredToken();

    if (token) {
      headers.Authorization =
        `Bearer ${token}`;
    }
  }

  const response =
    await fetch(
      `${API_V1}${path}`,
      {
        ...options,
        headers: {
          ...headers,
          ...(options.headers ?? {}),
        },
      },
    );

  if (
    response.status === 204
  ) {
    return undefined as T;
  }

  const raw =
    await response.text();

  let data: unknown = null;

  if (raw) {
    try {
      data =
        JSON.parse(raw);
    } catch {
      data = raw;
    }
  }

  if (!response.ok) {
    let message =
      `Request failed (${response.status}).`;

    if (
      typeof data === "object"
      && data !== null
      && "detail" in data
    ) {
      const detail =
        (
          data as {
            detail?: unknown;
          }
        ).detail;

      if (
        typeof detail === "string"
      ) {
        message = detail;
      }
    }

    if (
      typeof data === "object"
      && data !== null
      && "message" in data
    ) {
      const apiMessage =
        (
          data as {
            message?: unknown;
          }
        ).message;

      if (
        typeof apiMessage
        === "string"
      ) {
        message = apiMessage;
      }
    }

    throw new ApiError(
      message,
      response.status,
    );
  }

  return data as T;
}
