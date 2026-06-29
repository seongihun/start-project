import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerProps {
  initialSeconds: number;
  onTimeUp?: () => void;
}

export const useTimer = ({ initialSeconds, onTimeUp }: UseTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // onTimeUp 콜백이 바뀌어도 useEffect가 재실행되지 않도록 useRef로 관리 (최적화 꿀팁)
  const onTimeUpRef = useRef(onTimeUp);
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  const start = useCallback(() => setIsActive(true), []);
  const pause = useCallback(() => setIsActive(false), []);
  
  const reset = useCallback(() => {
    setIsActive(false);
    setTimeLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    // 활성화 상태가 아니면 아무것도 하지 않음
    if (!isActive) return;

    // 타이머가 시작될 때 딱 한 번만 셋팅됨!
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // 0초가 되면 타이머 종료
          setIsActive(false);
          if (timerRef.current) clearInterval(timerRef.current);
          onTimeUpRef.current?.(); // 안전하게 콜백 실행
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 클린업 함수: 일시정지 되거나 언마운트 될 때만 실행됨 (매초 실행 X)
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive]); // 💡 의존성 배열에 timeLeft가 사라졌습니다!

  return {
    timeLeft,
    isActive,
    start,
    pause,
    reset,
  };
};