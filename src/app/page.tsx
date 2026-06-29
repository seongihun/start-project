'use client';

import { useState } from 'react';
import Timer from '@/components/interview/Timer';
import { useSpeechToText } from '@/hooks/useSpeechToText';

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 🎙️ 음성 인식 훅 가져오기
  const { transcript, isListening, startListening, stopListening } = useSpeechToText();
  // 타이머를 화면에 띄울지 제어하는 상태
  const [showTimer, setShowTimer] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setIsLoading(true);
    setError('');
    setQuestions([]);
    setShowTimer(false); // 새로운 질문 뽑을 때 타이머 일단 숨김
    stopListening();     // 혹시 켜져있을 마이크 종료

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '문제가 발생했습니다.');

      setQuestions(data.questions);
      setShowTimer(true); // 질문이 정상적으로 나오면 타이머 표시 준비
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'AI 면접관을 깨우지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-gray-900">
      <div className="max-w-xl mx-auto">
        
        {/* 헤더 섹션 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-blue-6xl tracking-tight">
            🎯 꼬리 질문 메이커
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            기술 키워드를 입력하고 AI 질문에 실전처럼 말로 답변해 보세요!
          </p>
        </div>

        {/* 입력 폼 */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-4">
          <div>
            <label htmlFor="keyword" className="block text-sm font-semibold text-gray-7xl mb-2">
              면접 연습할 기술 키워드
            </label>
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
            className="w-full bg-blue-6xl hover:bg-blue-7xl text-white font-bold p-3.5 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? 'AI 면접관이 질문 고르는 중...' : '압박 질문 생성하기 🚀'}
          </button>
        </form>

        {/* 에러 메시지 */}
        {error && <div className="mt-6 p-4 bg-red-50 text-red-6xl rounded-lg text-sm font-medium">⚠️ {error}</div>}

        {/* 질문 결과 및 연습 세션 */}
        {questions.length > 0 && (
          <div className="mt-8 space-y-6">
            
            {/* 🕒 타이머 및 🎙️ 음성 인식 컨트롤러 */}
            {showTimer && (
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center space-y-4">
                <Timer initialSeconds={60} onTimeUp={stopListening} isListening={isListening} />
                
                <div className="flex justify-center gap-4">
                  {!isListening ? (
                    <button
                      onClick={startListening}
                      className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow transition-colors flex items-center gap-2"
                    >
                      <span className="w-3 h-3 bg-white rounded-full animate-ping"></span>
                      답변 시작 (녹음 켜기)
                    </button>
                  ) : (
                    <button
                      onClick={stopListening}
                      className="px-6 py-2.5 bg-gray-7xl hover:bg-gray-8xl text-white font-bold rounded-lg shadow transition-colors"
                    >
                      답변 종료 (녹음 끄기)
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 실시간 답변 기록창 */}
            {(transcript || isListening) && (
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-inner">
                <h3 className="text-sm font-bold text-blue-8xl mb-2 flex items-center gap-2">
                  🎙️ 실시간 나의 답변 기록 
                  {isListening && <span className="text-xs font-normal text-red-500 animate-pulse">(마이크 켜짐)</span>}
                </h3>
                <p className="text-gray-7xl font-medium leading-relaxed bg-white p-4 rounded-lg border border-blue-200 min-h-[80px] whitespace-pre-wrap">
                  {transcript || '아직 기록된 답변이 없습니다. 말씀해 주세요!'}
                </p>
              </div>
            )}

            {/* AI 면접관 질문 리스트 */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-8xl">🔥 AI 면접관의 꼬리 질문</h2>
              {questions.map((question, index) => (
                <div key={index} className="bg-white p-5 rounded-lg border-l-4 border-blue-500 shadow-sm border border-gray-100">
                  <div className="flex gap-3">
                    <span className="font-bold text-blue-5xl text-lg">Q{index + 1}.</span>
                    <p className="font-medium text-gray-8xl leading-relaxed">{question}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </main>
  );
}