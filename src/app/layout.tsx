import type { Metadata } from "next";
import "./globals.css";
import FloatingProductPromo from "@/components/FloatingProductPromo";
import ResponsiveDock from "@/components/ResponsiveDock";

export const metadata: Metadata = {
  title: "SHOWDAY — 나에게 맞는 공연을 더 쉽게",
  description:
    "나에게 맞는 공연을 찾고, 공연 가는 하루까지 준비하는 AI 공연 플랫폼",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        {/* 폰트는 런타임에 브라우저가 로드합니다 (빌드타임 네트워크 의존 없음) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Gothic+A1:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-ink text-paper">
        {children}
        <FloatingProductPromo />
        <ResponsiveDock />
      </body>
    </html>
  );
}
