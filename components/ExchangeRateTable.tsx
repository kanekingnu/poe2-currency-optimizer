'use client';

import { CurrencyItem } from '@/types/currency';
import { useMemo } from 'react';

interface ExchangeRateTableProps {
  currencyMap: Map<number, CurrencyItem>;
  limit?: number;
}

export default function ExchangeRateTable({
  currencyMap,
  limit = 20,
}: ExchangeRateTableProps) {

  const displayCurrencies = useMemo(() => {
    // currencyMapから通貨リストを作成し、相対価格でソート
    const currencies = Array.from(currencyMap.values());

    return currencies
      .filter((c: any) => c.relativePrice && c.relativePrice > 0)
      .sort((a: any, b: any) => b.relativePrice - a.relativePrice)
      .slice(0, limit);
  }, [currencyMap, limit]);

  if (currencyMap.size === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-400 text-center">
          通貨データを読み込み中...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">
        通貨価値一覧 (上位 {limit} 件)
      </h3>
      <p className="text-sm text-gray-400 mb-4">
        Exalted Orb を 1 としたときの相対価値
      </p>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 px-3 text-gray-400 text-sm font-medium">
                通貨名
              </th>
              <th className="text-right py-2 px-3 text-gray-400 text-sm font-medium">
                相対価値
              </th>
              <th className="text-left py-2 px-3 text-gray-400 text-sm font-medium">
                カテゴリ
              </th>
            </tr>
          </thead>
          <tbody>
            {displayCurrencies.map((currency: any, index: number) => {
              return (
                <tr
                  key={currency.id}
                  className="border-b border-gray-700 hover:bg-gray-700 transition-colors"
                >
                  <td className="py-3 px-3 text-white">
                    {currency.name}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-blue-400">
                    {currency.relativePrice.toFixed(2)}x
                  </td>
                  <td className="py-3 px-3 text-gray-400 text-sm">
                    {currency.category}
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
