import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";


const FASTAPI_URL = (
  process.env.FASTAPI_URL ??
  "http://127.0.0.1:8000"
).replace(/\/+$/, "");


interface RouteContext {
  params: Promise<{
    path?: string[];
  }>;
}


export async function GET(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      AUTH_COOKIE_NAME,
    )?.value;

  if (!token) {
    return NextResponse.json(
      {
        message:
          "Not authenticated.",
      },
      {
        status: 401,
      },
    );
  }

  const parameters =
    await context.params;

  const segments =
    parameters.path ?? [];

  const suffix =
    segments.length
      ? `/${segments.join("/")}`
      : "";

  const requestUrl =
    new URL(request.url);

  const backendUrl =
    `${FASTAPI_URL}/api/v1/insights` +
    suffix +
    requestUrl.search;

  try {
    const response =
      await fetch(
        backendUrl,
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${token}`,
            Accept:
              "application/json",
          },
          cache: "no-store",
        },
      );

    const text =
      await response.text();

    let data: unknown = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = {
          message: text,
        };
      }
    }

    return NextResponse.json(
      data,
      {
        status:
          response.status,
      },
    );
  } catch {
    return NextResponse.json(
      {
        message:
          "The insights service is unavailable. Make sure FastAPI is running.",
      },
      {
        status: 503,
      },
    );
  }
}
