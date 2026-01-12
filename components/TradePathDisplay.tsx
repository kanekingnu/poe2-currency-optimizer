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

  // 総交換レート（実数）から適切な基準量を決定
  let baseAmount: number;
  let finalAmount: number;

  if (path.totalRatio < 1) {
    // 1未満の場合: 分母を基準にする（例: 0.00265 → 377:1）
    baseAmount = Math.round(1 / path.totalRatio);
    finalAmount = 1;
  } else {
    // 1以上の場合: 分子を基準にする（例: 377 → 1:377）
    baseAmount = 1;
    finalAmount = Math.round(path.totalRatio);
  }

  // 各ステップの取引量を実数で計算してから整数化
  const tradeAmounts: Array<{ fromAmount: number; toAmount: number }> = [];
  let currentAmount = baseAmount;

  for (let i = 0; i < path.steps.length; i++) {
    const step = path.steps[i];
    const fromAmount = Math.round(currentAmount);

    // 実際のratioを使って次の量を計算（実数）
    const toAmountFloat = currentAmount * step.ratio;
    const toAmount = Math.round(toAmountFloat);

    tradeAmounts.push({ fromAmount, toAmount });
    currentAmount = toAmountFloat; // 次のステップでは実数を保持
  }

  // 最後のステップの出力を補正
  if (tradeAmounts.length > 0) {
    const lastIndex = tradeAmounts.length - 1;
    tradeAmounts[lastIndex].toAmount = finalAmount;
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
        {path.steps.map((step, index) => {
          const amounts = tradeAmounts[index];
          return (
            <div
              key={index}
              className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="text-gray-400 font-mono text-sm">
                  {index + 1}.
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {step.from.icon && (
                      <img
                        src={step.from.icon}
                        alt={step.from.name}
                        className="w-6 h-6 object-contain"
                      />
                    )}
                    <span className="text-white font-medium">
                      {amounts.fromAmount.toLocaleString()} {step.from.name}
                    </span>
                  </div>
                  <span className="text-gray-400">→</span>
                  <div className="flex items-center gap-2">
                    {step.to.icon && (
                      <img
                        src={step.to.icon}
                        alt={step.to.name}
                        className="w-6 h-6 object-contain"
                      />
                    )}
                    <span className="text-green-400 font-medium">
                      {amounts.toAmount.toLocaleString()} {step.to.name}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-blue-400 font-semibold text-sm">
                    {step.ratio.toFixed(4)}x
                  </div>
                  <div className="text-xs text-gray-500">
                    在庫: {step.stock.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-4 bg-gray-900 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            {path.path[0]?.icon && (
              <img
                src={path.path[0].icon}
                alt={path.path[0].name}
                className="w-5 h-5 object-contain"
              />
            )}
            <span className="font-semibold text-white">
              {baseAmount.toLocaleString()} {path.path[0]?.name}
            </span>
          </div>
          <span>を使って</span>
          <div className="flex items-center gap-1">
            {path.path[path.path.length - 1]?.icon && (
              <img
                src={path.path[path.path.length - 1].icon}
                alt={path.path[path.path.length - 1].name}
                className="w-5 h-5 object-contain"
              />
            )}
            <span className="font-semibold text-green-400">
              {finalAmount.toLocaleString()} {path.path[path.path.length - 1]?.name}
            </span>
          </div>
          <span>を獲得できます</span>
        </div>
      </div>
    </div>
  );
}
