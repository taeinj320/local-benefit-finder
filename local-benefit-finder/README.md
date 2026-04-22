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
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 무료 배포 (도메인 구매/유지 비용 0원)

Vercel 무료 플랜으로 배포하면 `https://프로젝트명.vercel.app` 주소를 무료로 사용할 수 있습니다.
이 주소는 도메인 구매가 필요 없고 유지비도 없습니다.

### 배포 순서

1. GitHub에 코드 업로드
2. [Vercel](https://vercel.com/) 로그인 후 `New Project`
3. GitHub 저장소 선택 후 `Deploy`
4. 배포 완료 후 `https://xxxxx.vercel.app` 주소 발급

## 다음 단계 (권장)

1. `scripts/fetch_benefits.py`에 실제 `data.go.kr` API 연동
2. 정기 배치(예: GitHub Actions)로 `manual-benefits.json` 자동 갱신
3. 주소/연령 조건 검증 강화 및 UX 개선
