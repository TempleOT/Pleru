"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCallback } from "react";

export default function BackButton({ label = "Back" }: { label?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  // Hide on home
  if (pathname === "/") return null;

  const goBack = useCallback(() => {
    // If there's no meaningful history, go home
    if (typeof window !== "undefined" && window.history.length <= 1) {
      router.push("/");
    } else {
      router.back();
    }
  }, [router]);

  return (
    <button
      onClick={goBack}
      className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950/80 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-900"
      aria-label="Go back"
      title="Back"
    >
      <ArrowLeft className="h-4 w-4 text-yellow-400" />
      <span>{label}</span>
    </button>
  );
}
