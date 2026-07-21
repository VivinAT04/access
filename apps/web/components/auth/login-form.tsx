"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useState,
} from "react";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        setMessage(data.message ?? "Login failed.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setMessage(
        "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="field-group">
        <label htmlFor="email">Email address</label>
        <input
          autoComplete="email"
          id="email"
          name="email"
          onChange={(event) =>
            setEmail(event.target.value)
          }
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
      </div>

      <div className="field-group">
        <label htmlFor="password">Password</label>
        <input
          autoComplete="current-password"
          id="password"
          minLength={8}
          name="password"
          onChange={(event) =>
            setPassword(event.target.value)
          }
          placeholder="Enter your password"
          required
          type="password"
          value={password}
        />
      </div>

      {message ? (
        <div className="form-message form-error" role="alert">
          {message}
        </div>
      ) : null}

      <button
        className="button button-primary button-full"
        disabled={isLoading}
        type="submit"
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </button>

      <p className="form-footer">
        New to Aksess?{" "}
        <Link href="/register">Create an account</Link>
      </p>
    </form>
  );
}
