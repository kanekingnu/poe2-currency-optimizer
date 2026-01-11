import { NextResponse } from "next/server";
import { poe2API } from "@/lib/poe2-api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const league = searchParams.get("league") || "Standard";

    const data = await poe2API.getCurrencyExchangePairs(league);

    // APIレスポンスを型定義に合わせてマッピング
    const exchangeData = Array.isArray(data) ? data.map((item: any) => {
      const currencyOnePrice = parseFloat(item.CurrencyOneData?.RelativePrice || '1');
      const currencyTwoPrice = parseFloat(item.CurrencyTwoData?.RelativePrice || '1');

      // CurrencyOne → CurrencyTwo の交換レート
      // = CurrencyOne の価値 / CurrencyTwo の価値
      // 例: Divine(380) → Exalted(1) = 380/1 = 380 (1 Divine で 380 Exalted)
      const ratio = currencyOnePrice / currencyTwoPrice;

      return {
        haveId: item.CurrencyOne?.id || 0,
        wantId: item.CurrencyTwo?.id || 0,
        ratio,
        stock: parseFloat(item.Volume || '0'),
        timestamp: new Date().toISOString(),
      };
    }) : [];

    return NextResponse.json(exchangeData);
  } catch (error) {
    console.error("Error fetching exchange data:", error);
    return NextResponse.json(
      { error: "Failed to fetch exchange data" },
      { status: 500 }
    );
  }
}
