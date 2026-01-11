export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          POE2 Currency Trade Optimizer
        </h1>

        <div className="grid gap-6">
          <section className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">通貨レート</h2>
            <p className="text-gray-400">
              通貨データを読み込み中...
            </p>
          </section>

          <section className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">最適取引計算</h2>
            <p className="text-gray-400">
              開発中...
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
