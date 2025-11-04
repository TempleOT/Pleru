import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "../components/ClientProviders"; // ⬅️ add this import

export const metadata: Metadata = {
  title: "Pleru — Temple of Truth",
  description: "Bridge • Reflect • Codex",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* ⬇️ this ensures ambient audio and other client providers persist across all pages */}
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
