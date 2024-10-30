// app/providers.jsx
"use client";

import { ReactNode } from "react";
import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs";

export default function Providers({ children }) {
  return <KindeProvider>{children}</KindeProvider>;
}