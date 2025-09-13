import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "WealthWise Client Portal",
  description: "Secure client portal for viewing account balances and financial information",
  keywords: ["client portal", "balance tracking", "financial dashboard", "wealth management"],
  authors: [{ name: "WealthWise Marketing" }],
  openGraph: {
    title: "WealthWise Client Portal",
    description: "Access your account information and track your financial progress securely",
    type: "website",
    siteName: "WealthWise Client Portal",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#059669',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
