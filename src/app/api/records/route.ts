import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { supabase } from "@/lib/supabase";

// 1. POST (데이터 저장 API)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 💡 session과 session.user의 존재 여부를 가드로 확인해 줍니다.
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "로그인이 필요한 서비스입니다." }, { status: 401 });
    }

    const { keyword, question, answer } = await req.json();

    const { data, error } = await supabase
      .from("interview_records")
      .insert([
        {
          user_email: session.user.email, // 가드 덕분에 user.email이 string임이 보장됩니다.
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

// 2. GET (내 면접 기록 조회 API)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // 💡 여기서도 동일하게 user 존재 여부까지 꼼꼼히 체크!
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "로그인이 필요한 서비스입니다." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("interview_records")
      .select("*")
      .eq("user_email", session.user.email)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("DB 조회 에러:", error);
    return NextResponse.json({ error: "데이터베이스 조회에 실패했습니다." }, { status: 500 });
  }
}