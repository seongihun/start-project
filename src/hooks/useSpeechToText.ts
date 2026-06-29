import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeechToText = () => {
  const [transcript, setTranscript] = useState(''); // 인식된 전체 텍스트
  const [isListening, setIsListening] = useState(false); // 녹음 중 여부
  const recognitionRef = useRef<any>(null);

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
    recognition.lang = 'ko-KR'; // 한국어 설정
    recognition.continuous = true; // 말의 끊김이 있어도 계속 녹음 진행

    // 3. 음성이 성공적으로 인식되었을 때의 이벤트 처리
    recognition.onresult = (event: any) => {
      let speechToText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          speechToText += event.results[i][0].transcript + ' ';
        } else {
          speechToText += event.results[i][0].transcript;
        }
      }
      setTranscript(speechToText);
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
    setTranscript(''); // 새 녹음 시작 시 기존 텍스트 초기화
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