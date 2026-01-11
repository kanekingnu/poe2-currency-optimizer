import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POE2 Currency Trade Optimizer",
  description: "Optimize your Path of Exile 2 currency trading",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  );
}
