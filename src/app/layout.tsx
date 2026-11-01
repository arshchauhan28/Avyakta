import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ReadingProvider } from "@/providers/ReadingProvider";
import { AuthProvider } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "AVYAKTA — The Journey Through the Gita | श्रीमद्भगवद्गीता",
  description:
    "Explore the timeless wisdom of the Bhagavad Gita through 700 structured lessons across 18 chapters. Understand its teachings, connect them with everyday life, and grow through interactive learning.",
  keywords: [
    "Avyakta",
    "Bhagavad Gita",
    "Shrimad Bhagavad Gita",
    "Sanskrit Shlokas",
    "Interactive Gita",
    "Gita Learning Platform",
    "Krishna Arjuna",
    "Kurukshetra",
    "Sanatana Dharma",
  ],
  authors: [{ name: "Avyakta Learning Platform" }],
};

// Inline script to prevent theme flash before hydration
const themeInitScript = `
  (function() {
    try {
      var saved = localStorage.getItem('avyakta_reader_prefs_v1');
      if (saved) {
        var parsed = JSON.parse(saved);
        if (parsed && parsed.theme) {
          document.documentElement.setAttribute('data-theme', parsed.theme);
        }
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sa-Deva" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background text-text-primary selection:bg-accent/20 selection:text-accent">
        <ReadingProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </ReadingProvider>
      </body>
    </html>
  );
}
