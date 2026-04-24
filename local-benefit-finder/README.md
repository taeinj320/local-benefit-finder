# 우리동네 혜택 알리미 (Local Benefit Finder)

지역, 연령, 가구 정보를 입력하면 맞춤형 복지/혜택을 카드 UI로 보여주고 공식 신청 링크로 연결하는 Next.js 앱입니다.

## 구현 범위 (MVP)

- `app/page.tsx`: 사용자 입력 폼 + 실시간 필터링 + 혜택 카드/상세 보기
- `data/manual-benefits.json`: 수동 큐레이션 혜택 데이터
- `data/benefits.ts`: 수동 데이터 + API 데이터(샘플) 통합
- `lib/filter-benefits.ts`: 맞춤 필터링 로직
- `app/api/benefits/route.ts`: 추후 외부 연동을 위한 API 엔드포인트
- `scripts/fetch_benefits.py`: 공공데이터 수집 자동화 스크립트 뼈대

## 로컬 실행

```bash
npm install
cp .env.example .env.local
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 공공데이터 API 연동 (Phase C)

`app/api/benefits/route.ts`는 기본 데이터에 더해 외부 공공 API를 병합합니다.

1. `.env.local`에 실제 값 입력

```bash
DATA_GO_KR_API_URL=https://apis.data.go.kr/B554287/NationalWelfareInformationsV001/NationalWelfarelistV001
DATA_GO_KR_API_KEY=실제_서비스키
```

2. 개발 서버 재시작 후 확인
- `http://localhost:3000/api/benefits`
- 응답의 `sources.external` 값이 1 이상이면 외부 API 데이터가 합쳐진 상태
- 응답의 `externalError`가 비어 있지 않으면 키/엔드포인트 점검 필요

3. 수동 갱신 스크립트 사용(선택)

```bash
python3 scripts/fetch_benefits.py
```

스크립트는 외부 API를 앱 포맷으로 정규화해 `data/manual-benefits.json`에 저장합니다.

## 광고 수익화 (배너 3개)

웹사이트 수익화는 AdMob이 아니라 보통 Google AdSense를 사용합니다.

배너 위치:
- 상단 헤더 아래 1개
- 검색 결과 요약 박스 아래 1개
- 페이지 최하단 1개

`.env.local` 예시:

```bash
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxx
NEXT_PUBLIC_AD_SLOT_TOP=1111111111
NEXT_PUBLIC_AD_SLOT_MIDDLE=2222222222
NEXT_PUBLIC_AD_SLOT_BOTTOM=3333333333
```

값이 없으면 광고 대신 미리보기 placeholder가 표시됩니다.

추가 설정:
- `public/ads.txt`가 포함되어 있으며 `https://도메인/ads.txt`로 접근 가능
- 개인정보처리방침 페이지: `https://도메인/privacy`
- 사이트맵: `https://도메인/sitemap.xml`
- robots: `https://도메인/robots.txt`

## 무료 배포 (도메인 구매/유지 비용 0원)

Vercel 무료 플랜으로 배포하면 `https://프로젝트명.vercel.app` 주소를 무료로 사용할 수 있습니다.
이 주소는 도메인 구매가 필요 없고 유지비도 없습니다.

### 배포 순서

1. GitHub에 코드 업로드
2. [Vercel](https://vercel.com/) 로그인 후 `New Project`
3. GitHub 저장소 선택 후 `Deploy`
4. 배포 완료 후 `https://xxxxx.vercel.app` 주소 발급

## 다음 단계 (권장)

1. 외부 API별 상세 필드 매핑 고도화(연령/소득/접수기간 정밀 파싱)
2. 정기 배치(예: GitHub Actions)로 `manual-benefits.json` 자동 갱신
3. 주소/연령 조건 검증 강화 및 UX 개선
