import { NextResponse } from "next/server";
import { poe2API } from "@/lib/poe2-api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const league = searchParams.get("league") || "Standard";

    const data = await poe2API.getCurrencyExchangePairs(league);

    // 通貨情報のマップを構築
    const currencyMap = new Map<number, any>();

    // APIレスポンスを型定義に合わせてマッピング
    const exchangeData = Array.isArray(data) ? data.map((item: any) => {
      const currencyOnePrice = parseFloat(item.CurrencyOneData?.RelativePrice || '1');
      const currencyTwoPrice = parseFloat(item.CurrencyTwoData?.RelativePrice || '1');

      // 通貨情報を収集（相対価格も含める）
      if (item.CurrencyOne && !currencyMap.has(item.CurrencyOne.id)) {
        currencyMap.set(item.CurrencyOne.id, {
          id: item.CurrencyOne.id,
          name: item.CurrencyOne.text || item.CurrencyOne.name || `Currency ${item.CurrencyOne.id}`,
          icon: item.CurrencyOne.iconUrl || item.CurrencyOne.icon || "",
          category: item.CurrencyOne.categoryApiId || "currency",
          relativePrice: currencyOnePrice, // Exaltedを1とした相対価格
        });
      }
      if (item.CurrencyTwo && !currencyMap.has(item.CurrencyTwo.id)) {
        currencyMap.set(item.CurrencyTwo.id, {
          id: item.CurrencyTwo.id,
          name: item.CurrencyTwo.text || item.CurrencyTwo.name || `Currency ${item.CurrencyTwo.id}`,
          icon: item.CurrencyTwo.iconUrl || item.CurrencyTwo.icon || "",
          category: item.CurrencyTwo.categoryApiId || "currency",
          relativePrice: currencyTwoPrice, // Exaltedを1とした相対価格
        });
      }

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

    return NextResponse.json({
      pairs: exchangeData,
      currencies: Array.from(currencyMap.values()),
    });
  } catch (error) {
    console.error("Error fetching exchange data:", error);
    return NextResponse.json(
      { error: "Failed to fetch exchange data" },
      { status: 500 }
    );
  }
}
