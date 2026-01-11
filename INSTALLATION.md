# インストールガイド

このプロジェクトを実行するための環境セットアップガイドです。

## 必要なツール

- **Bun**: JavaScriptランタイム&パッケージマネージャー（推奨）
- または **Node.js**: JavaScript実行環境

## Windows環境でのインストール手順

### オプション1: Bun のみをインストール（推奨）

Bunは単体でNode.jsの代わりとして動作します。

1. **PowerShellを管理者権限で開く**

2. **Bunをインストール**
   ```powershell
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```

3. **インストール確認**
   ```bash
   bun --version
   ```

4. **プロジェクトのセットアップ**
   ```bash
   cd c:\Workspace\trade_currency
   bun install
   bun run dev
   ```

### オプション2: Volta + Node.js + Bun

Voltaを使用してNode.jsのバージョン管理を行う場合：

1. **Voltaをインストール**
   - [Volta公式サイト](https://volta.sh/)から Windows用インストーラーをダウンロード
   - `volta-2.0.1-windows-x86_64.msi` を実行
   - または直接: https://github.com/volta-cli/volta/releases

2. **PowerShellまたはコマンドプロンプトを再起動**

3. **Node.jsをインストール**
   ```bash
   volta install node@22
   ```

4. **Bunをインストール**
   ```bash
   npm install -g bun
   ```
   または
   ```powershell
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```

5. **インストール確認**
   ```bash
   node --version
   volta --version
   bun --version
   ```

6. **プロジェクトのセットアップ**
   ```bash
   cd c:\Workspace\trade_currency
   bun install
   bun run dev
   ```

### オプション3: Node.js のみ（Bunなし）

1. **Node.jsをインストール**
   - [Node.js公式サイト](https://nodejs.org/)から LTS版をダウンロード
   - インストーラーを実行

2. **package.jsonのスクリプトを変更**
   ```json
   "scripts": {
     "dev": "next dev",
     "build": "next build",
     "start": "next start",
     "lint": "next lint"
   }
   ```

3. **プロジェクトのセットアップ**
   ```bash
   cd c:\Workspace\trade_currency
   npm install
   npm run dev
   ```

## プロジェクト起動後

ブラウザで http://localhost:3000 にアクセスしてアプリケーションを確認できます。

## トラブルシューティング

### PowerShellの実行ポリシーエラー

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### PATHが通らない場合

- システム環境変数を確認
- PowerShell/コマンドプロンプトを再起動

### ポート3000が使用中の場合

```bash
# 別のポートで起動
bun run dev -- -p 3001
```

## 推奨構成

**最もシンプル**: Bun のみ（オプション1）
- インストールが簡単
- 高速なパッケージインストール
- Next.js と完全互換

**プロフェッショナル**: Volta + Node.js + Bun（オプション2）
- 複数プロジェクトでNode.jsバージョンを管理
- チーム開発に適している
