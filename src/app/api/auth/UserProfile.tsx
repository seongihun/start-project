
"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function UserProfile() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex justify-end mb-6">
        <p className="text-xs text-gray-400 bg-white py-2 px-4 rounded-full border shadow-sm">
          계정 확인 중... 🔄
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-end mb-6">
      {session ? (
        // 🔓 로그인 성공 상태
        <div className="flex items-center gap-3 bg-white p-1.5 pr-4 rounded-full shadow-sm border border-gray-100">
          {session.user?.image && (
            <img 
              src={session.user.image} 
              alt="프로필" 
              className="w-8 h-8 rounded-full border border-gray-200" 
            />
          )}
          <div className="text-left">
            <p className="text-xs font-bold text-gray-800">{session.user?.name}님</p>
            <button 
              onClick={() => signOut()} 
              className="text-[10px] text-red-500 hover:underline block font-medium"
            >
              로그아웃
            </button>
          </div>
        </div>
      ) : (
        // 🔒 로그아웃 상태
        <button
          onClick={() => signIn("google")}
          className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-xs flex items-center gap-2 transition-all"
        >
          <img src="https://authjs.dev/img/providers/google.svg" alt="G" className="w-4 h-4" />
          구글로 로그인하기
        </button>
      )}
    </div>
  );
}