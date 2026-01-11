import { NextResponse } from "next/server";
import { poe2API } from "@/lib/poe2-api";
import { findOptimalPath, buildCurrencyGraph } from "@/lib/optimizer";
import type { CurrencyItem } from "@/types/currency";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromId = searchParams.get("from");
    const toId = searchParams.get("to");
    const league = searchParams.get("league") || "Standard";

    if (!fromId || !toId) {
      return NextResponse.json(
        { error: "Missing required parameters: from and to" },
        { status: 400 }
      );
    }

    // 通貨交換データを取得
    const data = await poe2API.getCurrencyExchangePairs(league);

    // APIレスポンスをマッピング
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

    // 通貨情報のマップを構築
    const currencyMap = new Map<number, CurrencyItem>();

    // 交換データから通貨情報を抽出してマップを構築
    data.forEach((item: any) => {
      const currencyOne = item.CurrencyOne;
      const currencyTwo = item.CurrencyTwo;

      if (currencyOne && !currencyMap.has(currencyOne.id)) {
        currencyMap.set(currencyOne.id, {
          id: currencyOne.id,
          name: currencyOne.text || currencyOne.name || `Currency ${currencyOne.id}`,
          icon: currencyOne.iconUrl || currencyOne.icon || "",
          category: currencyOne.categoryApiId || "currency",
        });
      }
      if (currencyTwo && !currencyMap.has(currencyTwo.id)) {
        currencyMap.set(currencyTwo.id, {
          id: currencyTwo.id,
          name: currencyTwo.text || currencyTwo.name || `Currency ${currencyTwo.id}`,
          icon: currencyTwo.iconUrl || currencyTwo.icon || "",
          category: currencyTwo.categoryApiId || "currency",
        });
      }
    });

    // グラフを構築
    const graph = buildCurrencyGraph(exchangeData);

    // 最適パスを計算
    const optimalPath = findOptimalPath(
      graph,
      parseInt(fromId),
      parseInt(toId),
      currencyMap
    );

    if (!optimalPath) {
      return NextResponse.json(
        { error: "No path found between the specified currencies" },
        { status: 404 }
      );
    }

    return NextResponse.json(optimalPath);
  } catch (error) {
    console.error("Error calculating optimal path:", error);
    return NextResponse.json(
      { error: "Failed to calculate optimal path" },
      { status: 500 }
    );
  }
}
