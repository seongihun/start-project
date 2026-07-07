// src/app/api/records/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { supabase } from "@/lib/supabase"; // 우리가 만든 Supabase 클라이언트

export async function POST(req: Request) {
  try {
    // 1. 현재 로그인한 유저의 세션 정보 서버에서 안전하게 가져오기
    const session = await getServerSession();
    
    // 💡 [초보 탈출 포인트] 로그인 안 한 유저가 야매(?)로 API를 호출하는 걸 차단합니다!
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "로그인이 필요한 서비스입니다." }, { status: 401 });
    }

    // 2. 프론트엔드가 보내준 면접 데이터 꺼내기
    const { keyword, question, answer } = await req.json();

    // 3. 🚀 대망의 Supabase DB에 INSERT(저장) 쿼리 날리기!
    const { data, error } = await supabase
      .from("interview_records") // 우리가 만든 테이블 이름
      .insert([
        {
          user_email: session.user.email, // 로그인한 유저의 이메일 고정!
          keyword,
          question,
          answer,
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("DB 저장 에러:", error);
    return NextResponse.json({ error: "데이터베이스 저장에 실패했습니다." }, { status: 500 });
  }
}