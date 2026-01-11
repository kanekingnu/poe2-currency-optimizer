import { NextResponse } from "next/server";
import { poe2API } from "@/lib/poe2-api";

export async function GET() {
  try {
    const leagues = await poe2API.getLeagues();
    return NextResponse.json(leagues);
  } catch (error) {
    console.error("Error fetching leagues:", error);
    return NextResponse.json(
      { error: "Failed to fetch leagues" },
      { status: 500 }
    );
  }
}
