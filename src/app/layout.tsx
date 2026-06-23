import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Perfect Day",
  description: "Dein personalisierter Trainingsplan und Fortschritts-Tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark">
      <body className={`${inter.className} antialiased bg-zinc-950 text-zinc-50`}>
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
