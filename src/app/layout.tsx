import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "OpenHeads - Party Guessing Game",
    template: "%s | OpenHeads",
  },
  description:
    "A modern, free party guessing game. Act out words, tap to score, and have fun with friends.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "OpenHeads",
  },
  openGraph: {
    title: "OpenHeads - Party Guessing Game",
    description:
      "A modern, free party guessing game. Act out words, tap to score, and have fun with friends.",
    type: "website",
    siteName: "OpenHeads",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenHeads - Party Guessing Game",
    description:
      "A modern, free party guessing game. Act out words, tap to score, and have fun with friends.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground antialiased flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <main className="flex-1 pb-20 safe-bottom">{children}</main>
            <BottomNav />
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
