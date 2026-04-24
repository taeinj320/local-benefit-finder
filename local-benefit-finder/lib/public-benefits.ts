import {
  type BenefitCategory,
  type BenefitItem,
  type ChildAgeTarget,
  type ChildStatus,
  type MarriageStatus,
} from "@/data/benefits";

type PublicApiRawItem = Record<string, unknown>;

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function pickString(item: PublicApiRawItem, keys: string[]): string {
  for (const key of keys) {
    const value = asString(item[key]);
    if (value) {
      return value;
    }
  }
  return "";
}

function splitLines(value: string): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(/\r?\n|[;•]/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function inferCategories(value: string): BenefitCategory[] {
  const bucket = new Set<BenefitCategory>();
  if (/주거|임대|월세|전세/.test(value)) bucket.add("주거");
  if (/대출|금융|수당|바우처|지원금|현금/.test(value)) bucket.add("금융");
  if (/건강|의료|접종|치료/.test(value)) bucket.add("건강");
  if (/교육|학습|장학|돌봄|보육/.test(value)) bucket.add("교육");
  if (/문화|여가|관람|체험|여행/.test(value)) bucket.add("문화");
  return bucket.size > 0 ? [...bucket] : ["금융"];
}

function inferChildTargets(value: string): ChildAgeTarget[] {
  const result = new Set<ChildAgeTarget>();
  if (/영유아|0세|1세|2세|3세|4세/.test(value)) result.add("0~4세");
  if (/초등|5세|6세|7세|8세|9세|10세/.test(value)) result.add("5~10세");
  if (/중학생|고등학생|청소년|11세|12세|13세|14세|15세|16세|17세|18세/.test(value)) {
    result.add("11~18세");
  }
  return result.size > 0 ? [...result] : ["전체"];
}

function inferChildStatus(value: string): ChildStatus[] {
  if (/자녀|아동|청소년|출산|보육|돌봄/.test(value)) {
    return ["있음"];
  }
  return ["없음", "있음", "계획 중"];
}

function normalizePublicApiItem(item: PublicApiRawItem, index: number): BenefitItem {
  const title = pickString(item, ["servNm", "serviceName", "svcNm", "title", "name"]) || `공공 혜택 ${index + 1}`;
  const organization =
    pickString(item, ["jurMnofNm", "organization", "provider", "deptNm", "insttNm"]) || "공공기관";
  const summary =
    pickString(item, ["servDgst", "summary", "description", "svcInfo", "content"]) ||
    "공공데이터에서 수집된 혜택 정보입니다.";
  const qualificationText = pickString(item, ["sprtTrgtCn", "qualification", "target", "eligibility"]);
  const documentText = pickString(item, ["aplyMtdCn", "documents", "requiredDocs", "howToApply"]);
  const supportText = pickString(item, ["servDtlLink", "support", "benefitDetail", "benefit"]);
  const province = pickString(item, ["ctpvNm", "sido", "province"]) || "전국";
  const city = pickString(item, ["sggNm", "sigungu", "city"]) || "전체";
  const link = pickString(item, ["aplyUrlAddr", "url", "link", "homepage"]) || "https://www.data.go.kr";
  const deadline = pickString(item, ["rceptPrdCn", "deadline", "period"]) || "상시";

  const mergedText = `${title} ${summary} ${qualificationText}`.replace(/\s+/g, " ");

  return {
    id: `public-api-${index}-${title.replace(/\s+/g, "-").toLowerCase()}`,
    title,
    organization,
    summary,
    applicationDeadline: deadline,
    regions: [{ province, city }],
    categories: inferCategories(mergedText),
    ageRange: { min: 19, max: 99 },
    eligibleMarriage: ["미혼", "신혼", "기혼"] as MarriageStatus[],
    eligibleChildStatus: inferChildStatus(mergedText),
    eligibleChildAgeTargets: inferChildTargets(mergedText),
    eligibleGender: "전체",
    detail: {
      qualification: splitLines(qualificationText).length > 0 ? splitLines(qualificationText) : ["공고문 참고"],
      documents: splitLines(documentText).length > 0 ? splitLines(documentText) : ["공고문 참고"],
      support: supportText || "지원 상세는 공고문에서 확인하세요.",
    },
    officialUrl: link,
    sourceType: "api",
  };
}

function getItemsFromPayload(payload: unknown): PublicApiRawItem[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const directItems = (payload as { items?: unknown }).items;
  if (Array.isArray(directItems)) {
    return directItems.filter((item): item is PublicApiRawItem => typeof item === "object" && item !== null);
  }

  const response = (payload as { response?: { body?: { items?: { item?: unknown } } } }).response;
  const nestedItems = response?.body?.items?.item;
  if (Array.isArray(nestedItems)) {
    return nestedItems.filter((item): item is PublicApiRawItem => typeof item === "object" && item !== null);
  }

  if (nestedItems && typeof nestedItems === "object") {
    return [nestedItems as PublicApiRawItem];
  }

  return [];
}

export async function fetchPublicBenefits(): Promise<BenefitItem[]> {
  const apiUrl = process.env.DATA_GO_KR_API_URL;
  const serviceKey = process.env.DATA_GO_KR_API_KEY;

  if (!apiUrl || !serviceKey) {
    return [];
  }

  const url = new URL(apiUrl);
  url.searchParams.set("serviceKey", serviceKey);
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("numOfRows", "100");
  url.searchParams.set("_type", "json");

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`공공 API 호출 실패: ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  const rawItems = getItemsFromPayload(payload);
  return rawItems.map(normalizePublicApiItem);
}
