import { NextResponse } from "next/server";
import { poe2API } from "@/lib/poe2-api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const league = searchParams.get("league") || "Standard";

    const exchangeData = await poe2API.getCurrencyExchangeSnapshot(league);

    return NextResponse.json(exchangeData);
  } catch (error) {
    console.error("Error fetching exchange data:", error);
    return NextResponse.json(
      { error: "Failed to fetch exchange data" },
      { status: 500 }
    );
  }
}
