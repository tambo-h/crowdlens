import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "TaskStack | Unified Productivity OS",
  description: "An AI-powered workspace for deep work, habit tracking, and creative energy management.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
