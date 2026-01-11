import { NextResponse } from "next/server";
import { poe2API } from "@/lib/poe2-api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "currency";
    const league = searchParams.get("league") || "Standard";
    const referenceCurrency = searchParams.get("referenceCurrency") || "exalted";

    const currencies = await poe2API.getCurrencyItems(
      category,
      league,
      referenceCurrency
    );

    return NextResponse.json(currencies);
  } catch (error) {
    console.error("Error fetching currencies:", error);
    return NextResponse.json(
      { error: "Failed to fetch currencies" },
      { status: 500 }
    );
  }
}
