'use client';

import { useState, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import CurrencySelector from '@/components/CurrencySelector';
import TradePathDisplay from '@/components/TradePathDisplay';
import ExchangeRateTable from '@/components/ExchangeRateTable';
import LeagueSelector from '@/components/LeagueSelector';
import type {
  League,
  CurrencyItem,
  CurrencyExchangePair,
  OptimalTradePath,
} from '@/types/currency';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Home() {
  const [selectedLeague, setSelectedLeague] = useState('');
  const [fromCurrency, setFromCurrency] = useState<number | null>(null);
  const [toCurrency, setToCurrency] = useState<number | null>(null);

  // リーグ一覧を取得
  const { data: leagues } = useSWR<League[]>('/api/leagues', fetcher);

  // デフォルトリーグを設定（最新のリーグを自動選択）
  useEffect(() => {
    if (leagues && leagues.length > 0 && !selectedLeague) {
      setSelectedLeague(leagues[0].id);
    }
  }, [leagues, selectedLeague]);

  // 通貨一覧を取得
  const { data: currencies, isLoading: currenciesLoading } = useSWR<CurrencyItem[]>(
    selectedLeague ? `/api/currencies?league=${selectedLeague}&category=currency` : null,
    fetcher
  );

  // 為替レートを取得
  const { data: exchangeData, isLoading: exchangeLoading } = useSWR<{
    pairs: CurrencyExchangePair[];
    currencies: CurrencyItem[];
  }>(selectedLeague ? `/api/exchange?league=${selectedLeague}` : null, fetcher);

  // 最適パスを取得
  const { data: optimalPath, isLoading: pathLoading } = useSWR<OptimalTradePath>(
    fromCurrency && toCurrency && selectedLeague
      ? `/api/optimize?from=${fromCurrency}&to=${toCurrency}&league=${selectedLeague}`
      : null,
    fetcher
  );

  // エラーレスポンスをnullに変換
  const validOptimalPath = optimalPath && 'error' in optimalPath ? null : optimalPath;

  const currencyMap = useMemo(() => {
    const map = new Map<number, CurrencyItem>();
    currencies?.forEach((c) => map.set(c.id, c));
    return map;
  }, [currencies]);

  const exchangeCurrencyMap = useMemo(() => {
    const map = new Map<number, CurrencyItem>();
    exchangeData?.currencies?.forEach((c) => map.set(c.id, c));
    return map;
  }, [exchangeData]);

  return (
    <main className="min-h-screen p-8 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            POE2 Currency Trade Optimizer
          </h1>
          <p className="text-gray-400">
            Path of Exile 2の通貨取引を最適化して、最高の交換レートを見つけましょう
          </p>
        </div>

        {/* リーグ選択 */}
        <div className="mb-6">
          {leagues && (
            <LeagueSelector
              leagues={leagues}
              selectedLeague={selectedLeague}
              onSelect={setSelectedLeague}
            />
          )}
        </div>

        <div className="grid gap-6">
          {/* 最適取引計算セクション */}
          <section className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">最適取引計算</h2>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <CurrencySelector
                currencies={currencies || []}
                selectedId={fromCurrency}
                onSelect={setFromCurrency}
                label="売却する通貨"
                disabled={currenciesLoading}
              />
              <CurrencySelector
                currencies={currencies || []}
                selectedId={toCurrency}
                onSelect={setToCurrency}
                label="取得する通貨"
                disabled={currenciesLoading}
              />
            </div>

            <TradePathDisplay
              path={validOptimalPath || null}
              isLoading={pathLoading}
            />
          </section>

          {/* 為替レート一覧 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">通貨レート</h2>
            {exchangeLoading ? (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                  <div className="h-8 bg-gray-700 rounded"></div>
                  <div className="h-8 bg-gray-700 rounded"></div>
                  <div className="h-8 bg-gray-700 rounded"></div>
                </div>
              </div>
            ) : (
              <ExchangeRateTable
                currencyMap={exchangeCurrencyMap}
                limit={20}
              />
            )}
          </section>
        </div>

        {/* フッター */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>
            データ提供:{' '}
            <a
              href="https://poe2scout.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              POE2 Scout
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
