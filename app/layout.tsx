import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "스윔잇 전국 특강 신청",
  description: "전국 지역 특강 수요를 빠르게 수집하는 스윔잇 특강 신청 페이지",
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
