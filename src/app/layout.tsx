import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthContext from "./api/auth/AuthContext";
import Header from "@/components/common/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "🎯 AI 꼬리질문 메이커 | 실전 면접 트레이닝",
  description: "기술 키워드를 입력하고 AI 질문에 실전처럼 답변해 보세요!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <AuthContext>
          {/* 💡 상단 헤더 배치 */}
          <Header />
          {/* 💡 메인 컨텐츠 영역 */}
          <main className="flex-1">{children}</main>
        </AuthContext>
      </body>
    </html>
  );
}