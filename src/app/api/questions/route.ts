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

    const prompt = `
      너는 기술 면접에서 지원자를 날카롭게 압박하는 5년 차 실무 프론트엔드 개발자 면접관이야.
      지원자가 제출한 기술 키워드 [${keyword}]에 대해, 면접에서 나올 법한 꼬리 질문(깊이 있는 질문)을 딱 3개만 뽑아줘.
      
      [출력 규칙]
      1. 인사말, 서론, 결론은 모두 생략하고 오직 질문만 출력해줘.
      2. 질문 앞에 숫자(1., 2., 3.)나 기호는 붙이지 말아줘.
      3. 각 질문은 반드시 줄바꿈(\\n)으로만 구분해줘.
    `;

    // Gemini 2.5 Flash 모델 호출 (빠르고 가벼운 텍스트 생성용 모델)
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const text = response.text || "";

    // 받아온 텍스트 응답을 줄바꿈 기준으로 쪼개서 배열로 만듭니다.
    const questions = text
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .slice(0, 3); // 확실하게 3개만 커트

    // 프론트엔드로 배열 데이터 반환
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Gemini API 호출 에러:", error);
    return NextResponse.json(
      { error: "AI 면접관이 질문을 생성하는 데 실패했습니다." },
      { status: 500 },
    );
  }
}
