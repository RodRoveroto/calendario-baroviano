import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calendario Baroviano",
  description: "Temos tanta coisa pra fazer... melhor se programar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
