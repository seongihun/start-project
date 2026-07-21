"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        {/* 로고 영역 */}
        <Link href="/" className="text-xl font-bold text-indigo-600">
          🎯 꼬리질문 AI
        </Link>

        {/* 우측 내비게이션 영역 */}
        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <div className="h-8 w-20 animate-pulse rounded-lg bg-gray-100" />
          ) : session ? (
            /* 로그인 상태 */
            <div className="flex items-center gap-3">
              <Link
                href="/mypage"
                className="flex items-center gap-2 rounded-full border border-gray-200 p-1 pr-3 transition-colors hover:bg-gray-50"
              >
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="프로필"
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                    {session.user?.name?.[0] || "U"}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">마이페이지</span>
              </Link>

              <button
                onClick={() => signOut()}
                className="text-xs text-gray-500 underline hover:text-gray-800"
              >
                로그아웃
              </button>
            </div>
          ) : (
            /* 미로그인 상태 */
            <button
              onClick={() => signIn("google")}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
            >
              Google 로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
}