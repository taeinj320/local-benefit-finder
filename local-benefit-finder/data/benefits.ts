import manualBenefits from "@/data/manual-benefits.json";

export type BenefitCategory = "주거" | "금융" | "건강" | "교육" | "문화";
export type MarriageStatus = "미혼" | "신혼" | "기혼";
export type ChildStatus = "없음" | "있음" | "계획 중";
export type Gender = "전체" | "여성" | "남성";

export type BenefitItem = {
  id: string;
  title: string;
  organization: string;
  summary: string;
  applicationDeadline: string;
  regions: {
    province: string;
    city: string;
  }[];
  categories: BenefitCategory[];
  ageRange: {
    min: number;
    max: number;
  };
  eligibleMarriage: MarriageStatus[];
  eligibleChildStatus: ChildStatus[];
  eligibleGender: Gender;
  detail: {
    qualification: string[];
    documents: string[];
    support: string;
  };
  officialUrl: string;
  sourceType: "api" | "manual";
};

const apiBenefits: BenefitItem[] = [
  {
    id: "national-health-checkup-support",
    title: "국가건강검진 추가 지원 안내",
    organization: "보건복지부 / 국민건강보험공단",
    summary: "연령대별 건강검진 항목 및 추가 지원 제도를 안내합니다.",
    applicationDeadline: "연중",
    regions: [{ province: "경기도", city: "전체" }],
    categories: ["건강"],
    ageRange: { min: 20, max: 99 },
    eligibleMarriage: ["미혼", "신혼", "기혼"],
    eligibleChildStatus: ["없음", "있음", "계획 중"],
    eligibleGender: "전체",
    detail: {
      qualification: ["국민건강보험 가입자 또는 피부양자", "연령/조건별 검진 대상자"],
      documents: ["신분증", "건강검진표(모바일 가능)"],
      support: "기본 검진 무료, 일부 항목 추가 지원",
    },
    officialUrl: "https://www.nhis.or.kr",
    sourceType: "api",
  },
];

export const BENEFIT_ITEMS: BenefitItem[] = [...(manualBenefits as BenefitItem[]), ...apiBenefits];
