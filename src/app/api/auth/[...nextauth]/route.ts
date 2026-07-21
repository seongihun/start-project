import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  // 1. 로그인 파트너로 '구글'을 등록합니다.
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  // 2. 보안을 위한 비밀키 세팅
  secret: process.env.NEXTAUTH_SECRET,

  // 3. (공부 포인트) 로그인 성공 시 유저 정보를 커스텀 가공하는 콜백 함수
  callbacks: {
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.sub; // 유저 고유 ID를 세션에 심어줍니다.
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
// Next.js가 GET 요청과 POST 요청 모두 이 핸들러로 처리하도록 내보냅니다.
export { handler as GET, handler as POST };
