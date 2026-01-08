import { NextRequest, NextResponse } from "next/server"
import { getCarUnavailableDates } from "@/lib/reservations"

export async function GET (
  request: NextRequest,
  { params }: { params: { vin: string } }
) {
  try {
    // Await params before accessing its properties
    const { vin } = await params;

    if (!vin) {
      return NextResponse.json({ error: "Car VIN is required" }, { status: 400 })
    }

    const unavailableDates = await getCarUnavailableDates(vin);
    return NextResponse.json(unavailableDates);
  } catch (error) {
    console.error("Error fetching car unavailable dates:", error);
    return NextResponse.json({ error: "Failed to fetch unavailable dates" }, { status: 500 });
  }
}
