"use server";

export type ApplyFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

function maskContact(contact: string) {
  if (contact.length <= 4) {
    return "***";
  }

  return `${contact.slice(0, 3)}****${contact.slice(-4)}`;
}

function normalizeContact(contact: string) {
  return contact.replace(/[^\d]/g, "");
}

function isValidContact(contact: string) {
  const normalizedContact = normalizeContact(contact);

  return normalizedContact.length >= 9 && normalizedContact.length <= 11;
}

function getNotionErrorMessage(notionErrorText: string) {
  try {
    const parsed = JSON.parse(notionErrorText) as {
      code?: string;
      message?: string;
    };

    if (parsed.code === "object_not_found") {
      return "노션 데이터베이스를 찾을 수 없습니다. 데이터베이스 연결 상태를 확인해주세요.";
    }

    if (parsed.code === "unauthorized") {
      return "노션 API 키가 올바르지 않거나 만료되었습니다.";
    }

    return parsed.message || "노션 저장 중 오류가 발생했습니다.";
  } catch {
    return "노션 저장 중 오류가 발생했습니다.";
  }
}

export async function submitTourApplication(
  _previousState: ApplyFormState,
  formData: FormData
): Promise<ApplyFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim();
  const stroke = String(formData.get("stroke") ?? "").trim();

  console.log("[submitTourApplication] Submission requested", {
    hasName: Boolean(name),
    maskedContact: maskContact(normalizeContact(contact)),
    region,
    stroke,
    databaseId: process.env.NOTION_DATABASE_ID,
  });

  if (!name || !contact || !region || !stroke) {
    console.warn("[submitTourApplication] Validation failed", {
      hasName: Boolean(name),
      hasContact: Boolean(contact),
      hasRegion: Boolean(region),
      hasStroke: Boolean(stroke),
    });

    return {
      status: "error",
      message: "지역, 이름, 연락처, 원하시는 영법을 모두 입력해주세요.",
    };
  }

  if (!isValidContact(contact)) {
    console.warn("[submitTourApplication] Invalid contact", {
      maskedContact: maskContact(normalizeContact(contact)),
    });

    return {
      status: "error",
      message: "올바른 연락처 형식을 입력해주세요.",
    };
  }

  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
    console.error("[submitTourApplication] Missing Notion environment variables");

    return {
      status: "error",
      message: "노션 연결 환경변수가 설정되지 않았습니다.",
    };
  }

  try {
    const notionResponse = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: {
          database_id: process.env.NOTION_DATABASE_ID,
        },
        properties: {
          이름: {
            title: [
              {
                text: {
                  content: name,
                },
              },
            ],
          },
          연락처: {
            rich_text: [
              {
                text: {
                  content: contact,
                },
              },
            ],
          },
          지역: {
            rich_text: [
              {
                text: {
                  content: region,
                },
              },
            ],
          },
          "원하시는 영법": {
            rich_text: [
              {
                text: {
                  content: stroke,
                },
              },
            ],
          },
          신청일시: {
            date: {
              start: new Date().toISOString(),
            },
          },
        },
      }),
      cache: "no-store",
    });

    if (!notionResponse.ok) {
      const notionError = await notionResponse.text();
      const userMessage = getNotionErrorMessage(notionError);

      console.error("[submitTourApplication] Notion API failed", {
        status: notionResponse.status,
        maskedContact: maskContact(normalizeContact(contact)),
        region,
        error: notionError,
      });

      return {
        status: "error",
        message: userMessage,
      };
    }

    console.log("[submitTourApplication] Notion save success", {
      maskedContact: maskContact(normalizeContact(contact)),
      region,
      stroke,
    });

    return {
      status: "success",
      message: "신청이 완료되었습니다. 입력하신 연락처로 먼저 안내드릴게요.",
    };
  } catch (error) {
    console.error("[submitTourApplication] Unexpected error", error);

    return {
      status: "error",
      message: "서버 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    };
  }
}
