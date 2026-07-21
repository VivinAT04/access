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


async function proxyRequest(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(
      AUTH_COOKIE_NAME,
    )?.value;

  if (!token) {
    return NextResponse.json(
      {
        message: "Not authenticated.",
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

  const extraPath =
    segments.length > 0
      ? `/${segments.join("/")}`
      : "";

  const incomingUrl =
    new URL(request.url);

  const backendUrl =
    `${FASTAPI_URL}/api/v1/focus-sessions` +
    extraPath +
    incomingUrl.search;

  const headers = new Headers({
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  });

  let body: string | undefined;

  if (
    request.method !== "GET" &&
    request.method !== "HEAD" &&
    request.method !== "DELETE"
  ) {
    body = await request.text();

    if (body) {
      headers.set(
        "Content-Type",
        "application/json",
      );
    }
  }

  try {
    const response = await fetch(
      backendUrl,
      {
        method: request.method,
        headers,
        body,
        cache: "no-store",
      },
    );

    if (response.status === 204) {
      return new NextResponse(
        null,
        {
          status: 204,
        },
      );
    }

    const responseText =
      await response.text();

    let data: unknown = null;

    if (responseText) {
      try {
        data = JSON.parse(
          responseText,
        );
      } catch {
        data = {
          message: responseText,
        };
      }
    }

    return NextResponse.json(
      data,
      {
        status: response.status,
      },
    );
  } catch {
    return NextResponse.json(
      {
        message:
          "The focus-session service is unavailable. Make sure FastAPI is running.",
      },
      {
        status: 503,
      },
    );
  }
}


export function GET(
  request: Request,
  context: RouteContext,
) {
  return proxyRequest(
    request,
    context,
  );
}


export function POST(
  request: Request,
  context: RouteContext,
) {
  return proxyRequest(
    request,
    context,
  );
}


export function DELETE(
  request: Request,
  context: RouteContext,
) {
  return proxyRequest(
    request,
    context,
  );
}
