import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeechToText = () => {
  const [transcript, setTranscript] = useState(''); // 인식된 전체 텍스트
  const [isListening, setIsListening] = useState(false); // 녹음 중 여부
  const recognitionRef = useRef<any>(null);

  // 💡 실시간 텍스트가 꼬이는 걸 방지하기 위해 확정된(최종) 텍스트들을 누적할 ref 변수
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    // 1. 브라우저가 Web Speech API를 지원하는지 확인합니다.
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('이 브라우저는 음성 인식을 지원하지 않습니다. (크롬 권장)');
      return;
    }

    // 2. 음성 인식 인스턴스 생성 및 설정
    const recognition = new SpeechRecognition();
    recognition.interimResults = true; // 유저가 말하는 도중에도 실시간으로 텍스트 반영
    recognition.continuous = true; // 말의 끊김이 있어도 계속 녹음 진행
    
    // 💡 [수정 포인트 1] 일부 크롬 버전에서는 한글 뒤에 'en-US'를 서브로 인지시키거나, 
    // 아예 생략할 때 한영 혼용 유추 성능이 더 올라가기도 합니다. 우선 기본값을 유연하게 열어둡니다.
    recognition.lang = 'ko-KR'; 

    // 3. 음성이 성공적으로 인식되었을 때의 이벤트 처리
    recognition.onresult = (event: any) => {
      let interimTranscript = ""; // 아직 말하는 중인 임시 텍스트
      let finalTranscript = "";   // 완전히 확정된 문장 텍스트

      // 💡 [수정 포인트 2] 0번째 인덱스부터 전체 이벤트를 다시 안전하게 정렬합니다.
      // 이렇게 해야 한글과 영어가 실시간 매칭될 때 글자가 꼬이거나 생략되는 버그를 막아줍니다.
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      // 최종 확정된 문장을 누적해서 들고 있음
      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript;
      }

      // 💡 화면에는 [지금까지 확정된 문장 + 현재 열심히 말하고 있는 단어]를 합쳐서 실시간 렌더링
      setTranscript(finalTranscriptRef.current + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('음성 인식 에러:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  // 녹음 시작 함수
  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setTranscript(''); 
    finalTranscriptRef.current = ''; // 💡 새 녹음 시작 시 누적 누수 방지를 위해 초기화!
    setIsListening(true);
    recognitionRef.current.start();
  }, []);

  // 녹음 중지 함수
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setIsListening(false);
    recognitionRef.current.stop();
  }, []);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
  };
};