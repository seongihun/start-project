/**
 * 숫자(초)를 받아 "MM:SS" 형식의 문자열로 변환합니다.
 * 예: 60 -> "01:00", 45 -> "00:45"
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  // 한 자리 숫자일 경우 앞에 0을 붙여줍니다 (padStart 활용)
  const formattedMins = String(mins).padStart(2, '0');
  const formattedSecs = String(secs).padStart(2, '0');
  
  return `${formattedMins}:${formattedSecs}`;
};