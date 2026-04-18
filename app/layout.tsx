// Licensed under MIT - DevForum Project
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { auth } from "@/lib/auth";  // ✅ Import from central auth config, not route file
import { env } from "@/lib/env";    // ✅ Use typed env instead of process.env

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    template: "%s | DevForum",
    default: "DevForum - Developer Q&A Community",
  },
  description: "Open-source Q&A forum for developers. Share knowledge, solve problems, grow together.",
  // ✅ Use typed env with fallback
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // ✅ Safe auth call with error handling
  const session = await auth().catch((err) => {
    console.error("Failed to fetch session:", err);
    return null;
  });

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem 
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}