import type { Metadata } from "next";
import { Micro_5 } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const micro = Micro_5({ subsets: ["latin"], weight: ["400"], display: "swap" });

export const metadata: Metadata = {
  title: "KodoMochi ",
  description: "Your virtual pet adventure awaits!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        <Script
          src='https://telegram.org/js/telegram-web-app/js'
          strategy='beforeInteractive'
        />
      </head>
      <body className={`${micro.className} flex justify-center bg-blue-50`}>
        {children}
      </body>
    </html>
  );
}
