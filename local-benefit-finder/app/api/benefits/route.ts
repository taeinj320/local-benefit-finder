import { NextResponse } from "next/server";
import { BENEFIT_ITEMS, type BenefitItem } from "@/data/benefits";
import { fetchPublicBenefits } from "@/lib/public-benefits";

export async function GET() {
  let externalItems: BenefitItem[] = [];
  let externalError = "";

  try {
    externalItems = await fetchPublicBenefits();
  } catch (error) {
    externalError = error instanceof Error ? error.message : "알 수 없는 외부 API 오류";
  }

  if (!process.env.DATA_GO_KR_API_URL || !process.env.DATA_GO_KR_API_KEY) {
    externalError = externalError || "DATA_GO_KR_API_URL 또는 DATA_GO_KR_API_KEY 미설정";
  }

  const mergedItems = [...BENEFIT_ITEMS, ...externalItems];

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    total: mergedItems.length,
    sources: {
      local: BENEFIT_ITEMS.length,
      external: externalItems.length,
    },
    externalError,
    items: mergedItems,
  });
}
