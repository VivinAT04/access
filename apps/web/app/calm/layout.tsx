import type { ReactNode } from "react";

import "./calm.css";


export default function CalmLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}
