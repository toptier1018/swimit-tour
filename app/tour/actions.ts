"use server";

import { google } from "googleapis";

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

async function hasDuplicateApplication({
  name,
  contact,
  region,
}: {
  name: string;
  contact: string;
  region: string;
}) {
  const normalizedContact = normalizeContact(contact);

  const queryResponse = await fetch(
    `https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        filter: {
          and: [
            {
              property: "이름",
              title: {
                equals: name,
              },
            },
            {
              property: "지역",
              rich_text: {
                equals: region,
              },
            },
          ],
        },
        page_size: 100,
      }),
      cache: "no-store",
    }
  );

  if (!queryResponse.ok) {
    const queryError = await queryResponse.text();
    throw new Error(
      `중복 신청 확인 중 오류가 발생했습니다: ${getNotionErrorMessage(queryError)}`
    );
  }

  const queryResult = (await queryResponse.json()) as {
    results?: Array<{
      properties?: Record<
        string,
        {
          rich_text?: Array<{ plain_text?: string }>;
        }
      >;
    }>;
  };

  const isDuplicate =
    queryResult.results?.some((page) => {
      const storedContact = page.properties?.["연락처"]?.rich_text
        ?.map((item) => item.plain_text ?? "")
        .join("")
        .trim();

      return normalizeContact(storedContact ?? "") === normalizedContact;
    }) ?? false;

  console.log("[submitTourApplication] Duplicate application checked", {
    name,
    region,
    maskedContact: maskContact(normalizedContact),
    isDuplicate,
  });

  return isDuplicate;
}

function getGooglePrivateKey() {
  return process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

function formatSubmittedAtForKoreanDisplay(submittedAt: string) {
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const parts = formatter.formatToParts(new Date(submittedAt));
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const dayPeriod = parts.find((part) => part.type === "dayPeriod")?.value ?? "";
  const hour = parts.find((part) => part.type === "hour")?.value ?? "";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "";

  return `${year}년 ${month}월 ${day}일 ${dayPeriod} ${hour}:${minute} (GMT+9)`;
}

async function saveToGoogleSheets({
  submittedAt,
  name,
  contact,
  email,
  region,
  stroke,
}: {
  submittedAt: string;
  name: string;
  contact: string;
  email: string;
  region: string;
  stroke: string;
}) {
  if (
    !process.env.GOOGLE_CLIENT_EMAIL ||
    !getGooglePrivateKey() ||
    !process.env.GOOGLE_SHEETS_SPREADSHEET_ID ||
    !process.env.GOOGLE_SHEETS_SHEET_NAME
  ) {
    throw new Error("구글 시트 연결 환경변수가 설정되지 않았습니다.");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: getGooglePrivateKey(),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({
    version: "v4",
    auth,
  });

  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME.trim();
  const submittedAtDisplay = formatSubmittedAtForKoreanDisplay(submittedAt);

  console.log("[submitTourApplication] Google Sheets save started", {
    sheetName,
    maskedContact: maskContact(normalizeContact(contact)),
  });

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties(sheetId,title))",
  });

  const availableSheetTitles =
    spreadsheet.data.sheets
      ?.map((sheet) => sheet.properties?.title?.trim())
      .filter((title): title is string => Boolean(title)) ?? [];

  const targetSheet =
    spreadsheet.data.sheets?.find(
      (sheet) => sheet.properties?.title?.trim() === sheetName
    ) ??
    (spreadsheet.data.sheets?.length === 1 ? spreadsheet.data.sheets[0] : undefined);

  console.log("[submitTourApplication] Google Sheets tabs loaded", {
    requestedSheetName: sheetName,
    availableSheetTitles,
  });

  if (targetSheet?.properties?.sheetId == null) {
    throw new Error(
      `구글 시트 탭을 찾을 수 없습니다. 현재 탭: ${availableSheetTitles.join(", ")}`
    );
  }

  const targetSheetTitle = targetSheet.properties.title?.trim() || sheetName;

  // Keep the contact column as plain text so leading zeros are preserved.
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: {
              sheetId: targetSheet.properties.sheetId,
              startColumnIndex: 2,
              endColumnIndex: 3,
            },
            cell: {
              userEnteredFormat: {
                numberFormat: {
                  type: "TEXT",
                },
              },
            },
            fields: "userEnteredFormat.numberFormat",
          },
        },
      ],
    },
  });

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${targetSheetTitle}!A:F`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          submittedAtDisplay,
          name,
          `'${contact}`,
          region,
          stroke,
          email,
        ],
      ],
    },
  });

  console.log("[submitTourApplication] Google Sheets save success", {
    sheetName,
    maskedContact: maskContact(normalizeContact(contact)),
  });
}

export async function submitTourApplication(
  _previousState: ApplyFormState,
  formData: FormData
): Promise<ApplyFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim();
  const stroke = String(formData.get("stroke") ?? "").trim();
  const submittedAt = new Date().toISOString();

  console.log("[submitTourApplication] Submission requested", {
    hasName: Boolean(name),
    maskedContact: maskContact(normalizeContact(contact)),
    region,
    hasEmail: Boolean(email),
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
    const isDuplicate = await hasDuplicateApplication({
      name,
      contact,
      region,
    });

    if (isDuplicate) {
      console.warn("[submitTourApplication] Duplicate submission blocked", {
        name,
        region,
        maskedContact: maskContact(normalizeContact(contact)),
      });

      return {
        status: "error",
        message: "이미 같은 이름, 연락처, 지역으로 신청이 접수되어 있습니다.",
      };
    }

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
          이메일: {
            rich_text: email
              ? [
                  {
                    text: {
                      content: email,
                    },
                  },
                ]
              : [],
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
              start: submittedAt,
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

    await saveToGoogleSheets({
      submittedAt,
      name,
      contact,
      email,
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
