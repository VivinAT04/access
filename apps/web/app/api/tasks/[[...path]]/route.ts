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


async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();

  return (
    cookieStore.get(AUTH_COOKIE_NAME)?.value ??
    null
  );
}


async function readResponseData(
  response: Response,
): Promise<unknown> {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return {
      message: responseText,
    };
  }
}


async function proxyRequest(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const token = await getToken();

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

  const pathSegments =
    parameters.path ?? [];

  const additionalPath =
    pathSegments.length > 0
      ? `/${pathSegments.join("/")}`
      : "";

  const incomingUrl = new URL(request.url);

  const backendUrl =
    `${FASTAPI_URL}/api/v1/tasks` +
    additionalPath +
    incomingUrl.search;

  const headers = new Headers();

  headers.set(
    "Authorization",
    `Bearer ${token}`,
  );

  headers.set(
    "Accept",
    "application/json",
  );

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
      return new NextResponse(null, {
        status: 204,
      });
    }

    const data =
      await readResponseData(response);

    return NextResponse.json(
      data,
      {
        status: response.status,
      },
    );
  } catch (error) {
    console.error(
      "Task API proxy error:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "The task service is unavailable. Make sure the FastAPI backend is running on port 8000.",
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


export function PUT(
  request: Request,
  context: RouteContext,
) {
  return proxyRequest(
    request,
    context,
  );
}


export function PATCH(
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
