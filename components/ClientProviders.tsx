"use client";
import { AmbientProvider } from "./AmbientProvider";
export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <AmbientProvider>{children}</AmbientProvider>;
}
