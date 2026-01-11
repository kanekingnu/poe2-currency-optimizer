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
  // 有向グラフを使用
  const graph = new Graph({ multi: false, type: "directed" });

  // 有効なペアをフィルタリング
  const validPairs = pairs.filter(p => p.stock > 0 && p.ratio > 0 && isFinite(p.ratio));

  // 最小ratioを見つけてオフセットを計算
  const minRatio = Math.min(...validPairs.map(p => p.ratio));
  const maxRatio = Math.max(...validPairs.map(p => p.ratio));

  // ノード（通貨）とエッジ（交換レート）を追加
  validPairs.forEach((pair) => {
    const { haveId, wantId, ratio, stock } = pair;

    // ノードを追加（既に存在する場合はスキップ）
    if (!graph.hasNode(haveId.toString())) {
      graph.addNode(haveId.toString());
    }
    if (!graph.hasNode(wantId.toString())) {
      graph.addNode(wantId.toString());
    }

    // エッジの重みを計算
    // 最適パスは「最大の交換レート」を求めるため、-log(ratio)を最小化したい
    // しかし負の重みは使えないので、-log(ratio) + log(maxRatio) = log(maxRatio/ratio)
    // これにより、ratioが大きいほど重みが小さくなる
    // ダイクストラで重みの合計を最小化 = log(maxRatio/ratio1) + log(maxRatio/ratio2) + ...
    // = log(maxRatio^n / (ratio1*ratio2*...)) を最小化
    // = ratio1*ratio2*... を最大化
    const weight = -Math.log(ratio) + Math.log(maxRatio);

    // エッジを追加（haveId → wantId）
    // 逆方向のエッジは既にoptimize/route.tsで作成されているため、ここでは作成しない
    if (!graph.hasEdge(haveId.toString(), wantId.toString())) {
      graph.addDirectedEdge(haveId.toString(), wantId.toString(), {
        ratio,
        stock,
        weight,
      });
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
