"use client";

import {
  useRouter,
} from "next/navigation";
import {
  useState,
} from "react";

import {
  authText,
} from "@/components/i18n/auth-translations";
import {
  useLanguage,
} from "@/components/language/language-provider";


export function LogoutButton() {
  const router =
    useRouter();

  const { locale } =
    useLanguage();

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);


  async function handleLogout() {
    setIsLoading(true);

    try {
      await fetch(
        "/api/auth/logout",
        {
          method: "POST",
        },
      );
    } finally {
      router.push(
        "/login",
      );

      router.refresh();

      setIsLoading(false);
    }
  }


  return (
    <button
      className="button button-secondary"
      disabled={isLoading}
      onClick={
        handleLogout
      }
      type="button"
    >
      {isLoading
        ? authText(
            locale,
            "logout.loading",
          )
        : authText(
            locale,
            "logout.button",
          )}
    </button>
  );
}
