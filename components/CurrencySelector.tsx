'use client';

import { CurrencyItem } from '@/types/currency';

interface CurrencySelectorProps {
  currencies: CurrencyItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  label: string;
  disabled?: boolean;
}

export default function CurrencySelector({
  currencies,
  selectedId,
  onSelect,
  label,
  disabled = false,
}: CurrencySelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <select
        value={selectedId ?? ''}
        onChange={(e) => onSelect(Number(e.target.value))}
        disabled={disabled}
        className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">通貨を選択...</option>
        {currencies.map((currency) => (
          <option key={currency.id} value={currency.id}>
            {currency.name}
          </option>
        ))}
      </select>
    </div>
  );
}
