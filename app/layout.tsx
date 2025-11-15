import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  title: "CoolGradient - Pro CSS Gradient Generator",
  description:
    "Create and export beautiful CSS gradients with filters and noise.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={
          robotoMono.variable + " min-h-screen bg-background antialiased"
        }
      >
        {children}
      </body>
    </html>
  );
}
