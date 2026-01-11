'use client';

import { OptimalTradePath } from '@/types/currency';

interface TradePathDisplayProps {
  path: OptimalTradePath | null;
  isLoading?: boolean;
}

export default function TradePathDisplay({ path, isLoading }: TradePathDisplayProps) {
  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!path || !path.totalRatio || !path.steps || path.steps.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-400 text-center">
          {path ? '取引パスが見つかりませんでした' : '通貨を選択して最適な取引パスを計算します'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">最適取引パス</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">総交換レート:</span>
          <span className="text-green-400 font-bold text-lg">
            {path.totalRatio.toFixed(4)}x
          </span>
          <span className="text-gray-500">
            ({path.steps.length}ステップ)
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {path.steps.map((step, index) => (
          <div
            key={index}
            className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <span className="text-gray-400 font-mono text-sm">
                {index + 1}.
              </span>
              <div className="flex items-center gap-3">
                <span className="text-white font-medium">{step.from.name}</span>
                <span className="text-gray-400">→</span>
                <span className="text-white font-medium">{step.to.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-blue-400 font-semibold">
                  {step.ratio.toFixed(4)}x
                </div>
                <div className="text-xs text-gray-500">
                  在庫: {step.stock}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-gray-900 rounded-lg">
        <div className="text-sm text-gray-400">
          <p>
            <span className="font-semibold text-white">
              1 {path.path[0]?.name}
            </span>
            {' '}を使って{' '}
            <span className="font-semibold text-green-400">
              {path.totalRatio.toFixed(4)} {path.path[path.path.length - 1]?.name}
            </span>
            {' '}を獲得できます
          </p>
        </div>
      </div>
    </div>
  );
}
