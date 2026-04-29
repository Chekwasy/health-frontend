import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "react-phone-input-2/lib/style.css";
import Providers from "@/app/providers"; 
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
  title: "HealthCare - Your Health, Our Priority",
  description: "@chekwasy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* ✅ FIXED */}
        <Providers>{children}</Providers>

        {/* Toast stays here (this is fine) */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#020617",
              color: "#e2e8f0",
              border: "1px solid #1e293b",
              padding: "12px 16px",
              borderRadius: "10px",
            },
          }}
        />
      </body>
    </html>
  );
}