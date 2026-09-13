"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import {
  type ApplyFormState,
  submitTourApplication,
} from "./actions";
import {
  MAIN_SITE_URL,
  TOUR_REGION_OPTIONS,
  getRegionStatus,
  type TourRegionName,
} from "../../lib/tour-regions";

const STROKE_OPTIONS = ["자유형", "배영", "평영", "접영"] as const;

const initialApplyFormState: ApplyFormState = {
  status: "idle",
  message: "",
};

const CLASS_FEATURES = [
  "물의 저항을 줄여 더 편하게 나가는 방법",
  "수중 촬영으로 내 자세를 직접 확인",
  "코치의 디테일한 영상 피드백",
  "수업 이후 혼자 연습할 방향까지 제시",
];

const REQUESTER_BENEFITS = [
  "일반 공개 전 우선 안내",
  "우선 신청 기회",
  "10,000원 할인 혜택",
];

const PROCESS_STEPS = [
  "지역 요청",
  "개설 검토",
  "일정 확정",
  "요청자 우선 안내",
  "신청 및 결제",
  "예약 확정",
];

const APPLICANT_TYPES = [
  "자유형 50m만 가도 숨이 차는 분",
  "몇 년을 배워도 속도가 잘 늘지 않는 분",
  "내 수영을 수중 영상으로 제대로 확인하고 싶은 분",
  "힘보다 저항을 줄여 편하게 수영하고 싶은 분",
];

const REVIEW_QUOTES = [
  "아, 이제 뭔가 알 것 같아요.",
  "이제 자신감이 생겼어요.",
  "하루 만에 이렇게 달라질 줄 몰랐어요.",
];

const DEFAULT_REQUESTABLE_REGION: TourRegionName = "대구";

