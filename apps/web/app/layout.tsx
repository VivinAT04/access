import {
  OfflineStatus,
} from "@/components/offline/offline-status";

import {
  ServiceWorkerRegister,
} from "@/components/offline/service-worker-register";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AccessibilityProvider } from "@/components/accessibility/accessibility-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeScript } from "@/components/theme/theme-script";

import "./globals.css";
import { LanguageProvider } from "@/components/language/language-provider";


export const metadata: Metadata = {
  title: {
    default: "Aksess",
    template: "%s | Aksess",
  },
  description:
    "An accessible platform for planning, focus and wellbeing support.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>

      <body>
        <ServiceWorkerRegister />
        <OfflineStatus />

        <ThemeProvider>
          <AccessibilityProvider>
            <LanguageProvider>
            {children}
                      </LanguageProvider>
          </AccessibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
