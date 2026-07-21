import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
} from "@/lib/auth-cookie";
import { getApiErrorMessage } from "@/lib/api-error";
import type {
  ApiError,
  LoginPayload,
  TokenResponse,
} from "@/lib/types";

const FASTAPI_URL =
  process.env.FASTAPI_URL ?? "http://127.0.0.1:8000";

export async function POST(request: Request) {
  let payload: LoginPayload;

  try {
    payload = (await request.json()) as LoginPayload;
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }

  if (!payload.email?.trim() || !payload.password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 400 },
    );
  }

  const formData = new URLSearchParams();
  formData.set("username", payload.email.trim().toLowerCase());
  formData.set("password", payload.password);

  try {
    const response = await fetch(
      `${FASTAPI_URL}/api/v1/auth/token`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: formData.toString(),
        cache: "no-store",
      },
    );

    const data = (await response.json()) as
      | TokenResponse
      | ApiError;

    if (!response.ok) {
      return NextResponse.json(
        {
          message: getApiErrorMessage(
            data as ApiError,
            "Login failed.",
          ),
        },
        { status: response.status },
      );
    }

    const tokenData = data as TokenResponse;
    const cookieStore = await cookies();

    cookieStore.set(
      AUTH_COOKIE_NAME,
      tokenData.access_token,
      AUTH_COOKIE_OPTIONS,
    );

    return NextResponse.json(
      { message: "Login successful." },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        message:
          "The authentication server is unavailable. Make sure FastAPI is running.",
      },
      { status: 503 },
    );
  }
}
