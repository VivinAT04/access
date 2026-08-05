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


export function RegisterForm() {
  const router =
    useRouter();

  const { locale } =
    useLanguage();

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

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

    if (
      password
      !== confirmPassword
    ) {
      setMessage(
        text(
          "register.passwordMismatch",
        ),
      );

      return;
    }

    if (
      password.length < 8
    ) {
      setMessage(
        text(
          "register.passwordLength",
        ),
      );

      return;
    }

    setIsLoading(true);

    try {
      const registerResponse =
        await fetch(
          "/api/auth/register",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              full_name:
                fullName,
              email,
              password,
            }),
          },
        );

      const registerData: {
        message?: string;
      } = await registerResponse.json();

      if (
        !registerResponse.ok
      ) {
        setMessage(
          registerData.message
          ?? text(
            "register.failed",
          ),
        );

        return;
      }

      const loginResponse =
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

      const loginData: {
        message?: string;
      } = await loginResponse.json();

      if (!loginResponse.ok) {
        setMessage(
          loginData.message
          ?? text(
            "register.createdSignIn",
          ),
        );

        router.push(
          "/login",
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
        <label htmlFor="fullName">
          {text(
            "register.fullName",
          )}
        </label>

        <input
          autoComplete="name"
          id="fullName"
          maxLength={120}
          minLength={2}
          name="fullName"
          onChange={(event) =>
            setFullName(
              event.target.value,
            )
          }
          placeholder={text(
            "register.fullNamePlaceholder",
          )}
          required
          type="text"
          value={fullName}
        />
      </div>

      <div className="field-group">
        <label htmlFor="email">
          {text(
            "register.email",
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
            "register.emailPlaceholder",
          )}
          required
          type="email"
          value={email}
        />
      </div>

      <div className="field-group">
        <label htmlFor="password">
          {text(
            "register.password",
          )}
        </label>

        <input
          autoComplete="new-password"
          id="password"
          minLength={8}
          name="password"
          onChange={(event) =>
            setPassword(
              event.target.value,
            )
          }
          placeholder={text(
            "register.passwordPlaceholder",
          )}
          required
          type="password"
          value={password}
        />
      </div>

      <div className="field-group">
        <label htmlFor="confirmPassword">
          {text(
            "register.confirmPassword",
          )}
        </label>

        <input
          autoComplete="new-password"
          id="confirmPassword"
          minLength={8}
          name="confirmPassword"
          onChange={(event) =>
            setConfirmPassword(
              event.target.value,
            )
          }
          placeholder={text(
            "register.confirmPasswordPlaceholder",
          )}
          required
          type="password"
          value={
            confirmPassword
          }
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
              "register.submitting",
            )
          : text(
              "register.submit",
            )}
      </button>

      <p className="form-footer">
        {text(
          "register.existingUser",
        )}{" "}

        <Link href="/login">
          {text(
            "register.signIn",
          )}
        </Link>
      </p>
    </form>
  );
}
