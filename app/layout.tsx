import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Attendance",
  description: "Google Meet based school attendance",
  manifest: "/manifest.json"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const saved = localStorage.getItem('theme');
                  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })()
            `
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}