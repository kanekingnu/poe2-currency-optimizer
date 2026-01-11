import { NextResponse } from "next/server";
import { poe2API } from "@/lib/poe2-api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "currency";
    const league = searchParams.get("league") || "Standard";
    const referenceCurrency = searchParams.get("referenceCurrency") || "exalted";

    const data = await poe2API.getCurrencyItems(
      category,
      league,
      referenceCurrency
    );

    // APIレスポンスがページネーション形式の場合、itemsを抽出
    const items = Array.isArray(data) ? data : data.items || [];

    // APIレスポンスを型定義に合わせてマッピング
    const currencies = items.map((item: any) => ({
      id: item.id,
      name: item.text || item.name,
      icon: item.iconUrl || item.icon,
      category: item.categoryApiId || item.category,
    }));

    // IDでソートして順番を固定
    currencies.sort((a, b) => a.id - b.id);

    return NextResponse.json(currencies);
  } catch (error) {
    console.error("Error fetching currencies:", error);
    return NextResponse.json(
      { error: "Failed to fetch currencies" },
      { status: 500 }
    );
  }
}
