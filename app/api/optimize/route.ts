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

    // 通貨交換データを取得（全カテゴリー）
    const data = await poe2API.getCurrencyExchangePairs(league);


    // まず、Exalted(ID=13)とDivine(ID=14)が含まれるペアからグローバルな相対価格マップを構築
    const globalRelativePriceMap = new Map<number, number>();
    globalRelativePriceMap.set(13, 1.0); // Exalted Orbを基準(=1)とする

    // 第1パス: Exaltedを含むペアから価格を構築
    data.forEach((item: any) => {
      const currencyOne = item.CurrencyOne;
      const currencyTwo = item.CurrencyTwo;

      if (currencyOne?.id === 13) {
        const relativePrice = parseFloat(item.CurrencyTwoData?.RelativePrice || '0');
        // RelativePriceが有効な値（> 0）の場合のみ設定
        if (relativePrice > 0 && !globalRelativePriceMap.has(currencyTwo?.id)) {
          globalRelativePriceMap.set(currencyTwo?.id, relativePrice);
        }
      } else if (currencyTwo?.id === 13) {
        const relativePrice = parseFloat(item.CurrencyOneData?.RelativePrice || '0');
        // RelativePriceが有効な値（> 0）の場合のみ設定
        if (relativePrice > 0 && !globalRelativePriceMap.has(currencyOne?.id)) {
          globalRelativePriceMap.set(currencyOne?.id, relativePrice);
        }
      }
    });

    // 第2パス: Divineを含むペアから、まだ設定されていない通貨の価格を構築
    const divinePrice = globalRelativePriceMap.get(14) || 377; // Divine の価格（Exalted基準）

    data.forEach((item: any) => {
      const currencyOne = item.CurrencyOne;
      const currencyTwo = item.CurrencyTwo;

      if (currencyOne?.id === 14 && !globalRelativePriceMap.has(currencyTwo?.id)) {
        const relativePriceToDivine = parseFloat(item.CurrencyTwoData?.RelativePrice || '0');
        // RelativePriceが有効な値（> 0）の場合のみ設定
        if (relativePriceToDivine > 0) {
          // DivineからExalted基準に変換
          const relativePrice = relativePriceToDivine * divinePrice;
          globalRelativePriceMap.set(currencyTwo?.id, relativePrice);
        }
      } else if (currencyTwo?.id === 14 && !globalRelativePriceMap.has(currencyOne?.id)) {
        const relativePriceToDivine = parseFloat(item.CurrencyOneData?.RelativePrice || '0');
        // RelativePriceが有効な値（> 0）の場合のみ設定
        if (relativePriceToDivine > 0) {
          // DivineからExalted基準に変換
          const relativePrice = relativePriceToDivine * divinePrice;
          globalRelativePriceMap.set(currencyOne?.id, relativePrice);
        }
      }
    });


    // APIレスポンスをマッピング - 両方向のエッジを作成
    const exchangeData: any[] = [];

    if (Array.isArray(data)) {
      data.forEach((item: any) => {
        const currencyOneId = item.CurrencyOne?.id || 0;
        const currencyTwoId = item.CurrencyTwo?.id || 0;

        // グローバルな相対価格マップから価格を取得
        const currencyOneRelativePrice = globalRelativePriceMap.get(currencyOneId) || 1;
        const currencyTwoRelativePrice = globalRelativePriceMap.get(currencyTwoId) || 1;

        const stock = parseFloat(item.Volume || '0');

        // CurrencyOne → CurrencyTwo の交換レート
        const forwardRatio = currencyOneRelativePrice / currencyTwoRelativePrice;
        exchangeData.push({
          haveId: currencyOneId,
          wantId: currencyTwoId,
          ratio: forwardRatio,
          stock,
          timestamp: new Date().toISOString(),
        });

        // CurrencyTwo → CurrencyOne の交換レート（逆方向）
        const reverseRatio = currencyTwoRelativePrice / currencyOneRelativePrice;
        exchangeData.push({
          haveId: currencyTwoId,
          wantId: currencyOneId,
          ratio: reverseRatio,
          stock,
          timestamp: new Date().toISOString(),
        });
      });
    }

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
