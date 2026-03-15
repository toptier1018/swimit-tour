import { NextResponse } from "next/server";

const DEFAULT_DATABASE_ID = "32156a6e82d78037ac1ff0edf3716bfa";
const LEGACY_VIEW_ID = "32156a6e82d7809f968f000c0fd64c3b";

function getDatabaseId() {
  const configuredDatabaseId = process.env.NOTION_DATABASE_ID?.trim();

  // The shared Notion URL contains both a database id and a view id.
  // If the view id was copied into env by mistake, fall back to the real database id.
  if (!configuredDatabaseId || configuredDatabaseId === LEGACY_VIEW_ID) {
    return DEFAULT_DATABASE_ID;
  }

  return configuredDatabaseId;
}

function maskContact(contact: string) {
  if (contact.length <= 4) {
    return "***";
  }

  return `${contact.slice(0, 3)}****${contact.slice(-4)}`;
}

function getNotionErrorMessage(notionErrorText: string) {
  try {
    const parsed = JSON.parse(notionErrorText) as {
      code?: string;
      message?: string;
    };

    if (parsed.code === "object_not_found") {
      return "노션 데이터베이스를 찾을 수 없습니다. 데이터베이스가 맞는지 확인하고, 노션에서 현재 연동 앱에 데이터베이스를 공유해주세요.";
    }

    if (parsed.code === "unauthorized") {
      return "노션 토큰이 올바르지 않거나 만료되었습니다. 새 통합 시크릿으로 다시 설정해주세요.";
    }

    return parsed.message || "신청 저장 중 오류가 발생했습니다.";
  } catch {
    return "신청 저장 중 오류가 발생했습니다.";
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      contact?: string;
      region?: string;
    };

    const name = body.name?.trim() || "";
    const contact = body.contact?.trim() || "";
    const region = body.region?.trim() || "";

    console.log("[/api/apply] Request received", {
      region,
      hasName: Boolean(name),
      maskedContact: maskContact(contact),
      databaseId: getDatabaseId(),
    });

    if (!name || !contact || !region) {
      console.warn("[/api/apply] Validation failed", {
        region,
        hasName: Boolean(name),
        hasContact: Boolean(contact),
      });

      return NextResponse.json(
        { message: "이름, 연락처, 지역을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    if (!process.env.NOTION_TOKEN) {
      console.error("[/api/apply] Missing NOTION_TOKEN");

      return NextResponse.json(
        { message: "노션 연동 설정이 아직 완료되지 않았습니다." },
        { status: 500 }
      );
    }

    const notionResponse = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: {
          database_id: getDatabaseId(),
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
          신청일시: {
            date: {
              start: new Date().toISOString(),
            },
          },
        },
      }),
    });

    if (!notionResponse.ok) {
      const notionError = await notionResponse.text();
      const userMessage = getNotionErrorMessage(notionError);

      console.error("[/api/apply] Notion API failed", {
        status: notionResponse.status,
        region,
        error: notionError,
        userMessage,
      });

      return NextResponse.json(
        { message: userMessage },
        { status: 500 }
      );
    }

    console.log("[/api/apply] Notion save success", {
      region,
      maskedContact: maskContact(contact),
    });

    return NextResponse.json({ message: "신청이 완료되었습니다." });
  } catch (error) {
    console.error("[/api/apply] Unexpected error", error);

    return NextResponse.json(
      { message: "서버 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
