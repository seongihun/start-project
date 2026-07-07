// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Timer from "@/components/interview/Timer";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import UserProfile from "./api/auth/UserProfile";

interface InterviewRecord {
  id: string;
  question: string;
  answer: string;
  date: string;
}

// 💡 AI 피드백을 담을 타입 정의
interface FeedbackResult {
  good: string;
  bad: string;
  bestAnswer: string;
}

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [records, setRecords] = useState<InterviewRecord[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // 💡 [2단계 고도화] AI 솔루션 관련 상태 추가
  const [feedbackLoadingId, setFeedbackLoadingId] = useState<string | null>(null); // 현재 로딩 중인 기록 카드 ID
  const [activeFeedback, setActiveFeedback] = useState<FeedbackResult | null>(null); // 모달에 띄울 피드백 내용
  const [selectedQuestionTitle, setSelectedQuestionTitle] = useState(""); // 모달에 띄울 질문 제목

  const { transcript, isListening, startListening, stopListening } = useSpeechToText();
  const [showTimer, setShowTimer] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setIsLoading(true);
    setError("");
    setQuestions([]);
    setShowTimer(false);
    setCurrentQuestionIndex(0);
    stopListening();

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "문제가 발생했습니다.");

      setQuestions(data.questions);
      setShowTimer(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "AI 면접관을 깨우지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("interview_records");
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error("기록을 불러오는 중 오류 발생:", e);
      }
    }
  }, []);

  const saveInterviewRecord = (currentQuestion: string, currentAnswer: string) => {
    if (!currentAnswer.trim()) {
      alert("기록된 답변이 없어서 저장하지 않았습니다.");
      return;
    }

    const newRecord: InterviewRecord = {
      id: crypto.randomUUID(),
      question: currentQuestion,
      answer: currentAnswer,
      date: new Date().toLocaleString("ko-KR"),
    };

    const updatedRecords = [newRecord, ...records];
    setRecords(updatedRecords);
    localStorage.setItem("interview_records", JSON.stringify(updatedRecords));
    alert("📝 답변이 성공적으로 저장되었습니다!");
  };

  const handleFinishAnswer = () => {
    stopListening();
    const currentQuestionText = questions[currentQuestionIndex];
    saveInterviewRecord(currentQuestionText, transcript);
  };

  // 💡 [2단계 고도화] AI 솔루션 요청 함수 구현
  const handleGetAISolution = async (record: InterviewRecord) => {
    setFeedbackLoadingId(record.id); // 해당 카드 로딩 돌리기
    setSelectedQuestionTitle(record.question);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: record.question,
          answer: record.answer,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "솔루션을 가져오지 못했습니다.");

      setActiveFeedback(data); // 성공 시 모달 오픈 상태 돌입
    } catch (err: any) {
      alert(err.message || "피드백 생성 중 에러 발생");
    } finally {
      setFeedbackLoadingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-gray-900 relative">
      <div className="max-w-xl mx-auto">
        <UserProfile/>
        {/* 헤더 섹션 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">🎯 꼬리 질문 메이커</h1>
          <p className="mt-2 text-sm text-gray-600">기술 키워드를 입력하고 AI 질문에 실전처럼 말로 답변해 보세요!</p>
        </div>

        {/* 입력 폼 */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-4">
          <div>
            <label htmlFor="keyword" className="block text-sm font-semibold text-gray-700 mb-2">면접 연습할 기술 키워드</label>
            <input
              id="keyword"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="예: 클로저, React 가상돔, Next.js Hydration"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !keyword.trim()}
            className="w-full bg-blue-600 hover:bg-blue-7xl text-white font-bold p-3.5 rounded-lg transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
          >
            {isLoading ? "AI 면접관이 질문 고르는 중..." : "압박 질문 생성하기 🚀"}
          </button>
        </form>

        {error && <div className="mt-6 p-4 bg-red-50 text-red-6xl rounded-lg text-sm font-medium">⚠️ {error}</div>}

        {/* 메인 세션 가동 */}
        {questions.length > 0 && (
          <div className="mt-8 space-y-6">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <label className="block text-xs font-bold text-gray-500 mb-2">🎯 연습할 질문 선택</label>
              <div className="flex gap-2">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setCurrentQuestionIndex(idx); stopListening(); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${currentQuestionIndex === idx ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    질문 {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {showTimer && (
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center space-y-4">
                <Timer initialSeconds={60} onTimeUp={handleFinishAnswer} isListening={isListening} />
                <div className="flex justify-center gap-4">
                  {!isListening ? (
                    <button onClick={startListening} className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow transition-colors flex items-center gap-2">
                      <span className="w-3 h-3 bg-white rounded-full animate-ping"></span>답변 시작 (녹음 켜기)
                    </button>
                  ) : (
                    <button onClick={handleFinishAnswer} className="px-6 py-2.5 bg-gray-700 hover:bg-gray-8xl text-white font-bold rounded-lg shadow transition-colors">답변 종료 및 저장 💾</button>
                  )}
                </div>
              </div>
            )}

            {(transcript || isListening) && (
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-inner">
                <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">🎙️ 실시간 나의 답변 기록 {isListening && <span className="text-xs font-normal text-red-500 animate-pulse">(마이크 켜짐)</span>}</h3>
                <p className="text-gray-700 font-medium leading-relaxed bg-white p-4 rounded-lg border border-blue-200 min-h-[80px] whitespace-pre-wrap">{transcript || "아직 기록된 답변이 없습니다. 말씀해 주세요!"}</p>
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-8xl">🔥 AI 면접관의 꼬리 질문</h2>
              {questions.map((question, index) => (
                <div key={index} className={`bg-white p-5 rounded-lg border-l-4 shadow-sm border transition-all ${currentQuestionIndex === index ? "border-blue-500 ring-2 ring-blue-100 bg-blue-50/30" : "border-gray-300 border-gray-100"}`}>
                  <div className="flex gap-3">
                    <span className={`font-bold text-lg ${currentQuestionIndex === index ? "text-blue-600" : "text-gray-400"}`}>Q{index + 1}.</span>
                    <p className="font-medium text-gray-8xl leading-relaxed">{question}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 📂 나의 면접 연습 기록 폴더 */}
        <div className="mt-12 p-6 bg-gray-100/70 rounded-2xl border border-gray-200 shadow-inner">
          <h2 className="text-lg font-bold text-gray-8xl mb-4 flex items-center gap-2">📂 나의 면접 연습 기록 ({records.length}개)</h2>
          {records.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">아직 저장된 답변이 없습니다. 첫 연습을 시작해 보세요!</p>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {records.map((record) => (
                <div key={record.id} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">기술 면접</span>
                    <span className="text-[11px] text-gray-400">{record.date}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-8xl">Q. {record.question}</p>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap">
                    <span className="font-semibold text-xs text-gray-400 block mb-1">[내 답변]</span>{record.answer}
                  </div>
                  
                  {/* 💡 버튼 상태에 로딩 스피너 작동 연동 */}
                  <button 
                    onClick={() => handleGetAISolution(record)}
                    disabled={feedbackLoadingId !== null}
                    className="w-full mt-2 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 disabled:bg-gray-200 disabled:text-gray-400 rounded-lg transition-colors border border-emerald-200 flex items-center justify-center gap-2"
                  >
                    {feedbackLoadingId === record.id ? (
                      <span className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
                    ) : "✨ 이 답변에 대한 AI 솔루션 받기"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 💡 [2단계 고도화 UI] AI 피드백 모달 창 (피드백이 활성화되면 팝업 형태로 등장) */}
      {activeFeedback && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 space-y-5 animate-slide-up">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-emerald-600 flex items-center gap-1.5">🔬 AI 면접관의 정밀 진단 레포트</h3>
              <button 
                onClick={() => setActiveFeedback(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >✕</button>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400">질문 항목</span>
              <p className="text-sm font-bold text-gray-8xl leading-relaxed">Q. {selectedQuestionTitle}</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <h4 className="text-xs font-black text-blue-7xl mb-1">👍 이런 점이 좋았어요</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{activeFeedback.good}</p>
              </div>

              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                <h4 className="text-xs font-black text-amber-7xl mb-1">⚠️ 이런 점은 아쉬워요</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{activeFeedback.bad}</p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <h4 className="text-xs font-black text-emerald-7xl mb-1">💡 시니어 개발자의 모범 답안 제안</h4>
                <p className="text-sm text-gray-8xl font-medium leading-relaxed bg-white p-3 rounded-lg border border-emerald-200/50">{activeFeedback.bestAnswer}</p>
              </div>
            </div>

            <button 
              onClick={() => setActiveFeedback(null)}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 rounded-xl text-sm transition-colors mt-2"
            >확인 완료</button>
          </div>
        </div>
      )}
    </main>
  );
}