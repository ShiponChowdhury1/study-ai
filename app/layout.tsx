import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/redux/provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyAI Admin Panel",
  description: "Admin dashboard for StudyAI platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`} suppressHydrationWarning>
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
