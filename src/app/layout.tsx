import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "smartlegal.id - Premium Legal Document Templates",
  description: "Unduh dokumen legal dan perjanjian bisnis berkualitas tinggi secara instan dan aman menggunakan Midtrans Snap.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900 font-sans">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="/smartlegal-logo.png"
                alt="smartlegal.id Logo"
                className="h-7 w-auto object-contain brightness-105"
              />
            </div>
            <nav className="flex space-x-6 text-sm font-medium text-slate-600">
              <a href="/" className="hover:text-red-500 transition-colors">Unduh Template</a>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex flex-col">{children}</main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-slate-50 py-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} smartlegal.id. Hak Cipta Dilindungi Undang-Undang.</p>
          {/* <p className="mt-1 text-slate-400">Simulasi Sistem Pembayaran Legal Berbasis Midtrans Snap Sandbox</p> */}
        </footer>

        {/* Midtrans Snap Script Loader */}
        <Script
          src={
            process.env.MIDTRANS_IS_PRODUCTION === 'true'
              ? 'https://app.midtrans.com/snap/snap.js'
              : 'https://app.sandbox.midtrans.com/snap/snap.js'
          }
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-mockkey'}
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
