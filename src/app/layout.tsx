import type { Metadata } from "next";
import { Noto_Sans_TC, Fraunces } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { getMembership } from "@/lib/wedding";
import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "呱呱婚禮",
  description: "讓新人與家人共同完成婚禮規劃的溫暖工作台",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const current = await getMembership();

  return (
    <html
      lang="zh-Hant"
      className={`${notoSansTC.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-text">
        {current ? (
          <AppShell
            weddingName={current.wedding.name}
            weddingDate={current.wedding.weddingDate}
          >
            {children}
          </AppShell>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
