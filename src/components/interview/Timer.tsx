"use client";

import { useEffect } from "react";
import { useTimer } from "@/hooks/useTimer";
import { formatTime } from "@/utils/formatTime";

interface TimerProps {
  initialSeconds?: number;
  onTimeUp?: () => void;
  isListening: boolean;
}

export default function Timer({
  initialSeconds = 60,
  onTimeUp,
  isListening,
}: TimerProps) {
  const { timeLeft, isActive, start, pause, reset } = useTimer({
    initialSeconds,
    onTimeUp: () => {
      alert("⏱️ 1분이 지나 답변 시간이 마감되었습니다!");
    },
  });

  // 컴포넌트가 화면에 마운트되면 (즉, 질문이 나와서 타이머가 켜지면) 자동으로 시작
  useEffect(() => {
    if (isListening) {
      start();
    } else {
      pause();
    }
  }, [isListening, start, pause]);
  
  useEffect(() => {
    return () => reset();
  }, [reset]);

  // 시간이 얼마 안 남았을 때 (10초 이하) 글자 색을 빨간색으로 변경하여 긴장감 조성
  const isUrgent = timeLeft <= 10;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-xl border border-gray-200 shadow-inner">
      <div
        className={`text-4xl font-mono font-bold tracking-wider ${isUrgent ? "text-red-500 animate-pulse" : "text-gray-8xl"}`}
      >
        {formatTime(timeLeft)}
      </div>

      {/* 타이머 컨트롤 버튼들 */}
      <div className="flex gap-2 mt-3">
        {isActive ? (
          <button
            onClick={pause}
            className="px-3 py-1 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded transition-colors"
          >
            일시정지
          </button>
        ) : (
          <button
            onClick={start}
            disabled={timeLeft === 0}
            className="px-3 py-1 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded transition-colors disabled:bg-gray-300"
          >
            재개
          </button>
        )}
        <button
          onClick={reset}
          className="px-3 py-1 text-xs font-semibold bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
        >
          초기화
        </button>
      </div>
    </div>
  );
}
