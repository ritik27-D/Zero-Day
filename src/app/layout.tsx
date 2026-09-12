import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Islington R&D Connect",
  description: "Researcher directory for Islington R&D Connect.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
