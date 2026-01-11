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
    const exchangeData = await poe2API.getCurrencyExchangeSnapshot(league);

    // 通貨情報のマップを構築
    const currencyMap = new Map<number, CurrencyItem>();

    // 交換データから通貨情報を抽出してマップを構築
    // 注: 実際のAPIレスポンスに応じて調整が必要
    exchangeData.forEach((pair: any) => {
      if (!currencyMap.has(pair.haveId)) {
        currencyMap.set(pair.haveId, {
          id: pair.haveId,
          name: pair.haveName || `Currency ${pair.haveId}`,
          icon: "",
          category: "currency",
        });
      }
      if (!currencyMap.has(pair.wantId)) {
        currencyMap.set(pair.wantId, {
          id: pair.wantId,
          name: pair.wantName || `Currency ${pair.wantId}`,
          icon: "",
          category: "currency",
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
