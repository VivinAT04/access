import { NextResponse } from "next/server";

import { getApiErrorMessage } from "@/lib/api-error";
import type {
  ApiError,
  RegisterPayload,
  User,
} from "@/lib/types";

const FASTAPI_URL =
  process.env.FASTAPI_URL ?? "http://127.0.0.1:8000";

export async function POST(request: Request) {
  let payload: RegisterPayload;

  try {
    payload = (await request.json()) as RegisterPayload;
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }

  if (
    !payload.email?.trim() ||
    !payload.full_name?.trim() ||
    !payload.password
  ) {
    return NextResponse.json(
      { message: "All fields are required." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `${FASTAPI_URL}/api/v1/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: payload.email.trim().toLowerCase(),
          full_name: payload.full_name.trim(),
          password: payload.password,
        }),
        cache: "no-store",
      },
    );

    const data = (await response.json()) as User | ApiError;

    if (!response.ok) {
      return NextResponse.json(
        {
          message: getApiErrorMessage(
            data as ApiError,
            "Registration failed.",
          ),
        },
        { status: response.status },
      );
    }

    return NextResponse.json(
      { user: data as User },
      { status: 201 },
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
