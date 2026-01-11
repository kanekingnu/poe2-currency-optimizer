// POE2 Scout API の型定義

export interface League {
  id: string;
  name: string;
}

export interface CurrencyItem {
  id: number;
  name: string;
  icon: string;
  category: string;
}

export interface PriceLogEntry {
  price: number;
  time: string;
  quantity: number;
}

export interface CurrencyItemExtended extends CurrencyItem {
  priceLog: PriceLogEntry[];
  currentPrice?: number;
}

export interface CurrencyExchangeSnapshot {
  id: string;
  timestamp: string;
  league: string;
  pairs: CurrencyPair[];
}

export interface CurrencyPair {
  have: CurrencyItem;
  want: CurrencyItem;
  ratio: number;
  stock: number;
}

export interface CurrencyExchangePair {
  haveId: number;
  wantId: number;
  ratio: number;
  stock: number;
  timestamp: string;
}

export interface OptimalTradePath {
  path: CurrencyItem[];
  totalRatio: number;
  steps: TradeStep[];
}

export interface TradeStep {
  from: CurrencyItem;
  to: CurrencyItem;
  ratio: number;
  stock: number;
}

export interface Category {
  id: string;
  name: string;
}
