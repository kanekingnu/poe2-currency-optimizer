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

    return NextResponse.json(leagues);
  } catch (error) {
    console.error("Error fetching leagues:", error);
    return NextResponse.json(
      { error: "Failed to fetch leagues" },
      { status: 500 }
    );
  }
}
