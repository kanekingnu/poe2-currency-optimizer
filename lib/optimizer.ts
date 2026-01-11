import Graph from "graphology";
import { dijkstra } from "graphology-shortest-path";
import type {
  CurrencyExchangePair,
  OptimalTradePath,
  TradeStep,
  CurrencyItem,
} from "@/types/currency";

/**
 * 通貨交換グラフを構築
 * @param pairs 通貨交換ペアの配列
 * @returns グラフオブジェクト
 */
export function buildCurrencyGraph(pairs: CurrencyExchangePair[]): Graph {
  const graph = new Graph({ multi: false, type: "directed" });

  // ノード（通貨）とエッジ（交換レート）を追加
  pairs.forEach((pair) => {
    const { haveId, wantId, ratio, stock } = pair;

    // ノードを追加（既に存在する場合はスキップ）
    if (!graph.hasNode(haveId.toString())) {
      graph.addNode(haveId.toString());
    }
    if (!graph.hasNode(wantId.toString())) {
      graph.addNode(wantId.toString());
    }

    // エッジを追加
    // 重みは 1/ratio で、最短経路が最小コスト（最大利益）になる
    // stock が0の場合はスキップ
    if (stock > 0 && ratio > 0) {
      const weight = 1 / ratio;

      // 順方向のエッジを追加
      if (!graph.hasEdge(haveId.toString(), wantId.toString())) {
        graph.addDirectedEdge(haveId.toString(), wantId.toString(), {
          ratio,
          stock,
          weight,
        });
      }

      // 逆方向のエッジも追加（逆レートで取引可能）
      const reverseRatio = 1 / ratio;
      const reverseWeight = 1 / reverseRatio;
      if (!graph.hasEdge(wantId.toString(), haveId.toString())) {
        graph.addDirectedEdge(wantId.toString(), haveId.toString(), {
          ratio: reverseRatio,
          stock,
          weight: reverseWeight,
        });
      }
    }
  });

  return graph;
}

/**
 * 2つの通貨間の最適取引パスを計算
 * @param graph 通貨グラフ
 * @param fromId 開始通貨ID
 * @param toId 目標通貨ID
 * @param currencyMap 通貨IDから通貨情報へのマップ
 * @returns 最適取引パス
 */
export function findOptimalPath(
  graph: Graph,
  fromId: number,
  toId: number,
  currencyMap: Map<number, CurrencyItem>
): OptimalTradePath | null {
  const from = fromId.toString();
  const to = toId.toString();

  // ノードが存在しない場合
  if (!graph.hasNode(from) || !graph.hasNode(to)) {
    return null;
  }

  try {
    // ダイクストラ法で最短経路を探索
    const path = dijkstra.bidirectional(graph, from, to, "weight");

    if (!path || path.length === 0) {
      return null;
    }

    // パスをTradeStepに変換
    const steps: TradeStep[] = [];
    let totalRatio = 1;

    for (let i = 0; i < path.length - 1; i++) {
      const currentNode = path[i];
      const nextNode = path[i + 1];

      const edge = graph.getEdgeAttributes(currentNode, nextNode);
      const ratio = edge.ratio as number;
      const stock = edge.stock as number;

      const fromCurrency = currencyMap.get(parseInt(currentNode));
      const toCurrency = currencyMap.get(parseInt(nextNode));

      if (fromCurrency && toCurrency) {
        steps.push({
          from: fromCurrency,
          to: toCurrency,
          ratio,
          stock,
        });

        totalRatio *= ratio;
      }
    }

    const pathCurrencies = path
      .map((nodeId) => currencyMap.get(parseInt(nodeId)))
      .filter((c): c is CurrencyItem => c !== undefined);

    return {
      path: pathCurrencies,
      totalRatio,
      steps,
    };
  } catch (error) {
    console.error("Error finding optimal path:", error);
    return null;
  }
}

/**
 * 全通貨ペアの最適パスを計算
 * @param pairs 通貨交換ペアの配列
 * @param currencyMap 通貨IDから通貨情報へのマップ
 * @returns 全ての最適パスのマップ
 */
export function calculateAllOptimalPaths(
  pairs: CurrencyExchangePair[],
  currencyMap: Map<number, CurrencyItem>
): Map<string, OptimalTradePath> {
  const graph = buildCurrencyGraph(pairs);
  const results = new Map<string, OptimalTradePath>();

  const currencyIds = Array.from(currencyMap.keys());

  // 全ペアの組み合わせで最適パスを計算
  for (const fromId of currencyIds) {
    for (const toId of currencyIds) {
      if (fromId === toId) continue;

      const path = findOptimalPath(graph, fromId, toId, currencyMap);
      if (path) {
        const key = `${fromId}-${toId}`;
        results.set(key, path);
      }
    }
  }

  return results;
}
