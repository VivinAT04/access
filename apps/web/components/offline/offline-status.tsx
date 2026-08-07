"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  syncOfflineQueue,
} from "@/lib/offline/sync";


export function OfflineStatus() {
  const [
    online,
    setOnline,
  ] =
    useState(
      true,
    );

  const [
    syncing,
    setSyncing,
  ] =
    useState(
      false,
    );


  useEffect(() => {
    const id =
      window.setTimeout(
        () => {
          setOnline(
            navigator.onLine,
          );
        },
        0,
      );

    const handleOffline =
      () => {
        setOnline(
          false,
        );
      };

    const handleOnline =
      async () => {
        setOnline(
          true,
        );

        setSyncing(
          true,
        );

        try {
          await syncOfflineQueue();
        } finally {
          setSyncing(
            false,
          );
        }
      };

    window.addEventListener(
      "offline",
      handleOffline,
    );

    window.addEventListener(
      "online",
      handleOnline,
    );

    return () => {
      window.clearTimeout(
        id,
      );

      window.removeEventListener(
        "offline",
        handleOffline,
      );

      window.removeEventListener(
        "online",
        handleOnline,
      );
    };
  }, []);


  if (
    online
    && !syncing
  ) {
    return null;
  }


  return (
    <div
      className={
        online
          ? "offline-banner offline-banner-syncing"
          : "offline-banner"
      }
      role="status"
    >
      {
        online
          ? "Back online — syncing saved changes…"
          : (
              "You are offline. "
              + "Supported changes will be saved locally."
            )
      }
    </div>
  );
}
