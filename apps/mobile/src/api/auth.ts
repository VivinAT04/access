import {
  apiRequest,
} from "./client";

import type {
  TokenResponse,
  User,
} from "../types";

export async function loginRequest(
  email: string,
  password: string,
): Promise<TokenResponse> {
  const form =
    new URLSearchParams();

  form.append(
    "username",
    email,
  );

  form.append(
    "password",
    password,
  );

  return apiRequest<TokenResponse>(
    "/auth/token",
    {
      method: "POST",
      authenticated: false,

      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },

      body:
        form.toString(),
    },
  );
}

export async function registerRequest(
  fullName: string,
  email: string,
  password: string,
): Promise<User> {
  return apiRequest<User>(
    "/auth/register",
    {
      method: "POST",
      authenticated: false,

      body:
        JSON.stringify({
          full_name:
            fullName,
          email,
          password,
        }),
    },
  );
}

export async function currentUserRequest(): Promise<User> {
  return apiRequest<User>(
    "/auth/me",
  );
}
