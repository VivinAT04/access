"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useState,
} from "react";

export function RegisterForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setMessage(
        "Password must contain at least 8 characters.",
      );
      return;
    }

    setIsLoading(true);

    try {
      const registerResponse = await fetch(
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: fullName,
            email,
            password,
          }),
        },
      );

      const registerData =
        (await registerResponse.json()) as {
          message?: string;
        };

      if (!registerResponse.ok) {
        setMessage(
          registerData.message ?? "Registration failed.",
        );
        return;
      }

      const loginResponse = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const loginData = (await loginResponse.json()) as {
        message?: string;
      };

      if (!loginResponse.ok) {
        setMessage(
          loginData.message ??
            "Account created. Please sign in.",
        );
        router.push("/login");
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
        <label htmlFor="fullName">Full name</label>
        <input
          autoComplete="name"
          id="fullName"
          maxLength={120}
          minLength={2}
          name="fullName"
          onChange={(event) =>
            setFullName(event.target.value)
          }
          placeholder="Your full name"
          required
          type="text"
          value={fullName}
        />
      </div>

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
          autoComplete="new-password"
          id="password"
          minLength={8}
          name="password"
          onChange={(event) =>
            setPassword(event.target.value)
          }
          placeholder="At least 8 characters"
          required
          type="password"
          value={password}
        />
      </div>

      <div className="field-group">
        <label htmlFor="confirmPassword">
          Confirm password
        </label>
        <input
          autoComplete="new-password"
          id="confirmPassword"
          minLength={8}
          name="confirmPassword"
          onChange={(event) =>
            setConfirmPassword(event.target.value)
          }
          placeholder="Enter the password again"
          required
          type="password"
          value={confirmPassword}
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
        {isLoading
          ? "Creating account..."
          : "Create account"}
      </button>

      <p className="form-footer">
        Already have an account?{" "}
        <Link href="/login">Sign in</Link>
      </p>
    </form>
  );
}
