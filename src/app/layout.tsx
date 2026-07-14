import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AppDiet — Seu parceiro de nutrição",
  description:
    "Acompanhe suas refeições, controle calorias e melhore sua adesão à dieta com ajuda da IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="pt-BR" className={`${plusJakartaSans.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col font-sans">{children}</body>
      </html>
    </AuthProvider>
  );
}