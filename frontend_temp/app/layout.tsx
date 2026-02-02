import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import SearchPalette from "./components/SearchPalette";

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
import SpaceSelector from "@/components/SpaceSelector";

// ... imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-slate-50 text-slate-900 font-sans`}>
        <Providers>
          {/* PROFESSIONAL HEADER */}
          <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center mr-6">
                    <span className="font-bold text-xl tracking-tight text-slate-900 mr-4">KOLOZUS</span>
                    <SpaceSelector />
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <Link href="/" className="border-slate-900 text-slate-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      Dashboard
                    </Link>
                    <Link href="/library" className="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      Library
                    </Link>
                    <Link href="/ingest" className="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      Ingest
                    </Link>
                    <Link href="/products" className="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      Publisher
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'k', 'metaKey': true }))}
                    className="hidden sm:flex items-center text-sm text-slate-500 hover:text-slate-700 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    Search...
                    <span className="ml-2 text-xs text-slate-400 font-mono border border-slate-300 rounded px-1">⌘K</span>
                  </button>

                  <div className="flex-shrink-0">
                    <Link href="/fragments" className="relative inline-flex items-center px-4 py-2 border border-transparent text-xs font-medium rounded-md text-slate-500 bg-slate-100 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
                      <span>System Audit</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* MAIN CONTENT SHELL */}
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>

          <SearchPalette />
        </Providers>
      </body>
    </html >
  );
}
