"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import {
  type ApplyFormState,
  submitTourApplication,
} from "./actions";

const REGION_OPTIONS = [
  "부산",
  "대구",
  "대전",
  "인천",
  "수원",
  "광주",
  "울산",
  "창원",
  "기타",
] as const;

const STROKE_OPTIONS = ["자유형", "배영", "접영", "평영"] as const;

const initialApplyFormState: ApplyFormState = {
  status: "idle",
  message: "",
};

const CLASS_FEATURES = [
  "물의 저항을 줄여 더 멀리 나가는 방법",
  "수중 촬영으로 내 동작을 직접 확인",
  "코치의 디테일한 영상 피드백",
];

const RESERVATION_BENEFITS = [
  "해당 지역 특강 일정 가장 먼저 안내",
  "우선 예약 기회 제공",
  "우선 예약 10,000원 할인 혜택 제공",
];

const APPLICANT_TYPES = [
  "자유형 50m만 가도 숨이 차는 분",
  "몇 년을 배워도 속도가 안 나는 분",
  "내 수영 동작을 영상으로 제대로 보고 싶은 분",
  "힘이 아니라 저항을 줄여 편하게 수영하고 싶은 분",
];

export default function TourPage() {
  const formSectionRef = useRef<HTMLDivElement | null>(null);

  const [selectedRegion, setSelectedRegion] =
    useState<(typeof REGION_OPTIONS)[number]>("부산");
  const [customRegion, setCustomRegion] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [selectedStroke, setSelectedStroke] =
    useState<(typeof STROKE_OPTIONS)[number]>("자유형");
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [formState, formAction, isPending] = useActionState(
    submitTourApplication,
    initialApplyFormState
  );

  const regionValue = useMemo(() => {
    if (selectedRegion === "기타") {
      return customRegion.trim();
    }

    return selectedRegion;
  }, [customRegion, selectedRegion]);

  const handleRegionSelect = (region: (typeof REGION_OPTIONS)[number]) => {
    setSelectedRegion(region);
    console.log("[TourPage] Region selected", { region });

    window.setTimeout(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  useEffect(() => {
    if (formState.status === "success") {
      setName("");
      setContact("");
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
    isPending || !name.trim() || !contact.trim() || !regionValue;

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
          padding: "16px 14px 40px",
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
            <span
              style={{
                display: "inline-flex",
                padding: "8px 12px",
                borderRadius: 999,
                backgroundColor: "#dbeafe",
                color: "#1d4ed8",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              전국 지역 수요 조사
            </span>

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginTop: 12,
              }}
            >
              <SummaryChip label="서울 서초에서 시작" />
              <SummaryChip label="저항을 줄이는 특강" />
              <SummaryChip label="영상 피드백 제공" />
            </div>

            <h1
              style={{
                marginTop: 18,
                marginBottom: 14,
                fontSize: 28,
                lineHeight: 1.25,
                letterSpacing: "-0.03em",
              }}
            >
              스윔잇 전국 특강 신청
            </h1>

            <div style={{ display: "grid", gap: 16 }}>
              <p style={bodyCopyStyle}>
                서울 서초에서 시작한 스윔잇 수영 특강
                <br />
                현재 전국 수영인들로부터
                <br />
                <span
                  style={{
                    color: "#1d4ed8",
                    fontWeight: 800,
                  }}
                >
                  &quot;우리 지역에도 와주세요&quot;
                </span>{" "}
                요청을 계속 받고 있습니다.
              </p>

              <div style={infoCardStyle}>
                <p style={sectionTitleStyle}>스윔잇 특강은</p>
                <p style={bodyCopyStyle}>
                  힘으로 버티는 수영이 아니라
                </p>
                <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                  {CLASS_FEATURES.map((feature) => (
                    <BenefitLine key={feature} text={feature} />
                  ))}
                </div>
                <p style={{ ...bodyCopyStyle, marginTop: 14 }}>
                  을 통해{" "}
                  <span
                    style={{
                      color: "#1d4ed8",
                      fontWeight: 800,
                    }}
                  >
                    수영을 훨씬 빠르게 이해하도록 돕는 특강
                  </span>
                  입니다.
                </p>
              </div>

              <div style={highlightCardStyle}>
                <p style={sectionTitleStyle}>지금 예약해두시면</p>
                <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                  {RESERVATION_BENEFITS.map((benefit) => (
                    <BenefitLine key={benefit} text={benefit} />
                  ))}
                </div>
              </div>

              <p
                style={{
                  margin: 0,
                  color: "#1d4ed8",
                  fontSize: 15,
                  lineHeight: 1.7,
                  fontWeight: 700,
                }}
              >
                지금 바로 &quot;우리 지역 저항 특강 예약&quot; 버튼을 눌러서 신청해주세요
              </p>

              <div
                style={{
                  marginTop: 4,
                  borderRadius: 20,
                  padding: "16px 18px",
                  backgroundColor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#1e40af",
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  지금 선택된 지역
                </p>
                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#0f172a",
                    fontSize: 20,
                    fontWeight: 800,
                  }}
                >
                  {regionValue || "지역을 선택해주세요"}
                </p>
              </div>

              <div style={{ marginTop: 8 }}>
                <h2
                  style={{
                    margin: "0 0 14px",
                    fontSize: 18,
                    lineHeight: 1.5,
                  }}
                >
                  특강을 원하는 지역을 선택해주세요
                </h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 10,
                  }}
                >
                  {REGION_OPTIONS.map((region) => {
                    const isSelected = selectedRegion === region;

                    return (
                      <button
                        key={region}
                        type="button"
                        onClick={() => handleRegionSelect(region)}
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
                        {region}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
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
                    margin: "0 0 14px",
                    fontSize: 18,
                  }}
                >
                  신청 폼
                </h2>

                <form
                  action={formAction}
                  onSubmit={() => {
                    console.log("[TourPage] Submit started", {
                      region: regionValue,
                      hasName: Boolean(name.trim()),
                      hasContact: Boolean(contact.trim()),
                      stroke: selectedStroke,
                    });
                  }}
                >
                  <div style={{ display: "grid", gap: 14 }}>
                    <label style={{ display: "grid", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>지역</span>
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
                      <span style={helperTextStyle}>
                        선택한 지역으로 특강 일정 안내를 보내드립니다.
                      </span>
                    </label>

                    <label style={{ display: "grid", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>이름</span>
                      <input
                        name="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="이름을 입력해주세요"
                        style={inputStyle}
                      />
                    </label>

                    <label style={{ display: "grid", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>연락처</span>
                      <input
                        name="contact"
                        type="tel"
                        value={contact}
                        onChange={(event) => setContact(event.target.value)}
                        placeholder="연락 가능한 번호를 입력해주세요"
                        style={inputStyle}
                      />
                      <span style={helperTextStyle}>
                        입력하신 연락처로 특강 일정 안내를 보내드립니다.
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
                                backgroundColor: isSelected ? "#2563eb" : "#eff6ff",
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
                      width: "100%",
                      marginTop: 18,
                      border: "none",
                      borderRadius: 999,
                      backgroundColor: isSubmitDisabled ? "#93c5fd" : "#2563eb",
                      color: "#ffffff",
                      padding: "16px 18px",
                      fontSize: 16,
                      fontWeight: 800,
                      cursor: isSubmitDisabled ? "not-allowed" : "pointer",
                      boxShadow: isSubmitDisabled
                        ? "none"
                        : "0 14px 30px rgba(37, 99, 235, 0.22)",
                    }}
                  >
                    {isPending ? "예약 접수 중입니다..." : "우리 지역 저항 특강 예약"}
                  </button>
                </form>

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
                  신청은 결제가 아닙니다. 지역 수요 확인 후 특강 일정이 확정되면 먼저
                  연락드립니다.
                </p>
              </div>

              <div style={warningCardStyle}>
                <p style={{ ...sectionTitleStyle, color: "#b45309" }}>
                  참고해주세요
                </p>
                <p style={{ ...bodyCopyStyle, marginTop: 10 }}>
                  이 신청은 결제가 아닙니다.
                  <br />
                  30명 이상 모이게 되어
                  <br />
                  해당 지역 특강 일정이 확정되면
                </p>
                <p
                  style={{
                    margin: "12px 0 0",
                    color: "#92400e",
                    fontSize: 15,
                    lineHeight: 1.7,
                    fontWeight: 700,
                  }}
                >
                  예약 신청 순번대로 연락 후 결제가 진행합니다.
                </p>
              </div>

              <div style={infoCardStyle}>
                <p style={sectionTitleStyle}>특히 이런 분들이 신청하고 있습니다</p>
                <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                  {APPLICANT_TYPES.map((type) => (
                    <PlainLine key={type} text={type} />
                  ))}
                </div>
              </div>

              <div style={infoCardStyle}>
                <p style={sectionTitleStyle}>서울 특강 후기 요약</p>
                <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                  <QuoteLine text="아 이제 뭔가 알 것 같아요" />
                  <QuoteLine text="이제 자신감이 생겼어요" />
                  <QuoteLine text="하루만에 이렇게 달라지다니" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {isCompleteModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          style={modalOverlayStyle}
        >
          <div style={modalCardStyle}>
            <p
              style={{
                margin: 0,
                color: "#1d4ed8",
                fontSize: 15,
                fontWeight: 800,
              }}
            >
              예약이 완료되었습니다
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
              인원이 모집되면 가장 먼저 연락드리겠습니다. 감사합니다
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

function SummaryChip({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "8px 12px",
        borderRadius: 999,
        backgroundColor: "#f8fbff",
        border: "1px solid #dbeafe",
        color: "#1e3a8a",
        fontSize: 13,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
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
      }}
    >
      "{text}"
    </div>
  );
}

function PlainLine({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        color: "#334155",
        fontSize: 15,
        lineHeight: 1.6,
        fontWeight: 600,
      }}
    >
      <span style={{ color: "#2563eb", fontWeight: 900 }}>•</span>
      <span>{text}</span>
    </div>
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
};

const infoCardStyle = {
  borderRadius: 20,
  padding: "16px 16px 18px",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
};

const highlightCardStyle = {
  borderRadius: 20,
  padding: "16px 16px 18px",
  backgroundColor: "#eff6ff",
  border: "1px solid #bfdbfe",
};

const warningCardStyle = {
  borderRadius: 20,
  padding: "16px 16px 18px",
  backgroundColor: "#fff7ed",
  border: "1px solid #fed7aa",
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
