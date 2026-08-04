import type { ReactNode } from "react";

import "./reflection.css";


export default function ReflectionLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}
