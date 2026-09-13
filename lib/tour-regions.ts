/**
 * 전국투어 지역 상태 source of truth (tour 앱 내부).
 *
 * 메인 사이트(https://swimit.vercel.app/)에는 현재 공개된
 * "활성 일정 API"가 없어 안전하게 자동 동기화할 수 없습니다.
 * 메인 예약 로직을 건드리지 않기 위해,
 * 운영 중인 지역은 아래 목록으로 관리합니다.
 *
 * 나중에 메인 사이트에서 공개 read-only endpoint가 생기면
 * ACTIVE_REGION_NAMES만 교체하거나 fetch로 덮어쓰면 됩니다.
 */
export const MAIN_SITE_URL = "https://swimit.vercel.app/";

/** 현재 특강이 실제로 열려 있는 지역 (수요조사 대상 아님) */
export const ACTIVE_REGION_NAMES = ["부산"] as const;

export const REQUESTABLE_REGION_NAMES = [
  "대구",
  "대전",
  "인천",
  "수원",
  "광주",
  "울산",
  "창원",
  "기타",
] as const;

export type ActiveRegionName = (typeof ACTIVE_REGION_NAMES)[number];
export type RequestableRegionName = (typeof REQUESTABLE_REGION_NAMES)[number];
export type TourRegionName = ActiveRegionName | RequestableRegionName;

export type TourRegionStatus = "active" | "requestable";

export type TourRegionOption = {
  name: TourRegionName;
  status: TourRegionStatus;
};

export const TOUR_REGION_OPTIONS: TourRegionOption[] = [
  ...ACTIVE_REGION_NAMES.map((name) => ({
    name,
    status: "active" as const,
  })),
  ...REQUESTABLE_REGION_NAMES.map((name) => ({
    name,
    status: "requestable" as const,
  })),
];

export function isActiveRegion(region: string): boolean {
  return (ACTIVE_REGION_NAMES as readonly string[]).includes(region);
}

export function getRegionStatus(region: string): TourRegionStatus {
  return isActiveRegion(region) ? "active" : "requestable";
}
