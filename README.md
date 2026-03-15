# swimit-tour

스윔잇 전국 특강 신청 랜딩페이지입니다.

## 주요 기능

- `/tour`에서 지역, 이름, 연락처를 빠르게 신청받습니다.
- `/api/apply`에서 노션 데이터베이스에 신청 정보를 저장합니다.
- 이 페이지는 결제 페이지가 아니라 특강 수요 수집 페이지입니다.

## 환경 변수

`.env.local` 파일에 아래 값을 넣어야 합니다.

```env
NOTION_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=32156a6e82d78037ac1ff0edf3716bfa
```

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000/tour`로 접속합니다.

## Vercel 배포 순서

1. GitHub 저장소를 Vercel에 연결합니다.
2. 프로젝트 프레임워크는 `Next.js`로 자동 인식됩니다.
3. Vercel 프로젝트 설정의 Environment Variables에 아래 두 값을 추가합니다.
4. `NOTION_TOKEN`
5. `NOTION_DATABASE_ID`
6. 배포 후 `/tour` 페이지에서 실제 신청 테스트를 진행합니다.

## 노션 연결 체크

- 데이터베이스 이름: `스윔잇 전국 특강 신청`
- 노션 Integration: `스윔잇 특강`
- 노션 데이터베이스를 해당 Integration에 공유해야 저장됩니다.

## 커밋 메시지 기준

짧고 분명하게, 왜 바꿨는지가 드러나게 작성합니다.

예시:

- `Add tour landing page with Notion intake flow`
- `Refine mobile form UX for faster applications`
- `Fix Notion database mapping for apply API`
- `Update landing copy for clearer class demand messaging`
