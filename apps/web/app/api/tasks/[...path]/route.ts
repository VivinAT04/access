import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";


const FASTAPI_URL =
  process.env.FASTAPI_URL ?? "http://127.0.0.1:8000";


interface RouteContext {
  params: Promise<{
    path?: string[];
  }>;
}


async function proxyRequest(
  request: Request,
  context: RouteContext,
) {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(AUTH_COOKIE_NAME)?.value;

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

  const parameters = await context.params;
  const path = parameters.path?.join("/") ?? "";

  const requestUrl = new URL(request.url);

  const backendUrl = new URL(
    `${FASTAPI_URL}/api/v1/tasks${
      path ? `/${path}` : ""
    }`,
  );

  backendUrl.search = requestUrl.search;

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };

  let body: string | undefined;

  if (
    request.method !== "GET" &&
    request.method !== "HEAD" &&
    request.method !== "DELETE"
  ) {
    body = await request.text();

    if (body) {
      headers["Content-Type"] =
        "application/json";
    }
  }

  try {
    const response = await fetch(
      backendUrl.toString(),
      {
        method: request.method,
        headers,
        body,
        cache: "no-store",
      },
    );

    if (response.status === 204) {
      return new NextResponse(null, {
        status: 204,
      });
    }

    const responseText = await response.text();

    if (!responseText) {
      return new NextResponse(null, {
        status: response.status,
      });
    }

    let responseData: unknown;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = {
        message: responseText,
      };
    }

    return NextResponse.json(
      responseData,
      {
        status: response.status,
      },
    );
  } catch {
    return NextResponse.json(
      {
        message:
          "The task service is unavailable. Make sure FastAPI is running.",
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
  return proxyRequest(request, context);
}


export function POST(
  request: Request,
  context: RouteContext,
) {
  return proxyRequest(request, context);
}


export function PUT(
  request: Request,
  context: RouteContext,
) {
  return proxyRequest(request, context);
}


export function PATCH(
  request: Request,
  context: RouteContext,
) {
  return proxyRequest(request, context);
}


export function DELETE(
  request: Request,
  context: RouteContext,
) {
  return proxyRequest(request, context);
}