export default function TourPage() {
  const formSectionRef = useRef<HTMLDivElement | null>(null);
  const regionSectionRef = useRef<HTMLDivElement | null>(null);

  const [selectedRegion, setSelectedRegion] = useState<TourRegionName>(
    DEFAULT_REQUESTABLE_REGION
  );
  const [customRegion, setCustomRegion] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [selectedStroke, setSelectedStroke] =
    useState<(typeof STROKE_OPTIONS)[number]>("자유형");
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [formState, formAction, isPending] = useActionState(
    submitTourApplication,
    initialApplyFormState
  );

  const selectedStatus = getRegionStatus(selectedRegion);
  const isActiveSelected = selectedStatus === "active";

  const regionValue = useMemo(() => {
    if (selectedRegion === "기타") {
      return customRegion.trim();
    }

    return selectedRegion;
  }, [customRegion, selectedRegion]);

  const scrollToForm = () => {
    console.log("[TourPage] Scroll to form section");
    window.setTimeout(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const scrollToRegionSection = () => {
    console.log("[TourPage] Scroll to region section");
    window.setTimeout(() => {
      regionSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const handleHeroCtaClick = () => {
    console.log("[TourPage] Hero CTA clicked");
    scrollToForm();
  };

  const handleFinalCtaClick = () => {
    console.log("[TourPage] Final CTA clicked");
    scrollToForm();
  };

  const handleRegionSelect = (region: TourRegionName) => {
    setSelectedRegion(region);
    const status = getRegionStatus(region);
    console.log("[TourPage] Region selected", { region, status });

    if (status === "active") {
      window.setTimeout(() => {
        regionSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 50);
      return;
    }

    scrollToForm();
  };

  useEffect(() => {
    if (formState.status === "success") {
      setName("");
      setContact("");
      setEmail("");
      setSelectedStroke("자유형");
      setIsCompleteModalOpen(true);
      if (selectedRegion === "기타") {
        setCustomRegion("");
      }

      console.log("[TourPage] Submit success", { region: regionValue });
    }

    if (formState.status === "error" && formState.message) {
      console.error("[TourPage] Submit failed", {
        region: regionValue,
        error: formState.message,
      });
    }
  }, [formState.message, formState.status, regionValue, selectedRegion]);

  const isSubmitDisabled =
    isPending ||
    isActiveSelected ||
    !name.trim() ||
    !contact.trim() ||
    !regionValue;

  const messageColor =
    formState.status === "success"
      ? "#166534"
      : formState.status === "error"
        ? "#b91c1c"
        : "#334155";

  return (
    <>
      <main
        style={{
          minHeight: "100vh",
          padding: "16px 14px 48px",
          boxSizing: "border-box",
        }}
      >
        <section
          style={{
            maxWidth: 560,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 28,
              padding: 20,
              boxShadow: "0 24px 80px rgba(37, 99, 235, 0.12)",
              border: "1px solid rgba(59, 130, 246, 0.14)",
            }}
          >
            <div style={{ display: "grid", gap: 28 }}>
              {/* 1. HERO */}
              <section>
                <span
                  style={{
                    display: "inline-flex",
                    padding: "8px 12px",
                    borderRadius: 999,
                    backgroundColor: "#dbeafe",
                    color: "#1d4ed8",
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.02em",
                  }}
                >
                  SWIMIT TOUR · 전국 지역 수요 조사
                </span>

                <h1
                  style={{
                    marginTop: 16,
                    marginBottom: 14,
                    fontSize: 28,
                    lineHeight: 1.3,
                    letterSpacing: "-0.03em",
                    wordBreak: "keep-all",
                  }}
                >
                  다음 스윔잇은
                  <br />
                  어디로 갈까요?
                </h1>

                <p style={bodyCopyStyle}>
                  서울에서 시작한 스윔잇 저항 특강이
                  <br />
                  이제 전국의 수영인들을 만나러 갑니다.
                </p>

                <p style={{ ...bodyCopyStyle, marginTop: 12 }}>
                  원하는 지역과 영법을 남겨주세요.
                  <br />
                  요청이 많이 모인 지역부터
                  <br />
                  스윔잇이 직접 찾아갑니다.
                </p>

                <p
                  style={{
                    margin: "16px 0 0",
                    color: "#1d4ed8",
                    fontSize: 17,
                    lineHeight: 1.6,
                    fontWeight: 800,
                    wordBreak: "keep-all",
                  }}
                >
                  &quot;우리 지역에도 와주세요.&quot;
                </p>

                <button
                  type="button"
                  onClick={handleHeroCtaClick}
                  style={primaryButtonStyle}
                >
                  우리 지역 특강 요청하기
                </button>

                <p
                  style={{
                    margin: "12px 0 0",
                    color: "#64748b",
                    fontSize: 13,
                    lineHeight: 1.7,
                    wordBreak: "keep-all",
                  }}
                >
                  요청은 예약이나 결제가 아닙니다.
                  <br />
                  일정이 확정되면 가장 먼저 안내드립니다.
                </p>
              </section>

              {/* 2. 왜 스윔잇인가요? */}
              <section style={softSectionStyle}>
                <h2 style={sectionTitleStyle}>왜 스윔잇인가요?</h2>
                <p style={{ ...bodyCopyStyle, marginTop: 10 }}>
                  힘으로 버티며 많이 수영하는 수업이 아닙니다.
                </p>
                <p style={{ ...bodyCopyStyle, marginTop: 10 }}>
                  내가 왜 힘든지,
                  <br />
                  어디에서 저항이 생기는지 직접 확인하고
                  <br />
                  바꾸는 수업입니다.
                </p>

                <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                  {CLASS_FEATURES.map((feature) => (
                    <BenefitLine key={feature} text={feature} />
                  ))}
                </div>

                <p
                  style={{
                    margin: "16px 0 0",
                    color: "#1d4ed8",
                    fontSize: 15,
                    lineHeight: 1.7,
                    fontWeight: 700,
                    wordBreak: "keep-all",
                  }}
                >
                  &quot;열심히 하는데 왜 안 늘지?&quot;
                  <br />
                  그 이유를 찾는 것이 스윔잇 특강의 시작입니다.
                </p>
              </section>

              {/* 3. 요청자 혜택 */}
              <section style={highlightSectionStyle}>
                <h2 style={sectionTitleStyle}>전국투어 요청자 혜택</h2>
                <p style={{ ...bodyCopyStyle, marginTop: 10 }}>
                  지역 특강을 미리 요청해주신 분께는
                  <br />
                  해당 지역 일정이 확정되었을 때
                  <br />
                  가장 먼저 안내드립니다.
                </p>
                <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                  {REQUESTER_BENEFITS.map((benefit) => (
                    <BenefitLine key={benefit} text={benefit} />
                  ))}
                </div>
              </section>

              {/* 4. 지역 선택 */}
              <section ref={regionSectionRef}>
                <h2
                  style={{
                    ...sectionTitleStyle,
                    fontSize: 20,
                    wordBreak: "keep-all",
                  }}
                >
                  우리 지역에도 스윔잇을 불러주세요
                </h2>
                <p style={{ ...bodyCopyStyle, marginTop: 8 }}>
                  원하는 지역을 선택해 한 표를 남겨주세요.
                  <br />
                  지역별 요청 현황을 바탕으로 다음 특강 일정을 준비합니다.
                </p>

                <p
                  style={{
                    margin: "18px 0 10px",
                    color: "#334155",
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  현재 특강 운영중
                </p>
                <div style={{ display: "grid", gap: 10 }}>
                  {TOUR_REGION_OPTIONS.filter(
                    (region) => region.status === "active"
                  ).map((region) => {
                    const isSelected = selectedRegion === region.name;

                    return (
                      <button
                        key={region.name}
                        type="button"
                        onClick={() => handleRegionSelect(region.name)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: 6,
                          border: isSelected
                            ? "1.5px solid #2563eb"
                            : "1px solid #bfdbfe",
                          backgroundColor: isSelected ? "#eff6ff" : "#f8fbff",
                          color: "#0f172a",
                          borderRadius: 18,
                          padding: "14px 16px",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 16,
                            fontWeight: 800,
                          }}
                        >
                          {region.name}
                        </span>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            color: "#166534",
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 999,
                              backgroundColor: "#22c55e",
                              display: "inline-block",
                            }}
                          />
                          현재 특강 운영중
                        </span>
                      </button>
                    );
                  })}
                </div>

                {isActiveSelected ? (
                  <div
                    style={{
                      marginTop: 12,
                      borderRadius: 18,
                      padding: "16px 16px 18px",
                      backgroundColor: "#ecfdf5",
                      border: "1px solid #a7f3d0",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        color: "#065f46",
                        fontSize: 15,
                        lineHeight: 1.7,
                        fontWeight: 700,
                        wordBreak: "keep-all",
                      }}
                    >
                      부산은 현재 스윔잇 특강이 열려 있습니다 🎉
                      <br />
                      현재 일정을 확인하고 바로 신청하실 수 있어요.
                    </p>
                    <a
                      href={MAIN_SITE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        console.log("[TourPage] Open Busan schedule link", {
                          url: MAIN_SITE_URL,
                        });
                      }}
                      style={{
                        ...primaryButtonStyle,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textDecoration: "none",
                        marginTop: 14,
                        boxSizing: "border-box",
                      }}
                    >
                      부산 특강 일정 보기 →
                    </a>
                  </div>
                ) : null}

                <p
                  style={{
                    margin: "20px 0 10px",
                    color: "#334155",
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  전국투어 요청 가능
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 10,
                  }}
                >
                  {TOUR_REGION_OPTIONS.filter(
                    (region) => region.status === "requestable"
                  ).map((region) => {
                    const isSelected = selectedRegion === region.name;

                    return (
                      <button
                        key={region.name}
                        type="button"
                        onClick={() => handleRegionSelect(region.name)}
                        style={{
                          border: isSelected
                            ? "1px solid #2563eb"
                            : "1px solid #bfdbfe",
                          backgroundColor: isSelected ? "#2563eb" : "#eff6ff",
                          color: isSelected ? "#ffffff" : "#1e3a8a",
                          borderRadius: 999,
                          padding: "14px 12px",
                          fontSize: 15,
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {region.name}
                      </button>
                    );
                  })}
                </div>

                {!isActiveSelected ? (
                  <div
                    style={{
                      marginTop: 14,
                      borderRadius: 16,
                      padding: "12px 14px",
                      backgroundColor: "#eff6ff",
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        color: "#1e40af",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      선택한 지역
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        color: "#0f172a",
                        fontSize: 18,
                        fontWeight: 800,
                      }}
                    >
                      {regionValue || "지역을 선택해주세요"}
                    </p>
                  </div>
                ) : null}
              </section>

              {/* 5. 신청 폼 */}
              <section
                ref={formSectionRef}
                style={{
                  padding: 20,
                  borderRadius: 24,
                  backgroundColor: "#f8fbff",
                  border: "1px solid #dbeafe",
                }}
              >
                <h2
                  style={{
                    margin: "0 0 6px",
                    fontSize: 18,
                  }}
                >
                  전국투어 요청하기
                </h2>
                <p
                  style={{
                    margin: "0 0 14px",
                    color: "#64748b",
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  {isActiveSelected
                    ? "부산은 아래에서 일정을 바로 확인해주세요."
                    : "지역 · 이름 · 연락처 · 영법을 남겨주세요."}
                </p>

                {isActiveSelected ? (
                  <div
                    style={{
                      borderRadius: 16,
                      padding: "14px 16px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #dbeafe",
                    }}
                  >
                    <p style={{ ...bodyCopyStyle, fontWeight: 600 }}>
                      부산은 수요조사 대상이 아닙니다.
                      <br />
                      메인 사이트에서 현재 특강 일정을 확인해주세요.
                    </p>
                    <a
                      href={MAIN_SITE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        ...primaryButtonStyle,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textDecoration: "none",
                        marginTop: 12,
                        boxSizing: "border-box",
                      }}
                    >
                      부산 특강 일정 보기 →
                    </a>
                    <button
                      type="button"
                      onClick={scrollToRegionSection}
                      style={{
                        width: "100%",
                        marginTop: 10,
                        border: "1px solid #bfdbfe",
                        borderRadius: 999,
                        backgroundColor: "#ffffff",
                        color: "#1e3a8a",
                        padding: "12px 16px",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      다른 지역 요청하기
                    </button>
                  </div>
                ) : (
                  <form
                    action={formAction}
                    onSubmit={() => {
                      console.log("[TourPage] Submit started", {
                        region: regionValue,
                        hasName: Boolean(name.trim()),
                        hasContact: Boolean(contact.trim()),
                        hasEmail: Boolean(email.trim()),
                        stroke: selectedStroke,
                      });
                    }}
                  >
                    <div style={{ display: "grid", gap: 14 }}>
                      <label style={{ display: "grid", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>
                          지역 <RequiredMark />
                        </span>
                        {selectedRegion === "기타" ? (
                          <input
                            name="region"
                            value={customRegion}
                            onChange={(event) => {
                              setCustomRegion(event.target.value);
                            }}
                            placeholder="희망 지역을 직접 입력해주세요"
                            style={inputStyle}
                          />
                        ) : (
                          <input
                            name="region"
                            value={regionValue}
                            readOnly
                            style={inputStyle}
                          />
                        )}
                      </label>

                      <label style={{ display: "grid", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>
                          이름 <RequiredMark />
                        </span>
                        <input
                          name="name"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          placeholder="이름을 입력해주세요"
                          style={inputStyle}
                        />
                      </label>

                      <label style={{ display: "grid", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>
                          연락처 <RequiredMark />
                        </span>
                        <input
                          name="contact"
                          type="tel"
                          value={contact}
                          onChange={(event) => setContact(event.target.value)}
                          placeholder="연락 가능한 번호를 입력해주세요"
                          style={inputStyle}
                        />
                      </label>

                      <label style={{ display: "grid", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>
                          이메일
                        </span>
                        <input
                          name="email"
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="예시: swimit@example.com"
                          style={inputStyle}
                        />
                        <span
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 8,
                            padding: "12px 14px",
                            borderRadius: 16,
                            backgroundColor: "#eff6ff",
                            border: "1px solid #bfdbfe",
                            lineHeight: 1.6,
                          }}
                        >
                          <span
                            style={{
                              color: "#2563eb",
                              fontSize: 15,
                              fontWeight: 900,
                              lineHeight: 1.5,
                              flexShrink: 0,
                            }}
                          >
                            ※
                          </span>
                          <span style={{ display: "grid", gap: 2 }}>
                            <span
                              style={{
                                color: "#1d4ed8",
                                fontSize: 14,
                                fontWeight: 800,
                                wordBreak: "keep-all",
                              }}
                            >
                              특강 할인 + 수영 제품 할인 혜택
                            </span>
                            <span
                              style={{
                                color: "#0f172a",
                                fontSize: 14,
                                fontWeight: 700,
                                wordBreak: "keep-all",
                              }}
                            >
                              가장 먼저 받아보세요
                            </span>
                          </span>
                        </span>
                      </label>

                      <div style={{ display: "grid", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>
                          원하시는 영법
                        </span>
                        <input
                          type="hidden"
                          name="stroke"
                          value={selectedStroke}
                        />
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: 10,
                          }}
                        >
                          {STROKE_OPTIONS.map((stroke) => {
                            const isSelected = selectedStroke === stroke;

                            return (
                              <button
                                key={stroke}
                                type="button"
                                onClick={() => {
                                  setSelectedStroke(stroke);
                                  console.log("[TourPage] Stroke selected", {
                                    stroke,
                                  });
                                }}
                                style={{
                                  border: isSelected
                                    ? "1px solid #2563eb"
                                    : "1px solid #bfdbfe",
                                  backgroundColor: isSelected
                                    ? "#2563eb"
                                    : "#eff6ff",
                                  color: isSelected ? "#ffffff" : "#1e3a8a",
                                  borderRadius: 16,
                                  padding: "13px 12px",
                                  fontSize: 15,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  transition: "all 0.2s ease",
                                }}
                              >
                                {stroke}
                              </button>
                            );
                          })}
                        </div>
                        <span style={helperTextStyle}>
                          가장 배우고 싶은 영법을 선택해주세요.
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitDisabled}
                      style={{
                        ...primaryButtonStyle,
                        backgroundColor: isSubmitDisabled
                          ? "#93c5fd"
                          : "#2563eb",
                        cursor: isSubmitDisabled ? "not-allowed" : "pointer",
                        boxShadow: isSubmitDisabled
                          ? "none"
                          : "0 14px 30px rgba(37, 99, 235, 0.22)",
                      }}
                    >
                      {isPending
                        ? "요청 접수 중입니다..."
                        : "우리 지역 특강 요청하기"}
                    </button>
                  </form>
                )}

                {formState.status === "error" && formState.message ? (
                  <p
                    style={{
                      marginTop: 14,
                      marginBottom: 0,
                      color: messageColor,
                      fontSize: 14,
                      lineHeight: 1.6,
                      fontWeight: 500,
                    }}
                  >
                    {formState.message}
                  </p>
                ) : null}

                {!isActiveSelected ? (
                  <p
                    style={{
                      marginTop: 12,
                      marginBottom: 0,
                      color: "#1e3a8a",
                      backgroundColor: "#dbeafe",
                      border: "1px solid #bfdbfe",
                      borderRadius: 16,
                      padding: "12px 14px",
                      fontSize: 13,
                      lineHeight: 1.7,
                      fontWeight: 700,
                      wordBreak: "keep-all",
                    }}
                  >
                    요청은 예약이나 결제가 아닙니다.
                    <br />
                    지역별 요청 현황과 수영장·코치 일정을 확인한 뒤
                    <br />
                    특강 일정이 확정되면 먼저 연락드립니다.
                  </p>
                ) : null}
              </section>

              {/* 6. 진행 과정 */}
              <section style={softSectionStyle}>
                <h2 style={sectionTitleStyle}>요청 후 이렇게 진행됩니다</h2>
                <p style={{ ...bodyCopyStyle, marginTop: 10 }}>
                  지역별 요청이 충분히 모이면
                  <br />
                  수영장과 코치 일정을 확인해
                  <br />
                  특강 개설을 준비합니다.
                </p>

                <div
                  style={{
                    display: "grid",
                    gap: 8,
                    marginTop: 16,
                  }}
                >
                  {PROCESS_STEPS.map((step, index) => (
                    <div
                      key={step}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 999,
                          backgroundColor: "#2563eb",
                          color: "#ffffff",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </span>
                      <span
                        style={{
                          color: "#0f172a",
                          fontSize: 15,
                          fontWeight: 700,
                        }}
                      >
                        {step}
                      </span>
                      {index < PROCESS_STEPS.length - 1 ? (
                        <span
                          style={{
                            marginLeft: "auto",
                            color: "#93c5fd",
                            fontSize: 14,
                            fontWeight: 700,
                          }}
                          aria-hidden="true"
                        >
                          →
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>

              {/* 7. 이런 분들이 기다리고 있습니다 */}
              <section style={softSectionStyle}>
                <h2 style={sectionTitleStyle}>
                  이런 분들이 스윔잇을 기다리고 있습니다
                </h2>
                <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                  {APPLICANT_TYPES.map((type) => (
                    <div
                      key={type}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 16,
                        backgroundColor: "#f8fbff",
                        border: "1px solid #e2e8f0",
                        color: "#334155",
                        fontSize: 15,
                        lineHeight: 1.6,
                        fontWeight: 600,
                        wordBreak: "keep-all",
                      }}
                    >
                      • {type}
                    </div>
                  ))}
                </div>
              </section>

              {/* 8. 후기 */}
              <section style={softSectionStyle}>
                <h2 style={sectionTitleStyle}>
                  먼저 경험한 회원님들은 이렇게 말했습니다
                </h2>
                <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
                  {REVIEW_QUOTES.map((quote) => (
                    <QuoteLine key={quote} text={quote} />
                  ))}
                </div>
              </section>

              {/* 9. 최종 CTA */}
              <section
                style={{
                  borderRadius: 20,
                  padding: "20px 18px",
                  background:
                    "linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)",
                  border: "1px solid #bfdbfe",
                  textAlign: "center",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    color: "#0f172a",
                    fontSize: 20,
                    lineHeight: 1.45,
                    fontWeight: 800,
                    wordBreak: "keep-all",
                  }}
                >
                  다음 스윔잇은
                  <br />
                  당신의 지역일 수도 있습니다.
                </h2>
                <button
                  type="button"
                  onClick={handleFinalCtaClick}
                  style={{
                    ...primaryButtonStyle,
                    marginTop: 16,
                  }}
                >
                  우리 지역 특강 요청하기
                </button>
              </section>
            </div>
          </div>
        </section>
      </main>

      {isCompleteModalOpen ? (
        <div role="dialog" aria-modal="true" style={modalOverlayStyle}>
          <div style={modalCardStyle}>
            <p
              style={{
                margin: 0,
                color: "#1d4ed8",
                fontSize: 15,
                fontWeight: 800,
              }}
            >
              요청이 접수되었습니다
            </p>
            <p
              style={{
                margin: "12px 0 0",
                color: "#0f172a",
                fontSize: 16,
                lineHeight: 1.7,
                fontWeight: 600,
                wordBreak: "keep-all",
              }}
            >
              해당 지역 특강이 준비되면 가장 먼저 안내드리겠습니다.
              감사합니다.
            </p>
            <button
              type="button"
              onClick={() => setIsCompleteModalOpen(false)}
              style={{
                width: "100%",
                marginTop: 18,
                border: "none",
                borderRadius: 999,
                backgroundColor: "#2563eb",
                color: "#ffffff",
                padding: "14px 16px",
                fontSize: 15,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              확인
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function BenefitLine({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        color: "#0f172a",
        fontSize: 15,
        lineHeight: 1.6,
        fontWeight: 600,
        wordBreak: "keep-all",
      }}
    >
      <span style={{ color: "#2563eb", fontWeight: 900 }}>✔</span>
      <span>{text}</span>
    </div>
  );
}

function QuoteLine({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 16,
        backgroundColor: "#f8fbff",
        color: "#0f172a",
        fontSize: 15,
        lineHeight: 1.6,
        fontWeight: 600,
        wordBreak: "keep-all",
      }}
    >
      &quot;{text}&quot;
    </div>
  );
}

function RequiredMark() {
  return (
    <span
      style={{
        color: "#dc2626",
        fontWeight: 800,
      }}
    >
      *
    </span>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  borderRadius: 16,
  border: "1px solid #cbd5e1",
  backgroundColor: "#ffffff",
  padding: "14px 16px",
  fontSize: 15,
  outline: "none",
};

const helperTextStyle = {
  color: "#64748b",
  fontSize: 12,
  lineHeight: 1.5,
};

const bodyCopyStyle = {
  margin: 0,
  color: "#334155",
  lineHeight: 1.8,
  fontSize: 15,
  wordBreak: "keep-all" as const,
};

const sectionTitleStyle = {
  margin: 0,
  color: "#0f172a",
  fontSize: 17,
  fontWeight: 800,
  lineHeight: 1.5,
  wordBreak: "keep-all" as const,
};

const softSectionStyle = {
  borderRadius: 20,
  padding: "16px 16px 18px",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
};

const highlightSectionStyle = {
  borderRadius: 20,
  padding: "16px 16px 18px",
  backgroundColor: "#eff6ff",
  border: "1px solid #bfdbfe",
};

const primaryButtonStyle = {
  width: "100%",
  marginTop: 18,
  border: "none",
  borderRadius: 999,
  backgroundColor: "#2563eb",
  color: "#ffffff",
  padding: "16px 18px",
  fontSize: 16,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 14px 30px rgba(37, 99, 235, 0.22)",
};

const modalOverlayStyle = {
  position: "fixed" as const,
  inset: 0,
  backgroundColor: "rgba(15, 23, 42, 0.54)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 1000,
};

const modalCardStyle = {
  width: "100%",
  maxWidth: 360,
  borderRadius: 24,
  backgroundColor: "#ffffff",
  padding: 20,
  boxShadow: "0 24px 60px rgba(15, 23, 42, 0.24)",
};
