import { NextResponse } from "next/server";
import { BENEFIT_ITEMS } from "@/data/benefits";

export async function GET() {
  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    total: BENEFIT_ITEMS.length,
    items: BENEFIT_ITEMS,
  });
}
