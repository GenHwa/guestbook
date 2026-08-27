import type { Metadata } from "next";
import { AuthProvider } from "@/lib/useAuth";
import "./globals.css";

export const metadata: Metadata = {
  title: "방명록 · Guestbook",
  description: "오가는 이들이 한 마디씩 남기고 가는 곳",
};

/** 첫 페인트 전에 테마를 정해 깜빡임을 막는다 */
const THEME_INIT = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','light')}})()`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />

        {/* 본문 고딕: Pretendard (없으면 Apple SD Gothic Neo 로 폴백) */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />

        {/* 제목·글귀용 명조체 (없으면 AppleMyungjo / 바탕 으로 폴백) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* App Router 에서는 문서 전체에 적용되므로 pages 전용 규칙은 해당 없음 */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&display=swap"
        />
      </head>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
