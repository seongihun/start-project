"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";

interface InterviewRecord {
  id: string;
  keyword: string;
  question: string;
  answer: string;
  created_at: string;
}

export default function MyPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"records" | "profile">("records");
  const [records, setRecords] = useState<InterviewRecord[]>([]);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  useEffect(() => {
    // 세션 정보가 없으면 아무것도 안 함 (Effect 내부 동기 setState 제로)
    if (!session?.user) {
      return;
    }

    let ignore = false;

    const loadData = async () => {
      try {
        const res = await fetch("/api/records");
        const data = await res.json();

        if (!ignore) {
          if (res.ok) {
            setRecords(data.data || []);
          } else {
            console.error("데이터 불러오기 실패:", data.error);
          }
        }
      } catch (error) {
        if (!ignore) {
          console.error("네트워크 에러:", error);
        }
      } finally {
        if (!ignore) {
          setIsDataLoading(false);
        }
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, [session]);

  // 1. 전체 로딩 상태 파생 (NextAuth 세션이 로딩 중이거나, 로그인 후 DB 데이터를 가져오는 중일 때)
  const showSpinner = status === "loading" || (!!session && isDataLoading);

  if (showSpinner) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // 2. 미로그인 상태 처리
  if (!session) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium text-gray-600">
          🔒 로그인 후 이용 가능한 페이지입니다.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 w-full">
      {/* 상단 프로필 요약 카드 */}
      <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100 mb-8">
        {session.user?.image ? (
          <Image
            src={session.user.image}
            alt="프로필 이미지"
            width={64}
            height={64}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-xl">
            {session.user?.name?.[0] || "U"}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-900">{session.user?.name}님</h1>
          <p className="text-sm text-gray-500">{session.user?.email}</p>
        </div>
      </div>

      {/* 🚀 SPA 방식 탭 메뉴 바 */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("records")}
          className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === "records"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          📝 내 면접 노트 ({records.length})
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === "profile"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          👤 내 정보
        </button>
      </div>

      {/* 탭 1: 내 면접 노트 목록 */}
      {activeTab === "records" && (
        <div>
          {records.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
              아직 저장된 면접 기록이 없습니다. 질문을 생성하고 답변을 작성해 보세요!
            </div>
          ) : (
            <div className="grid gap-4">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                      #{record.keyword}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(record.created_at).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">
                    Q. {record.question}
                  </h3>
                  <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">A. </span>
                    {record.answer}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 탭 2: 계정 정보 */}
      {activeTab === "profile" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">계정 관리</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <p><strong className="text-gray-900">로그인 방식:</strong> Google 소셜 로그인</p>
            <p><strong className="text-gray-900">이메일:</strong> {session.user?.email}</p>
          </div>
        </div>
      )}
    </div>
  );
}