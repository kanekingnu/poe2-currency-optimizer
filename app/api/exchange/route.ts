import { NextResponse } from "next/server";
import { poe2API } from "@/lib/poe2-api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const league = searchParams.get("league") || "Standard";

    const data = await poe2API.getCurrencyExchangePairs(league);

    // APIレスポンスを型定義に合わせてマッピング
    const exchangeData = Array.isArray(data) ? data.map((item: any) => ({
      haveId: item.CurrencyOne?.id || 0,
      wantId: item.CurrencyTwo?.id || 0,
      ratio: parseFloat(item.CurrencyOneData?.RelativePrice || item.CurrencyTwoData?.RelativePrice || '0'),
      stock: parseFloat(item.Volume || '0'),
      timestamp: new Date().toISOString(),
    })) : [];

    return NextResponse.json(exchangeData);
  } catch (error) {
    console.error("Error fetching exchange data:", error);
    return NextResponse.json(
      { error: "Failed to fetch exchange data" },
      { status: 500 }
    );
  }
}
