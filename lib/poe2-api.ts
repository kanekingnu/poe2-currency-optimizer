import type {
  League,
  CurrencyItemExtended,
  CurrencyExchangePair,
  Category,
  PriceLogEntry,
} from "@/types/currency";

const API_BASE_URL = "https://poe2scout.com/api";

export class POE2ScoutAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * リーグ一覧を取得
   */
  async getLeagues(): Promise<League[]> {
    const response = await fetch(`${this.baseUrl}/leagues`);
    if (!response.ok) {
      throw new Error(`Failed to fetch leagues: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * カテゴリ一覧を取得
   */
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${this.baseUrl}/items/categories`);
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * 通貨アイテムを取得
   * @param category カテゴリ名
   * @param league リーグ名 (デフォルト: "Standard")
   * @param referenceCurrency 基準通貨 (デフォルト: "exalted")
   */
  async getCurrencyItems(
    category: string,
    league: string = "Standard",
    referenceCurrency: string = "exalted"
  ): Promise<CurrencyItemExtended[]> {
    const url = new URL(`${this.baseUrl}/items/currency/${category}`);
    url.searchParams.append("league", league);
    url.searchParams.append("referenceCurrency", referenceCurrency);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch currency items: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * 特定通貨の詳細を取得
   * @param apiId API ID
   * @param league リーグ名 (デフォルト: "Standard")
   */
  async getCurrencyById(
    apiId: string,
    league: string = "Standard"
  ): Promise<CurrencyItemExtended> {
    const url = new URL(`${this.baseUrl}/items/currencyById/${apiId}`);
    url.searchParams.append("league", league);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch currency by ID: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * アイテムの価格履歴を取得
   * @param itemId アイテムID
   * @param league リーグ名 (デフォルト: "Standard")
   */
  async getItemHistory(
    itemId: number,
    league: string = "Standard"
  ): Promise<PriceLogEntry[]> {
    const url = new URL(`${this.baseUrl}/items/${itemId}/history`);
    url.searchParams.append("league", league);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch item history: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * 通貨交換のスナップショットを取得
   * @param league リーグ名 (デフォルト: "Standard")
   */
  async getCurrencyExchangeSnapshot(
    league: string = "Standard"
  ): Promise<CurrencyExchangePair[]> {
    const url = new URL(`${this.baseUrl}/currencyExchangeSnapshot`);
    url.searchParams.append("league", league);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(
        `Failed to fetch currency exchange snapshot: ${response.statusText}`
      );
    }
    return response.json();
  }

  /**
   * 通貨交換ペアの一覧を取得
   * @param league リーグ名 (デフォルト: "Standard")
   */
  async getCurrencyExchangePairs(
    league: string = "Standard"
  ): Promise<CurrencyExchangePair[]> {
    const url = new URL(`${this.baseUrl}/currencyExchange/SnapshotPairs`);
    url.searchParams.append("league", league);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(
        `Failed to fetch currency exchange pairs: ${response.statusText}`
      );
    }
    return response.json();
  }
}

// デフォルトのAPIクライアントインスタンスをエクスポート
export const poe2API = new POE2ScoutAPI();
