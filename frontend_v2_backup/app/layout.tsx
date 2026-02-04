import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "Kolozus Studio",
  description: "Cognitive Evolution System",
};

import { Providers } from "./providers";
import { LanguageProvider } from "./context/LanguageContext";
import SearchPalette from "./components/SearchPalette";
import Header from "@/components/Header";


import Sidebar from "@/components/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground font-sans`}>
        <Providers>
          <LanguageProvider>
            <div className="flex h-screen bg-background">
              {/* Desktop Sidebar */}
              <Sidebar />

              {/* Mobile Header (TODO: Refactor Header to be mobile-only or intelligent) */}
              <div className="md:hidden fixed top-0 w-full z-50">
                <Header />
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 mt-16 md:mt-0">
                  {children}
                </main>
              </div>
            </div>

            <SearchPalette />
          </LanguageProvider>
        </Providers>
      </body>
    </html >
  );
}

