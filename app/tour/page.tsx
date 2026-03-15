"use client";

import { FormEvent, useMemo, useRef, useState } from "react";

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

type SubmitState = "idle" | "loading" | "success" | "error";

export default function TourPage() {
  const formSectionRef = useRef<HTMLDivElement | null>(null);

  const [selectedRegion, setSelectedRegion] =
    useState<(typeof REGION_OPTIONS)[number]>("부산");
  const [customRegion, setCustomRegion] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  const regionValue = useMemo(() => {
    if (selectedRegion === "기타") {
      return customRegion.trim();
    }

    return selectedRegion;
  }, [customRegion, selectedRegion]);

  const handleRegionSelect = (region: (typeof REGION_OPTIONS)[number]) => {
    setSelectedRegion(region);
    setMessage("");
    console.log("[TourPage] Region selected", { region });

    window.setTimeout(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!regionValue) {
      setSubmitState("error");
      setMessage("지역을 입력해주세요.");
      console.warn("[TourPage] Submission blocked: region missing");
      return;
    }

    setSubmitState("loading");
    setMessage("신청 내용을 저장하고 있습니다.");
    console.log("[TourPage] Submit started", {
      region: regionValue,
      hasName: Boolean(name.trim()),
      hasContact: Boolean(contact.trim()),
    });

    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          contact,
          region: regionValue,
        }),
      });

      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || "신청 저장에 실패했습니다.");
      }

      setSubmitState("success");
      setMessage("신청이 완료되었습니다. 일정 안내 시 가장 먼저 알려드릴게요.");
      setName("");
      setContact("");
      if (selectedRegion === "기타") {
        setCustomRegion("");
      }
      console.log("[TourPage] Submit success", { region: regionValue });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "일시적인 오류가 발생했습니다. 다시 시도해주세요.";

      setSubmitState("error");
      setMessage(errorMessage);
      console.error("[TourPage] Submit failed", {
        region: regionValue,
        error: errorMessage,
      });
    }
  };

  const isSubmitDisabled =
    submitState === "loading" || !name.trim() || !contact.trim() || !regionValue;

  const messageColor =
    submitState === "success"
      ? "#166534"
      : submitState === "error"
        ? "#b91c1c"
        : "#334155";

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px 16px 48px",
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
            padding: 24,
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
              fontSize: 14,
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
              marginTop: 14,
            }}
          >
            <SummaryChip label="30명 이상 모이면 개설" />
            <SummaryChip label="결제 없는 신청 폼" />
            <SummaryChip label="모바일 1분 신청" />
          </div>

          <h1
            style={{
              marginTop: 18,
              marginBottom: 16,
              fontSize: 32,
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
            }}
          >
            스윔잇 전국 특강 신청
          </h1>

          <p
            style={{
              margin: 0,
              color: "#334155",
              lineHeight: 1.7,
              whiteSpace: "pre-line",
              fontSize: 16,
            }}
          >
            {"서울 서초 특강에 이어\n전국에서도 스윔잇 특강 요청을 받고 있습니다.\n\n신청자가 30명 이상 모이면\n해당 지역에서 특강을 개최합니다.\n\n먼저 신청하신 분들께\n특강 일정과 예약을 가장 먼저 안내드립니다.\n\n신청은 결제가 아니며\n특강 일정 확정 시 먼저 안내드립니다."}
          </p>

          <div
            style={{
              marginTop: 20,
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

          <div style={{ marginTop: 28 }}>
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
              marginTop: 28,
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

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gap: 14 }}>
                <label style={{ display: "grid", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>지역</span>
                  {selectedRegion === "기타" ? (
                    <input
                      value={customRegion}
                      onChange={(event) => {
                        setCustomRegion(event.target.value);
                      }}
                      placeholder="희망 지역을 직접 입력해주세요"
                      style={inputStyle}
                    />
                  ) : (
                    <input value={regionValue} readOnly style={inputStyle} />
                  )}
                  <span style={helperTextStyle}>
                    선택한 지역으로 특강 일정 안내를 보내드립니다.
                  </span>
                </label>

                <label style={{ display: "grid", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>이름</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="이름을 입력해주세요"
                    style={inputStyle}
                  />
                </label>

                <label style={{ display: "grid", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>연락처</span>
                  <input
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    placeholder="연락 가능한 번호를 입력해주세요"
                    style={inputStyle}
                  />
                  <span style={helperTextStyle}>
                    예: 010-1234-5678. 일정 안내 외의 용도로 사용하지 않습니다.
                  </span>
                </label>
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
                {submitState === "loading"
                  ? "신청 중입니다..."
                  : "신청하고 일정 안내받기"}
              </button>
            </form>

            {message ? (
              <p
                style={{
                  marginTop: 14,
                  marginBottom: 0,
                  color: messageColor,
                  fontSize: 14,
                  lineHeight: 1.6,
                  fontWeight: submitState === "success" ? 700 : 500,
                }}
              >
                {message}
              </p>
            ) : null}

            <p
              style={{
                marginTop: 12,
                marginBottom: 0,
                color: "#64748b",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              신청은 결제가 아닙니다. 지역 수요 확인 후 특강 일정이 확정되면 먼저
              연락드립니다.
            </p>
          </div>
        </div>
      </section>
    </main>
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
