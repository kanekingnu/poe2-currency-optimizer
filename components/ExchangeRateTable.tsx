'use client';

import { CurrencyExchangePair, CurrencyItem } from '@/types/currency';
import { useMemo } from 'react';

interface ExchangeRateTableProps {
  pairs: CurrencyExchangePair[];
  currencies: CurrencyItem[];
  limit?: number;
}

export default function ExchangeRateTable({
  pairs,
  currencies,
  limit = 20,
}: ExchangeRateTableProps) {
  const currencyMap = useMemo(() => {
    const map = new Map<number, CurrencyItem>();
    currencies.forEach((c) => map.set(c.id, c));
    return map;
  }, [currencies]);

  const displayPairs = useMemo(() => {
    return pairs
      .filter((p) => p.stock > 0 && p.ratio > 0)
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, limit);
  }, [pairs, limit]);

  if (pairs.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-400 text-center">
          交換レートデータを読み込み中...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">
        為替レート一覧 (上位 {limit} 件)
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 px-3 text-gray-400 text-sm font-medium">
                売却
              </th>
              <th className="text-center py-2 px-3 text-gray-400 text-sm font-medium">
                →
              </th>
              <th className="text-left py-2 px-3 text-gray-400 text-sm font-medium">
                取得
              </th>
              <th className="text-right py-2 px-3 text-gray-400 text-sm font-medium">
                レート
              </th>
              <th className="text-right py-2 px-3 text-gray-400 text-sm font-medium">
                在庫
              </th>
            </tr>
          </thead>
          <tbody>
            {displayPairs.map((pair, index) => {
              const haveCurrency = currencyMap.get(pair.haveId);
              const wantCurrency = currencyMap.get(pair.wantId);

              return (
                <tr
                  key={index}
                  className="border-b border-gray-700 hover:bg-gray-700 transition-colors"
                >
                  <td className="py-3 px-3 text-white">
                    {haveCurrency?.name || `ID: ${pair.haveId}`}
                  </td>
                  <td className="py-3 px-3 text-center text-gray-400">→</td>
                  <td className="py-3 px-3 text-white">
                    {wantCurrency?.name || `ID: ${pair.wantId}`}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-blue-400">
                    {pair.ratio.toFixed(4)}x
                  </td>
                  <td className="py-3 px-3 text-right text-gray-400">
                    {pair.stock}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
