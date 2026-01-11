'use client';

import { CurrencyItem } from '@/types/currency';
import { useState, useRef, useEffect } from 'react';

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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCurrency = currencies.find((c) => c.id === selectedId);

  // クリック外を検知してドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: number) => {
    onSelect(id);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-2" ref={dropdownRef}>
      <label className="text-sm font-medium text-gray-300">{label}</label>

      <div className="relative">
        {/* セレクターボタン */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-left text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedCurrency ? (
              <>
                {selectedCurrency.icon && (
                  <img
                    src={selectedCurrency.icon}
                    alt={selectedCurrency.name}
                    className="w-6 h-6 object-contain flex-shrink-0"
                  />
                )}
                <span className="truncate">{selectedCurrency.name}</span>
              </>
            ) : (
              <span className="text-gray-400">通貨を選択...</span>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* ドロップダウンメニュー */}
        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {currencies.map((currency) => (
              <button
                key={currency.id}
                type="button"
                onClick={() => handleSelect(currency.id)}
                className={`w-full px-4 py-2 text-left hover:bg-gray-600 flex items-center gap-2 transition-colors ${
                  currency.id === selectedId ? 'bg-gray-600' : ''
                }`}
              >
                {currency.icon && (
                  <img
                    src={currency.icon}
                    alt={currency.name}
                    className="w-6 h-6 object-contain flex-shrink-0"
                  />
                )}
                <span className="text-white truncate">{currency.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
