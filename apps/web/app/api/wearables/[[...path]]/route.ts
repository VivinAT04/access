import {
  cookies,
} from "next/headers";

import {
  NextResponse,
} from "next/server";

import {
  AUTH_COOKIE_NAME,
} from "@/lib/auth-cookie";


const FASTAPI_URL = (
  process.env.FASTAPI_URL
  ?? "http://127.0.0.1:8000"
).replace(
  /\/+$/,
  "",
);


interface RouteContext {
  params: Promise<{
    path?: string[];
  }>;
}


async function proxy(
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

  const suffix =
    parameters.path?.length
      ? (
          "/"
          + parameters.path.join("/")
        )
      : "";

  const url =
    new URL(
      request.url,
    );

  const backendUrl =
    (
      FASTAPI_URL
      + "/api/v1/wearables"
      + suffix
      + url.search
    );

  const headers:
    Record<
      string,
      string
    > = {
      Authorization:
        `Bearer ${token}`,

      Accept:
        "application/json",
    };

  const options:
    RequestInit = {
      method:
        request.method,

      headers,

      cache:
        "no-store",
    };

  if (
    request.method !== "GET"
    && request.method !== "HEAD"
  ) {
    headers[
      "Content-Type"
    ] =
      "application/json";

    options.body =
      await request.text();
  }

  try {
    const response =
      await fetch(
        backendUrl,
        options,
      );

    const raw =
      await response.text();

    let data:
      unknown = null;

    if (raw) {
      try {
        data =
          JSON.parse(
            raw,
          );
      } catch {
        data = {
          message:
            raw,
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
          "Wearable services are unavailable.",
      },
      {
        status: 503,
      },
    );
  }
}


export async function GET(
  request: Request,
  context: RouteContext,
) {
  return proxy(
    request,
    context,
  );
}


export async function POST(
  request: Request,
  context: RouteContext,
) {
  return proxy(
    request,
    context,
  );
}


export async function DELETE(
  request: Request,
  context: RouteContext,
) {
  return proxy(
    request,
    context,
  );
}
