// src/app/api/feedback/route.ts
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// 기존 questions 라우터와 동일하게 초기화합니다.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const { question, answer } = await req.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: "질문과 답변 데이터가 누락되었습니다." },
        { status: 400 },
      );
    }

    // Gemini에게 엄격하고 구조화된 피드백 템플릿을 요구하는 프롬프트
    const prompt = `
      너는 10년 차 베테랑 시니어 프론트엔드 개발자이자 기술 면접관이야.
      지원자가 다음 [면접 질문]에 대해 [지원자 답변]을 고안했어.
      이 답변을 냉철하고 전문적으로 분석해서 피드백 리포트를 작성해 줘.

      [면접 질문]
      ${question}

      [지원자 답변]
      ${answer}

      지시사항:
      -[지원자 답변]은 브라우저 음성 인식(STT)으로 받아적은 것이라 "하이드레이션"이 "하이 드레이 션"으로 받아적히거나, 영어 단어 대소문자가 깨져있을 수 있어.
      -너는 문맥을 파악해서 유저가 어떤 프론트엔드 개념(예: Hydration, Closure 등)을 말하려고 했는지 똑똑하게 유추해서 피드백을 작성해 줘. 텍스트가 약간 깨져있더라도 말하려는 의도가 맞다면 정답으로 인정해 줘
      1. 잘한 점(good): 유저 답변에서 칭찬할 만한 핵심 키워드나 태도를 1~2문장으로 요약해 줘.
      2. 아쉬운 점(bad): 개념적 오류나 부족했던 설명, 기술적 보완점을 1~2문장으로 지적해 줘.
      3. 모범 답안(bestAnswer): 이 질문에 대해 시니어 개발자가 할 법한 가장 완벽하고 깔끔한 프론트엔드 모범 기술 답변(약 2~3문장)을 작성해 줘.

      최종 응답은 마크다운(Markdown)이나 줄바꿈 기호 없이, 반드시 아래 구조를 지킨 순수한 JSON 객체 하나만 반환해 줘. 다른 텍스트는 절대 포함하지 마.

      {
        "good": "여기에 잘한 점 작성",
        "bad": "여기에 아쉬운 점 작성",
        "bestAnswer": "여기에 모범 답안 작성"
      }
    `;

    // 구조화된 응답을 위해 gemini-2.5-flash 모델과 json 응답 설정을 씁니다.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;
    if (!responseText) throw new Error("AI 응답을 생성하지 못했습니다.");

    const feedbackData = JSON.parse(responseText);
    return NextResponse.json(feedbackData);
  } catch (error: any) {
    console.error("Feedback API Error:", error);
    return NextResponse.json(
      { error: "AI 피드백을 생성하는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
