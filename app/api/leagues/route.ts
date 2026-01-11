import { NextResponse } from "next/server";
import { poe2API } from "@/lib/poe2-api";

export async function GET() {
  try {
    const data = await poe2API.getLeagues();

    // APIレスポンスを型定義に合わせてマッピング
    const leagues = Array.isArray(data) ? data.map((item: any) => ({
      id: item.value || item.id,
      name: item.value || item.name,
    })) : [];

    // リーグの順序を固定
    // 最新リーグを先頭に、Standard/Hardcoreを最後に
    // 新しいリーグが追加されたら、この配列の先頭に追加してください
    const leagueOrder = [
      'Fate of the Vaal',          // 最新 (2026-01-11時点)
      'HC Fate of the Vaal',
      'Dawn of the Hunt',
      'HC Dawn of the Hunt',
      'Rise of the Abyssal',
      'HC Rise of the Abyssal',
    ];

    // 優先順位順にソート
    const sortedLeagues = leagues.sort((a, b) => {
      const indexA = leagueOrder.indexOf(a.id);
      const indexB = leagueOrder.indexOf(b.id);

      // 両方がリストにある場合、順序通り
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      // Aだけがリストにある場合、Aを先に
      if (indexA !== -1) return -1;
      // Bだけがリストにある場合、Bを先に
      if (indexB !== -1) return 1;

      // どちらもリストにない場合
      // Standard/Hardcoreを最後に
      if (a.id === 'Standard' || a.id === 'Hardcore') return 1;
      if (b.id === 'Standard' || b.id === 'Hardcore') return -1;

      // それ以外はアルファベット順
      return a.id.localeCompare(b.id);
    });

    return NextResponse.json(sortedLeagues);
  } catch (error) {
    console.error("Error fetching leagues:", error);
    return NextResponse.json(
      { error: "Failed to fetch leagues" },
      { status: 500 }
    );
  }
}
