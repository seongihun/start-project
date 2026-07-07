// src/app/api/questions/route.ts
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// .env.local에 저장한 API 키로 Gemini 인스턴스 생성
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    // 프론트엔드에서 보낸 body 데이터(keyword)를 받아옵니다.
    const { keyword } = await request.json();

    if (!keyword || !keyword.trim()) {
      return NextResponse.json(
        { error: "키워드를 입력해주세요." },
        { status: 400 },
      );
    }

    // 💡 프롬프트를 JSON 포맷 전용으로 심플하고 확실하게 대수술합니다!
    const prompt = `
      너는 기술 면접에서 지원자를 날카롭게 압박하는 5년 차 실무 프론트엔드 개발자 면접관이야.
      지원자가 제출한 기술 키워드 [${keyword}]에 대해, 면접에서 나올 법한 깊이 있는 꼬리 질문을 딱 3개만 뽑아줘.
      
      [출력 규칙]
      - 반드시 다른 텍스트(인사말, 설명 등) 없이 딱 문자열로 이루어진 JSON 배열 형식으로만 응답해줘.
      - 예시: ["질문 1", "질문 2", "질문 3"]
    `;

    // Gemini 2.5 Flash 모델 호출
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }, // 완벽한 JSON 응답 보장
    });

    const text = response.text || "[]";

    // 💡 [핵심 교체] Gemini가 준 JSON 텍스트 문자열 포장지를 뜯어서 진짜 JS 배열로 변환합니다!
    // 예: '["질문1", "질문2", "질문3"]' -> ["질문1", "질문2", "질문3"]
    const questions = JSON.parse(text);

    // 프론트엔드로 진짜 배열 데이터 반환
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Gemini API 호출 에러:", error);
    return NextResponse.json(
      { error: "AI 면접관이 질문을 생성하는 데 실패했습니다." },
      { status: 500 },
    );
  }
}