import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "스윔잇 전국투어 | 우리 지역 특강 요청",
  description:
    "다음 스윔잇은 어디로 갈까요? 전국 지역 수요를 모아 특강 개설을 준비합니다.",
  icons: {
    icon: "/icon.svg",
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body
        suppressHydrationWarning
        style={{
          margin: 0,
          fontFamily:
            "Pretendard, Apple SD Gothic Neo, Noto Sans KR, sans-serif",
          background:
            "linear-gradient(180deg, #f5faff 0%, #eef6ff 45%, #ffffff 100%)",
          color: "#0f172a",
        }}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
