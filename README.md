# POE2 Currency Trade Optimizer

Path of Exile 2のゲーム内通貨取引を最適化するWebアプリケーションです。

## 機能

- **通貨レート表示**: リアルタイムの通貨交換レートを表示
- **最適取引計算**: 複数の通貨ペアを考慮した最適な交換ルートを提案
- **価格履歴**: 過去の価格推移をグラフで表示

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **データフェッチング**: SWR
- **グラフアルゴリズム**: graphology
- **チャート**: Recharts

## セットアップ

### 前提条件

- Node.js 18以上
- npm または yarn

### インストール

1. 依存関係をインストール:

```bash
npm install
# または
yarn install
```

2. 開発サーバーを起動:

```bash
npm run dev
# または
yarn dev
```

3. ブラウザで [http://localhost:3000](http://localhost:3000) を開く

## API エンドポイント

### `/api/leagues`
利用可能なリーグ一覧を取得

### `/api/currencies?league=Standard&category=currency`
指定されたリーグとカテゴリの通貨一覧を取得

### `/api/exchange?league=Standard`
通貨交換スナップショットを取得

### `/api/optimize?from=1&to=2&league=Standard`
2つの通貨間の最適取引パスを計算

## プロジェクト構造

```
trade_currency/
├── app/
│   ├── api/              # Next.js API Routes
│   │   ├── currencies/   # 通貨データ取得
│   │   ├── exchange/     # 為替レート取得
│   │   ├── leagues/      # リーグ一覧
│   │   └── optimize/     # 最適経路計算
│   ├── page.tsx          # メインページ
│   ├── layout.tsx        # レイアウト
│   └── globals.css       # グローバルスタイル
├── components/           # Reactコンポーネント
├── lib/
│   ├── poe2-api.ts      # POE2 Scout API クライアント
│   └── optimizer.ts     # 最適化アルゴリズム
├── types/
│   └── currency.ts      # TypeScript型定義
└── public/              # 静的ファイル
```

## 使用API

このプロジェクトは [POE2 Scout API](https://poe2scout.com/api/swagger) を使用しています。

## ライセンス

MIT
