"use client";

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";
import {
  FormEvent,
  useState,
} from "react";

import {
  authText,
} from "@/components/i18n/auth-translations";
import {
  useLanguage,
} from "@/components/language/language-provider";


export function LoginForm() {
  const router =
    useRouter();

  const { locale } =
    useLanguage();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);


  const text = (
    key:
      Parameters<
        typeof authText
      >[1],
  ) => authText(
    locale,
    key,
  );


  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");
    setIsLoading(true);

    try {
      const response =
        await fetch(
          "/api/auth/login",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              email,
              password,
            }),
          },
        );

      const data: {
        message?: string;
      } = await response.json();

      if (!response.ok) {
        setMessage(
          data.message
          ?? text(
            "login.failed",
          ),
        );

        return;
      }

      router.push(
        "/dashboard",
      );

      router.refresh();
    } catch {
      setMessage(
        text(
          "common.tryAgain",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <form
      className="auth-form"
      onSubmit={
        handleSubmit
      }
    >
      <div className="field-group">
        <label htmlFor="email">
          {text(
            "login.email",
          )}
        </label>

        <input
          autoComplete="email"
          id="email"
          name="email"
          onChange={(event) =>
            setEmail(
              event.target.value,
            )
          }
          placeholder={text(
            "login.emailPlaceholder",
          )}
          required
          type="email"
          value={email}
        />
      </div>

      <div className="field-group">
        <label htmlFor="password">
          {text(
            "login.password",
          )}
        </label>

        <input
          autoComplete="current-password"
          id="password"
          minLength={8}
          name="password"
          onChange={(event) =>
            setPassword(
              event.target.value,
            )
          }
          placeholder={text(
            "login.passwordPlaceholder",
          )}
          required
          type="password"
          value={password}
        />
      </div>

      {message ? (
        <div
          className="form-message form-error"
          role="alert"
        >
          {message}
        </div>
      ) : null}

      <button
        className="button button-primary button-full"
        disabled={isLoading}
        type="submit"
      >
        {isLoading
          ? text(
              "login.submitting",
            )
          : text(
              "login.submit",
            )}
      </button>

      <p className="form-footer">
        {text(
          "login.newUser",
        )}{" "}

        <Link href="/register">
          {text(
            "login.createAccount",
          )}
        </Link>
      </p>
    </form>
  );
}
