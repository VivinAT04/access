import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

const FASTAPI_URL =
  process.env.FASTAPI_URL ?? "http://127.0.0.1:8000";

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();

  return (
    cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null
  );
}

export async function GET() {
  const token = await getToken();

  if (!token) {
    return NextResponse.json(
      { message: "Not authenticated." },
      { status: 401 },
    );
  }

  try {
    const response = await fetch(
      `${FASTAPI_URL}/api/v1/accessibility/preferences`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "The accessibility service is unavailable.",
      },
      { status: 503 },
    );
  }
}

export async function PUT(request: Request) {
  const token = await getToken();

  if (!token) {
    return NextResponse.json(
      { message: "Not authenticated." },
      { status: 401 },
    );
  }

  try {
    const payload = await request.json();

    const response = await fetch(
      `${FASTAPI_URL}/api/v1/accessibility/preferences`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      },
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "The accessibility service is unavailable.",
      },
      { status: 503 },
    );
  }
}
